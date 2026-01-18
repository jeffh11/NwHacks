"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface QOTDResponse {
  id: number;
  user_id: string;
  response: string;
  created_at: string;
  users: {
    firstname: string;
    lastname: string;
    avatar_url: string | null;
  };
}

interface QuestionOfTheDayProps {
  question: string;
  responses: QOTDResponse[];
  currentUser: {
    id: string;
    name: string;
    initial: string;
    avatarUrl: string | null;
  };
  familyId: string;
}

export default function QuestionOfTheDay({
  question,
  responses,
  currentUser,
  familyId,
}: QuestionOfTheDayProps) {
  const supabase = createClient();
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localResponses, setLocalResponses] =
    useState<QOTDResponse[]>(responses);

  const todayDate = new Date().toISOString().split("T")[0];

  const hasResponded = localResponses.some(
    (r) => r.user_id === currentUser.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);

    const { data, error } = await supabase
      .from("family_question_responses")
      .insert({
        family_id: familyId,
        user_id: currentUser.id,
        response: answer,
        response_date: todayDate,
      })
      .select()
      .single();

    if (!error && data) {
      setLocalResponses((prev) => [...prev, data]);
      setAnswer("");
    }

    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-3">
        🧠 Question of the Day
      </h2>

      <p className="text-slate-700 mb-4 text-base">{question}</p>

      {/* INPUT */}
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={
            hasResponded
              ? "You have already answered."
              : "Write your answer..."
          }
          className="w-full border border-slate-200 rounded-lg p-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3 bg-slate-50"
          rows={3}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={hasResponded || submitting}
        />

        <button
          type="submit"
          disabled={hasResponded || submitting || !answer.trim()}
          className={`mt-2 w-full bg-orange-500 text-white py-2 rounded-lg text-base font-semibold transition ${hasResponded || submitting || !answer.trim()
            ? "opacity-60 cursor-not-allowed"
            : "hover:bg-orange-600"
            }`}
        >
          {hasResponded
            ? "Response Submitted"
            : submitting
              ? "Submitting..."
              : "Respond"}
        </button>
      </form>

      {/* RESPONSES */}
      <div className="mt-6">
        <h3 className="text-base font-bold text-slate-800 mb-3">
          Today's Responses
        </h3>

        {localResponses.length === 0 ? (
          <p className="text-sm text-slate-400">No responses yet.</p>
        ) : (
          <ul className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {localResponses.map((r) => (
              <li
                key={r.id}
                className="bg-amber-50 rounded-lg px-3 py-2 text-sm text-slate-800 border border-amber-200"
              >
                <span className="font-semibold text-orange-700 mr-2">
                  {r.user_id === currentUser.id
                    ? "You"
                    : `${r.users.firstname} ${r.users.lastname}`}
                  :
                </span>

                {r.response}
                <span className="block text-xs text-slate-500 mt-1">
                  {new Date(r.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

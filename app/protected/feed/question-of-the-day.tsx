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
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">
        🧠 Question of the Day
      </h2>

      <p className="text-gray-700 mb-4">{question}</p>

      {/* INPUT */}
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={
            hasResponded
              ? "You have already answered."
              : "Write your answer..."
          }
          className="w-full border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          rows={3}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={hasResponded || submitting}
        />

        <button
          type="submit"
          disabled={hasResponded || submitting || !answer.trim()}
          className={`mt-2 w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold transition ${hasResponded || submitting || !answer.trim()
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-blue-600"
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
        <h3 className="text-sm font-bold text-gray-700 mb-2">
          Today's Responses
        </h3>

        {localResponses.length === 0 ? (
          <p className="text-xs text-gray-400">No responses yet.</p>
        ) : (
          <ul className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {localResponses.map((r) => (
              <li
                key={r.id}
                className="bg-blue-50 rounded-lg px-3 py-2 text-sm text-gray-800"
              >
                <span className="font-semibold text-blue-700 mr-2">
                  {r.user_id === currentUser.id
                    ? "You"
                    : `${r.users.firstname} ${r.users.lastname}`}
                  :
                </span>

                {r.response}
                <span className="block text-xs text-gray-400 mt-1">
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

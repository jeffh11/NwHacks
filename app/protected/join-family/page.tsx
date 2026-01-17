"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function JoinFamilyPage() {
  const supabase = createClient();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoinFamily() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("invite_code", code)
      .single();

    if (familyError || !family) {
      setError("Invalid family code");
      setLoading(false);
      return;
    }

    const { error: joinError } = await supabase
      .from("family_members")
      .insert({
        user_id: user.id,
        family_id: family.id,
      });

    if (joinError) {
      setError(joinError.message);
      setLoading(false);
      return;
    }

    router.push("/protected/dashboard");
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Join a family</h1>

      <input
        placeholder="Enter family code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="border rounded px-3 py-2 tracking-widest"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleJoinFamily}
        disabled={loading || !code}
        className="bg-primary text-primary-foreground py-2 rounded disabled:opacity-50"
      >
        {loading ? "Joining..." : "Join family"}
      </button>
    </div>
  );
}

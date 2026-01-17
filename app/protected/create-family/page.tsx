"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateFamilyPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateFamily() {
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

    const inviteCode = generateInviteCode();

    const { data: family, error: familyError } = await supabase
      .from("families")
      .insert({
        name,
        description,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (familyError) {
      setError(familyError.message);
      setLoading(false);
      return;
    }

    await supabase.from("family_members").insert({
      user_id: user.id,
      family_id: family.id,
    });

    router.push("/protected/dashboard");
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Create a family</h1>

      <input
        placeholder="Family name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-3 py-2"
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border rounded px-3 py-2"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleCreateFamily}
        disabled={loading || !name}
        className="bg-primary text-primary-foreground py-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create family"}
      </button>
    </div>
  );
}

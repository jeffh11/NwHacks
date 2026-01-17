"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/card";
import Button from "../../components/button";
import { createClient } from "@/lib/supabase/client";

export default function JoinFamilyPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleJoin = async () => {
    setError("");

    const formattedCode = code.toUpperCase().trim();

    // 1️⃣ Look up family by ID (join code)
    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("id", formattedCode)
      .single();

    if (familyError || !family) {
      setError("Family code not found.");
      return;
    }

    // 2️⃣ Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    // 3️⃣ Insert membership
    const { error: joinError } = await supabase
      .from("family_members")
      .insert({
        family_id: family.id, // same string code
        user_id: user.id,
        role_in_family: "member",
      });

    if (joinError) {
      setError("You are already in this family.");
      return;
    }

    // 4️⃣ Success
    router.push("/protected");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card>
        <h1 className="text-2xl font-semibold mb-2">Join a Family</h1>
        <p className="text-gray-500 mb-4">
          Enter the family code shared with you.
        </p>

        <input
          value={code}
          onChange={(e) =>
            setCode(e.target.value.toUpperCase().trim())
          }
          className="w-full border rounded-xl p-2 mb-3 text-center tracking-widest"
          placeholder="FAMILY123"
        />

        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        <Button text="Join Family" onClick={handleJoin} />
      </Card>
    </main>
  );
}
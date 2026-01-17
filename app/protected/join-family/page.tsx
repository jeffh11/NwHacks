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

<<<<<<< HEAD
            {/* Content wrapper with z-index */}
            <div className="relative z-10">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 blur-lg opacity-30" />
                    <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-amber-900 mb-3">
                  Join Your Family
                </h1>
              </div>

              {/* Form Section */}
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-amber-900">
                    Family Invite Code
                    <span className="text-orange-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-amber-200 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 font-bold text-lg tracking-widest text-center"
                      placeholder="ABCDE"
                      aria-label="Family Code"
                      required
                      autoComplete="off"
                      maxLength={5}
                    />
                    <Key className="absolute left-3 top-3.5 h-5 w-5 text-amber-400" />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
                  <Button text="Join Family" />
                </div>
              </form>

              {/* Alternative Action */}
              <div className="mt-6 pt-6 border-t border-amber-100">
                <p className="text-center text-sm text-amber-700 mb-3">
                  Don't have a code yet?
                </p>
                <Link
                  href="/protected/create-family"
                  className="group flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 rounded-xl border-2 border-amber-200 text-amber-800 font-medium hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
                >
                  Create a New Family
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
=======
        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        <Button text="Join Family" onClick={handleJoin} />
      </Card>
    </main>
>>>>>>> 0ce66935e070bd1bf252770bea83f5a0e7e1553d
  );
}
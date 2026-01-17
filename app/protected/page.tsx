import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: familyMemberships } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", userData.user!.id);

  const hasFamily = familyMemberships && familyMemberships.length > 0;

  return (
    <div className="flex flex-col gap-8 items-center justify-center p-6">
      <h1 className="text-3xl font-extrabold text-[var(--primary)] mb-2">
        Welcome
      </h1>
      {!hasFamily ? (
        <>
          <p className="text-lg text-gray-700 mb-4 text-center">
            You’re not part of a family yet. Join or create a family to get
            started.
          </p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Link
              href="/protected/join-family"
              className="px-6 py-4 rounded-xl bg-[var(--primary)] text-white text-lg font-semibold text-center hover:opacity-90 transition shadow-md"
            >
              Join a Family
            </Link>
            <Link
              href="/protected/create-family"
              className="px-6 py-4 rounded-xl border-2 border-gray-300 text-[var(--primary)] text-lg font-semibold text-center hover:bg-gray-50 transition"
            >
              Create a Family
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-lg text-gray-700 mb-4 text-center">
            You’re connected to your family.
          </p>
          <Link
            href="/protected/dashboard"
            className="px-6 py-4 rounded-xl bg-[var(--primary)] text-white text-lg font-semibold text-center hover:opacity-90 transition shadow-md w-full max-w-xs"
          >
            Go to Family Dashboard
          </Link>
        </>
      )}
    </div>
  );
}

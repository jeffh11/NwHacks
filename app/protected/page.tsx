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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Welcome</h1>

      {!hasFamily ? (
        <>
          <p className="text-muted-foreground">
            You’re not part of a family yet.
          </p>

          <div className="flex gap-4">
            <Link
              href="/protected/join-family"
              className="px-4 py-2 rounded bg-primary text-primary-foreground"
            >
              Join a family
            </Link>

            <Link
              href="/protected/create-family"
              className="px-4 py-2 rounded border"
            >
              Create a family
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">
            You’re connected to your family.
          </p>

          <Link
            href="/protected/dashboard"
            className="px-4 py-2 rounded bg-primary text-primary-foreground w-fit"
          >
            Go to family dashboard
          </Link>
        </>
      )}
    </div>
  );
}

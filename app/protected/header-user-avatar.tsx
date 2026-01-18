import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/avatar";
import Link from "next/link";

export default async function HeaderUserAvatar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("firstname, lastname, avatar_url")
    .eq("supabase_id", user.id)
    .single();

  if (!profile) return null;

  return (
    <Link href={`/protected/profile/${user.id}`}>
      <Avatar
        name={`${profile.firstname} ${profile.lastname}`}
        initial={profile.firstname[0]}
        avatarUrl={profile.avatar_url || null}
        size="md"
        className="hover:ring-2 hover:ring-orange-300 transition-all cursor-pointer"
      />
    </Link>
  );
}

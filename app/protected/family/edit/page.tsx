import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Settings, Users } from "lucide-react";
import EditFamilyForm from "./edit-family-form";
import Avatar from "@/components/avatar";
import RemoveMemberButton from "./remove-member-button";

export default async function EditFamilyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get user's family
  const { data: memberships } = await supabase
    .from("family_members")
    .select("family")
    .eq("user", user.id);

  if (!memberships || memberships.length === 0) redirect("/protected");

  const familyId = memberships[0].family;

  // Get family data
  const { data: familyData } = await supabase
    .from("families")
    .select("id, name, description, owner")
    .eq("id", familyId)
    .single();

  if (!familyData) redirect("/protected");

  // Check if user is owner
  if (familyData.owner !== user.id) {
    redirect("/protected/feed");
  }

  // Get all family members
  const { data: membersData } = await supabase
    .from("family_members")
    .select("user")
    .eq("family", familyId);

  const uniqueUserIds = Array.from(
    new Set(membersData?.map((m) => m.user).filter(Boolean))
  );

  const { data: profilesData } = await supabase
    .from("users")
    .select("supabase_id, firstname, lastname, avatar_url")
    .in("supabase_id", uniqueUserIds);

  const profiles = profilesData?.filter((p) => p.firstname) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Back Button */}
      <Link
        href="/protected/feed"
        className="absolute top-6 left-6 flex items-center gap-2 text-amber-700 hover:text-orange-600 transition-colors z-50"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-base font-bold">Back to Feed</span>
      </Link>

      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-3xl shadow-lg">
                  <Settings className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-black text-amber-900 mb-2">Edit Family</h1>
              <p className="text-amber-700/70 text-base">Manage your family settings</p>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-10">
              {/* Family Info Form */}
              <EditFamilyForm
                familyId={familyData.id}
                initialName={familyData.name}
                initialDescription={familyData.description || ""}
              />

              {/* Members Section */}
              <div className="pt-6 border-t border-amber-100">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-black text-amber-900">Family Members</h2>
                </div>

                <div className="space-y-3">
                  {profiles.map((profile) => {
                    const isOwner = profile.supabase_id === familyData.owner;
                    return (
                      <MemberRow
                        key={profile.supabase_id}
                        profile={profile}
                        isOwner={isOwner}
                        familyId={familyData.id}
                        currentUserId={user.id}
                      />
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function MemberRow({
  profile,
  isOwner,
  familyId,
  currentUserId,
}: {
  profile: { supabase_id: string; firstname: string; lastname: string; avatar_url?: string | null };
  isOwner: boolean;
  familyId: string;
  currentUserId: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
      <div className="flex items-center gap-4">
        <Avatar
          name={`${profile.firstname} ${profile.lastname}`}
          initial={profile.firstname[0]}
          avatarUrl={profile.avatar_url || null}
          size="md"
        />
        <div>
          <p className="font-bold text-amber-900">
            {profile.firstname} {profile.lastname}
          </p>
          {isOwner && (
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
              Owner
            </p>
          )}
        </div>
      </div>
      {!isOwner && (
        <RemoveMemberButton familyId={familyId} memberId={profile.supabase_id} />
      )}
    </div>
  );
}


import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card"; //
import { Users, Heart, Plus, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: familyMemberships } = await supabase
    .from("family_members")
    .select("family")
    .eq("user", userData.user!.id);

  const hasFamily = familyMemberships && familyMemberships.length > 0;

  if (hasFamily) {
    redirect("/protected/feed");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center p-4">
      {/* TOP BAR REMOVED FROM HERE 
          To make the main bar bigger, you must edit the navbar component 
          usually found in your layout.tsx or a separate header component.
      */}

      <main className="flex items-center justify-center w-full">
        <Card className="w-full max-w-md border-amber-200 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-3xl bg-orange-100 flex items-center justify-center shadow-inner">
                {hasFamily ? (
                  <Heart className="h-10 w-10 text-orange-500" />
                ) : (
                  <Users className="h-10 w-10 text-orange-500" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-black text-amber-900 mb-2">
              {hasFamily ? "Welcome Back!" : "Welcome to Huddle!"}
            </h1>
            <p className="text-amber-700/80 text-lg">
              {hasFamily 
                ? "Your family is waiting for you" 
                : "Create or join your family to start sharing moments"}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-10 px-8">
            {!hasFamily ? (
              <div className="space-y-5">
                <Link
                  href="/protected/join-family"
                  className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-orange-200/50 active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8" /> {/* Increased icon size */}
                    <div>
                      <div className="font-bold text-lg">Join a Family</div>
                      <div className="text-sm opacity-90 font-medium">Use an invite code</div>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 opacity-70 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/protected/create-family"
                  className="group flex items-center justify-between p-5 rounded-2xl border-2 border-amber-200 bg-white text-amber-900 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <Plus className="h-8 w-8 text-orange-500" /> {/* Increased icon size */}
                    <div>
                      <div className="font-bold text-lg">Create a Family</div>
                      <div className="text-sm text-amber-700/80 font-medium">Start your family space</div>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-amber-600 opacity-70 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  href="/protected/dashboard"
                  className="group flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8" />
                    <div>
                      <div className="font-bold text-xl">Go to Dashboard</div>
                      <div className="text-sm opacity-90 font-medium">See the latest moments</div>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 opacity-70 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-amber-200 shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
              {hasFamily ? (
                <Heart className="h-8 w-8 text-orange-500" />
              ) : (
                <Users className="h-8 w-8 text-orange-500" />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-amber-900 mb-2">
            {hasFamily ? "Welcome Back!" : "Welcome to Huddle!"}
          </h1>
          <p className="text-amber-700/80 text-sm">
            {hasFamily 
              ? "Your family is waiting for you" 
              : "Create or join your family to start sharing moments"}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!hasFamily ? (
            <div className="space-y-4">
              <Link
                href="/protected/join-family"
                className="group flex items-center justify-between p-4 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">Join a Family</div>
                    <div className="text-xs opacity-90">Use an invite code</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/protected/create-family"
                className="group flex items-center justify-between p-4 rounded-xl border-2 border-amber-200 bg-white text-amber-900 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">Create a Family</div>
                    <div className="text-xs text-amber-700/80">Start your family space</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-amber-600 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                href="/protected/dashboard"
                className="group flex items-center justify-between p-4 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">Go to Family Dashboard</div>
                    <div className="text-xs opacity-90">See your family&apos;s latest moments</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="text-center pt-4">
                <p className="text-sm text-amber-700/60">
                  You're connected to <span className="font-medium text-amber-800">{familyMemberships.length}</span> family group
                  {familyMemberships.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
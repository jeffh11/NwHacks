import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, LogOut, Home } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button"; //
import isInFamily from "@/utils/isInFamily";

async function AuthCheck({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      redirect("/auth/login");
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    redirect("/auth/login");
  }

  return <>{children}</>;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
      {/* SINGLE ENHANCED HEADER 
          Removed the extra inner bar and increased height to h-24 
      */}
      <header className="sticky top-0 z-50 w-full border-b border-amber-200 bg-white/95 backdrop-blur-sm shadow-sm h-24 flex items-center">
        <div className="flex items-center justify-between px-8 w-full max-w-6xl mx-auto">
          
          {/* Bigger Logo Section */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 shadow-sm">
              <Users className="h-7 w-7 text-orange-600" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-amber-900">Huddle</h1>
          </div>
          
          {/* Bigger Navigation Actions */}
          <div className="flex items-center gap-8">
            <a href="/protected" className="hover:scale-110 transition-transform">
              <Home className="h-8 w-8 text-amber-800" />
            </a>
            
            <form action="/auth/logout" method="POST">
              {/* Using the Button component from your UI library with size="lg" */}
              <Button 
                variant="outline" 
                size="lg" 
                type="submit" 
                className="flex items-center gap-3 border-2 border-amber-200 text-amber-800 font-bold hover:bg-amber-50 rounded-xl"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-lg">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
          <Suspense fallback={<LoadingState />}>
            <AuthCheck>{children}</AuthCheck>
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-200 bg-white py-6">
        <div className="text-center text-base font-medium text-amber-700/70">
          Made for families, built with ❤️
        </div>
      </footer>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-amber-700 flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-lg font-medium">Loading your family space...</span>
      </div>
    </div>
  );
}

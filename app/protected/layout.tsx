import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Users, LogOut, Home } from "lucide-react";
import { Suspense } from "react";

// Separate async component for streaming
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-amber-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <h1 className="text-lg font-semibold text-amber-900">Kinfolk</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Home className="h-4 w-4 text-amber-600" />
            <form action="/auth/logout" method="POST">
              <button 
                type="submit" 
                className="flex items-center gap-2 text-sm text-amber-700 hover:text-orange-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content - Simplified without extra wrappers */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
          <Suspense fallback={<LoadingState />}>
            <AuthCheck>{children}</AuthCheck>
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-200 bg-white py-4">
        <div className="text-center text-sm text-amber-700/70">
          Made for families, built with ❤️
        </div>
      </footer>
    </div>
  );
}

// Loading component for Suspense
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-amber-700 flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-orange-500 animate-pulse" />
        <span>Loading your family space...</span>
      </div>
    </div>
  );
}
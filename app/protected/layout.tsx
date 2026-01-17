import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-[var(--bg-soft)]">
      <div className="w-full max-w-xl p-8 rounded-2xl shadow-lg bg-white border border-gray-100 mt-8 mb-8">
        {children}
      </div>
    </main>
  );
}

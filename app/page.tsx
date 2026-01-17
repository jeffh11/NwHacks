import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button"; //

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-[var(--bg-soft)]">
      {/* NAV */}
      <nav className="w-full flex justify-center border-b h-20 bg-white shadow-sm">
        <div className="w-full max-w-5xl flex justify-between items-center px-8 text-xl">
          {/* ONLY CHANGE: Increased text size from default to text-4xl and added tracking-tighter */}
          <span className="font-extrabold text-4xl tracking-tighter text-[var(--primary)]">Huddle</span>
          
          <div className="flex gap-6 items-center">
            <div className="flex gap-4">
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="/login">Sign Up</Link>
              </Button>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center text-center gap-8 px-8 max-w-2xl">
        <h1 className="text-5xl font-extrabold text-[var(--primary)] mb-4">
          Stay close to family, even when you’re far away
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          Private family spaces for updates, voice messages, memories, and meaningful connection.
        </p>
        <Link
          href="/protected"
          className="px-8 py-4 rounded-xl bg-[var(--primary)] text-white text-xl font-bold shadow-md hover:opacity-90 transition"
        >
          Enter your family space
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="text-base text-gray-500 py-8">
        Connecting families everywhere with Huddle
      </footer>
    </main>
  );
}
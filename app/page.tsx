import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* NAV */}
      <nav className="w-full flex justify-center border-b h-16">
        <div className="w-full max-w-5xl flex justify-between items-center px-5 text-sm">
          <span className="font-semibold">Family Connect</span>
          <div className="flex gap-4 items-center">
            <AuthButton />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-6 max-w-xl">
        <h1 className="text-4xl font-bold">
          Stay close to family, even when you’re far away
        </h1>

        <p className="text-muted-foreground">
          Private family spaces for updates, voice messages, memories,
          and meaningful connection.
        </p>

        <Link
          href="/protected"
          className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium"
        >
          Enter your family space
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="text-xs text-muted-foreground py-6">
        Built with ❤️ using Supabase
      </footer>
    </main>
  );
}

import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="w-full border-b bg-white/80 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 font-extrabold">
              H
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-amber-900">
              Huddle
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="#features">Features</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#how-it-works">How it works</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button variant={"outline"} size="sm" asChild>
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </nav>
      </div>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-medium text-amber-900 shadow-sm">
            Built for families who live apart
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            A cozy family hub for stories, updates, and
            <span className="text-amber-700"> daily moments</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-700">
            Huddle brings everyone together with private spaces, photo
            galleries, voice notes, and a simple daily question that keeps the
            conversation flowing.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant={'outline'} size="lg" asChild>
              <Link href="/auth/sign-up">Create your family space</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-amber-600">●</span> Private by default
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-600">●</span> No ads, no noise
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-600">●</span> Made for all ages
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-12 hidden h-28 w-28 rounded-3xl bg-amber-200/60 lg:block" />
          <div className="absolute -right-6 bottom-10 hidden h-32 w-32 rounded-3xl bg-rose-200/60 lg:block" />
          <div className="relative rounded-3xl border border-amber-100 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700">The Lopez family</p>
                <p className="text-xs text-slate-500">Today · 4 new updates</p>
              </div>
              <div className="flex -space-x-2">
                <div className="h-9 w-9 rounded-full border-2 border-white bg-amber-300" />
                <div className="h-9 w-9 rounded-full border-2 border-white bg-rose-300" />
                <div className="h-9 w-9 rounded-full border-2 border-white bg-teal-300" />
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Question of the day</p>
                <p className="mt-2 text-sm text-slate-700">
                  What was the best part of your day?
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">New photo drop</p>
                <p className="mt-1 text-sm text-slate-600">
                  Nana shared 6 photos from the weekend.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Voice note</p>
                <p className="mt-1 text-sm text-slate-600">
                  “We miss you! Listen when you can.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Family feed",
              description: "Share updates, photos, and quick moments everyone can see.",
            },
            {
              title: "Question of the day",
              description: "A gentle prompt that sparks stories across generations.",
            },
            {
              title: "Memory gallery",
              description: "Collect the photos you want to keep forever in one place.",
            },
            {
              title: "Private groups",
              description: "Invite only the people you trust with your space.",
            },
            {
              title: "Simple onboarding",
              description: "Create a family in minutes and invite with a link.",
            },
            {
              title: "Built for all ages",
              description: "Large text, clean layout, and easy actions.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <p className="text-lg font-semibold text-slate-900">
                {feature.title}
              </p>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-6xl px-6 pb-20"
      >
        <div className="grid gap-8 rounded-3xl border border-amber-100 bg-white p-10 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-amber-700">Step 1</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              Create your family
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Set up a private space and invite the people who matter.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-700">Step 2</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              Share daily moments
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Post updates, answer the prompt, and drop photos.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-700">Step 3</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              Stay connected
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Everyone sees the stories that keep the family close.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-amber-900 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Ready to bring everyone together?
          </h2>
          <p className="max-w-2xl text-base text-amber-100">
            Create your family space today and start sharing the moments that
            matter most.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/sign-up">Start now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-slate-500">
        Made for families, built with ❤️
      </footer>
    </main>
  );
}
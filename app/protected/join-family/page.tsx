import Card from "../../components/card";
import Button from "../../components/button";
import Link from "next/link";

export default function JoinFamilyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-soft)]">
      <Card>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-[var(--accent)] via-yellow-100 to-pink-100 rounded-full mb-4 shadow-md">
            <svg
              className="w-10 h-10 text-[var(--primary)]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-[var(--primary)] mb-3">
            Join Your Family
          </h1>
          <p className="text-gray-700 text-lg">
            Enter your family code below. If you need help, ask a family member!
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Family Code
          </label>
          <input
            className="w-full border-2 border-[var(--accent)] bg-yellow-50 rounded-xl p-4 mb-2 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-200 focus:ring-opacity-40 transition"
            placeholder="ABC-DEF-GHI"
            aria-label="Family Code"
          />
          <p className="text-sm text-gray-500 text-center">
            Ask a family member to share their code with you.
          </p>
        </div>

        {/* Button */}
        <Button text="Join Family" />

        {/* Divider */}
        <div className="flex items-center gap-3 my-8 bg-gradient-to-r from-[var(--accent)]/30 via-yellow-100/40 to-pink-100/30 rounded-lg py-2">
          <div className="flex-1 h-px bg-pink-200" />
          <span className="text-base text-pink-500 font-semibold">or</span>
          <div className="flex-1 h-px bg-pink-200" />
        </div>

        {/* Alternative Action */}
        <Link
          href="/protected/create-family"
          className="block w-full text-center px-4 py-3 rounded-xl border-2 border-pink-200 text-pink-700 text-lg font-semibold hover:bg-pink-50 transition"
        >
          Create a New Family
        </Link>
      </Card>
    </main>
  );
}

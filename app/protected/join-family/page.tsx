import Card from "../../components/card";
import Button from "../../components/button";
import Link from "next/link";
import { Users, Heart, ArrowLeft, Key, ArrowRight } from "lucide-react";

export default function JoinFamilyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Floating Back Button */}
      <Link
        href="/protected"
        className="absolute top-6 left-6 flex items-center gap-2 text-amber-700 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back</span>
      </Link>

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        {/* Wrapper div for Card styling */}
        <div className="w-full max-w-md relative overflow-hidden">
          <Card>
            {/* Decorative Background Elements */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-100/50 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-amber-100/50 blur-2xl pointer-events-none" />

            {/* Content wrapper with z-index */}
            <div className="relative z-10">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 blur-lg opacity-30" />
                    <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-amber-900 mb-3">
                  Join Your Family
                </h1>
              </div>

              {/* Form Section */}
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-amber-900">
                    Family Invite Code
                    <span className="text-orange-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-amber-200 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 font-bold text-lg tracking-widest text-center"
                      placeholder="ABCDE"
                      aria-label="Family Code"
                      required
                      autoComplete="off"
                      maxLength={5}
                    />
                    <Key className="absolute left-3 top-3.5 h-5 w-5 text-amber-400" />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
                  <Button text="Join Family" />
                </div>
              </form>

              {/* Alternative Action */}
              <div className="mt-6 pt-6 border-t border-amber-100">
                <p className="text-center text-sm text-amber-700 mb-3">
                  Don't have a code yet?
                </p>
                <Link
                  href="/protected/create-family"
                  className="group flex items-center justify-center gap-2 w-full text-center px-4 py-2.5 rounded-xl border-2 border-amber-200 text-amber-800 font-medium hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
                >
                  Create a New Family
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
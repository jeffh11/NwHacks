import Card from "../../components/card";
import Button from "../../components/button";
import Link from "next/link";
import { Users, Plus, Heart, ArrowLeft } from "lucide-react";

export default function CreateFamilyPage() {
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
        {/* Wrapper div for Card styling since Card doesn't accept className */}
        <div className="w-full max-w-md relative overflow-hidden">
          <Card>
            {/* Decorative Background Elements - ensure they don't block interactions */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-100/50 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-amber-100/50 blur-2xl pointer-events-none" />

            {/* Content wrapper with z-index to stay above decorations */}
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
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                    <Plus className="h-4 w-4 text-orange-600" />
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-amber-900 mb-3">
                  Create Your Family Space
                </h1>
                <p className="text-amber-700/80 text-sm leading-relaxed">
                  Build a private haven where memories live and love grows. 
                  Only invited family members can join.
                </p>
              </div>

              {/* Form Section */}
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-amber-900">
                    Family Name
                    <span className="text-orange-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-amber-200 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                      placeholder="e.g., The Johnson Family"
                      required
                    />
                    <Users className="absolute left-3 top-3.5 h-5 w-5 text-amber-400" />
                  </div>
                  <p className="text-xs text-amber-600/70">
                    This is how your family will appear to members
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-amber-900">
                    Family Description
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 resize-none"
                      placeholder="Share what makes your family special..."
                      rows={3}
                    />
                  </div>
                  <p className="text-xs text-amber-600/70">
                    Optional - helps members understand your family's story
                  </p>
                </div>

                {/* Features Preview */}
                <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-amber-900">Your family space includes:</p>
                  <div className="space-y-2">
                    {[
                      "Private photo & video sharing",
                      "Voice notes and messages",
                      "Gentle 'hug' reactions",
                      "Invite-only access"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Heart className="h-3 w-3 text-orange-400 fill-current" />
                        <span className="text-xs text-amber-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button wrapper since Button doesn't accept className */}
                <div className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
                  <Button text="Create Family Space" />
                </div>
              </form>

              {/* Alternative Action */}
              <div className="mt-6 pt-6 border-t border-amber-100">
                <p className="text-center text-sm text-amber-700 mb-3">
                  Already have an invite code?
                </p>
                <Link
                  href="/protected/join-family"
                  className="block w-full text-center px-4 py-2.5 rounded-xl border-2 border-amber-200 text-amber-800 font-medium hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
                >
                  Join an Existing Family
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
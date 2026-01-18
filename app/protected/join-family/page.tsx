"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"; //
import { Button } from "@/components/ui/button"; //
import Link from "next/link";
import { Users, ArrowLeft, Key, ArrowRight } from "lucide-react";
import { useState } from "react";
import joinFamily from "@/utils/joinFamily";

export default function JoinFamilyPage() {
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Floating Back Button */}
      <Link
        href="/protected"
        className="absolute top-6 left-6 flex items-center gap-2 text-amber-700 hover:text-orange-600 transition-colors z-50"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-base font-bold">Back</span>
      </Link>

      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md relative overflow-hidden">
          <Card className="border-amber-200 shadow-2xl rounded-3xl bg-white/80 backdrop-blur-sm">
            <div className="relative z-10">
              <CardHeader className="text-center pb-6">
                <div className="inline-flex items-center justify-center mb-6">
                  <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-3xl shadow-lg">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-black text-amber-900 mb-2">Join Your Family</h1>
              </CardHeader>

              <CardContent className="space-y-6 flex flex-col items-center px-8 pb-10">
                <div className="w-full space-y-2">
                  <label className="block text-sm font-bold text-amber-900 mb-2">
                    Family Invite Code <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-amber-100 bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-black text-2xl tracking-[0.3em] text-center uppercase"
                      placeholder="ABCDE"
                      maxLength={5}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                    <Key className="absolute left-4 top-4.5 h-6 w-6 text-amber-400" />
                  </div>
                </div>

                {/* UPDATED BUTTON:
                    - Uses font-bold and text-lg to match the link below
                    - Removed the wrapper div that was causing duplication issues
                */}
                <Button 
                  size="lg"
                  className="w-full h-16 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg transition-all active:scale-95"
                  onClick={() => joinFamily(joinCode)}
                >
                  Join Family
                </Button>

                <div className="w-full mt-4 pt-6 border-t border-amber-100 flex flex-col items-center">
                  <p className="text-center text-sm font-medium text-amber-700 mb-4">
                    Don&apos;t have a code yet?
                  </p>
                  <Link
                    href="/protected/create-family"
                    className="group flex items-center justify-center gap-2 w-full text-center py-4 rounded-2xl border-2 border-amber-200 text-amber-900 text-lg font-bold hover:bg-amber-50 transition-all"
                  >
                    Create a New Family
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
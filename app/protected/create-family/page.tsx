'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card"; //
import { Button } from "@/components/ui/button"; //
import Link from "next/link";
import createFamily from "@/utils/createFamily";

export default function CreateFamilyPage() {
    const [familyName, setFamilyName] = useState("");
    const [familyDescription, setFamilyDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCreateFamily = async () => {
        if (!familyName.trim()) return;
        setIsLoading(true);
        try {
            await createFamily(familyName, familyDescription);
            router.push("/protected/feed");
        } catch (error) {
            console.error("Failed to create family:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-amber-50 to-orange-50">
            <Card className="w-full max-w-md shadow-2xl border-none">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-orange-100 rounded-2xl shadow-sm">
                            <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9h-4v4h4v-4zm5-4h-4v4h4V8zm-9 4H5v4h5v-4zm0-8v4H5V4h5z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-amber-900 mb-2">Create a Family</h1>
                    <p className="text-amber-700/70 text-base">Start a private space for your family</p>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-amber-900 mb-2">
                            Family Name <span className="text-orange-500">*</span>
                        </label>
                        <input
                            className="w-full border-2 border-amber-100 rounded-xl p-3 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition bg-white text-lg"
                            placeholder="e.g., The Smiths"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-amber-900 mb-2">
                            Family Description (Optional)
                        </label>
                        <textarea
                            className="w-full border-2 border-amber-100 rounded-xl p-3 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition bg-white resize-none"
                            placeholder="A bit about your family..."
                            rows={3}
                            value={familyDescription}
                            onChange={(e) => setFamilyDescription(e.target.value)}
                        />
                    </div>

                    {/* UPDATED BUTTON: 
              Lighter background (bg-orange-200) 
              Brown text (text-amber-900)
          */}
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-14 text-xl font-bold border-2 border-amber-200 bg-transparent text-amber-900 rounded-xl shadow-sm hover:bg-amber-50 transition-all"
                        onClick={() => createFamily(familyName, familyDescription)}
                    >
                        Create Family
                    </Button>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-amber-100" />
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-amber-100" />
                    </div>

                    <Link
                        href="/protected/join-family"
                        className="block w-full text-center px-4 py-3 rounded-xl border-2 border-amber-200 text-amber-900 font-bold hover:bg-amber-50 transition-all"
                    >
                        Join an Existing Family
                    </Link>
                </CardContent>
            </Card>
        </main>
    );
}
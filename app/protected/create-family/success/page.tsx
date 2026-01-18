'use client';

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function CreateFamilySuccessPage() {
    const searchParams = useSearchParams();
    const familyName = searchParams.get('name') || 'Your Family';
    const joinCode = searchParams.get('code') || '';

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-6 py-12">
            <Card className="w-full max-w-md border-amber-200 shadow-lg">
                <CardContent className="p-6">
                    {/* Success Icon */}
                    <div className="text-center mb-6">
                        <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                            <svg
                                className="w-12 h-12 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-amber-900 mb-2">
                            Family Created!
                        </h1>
                        <p className="text-slate-600 text-sm">
                            {familyName} is ready to go
                        </p>
                    </div>

                    {/* Join Code Section */}
                    <div className="bg-amber-50 rounded-lg p-6 mb-6 border border-amber-200">
                        <p className="text-sm text-slate-600 mb-2 text-center">
                            Share this code with family members:
                        </p>
                        <div className="text-center">
                            <div className="inline-block bg-white rounded-lg px-8 py-4 border-2 border-dashed border-amber-300">
                                <p className="text-4xl font-bold text-amber-900 tracking-widest font-mono">
                                    {joinCode}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 text-center">
                            They can use this code to join your family
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Link
                            href="/protected/feed"
                            className="w-full h-14 flex items-center justify-center rounded-xl border-2 border-amber-200 bg-transparent text-amber-900 font-bold hover:bg-amber-50 transition-all shadow-sm"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
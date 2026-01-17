'use client';

import { useState } from "react";
import Card from "../../components/card";
import Button from "../../components/button";
import Link from "next/link";
import createFamily from "@/utils/createFamily";

export default function CreateFamilyPage() {
  const [familyName, setFamilyName] = useState("");
  const [familyDescription, setFamilyDescription] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card>
        {/* Icon/Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-[var(--accent)] rounded-full mb-4">
            <svg
              className="w-8 h-8 text-[var(--primary)]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9h-4v4h4v-4zm5-4h-4v4h4V8zm-9 4H5v4h5v-4zm0-8v4H5V4h5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--primary)] mb-2">
            Create a Family
          </h1>
          <p className="text-gray-600 text-sm">
            Start a private space for your family
          </p>
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Name
            </label>
            <input
              className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 transition"
              placeholder="e.g., The Smiths"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Description (Optional)
            </label>
            <textarea
              className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 transition resize-none"
              placeholder="A bit about your family..."
              rows={3}
              value={familyDescription}
              onChange={(e) => setFamilyDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Button */}
        <Button text="Create Family" onClick={() => void createFamily(familyName, familyDescription)} />

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Alternative Action */}
        <Link
          href="/protected/join-family"
          className="block w-full text-center px-4 py-2 rounded-lg border-2 border-gray-200 text-[var(--primary)] font-medium hover:bg-gray-50 transition"
        >
          Join an Existing Family
        </Link>
      </Card>
    </main>
  );
} 
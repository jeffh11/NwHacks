"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateFamily } from "./actions";

interface EditFamilyFormProps {
  familyId: string;
  initialName: string;
  initialDescription: string;
}

export default function EditFamilyForm({
  familyId,
  initialName,
  initialDescription,
}: EditFamilyFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("familyId", familyId);
    formData.append("name", name);
    formData.append("description", description);

    const result = await updateFamily(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-amber-900 mb-2">
          Family Name <span className="text-orange-500">*</span>
        </label>
        <input
          className="w-full border-2 border-amber-100 rounded-xl p-3 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition bg-white text-lg"
          placeholder="e.g., The Smiths"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          Family updated successfully!
        </div>
      )}

      <Button
        type="submit"
        variant="outline"
        size="lg"
        className="w-full h-14 text-xl font-bold border-2 border-amber-200 bg-transparent text-amber-900 rounded-xl shadow-sm hover:bg-amber-50 transition-all disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}

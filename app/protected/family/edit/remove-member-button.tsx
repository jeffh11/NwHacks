"use client";

import { X } from "lucide-react";
import { removeMember } from "./actions";

interface RemoveMemberButtonProps {
  familyId: string;
  memberId: string;
}

export default function RemoveMemberButton({ familyId, memberId }: RemoveMemberButtonProps) {
  return (
    <form
      action={async () => {
        await removeMember(familyId, memberId);
      }}
      onSubmit={(e) => {
        if (!confirm("Remove this member from the family? They can rejoin with the join code.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove member"
      >
        <X className="h-5 w-5" />
      </button>
    </form>
  );
}

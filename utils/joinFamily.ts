"use server"
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function joinFamily(joinCode: string): Promise<{ error?: string }> {
	const sb = await createClient();

	const user = await sb.auth.getUser();

	if (!user.data.user) {
		return { error: "User not authenticated" };
	}

	const normalizedCode = joinCode.toUpperCase().trim();

	// Check if family exists
	const { data: family, error: familyError } = await sb
		.from("families")
		.select("id")
		.eq("id", normalizedCode)
		.single();

	if (familyError || !family) {
		return { error: "Invalid join code. Please check the code and try again." };
	}

	// Check if user is already a member
	const { data: existingMember } = await sb
		.from("family_members")
		.select("id")
		.eq("family", normalizedCode)
		.eq("user", user.data.user.id)
		.single();

	if (existingMember) {
		return { error: "You are already a member of this family." };
	}

	const { error: insertError } = await sb.from("family_members").insert({
		family: normalizedCode,
		user: user.data.user.id,
	});

	if (insertError) {
		// Handle specific database errors
		if (insertError.code === "23503") {
			return { error: "Invalid join code. Please check the code and try again." };
		}
		return { error: `Failed to join family: ${insertError.message}` };
	}

	redirect("/protected/join-family/success");
}
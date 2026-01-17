'use server';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function createFamily(familyName: string, familyDescription: string) {
	const sb = await createClient();

	const user = await sb.auth.getUser();

	if (!user.data.user) {
		throw new Error("User not authenticated");
	}

	const joinCode = generateJoinCode();

	// check if joinCode already exists
	const { data: existingFamily } = await sb
		.from("families")
		.select("id")
		.eq("id", joinCode)
		.single();

	while (existingFamily) {
		// if it exists, generate a new codew (simple retry logic)
		return createFamily(familyName, familyDescription);
	}

	const { error } = await sb
		.from("families")
		.insert({
			id: joinCode,
			name: familyName,
			description: familyDescription,
			owner: user.data.user.id
		});

	if (error) {
		throw error;
	}

	redirect("/protected/create-family/success?name=" + encodeURIComponent(familyName) + "&code=" + encodeURIComponent(joinCode));
}

function generateJoinCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}
"use server"
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function joinFamily(joinCode: string) {
	const sb = await createClient();

	const user = await sb.auth.getUser();

	if (!user.data.user) {
		throw new Error("User not authenticated");
	}

	const { error: insertError } =await sb.from("family_members").insert({
		family: joinCode,
		user: user.data.user.id,
	});

	if (insertError) {
		throw insertError;
	}

	redirect("/protected/join-family/success");
}
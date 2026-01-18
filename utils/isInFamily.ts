import { createClient } from "@/lib/supabase/server";

export default async function isInFamily() {
	const supabase = await createClient();

	const { data: { user } } = await supabase.auth.getUser();

	const { data, error } = await supabase
		.from("family_members")
		.select("*")
		.eq("user", user?.id);

	if (error) {
		throw error;
	}

	return data && data.length > 0;
}
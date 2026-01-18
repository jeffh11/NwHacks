"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- TYPES ---

type GameSessionInput = {
  durationMs: number;
  mistakes: number;
};

type LeaderboardEntry = {
  user_id: string;
  firstname: string;
  lastname: string;
  avatar_url: string | null;
  score: number;
  duration_ms: number;
  mistakes: number;
  rank: number;
};

// --- ACTIONS ---

/**
 * Gets or creates today's round for the user's family
 */
export async function getOrCreateTodayRound() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get user's family
  const { data: membership, error: membershipError } = await supabase
    .from("family_members")
    .select("family")
    .eq("user", user.id)
    .single();

  if (membershipError || !membership) {
    throw new Error("User is not in a family");
  }

  const familyId = membership.family;
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Try to get existing round
  const { data: existingRound, error: fetchError } = await supabase
    .from("game_rounds")
    .select("id")
    .eq("family_id", familyId)
    .eq("round_date", today)
    .single();

  if (existingRound) {
    return existingRound.id;
  }

  // Create new round if it doesn't exist
  const { data: newRound, error: createError } = await supabase
    .from("game_rounds")
    .insert({
      family_id: familyId,
      round_date: today,
    })
    .select("id")
    .single();

  if (createError || !newRound) {
    throw new Error(createError?.message ?? "Failed to create game round");
  }

  return newRound.id;
}

/**
 * Submits a game session score
 * Updates the user's best score if this is better than their previous attempt
 */
export async function submitGameSession({ durationMs, mistakes }: GameSessionInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (durationMs < 0 || mistakes < 0) {
    throw new Error("Invalid game session data");
  }

  // Calculate score (lower is better)
  const score = durationMs + mistakes * 1500;

  // Get or create today's round
  const roundId = await getOrCreateTodayRound();

  // Check if user already has a session for this round
  const { data: existingSession, error: fetchError } = await supabase
    .from("game_sessions")
    .select("id, score")
    .eq("round_id", roundId)
    .eq("user_id", user.id)
    .single();

  if (existingSession) {
    // Only update if the new score is better (lower)
    if (score < existingSession.score) {
      const { error: updateError } = await supabase
        .from("game_sessions")
        .update({
          duration_ms: durationMs,
          mistakes: mistakes,
          score: score,
          created_at: new Date().toISOString(),
        })
        .eq("id", existingSession.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }
  } else {
    // Insert new session
    const { error: insertError } = await supabase
      .from("game_sessions")
      .insert({
        round_id: roundId,
        user_id: user.id,
        duration_ms: durationMs,
        mistakes: mistakes,
        score: score,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  revalidatePath("/protected/game");
  return { success: true, score };
}

/**
 * Gets today's leaderboard for the user's family
 */
export async function getTodayLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get user's family
  const { data: membership, error: membershipError } = await supabase
    .from("family_members")
    .select("family")
    .eq("user", user.id)
    .single();

  if (membershipError || !membership) {
    throw new Error("User is not in a family");
  }

  const familyId = membership.family;
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Get today's round
  const { data: round, error: roundError } = await supabase
    .from("game_rounds")
    .select("id")
    .eq("family_id", familyId)
    .eq("round_date", today)
    .single();

  if (roundError || !round) {
    // No round yet, return empty leaderboard
    return [];
  }

  // Get all sessions for this round, ordered by score (ascending)
  const { data: sessions, error: sessionsError } = await supabase
    .from("game_sessions")
    .select("user_id, score, duration_ms, mistakes")
    .eq("round_id", round.id)
    .order("score", { ascending: true });

  if (sessionsError || !sessions || sessions.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = Array.from(new Set(sessions.map((s) => s.user_id)));

  // Fetch user profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("users")
    .select("supabase_id, firstname, lastname, avatar_url")
    .in("supabase_id", userIds);

  if (profilesError || !profiles) {
    return [];
  }

  // Create a map for quick lookup
  const profileMap = new Map(
    profiles.map((p) => [p.supabase_id, p])
  );

  // Transform and add rank
  const leaderboard: LeaderboardEntry[] = sessions
    .map((session, index) => {
      const profile = profileMap.get(session.user_id);
      if (!profile) return null;

      return {
        user_id: session.user_id,
        firstname: profile.firstname,
        lastname: profile.lastname,
        avatar_url: profile.avatar_url,
        score: session.score,
        duration_ms: session.duration_ms,
        mistakes: session.mistakes,
        rank: index + 1,
      };
    })
    .filter((entry): entry is LeaderboardEntry => entry !== null);

  return leaderboard;
}

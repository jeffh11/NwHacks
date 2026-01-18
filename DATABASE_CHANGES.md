# Database Changes for Voice Note Comments

## Required Database Schema Changes

### 1. Add Columns to `comments` Table

Add the following columns to your `comments` table in Supabase:

```sql
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_duration_ms INTEGER,
ADD COLUMN IF NOT EXISTS audio_mime TEXT;
```

**Column Details:**
- `audio_url` (TEXT, nullable): Stores the public URL to the audio file in Supabase Storage
- `audio_duration_ms` (INTEGER, nullable): Duration of the audio in milliseconds
- `audio_mime` (TEXT, nullable): MIME type of the audio file (e.g., "audio/webm;codecs=opus")

### 2. Create Supabase Storage Bucket

Create a new storage bucket named `comment-audio`:

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New Bucket**
4. Name: `comment-audio`
5. **Public bucket**: ✅ Check this (or configure RLS policies for authenticated users)
6. Click **Create bucket**

### 3. Storage Bucket Policies (if using RLS)

If you want to use Row Level Security instead of a public bucket, add these policies:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Allow authenticated users to upload comment audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comment-audio');
```

**Policy 2: Allow authenticated users to read**
```sql
CREATE POLICY "Allow authenticated users to read comment audio"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comment-audio');
```

**Policy 3: Allow users to delete their own audio**
```sql
CREATE POLICY "Allow users to delete their own comment audio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'comment-audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Verification

After making these changes:

1. ✅ Comments table has the three new columns
2. ✅ `comment-audio` storage bucket exists
3. ✅ Storage policies are configured (if using RLS)
4. ✅ Test recording and uploading a voice note comment

## Notes

- Audio files are stored in the format: `{user_id}/{family_id}/comments/{timestamp}-{random}.webm`
- Maximum audio duration is 120 seconds (2 minutes) - enforced client-side
- Audio format: WebM with Opus codec (default browser MediaRecorder format)
- Comments can have text only, audio only, or both text and audio

---

# Database Changes for Profile Pictures

## Required Database Schema Changes

### 1. Add Column to `users` Table

Add the following column to your `users` table in Supabase:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

**Column Details:**
- `avatar_url` (TEXT, nullable): Stores the public URL to the profile picture in Supabase Storage

### 2. Create Supabase Storage Bucket

Create a new storage bucket named `avatars`:

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New Bucket**
4. Name: `avatars`
5. **Public bucket**: ✅ Check this (or configure RLS policies for authenticated users)
6. Click **Create bucket**

### 3. Storage Bucket Policies (if using RLS)

If you want to use Row Level Security instead of a public bucket, add these policies:

**Policy 1: Allow authenticated users to upload their own avatars**
```sql
CREATE POLICY "Allow authenticated users to upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Allow public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

**Policy 3: Allow users to update their own avatars**
```sql
CREATE POLICY "Allow users to update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 4: Allow users to delete their own avatars**
```sql
CREATE POLICY "Allow users to delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Verification

After making these changes:

1. ✅ Users table has the `avatar_url` column
2. ✅ `avatars` storage bucket exists
3. ✅ Storage policies are configured (if using RLS)
4. ✅ Test uploading and displaying a profile picture

## Notes

- Avatar files are stored in the format: `{user_id}/{timestamp}-{random}.{ext}`
- Supported formats: JPG, PNG, WebP (client-side validation)
- Maximum file size: Recommended 5MB or less (client-side validation)
- Profile pictures can be edited on the user's own profile page (`/protected/profile/[id]`)
- First name and last name can also be edited on the profile page

---

# Database Changes for Daily Memory Match Game

## Required Database Schema Changes

### 1. Create `game_rounds` Table

Create a new table to track daily game rounds per family:

```sql
CREATE TABLE IF NOT EXISTS game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  round_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, round_date)
);

CREATE INDEX IF NOT EXISTS idx_game_rounds_family_date 
ON game_rounds(family_id, round_date);
```

**Column Details:**
- `id` (UUID, primary key): Unique identifier for the round
- `family_id` (TEXT, foreign key): References the family this round belongs to
- `round_date` (DATE): The date this round is for (used for daily resets)
- `created_at` (TIMESTAMPTZ): When the round was created
- Unique constraint ensures one round per family per day

### 2. Create `game_sessions` Table

Create a new table to track individual game play sessions:

```sql
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_ms INTEGER NOT NULL,
  mistakes INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(round_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_round_user 
ON game_sessions(round_id, user_id);

CREATE INDEX IF NOT EXISTS idx_game_sessions_round_score 
ON game_sessions(round_id, score);
```

**Column Details:**
- `id` (UUID, primary key): Unique identifier for the session
- `round_id` (UUID, foreign key): References the game round this session belongs to
- `user_id` (TEXT, foreign key): References the user who played
- `duration_ms` (INTEGER): Time taken to complete the game in milliseconds
- `mistakes` (INTEGER): Number of incorrect matches made
- `score` (INTEGER): Calculated score (lower is better: duration_ms + mistakes * 1500)
- `created_at` (TIMESTAMPTZ): When the session was recorded
- Unique constraint ensures one best score per user per round (can be updated if better)

### 3. Row Level Security (RLS) Policies

Enable RLS on both tables and add policies:

```sql
-- Enable RLS
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read rounds for their family
CREATE POLICY "Users can read rounds for their family"
ON game_rounds FOR SELECT
TO authenticated
USING (
  family_id IN (
    SELECT family FROM family_members WHERE user = auth.uid()
  )
);

-- Policy: Users can insert rounds for their family
CREATE POLICY "Users can insert rounds for their family"
ON game_rounds FOR INSERT
TO authenticated
WITH CHECK (
  family_id IN (
    SELECT family FROM family_members WHERE user = auth.uid()
  )
);

-- Policy: Users can read sessions for their family's rounds
CREATE POLICY "Users can read sessions for their family's rounds"
ON game_sessions FOR SELECT
TO authenticated
USING (
  round_id IN (
    SELECT gr.id FROM game_rounds gr
    INNER JOIN family_members fm ON gr.family_id = fm.family
    WHERE fm.user = auth.uid()
  )
);

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
ON game_sessions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()::text AND
  round_id IN (
    SELECT gr.id FROM game_rounds gr
    INNER JOIN family_members fm ON gr.family_id = fm.family
    WHERE fm.user = auth.uid()
  )
);

-- Policy: Users can update their own sessions (to improve their score)
CREATE POLICY "Users can update their own sessions"
ON game_sessions FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);
```

## Verification

After making these changes:

1. ✅ `game_rounds` table exists with proper columns and indexes
2. ✅ `game_sessions` table exists with proper columns and indexes
3. ✅ RLS is enabled on both tables
4. ✅ RLS policies are configured correctly
5. ✅ Test creating a round, submitting a score, and viewing leaderboard
6. ✅ Verify that users can only see their family's rounds and sessions

## Notes

- Each family gets one round per day (date-based)
- Each user can have one best score per round (stored in `game_sessions` with unique constraint)
- Score calculation: `score = duration_ms + mistakes * 1500` (lower is better)
- Rounds automatically reset daily
- Leaderboard shows top scores for the current day's round
- Game is accessible at `/protected/game`

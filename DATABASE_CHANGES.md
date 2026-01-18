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

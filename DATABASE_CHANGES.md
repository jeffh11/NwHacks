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

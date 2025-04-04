# Profile Functionality Setup

This document provides instructions on how to set up the profile functionality in the application.

## Prerequisites

- Supabase project set up
- Environment variables configured

## Database Setup

1. Run the SQL migration script in your Supabase SQL editor:
   - Copy the contents of `src/lib/supabase-migrations.sql`
   - Paste into the Supabase SQL editor
   - Execute the script

This will:
- Create a `profiles` table
- Set up Row Level Security (RLS) policies
- Create a trigger to automatically create a profile when a user signs up
- Create a storage bucket for avatars
- Set up storage policies for avatar uploads

## Environment Variables

Make sure your `.env` file includes the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

The profile page allows users to:

1. View and edit their username
2. Upload and change their profile picture
3. View their email address (read-only)

## Implementation Details

- The profile data is stored in the `profiles` table in Supabase
- Profile images are stored in the `avatars` storage bucket
- User metadata is updated in both the `profiles` table and the auth user metadata
- The profile page is accessible via the `/profile` route
- A link to the profile page is available in the header of the code editor

## Usage

1. Navigate to the profile page by clicking the user icon in the header
2. Edit your username in the input field
3. Upload a profile picture by clicking the camera icon on the avatar
4. Click "Save Changes" to update your profile

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that your Supabase project has the correct tables and policies
3. Ensure your environment variables are correctly set
4. Check that the storage bucket for avatars exists and has the correct permissions 
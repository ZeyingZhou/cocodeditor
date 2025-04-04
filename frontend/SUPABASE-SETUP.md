# Supabase Setup Guide

This guide will help you set up the Supabase environment variables for your project.

## Step 1: Create a Supabase Project

If you haven't already, create a Supabase project:

1. Go to [https://supabase.com](https://supabase.com) and sign in or create an account
2. Click "New Project" and follow the setup wizard
3. Note your project URL and anon key (you'll need these later)

## Step 2: Configure Environment Variables

### Option 1: Using .env file (Recommended for development)

1. Create a `.env` file in the root of your project (if it doesn't exist already)
2. Add the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace `your-project-id` and `your-anon-key-here` with the values from your Supabase project.

### Option 2: Using environment variables directly (for production)

If you're deploying to a platform like Vercel, Netlify, or Heroku, you can set the environment variables directly in their dashboard.

## Step 3: Find Your Supabase Credentials

To find your Supabase URL and anon key:

1. Go to your Supabase project dashboard
2. Click on the "Settings" icon in the sidebar
3. Click on "API" in the settings menu
4. You'll find your project URL and anon key in the "Project API keys" section

## Step 4: Verify Your Setup

After setting up your environment variables:

1. Restart your development server
2. Check the browser console for any errors related to Supabase
3. Try to access the profile page to verify that the Supabase connection is working

## Troubleshooting

If you're still seeing the "Missing Supabase environment variables" error:

1. Make sure your `.env` file is in the correct location (root of your project)
2. Verify that the variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Ensure there are no spaces around the `=` sign in your `.env` file
4. Restart your development server after making changes to the `.env` file
5. If using Vite, make sure you're using the correct environment variable format (they must start with `VITE_`)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction) 
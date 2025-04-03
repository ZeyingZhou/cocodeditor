// Simple script to check if environment variables are properly set
console.log('Checking environment variables...');

// Check for Supabase environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please make sure you have the following in your .env file:');
  console.error('VITE_SUPABASE_URL=https://your-project-id.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
  process.exit(1);
} else {
  console.log('✅ Supabase environment variables are set');
  console.log(`URL: ${supabaseUrl.substring(0, 10)}...`);
  console.log(`Key: ${supabaseAnonKey.substring(0, 10)}...`);
}

// Add checks for other environment variables here

console.log('All environment variables are properly set!'); 
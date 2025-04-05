import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const TestSupabaseConfig = () => {
  useEffect(() => {
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Test the connection
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Supabase session:', session);
    }).catch(error => {
      console.error('Supabase connection error:', error);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Supabase Configuration Test</h2>
      <div className="space-y-2">
        <p>URL: {import.meta.env.VITE_SUPABASE_URL}</p>
        <p>Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}</p>
      </div>
    </div>
  );
};

export default TestSupabaseConfig; 

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

serve(async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  
  // Initialize Supabase client with the URL and anon key from environment
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { userId, isAdmin, isBanned } = await req.json();
    
    if (action === 'toggleAdmin') {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId);
        
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    if (action === 'banUser') {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', userId);
        
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

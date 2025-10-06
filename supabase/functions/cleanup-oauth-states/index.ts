import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Call the cleanup function
    const { error } = await supabaseClient.rpc('cleanup_expired_oauth_states');

    if (error) {
      console.error('Error cleaning up OAuth states:', error);
      
      // Log security event
      await supabaseClient.rpc('log_security_event', {
        _user_id: null,
        _event_type: 'oauth_cleanup_failed',
        _event_details: { error: error.message },
      });

      return new Response(
        JSON.stringify({ error: 'Cleanup failed' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log successful cleanup
    await supabaseClient.rpc('log_security_event', {
      _user_id: null,
      _event_type: 'oauth_cleanup_success',
      _event_details: { timestamp: new Date().toISOString() },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'OAuth states cleaned up successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

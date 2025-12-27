import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateRandomKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 5;
  
  const keySegments = [];
  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    keySegments.push(segment);
  }
  
  return keySegments.join('-');
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { scriptId, hwid, expiresAt, maxActivations = 1 } = await req.json();

    if (!scriptId) {
      return new Response(
        JSON.stringify({ error: 'Script ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', scriptId)
      .maybeSingle();

    if (scriptError || !script) {
      return new Response(
        JSON.stringify({ error: 'Script not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const keyValue = generateRandomKey();
    const expiration = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: keyData, error: keyError } = await supabase
      .from('script_keys')
      .insert({
        script_id: scriptId,
        key_value: keyValue,
        hwid: hwid || null,
        expires_at: expiration,
        max_activations: maxActivations,
        current_activations: 0,
        is_active: true
      })
      .select()
      .single();

    if (keyError) throw keyError;

    return new Response(
      JSON.stringify({
        success: true,
        key: keyData.key_value,
        expiresAt: keyData.expires_at,
        scriptName: script.name
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Key generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
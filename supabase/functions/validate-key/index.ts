import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { key, hwid } = await req.json();

    if (!key || !hwid) {
      return new Response(
        JSON.stringify({ error: 'Key and HWID are required', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: keyData, error: keyError } = await supabase
      .from('script_keys')
      .select('*, scripts(*)')
      .eq('key_value', key)
      .eq('is_active', true)
      .maybeSingle();

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid key', valid: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const expiresAt = new Date(keyData.expires_at);

    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Key has expired', valid: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: activation } = await supabase
      .from('key_activations')
      .select('*')
      .eq('key_id', keyData.id)
      .eq('hwid', hwid)
      .maybeSingle();

    if (activation) {
      await supabase
        .from('key_activations')
        .update({ last_validated_at: now.toISOString() })
        .eq('id', activation.id);

      return new Response(
        JSON.stringify({
          valid: true,
          script: keyData.scripts.obfuscated_script,
          scriptName: keyData.scripts.name,
          expiresAt: keyData.expires_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (keyData.hwid && keyData.hwid !== hwid) {
      return new Response(
        JSON.stringify({ error: 'Key is locked to a different HWID', valid: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (keyData.current_activations >= keyData.max_activations) {
      return new Response(
        JSON.stringify({ error: 'Key activation limit reached', valid: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const connInfo = req.headers.get('x-forwarded-for') || 'unknown';

    await supabase
      .from('key_activations')
      .insert({
        key_id: keyData.id,
        hwid: hwid,
        ip_address: connInfo
      });

    await supabase
      .from('script_keys')
      .update({
        current_activations: keyData.current_activations + 1,
        hwid: keyData.hwid || hwid
      })
      .eq('id', keyData.id);

    return new Response(
      JSON.stringify({
        valid: true,
        script: keyData.scripts.obfuscated_script,
        scriptName: keyData.scripts.name,
        expiresAt: keyData.expires_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ error: error.message, valid: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
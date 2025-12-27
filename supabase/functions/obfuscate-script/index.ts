import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function obfuscateLuaScript(script: string): string {
  try {
    let obfuscated = script;
    
    const stringMap = new Map<string, string>();
    let stringCounter = 0;
    obfuscated = obfuscated.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
      const varName = `_S${stringCounter++}`;
      stringMap.set(varName, match);
      return varName;
    });
    
    const varMap = new Map<string, string>();
    const varPattern = /\b(?:local\s+)?(\w+)\s*=/g;
    let varCounter = 0;
    const matches = [...obfuscated.matchAll(varPattern)];
    matches.forEach(match => {
      const originalVar = match[1];
      if (!varMap.has(originalVar) && !originalVar.startsWith('_')) {
        varMap.set(originalVar, `_0x${varCounter.toString(16)}${Math.random().toString(36).substr(2, 5)}`);
        varCounter++;
      }
    });
    
    varMap.forEach((newVar, oldVar) => {
      const regex = new RegExp(`\\b${oldVar}\\b`, 'g');
      obfuscated = obfuscated.replace(regex, newVar);
    });
    
    stringMap.forEach((originalString, placeholder) => {
      obfuscated = obfuscated.replace(new RegExp(placeholder, 'g'), originalString);
    });
    
    obfuscated = obfuscated.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('--')) return '';
      return line.replace(/--.*$/, '');
    }).filter(line => line.trim() !== '').join('\n');
    
    obfuscated = obfuscated.replace(/\n\s*\n/g, '\n');
    
    const lines = obfuscated.split('\n');
    const chunks: string[] = [];
    for (let i = 0; i < lines.length; i += 3) {
      chunks.push(lines.slice(i, i + 3).join('\\n'));
    }
    
    const encoded = chunks.map(chunk => {
      return `"${chunk}"`;
    }).join(',');
    
    const wrapper = `local _v={${encoded}};local _c=table.concat;local _e=function(s)return(loadstring or load)(s)()end;_e(_c(_v,''))`;
    
    return wrapper;
  } catch (error) {
    console.error('Obfuscation error:', error);
    return script;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { script, scriptId, name, description } = await req.json();

    if (!script) {
      return new Response(
        JSON.stringify({ error: 'Script content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const obfuscatedScript = obfuscateLuaScript(script);

    if (scriptId) {
      const { data, error } = await supabase
        .from('scripts')
        .update({
          original_script: script,
          obfuscated_script: obfuscatedScript,
          updated_at: new Date().toISOString()
        })
        .eq('id', scriptId)
        .select()
        .maybeSingle();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const { data, error } = await supabase
        .from('scripts')
        .insert({
          name: name || 'Untitled Script',
          description: description || '',
          original_script: script,
          obfuscated_script: obfuscatedScript
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
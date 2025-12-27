import { useEffect, useState } from 'react';
import { supabase, Script } from '../lib/supabase';
import { FileCode, Trash2, Key, Copy, Check } from 'lucide-react';

interface ScriptListProps {
  onSelectScript: (script: Script) => void;
}

export function ScriptList({ onSelectScript }: ScriptListProps) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadScripts();
  }, []);

  async function loadScripts() {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error('Error loading scripts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteScript(id: string) {
    if (!confirm('Yakin ingin menghapus script ini?')) return;

    try {
      const { error } = await supabase.from('scripts').delete().eq('id', id);
      if (error) throw error;
      setScripts(scripts.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting script:', error);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scripts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileCode className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada script</h3>
          <p className="mt-1 text-sm text-gray-500">Mulai dengan membuat script baru</p>
        </div>
      ) : (
        scripts.map(script => (
          <div
            key={script.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{script.name}</h3>
                {script.description && (
                  <p className="mt-1 text-sm text-gray-600">{script.description}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Dibuat: {new Date(script.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onSelectScript(script)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Kelola Keys"
                >
                  <Key className="h-5 w-5" />
                </button>
                <button
                  onClick={() => copyToClipboard(script.obfuscated_script, script.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Copy Script"
                >
                  {copiedId === script.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => deleteScript(script.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

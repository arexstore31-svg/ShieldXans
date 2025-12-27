import { useEffect, useState } from 'react';
import { supabase, Script, ScriptKey } from '../lib/supabase';
import { Key, Plus, Trash2, Copy, Check, X } from 'lucide-react';

interface KeyManagerProps {
  script: Script;
  onClose: () => void;
}

export function KeyManager({ script, onClose }: KeyManagerProps) {
  const [keys, setKeys] = useState<ScriptKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    hwid: '',
    maxActivations: 1,
    expirationDays: 7,
  });

  useEffect(() => {
    loadKeys();
  }, [script.id]);

  async function loadKeys() {
    try {
      const { data, error } = await supabase
        .from('script_keys')
        .select('*')
        .eq('script_id', script.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeys(data || []);
    } catch (error) {
      console.error('Error loading keys:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expirationDays);

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          scriptId: script.id,
          hwid: formData.hwid || null,
          expiresAt: expiresAt.toISOString(),
          maxActivations: formData.maxActivations,
        }),
      });

      if (!response.ok) throw new Error('Gagal membuat key');

      setShowCreateForm(false);
      setFormData({ hwid: '', maxActivations: 1, expirationDays: 7 });
      await loadKeys();
    } catch (error) {
      console.error('Error creating key:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('Yakin ingin menghapus key ini?')) return;

    try {
      const { error } = await supabase.from('script_keys').delete().eq('id', id);
      if (error) throw error;
      setKeys(keys.filter(k => k.id !== id));
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  }

  async function toggleKeyStatus(key: ScriptKey) {
    try {
      const { error } = await supabase
        .from('script_keys')
        .update({ is_active: !key.is_active })
        .eq('id', key.id);

      if (error) throw error;
      await loadKeys();
    } catch (error) {
      console.error('Error updating key:', error);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function getKeyUrl(keyValue: string) {
    return `${window.location.origin}/getkey?key=${keyValue}`;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Key Management</h2>
            <p className="text-sm text-gray-600 mt-1">{script.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Buat Key Baru
            </button>
          </div>

          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Konfigurasi Key Baru</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HWID (opsional - kosongkan untuk auto-bind)
                  </label>
                  <input
                    type="text"
                    value={formData.hwid}
                    onChange={(e) => setFormData({ ...formData, hwid: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Hardware ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maksimal Aktivasi
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxActivations}
                    onChange={(e) => setFormData({ ...formData, maxActivations: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Masa Berlaku (hari)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.expirationDays}
                    onChange={(e) => setFormData({ ...formData, expirationDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={createKey}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    Generate Key
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {keys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Key className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>Belum ada key untuk script ini</p>
              </div>
            ) : (
              keys.map(key => (
                <div
                  key={key.id}
                  className={`p-4 border rounded-lg ${
                    key.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-lg font-mono font-semibold text-gray-900">
                          {key.key_value}
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.key_value, key.id)}
                          className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {copiedKey === key.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>HWID: {key.hwid || 'Belum terikat'}</p>
                        <p>Aktivasi: {key.current_activations} / {key.max_activations}</p>
                        <p>Expired: {new Date(key.expires_at).toLocaleString('id-ID')}</p>
                        <p className="mt-2">
                          <span className="font-medium">Link Get Key: </span>
                          <button
                            onClick={() => copyToClipboard(getKeyUrl(key.key_value), `url-${key.id}`)}
                            className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                          >
                            {getKeyUrl(key.key_value)}
                            {copiedKey === `url-${key.id}` ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => toggleKeyStatus(key)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          key.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {key.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

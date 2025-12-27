import { useEffect, useState } from 'react';
import { Key, Copy, Check, AlertCircle } from 'lucide-react';

export function GetKeyPage() {
  const [hwid, setHwid] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keyParam = params.get('key');
    if (keyParam) {
      setGeneratedKey(keyParam);
    }
  }, []);

  function generateHWID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
      if ([7, 15, 23].includes(i)) result += '-';
    }
    setHwid(result);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Key className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Your Key</h1>
          <p className="text-gray-600">Dapatkan key untuk mengakses script</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!generatedKey ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hardware ID (HWID)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hwid}
                  onChange={(e) => setHwid(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Masukkan HWID Anda"
                />
                <button
                  onClick={generateHWID}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                HWID akan mengikat key ke perangkat Anda
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">Cara Mendapatkan HWID:</h3>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Jalankan game Roblox</li>
                <li>Execute script loader yang diberikan</li>
                <li>HWID akan ditampilkan di UI</li>
                <li>Copy dan paste HWID ke form ini</li>
              </ol>
            </div>

            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                const keyParam = params.get('key');
                if (keyParam) {
                  setGeneratedKey(keyParam);
                } else {
                  setError('Key tidak ditemukan di URL');
                }
              }}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {loading ? 'Memproses...' : 'Dapatkan Key'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-3">Key Anda:</p>
              <div className="flex items-center gap-2 bg-white p-3 rounded border border-green-300">
                <code className="flex-1 text-lg font-mono font-bold text-gray-900 break-all">
                  {generatedKey}
                </code>
                <button
                  onClick={() => copyToClipboard(generatedKey)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors flex-shrink-0"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Langkah Selanjutnya:</h3>
              <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside">
                <li>Copy key di atas</li>
                <li>Kembali ke Roblox</li>
                <li>Jalankan script lagi</li>
                <li>Paste key ke input yang muncul</li>
                <li>Tekan Submit dan script akan berjalan</li>
              </ol>
            </div>

            <button
              onClick={() => copyToClipboard(generatedKey)}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy Key
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ScriptList } from './components/ScriptList';
import { ScriptForm } from './components/ScriptForm';
import { KeyManager } from './components/KeyManager';
import { GetKeyPage } from './components/GetKeyPage';
import { LuaScriptViewer } from './components/LuaScriptViewer';
import { Script } from './lib/supabase';
import { Shield, FileCode } from 'lucide-react';

function App() {
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isGetKeyPage, setIsGetKeyPage] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/getkey' || window.location.search.includes('key=')) {
      setIsGetKeyPage(true);
    }
  }, []);

  if (isGetKeyPage) {
    return <GetKeyPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Roblox Script Obfuscator</h1>
              <p className="text-sm text-gray-600 mt-1">
                Amankan script Roblox Anda dengan obfuscation dan key system HWID
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ScriptForm onScriptCreated={() => setRefreshKey(prev => prev + 1)} />
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileCode className="h-5 w-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">Daftar Script</h2>
              </div>
              <ScriptList key={refreshKey} onSelectScript={setSelectedScript} />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Cara Menggunakan:</h3>
          <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
            <li>Paste script Lua Anda di form dan klik "Obfuscate Script"</li>
            <li>Script akan di-obfuscate dan tersimpan otomatis</li>
            <li>Klik tombol Key untuk membuat key system dengan HWID dan expiration</li>
            <li>Copy link "Get Key" dan bagikan ke user Anda</li>
            <li>User akan menggunakan Lua loader script (lihat di bawah) untuk validasi key</li>
            <li>Setelah key valid, script akan otomatis dijalankan di Roblox</li>
          </ol>
        </div>

        <div className="mt-8">
          <LuaScriptViewer />
        </div>
      </main>

      {selectedScript && (
        <KeyManager
          script={selectedScript}
          onClose={() => {
            setSelectedScript(null);
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}

export default App;

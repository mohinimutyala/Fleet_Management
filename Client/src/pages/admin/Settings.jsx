import Sidebar from '../../components/Sidebar';
import { Settings as SettingsIcon, Bell, Shield, Database } from 'lucide-react';

const Settings = () => (
  <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <h1 className="text-2xl font-black text-white mb-2">Settings</h1>
      <p className="text-white/40 text-sm mb-8">Platform configuration and preferences</p>

      <div className="max-w-xl space-y-4">
        {[
          { icon: Bell, title: 'Notifications', desc: 'Configure email and push notification preferences' },
          { icon: Shield, title: 'Security', desc: 'Password policies, 2FA, and session management' },
          { icon: Database, title: 'Data Management', desc: 'Export data, manage backups, and cleanup tools' },
          { icon: SettingsIcon, title: 'General', desc: 'Platform name, timezone, currency settings' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card hover:border-white/20 transition-all cursor-pointer flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center border border-yellow-400/20 shrink-0">
              <Icon className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="font-semibold text-white">{title}</p>
              <p className="text-sm text-white/40">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
);

export default Settings;

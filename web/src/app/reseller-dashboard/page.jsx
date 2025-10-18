'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardHeader } from '@/components/UserDashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/UserDashboard/DashboardSidebar';
import { KeysTab } from '@/components/UserDashboard/KeysTab';
import { ApplicationsTab } from '@/components/UserDashboard/ApplicationsTab';
import { DocumentationTab } from '@/components/UserDashboard/DocumentationTab';
import { CreateKeyModal } from '@/components/UserDashboard/CreateKeyModal';
import { CreateAppModal } from '@/components/UserDashboard/CreateAppModal';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Key, Layers } from 'lucide-react';

export default function ResellerDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('keys');
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.userType !== 'reseller') {
        window.location.href = '/';
        return;
      }
      setUser(parsedUser);
    } else {
      window.location.href = '/';
    }
  }, []);

  // Fetch user details to get key limit and current usage
  const { data: userData } = useQuery({
    queryKey: ['reseller-details', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
      return data.users.find(u => u.id === user.id);
    },
    enabled: !!user
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const keyLimit = userData?.key_limit;
  const keysUsed = userData?.key_count || 0;
  const canCreateMoreKeys = !keyLimit || keysUsed < keyLimit;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Modified header to show it's reseller dashboard */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://ucarecdn.com/201a4688-4d6c-4c8f-a581-2a4d74f80633/-/format/auto/" 
                alt="PanixAuth Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold">PanixAuth Reseller Portal</h1>
                <p className="text-sm text-gray-400">Welcome back, {user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('docs')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <span>Documentation</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Key Usage Banner for Resellers */}
        {keyLimit && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg border ${
              keysUsed >= keyLimit 
                ? 'bg-red-900/20 border-red-700 text-red-300' 
                : keysUsed / keyLimit > 0.8 
                  ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
                  : 'bg-blue-900/20 border-blue-700 text-blue-300'
            }`}>
              <div className="flex items-center space-x-3">
                {keysUsed >= keyLimit ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Key className="w-5 h-5" />
                )}
                <div>
                  <h3 className="font-semibold">
                    Key Usage: {keysUsed} / {keyLimit} 
                    {keyLimit && ` (${Math.round((keysUsed / keyLimit) * 100)}%)`}
                  </h3>
                  <p className="text-sm opacity-90">
                    {keysUsed >= keyLimit 
                      ? 'You have reached your key limit. Contact admin to increase your limit.'
                      : keyLimit - keysUsed > 1 
                        ? `You can create ${keyLimit - keysUsed} more keys.`
                        : 'You can create 1 more key.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1">
            {activeTab === 'keys' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Key Management</h2>
                    <p className="text-gray-400 mt-1">Generate and manage your authentication keys</p>
                  </div>
                  <button
                    onClick={() => setShowCreateKey(true)}
                    disabled={!canCreateMoreKeys}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      canCreateMoreKeys
                        ? 'bg-blue-600 hover:bg-blue-500'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Generate Key</span>
                    {keyLimit && (
                      <span className="text-xs">({keysUsed}/{keyLimit})</span>
                    )}
                  </button>
                </div>
                
                <KeysTab
                  user={user}
                  setShowCreateKey={setShowCreateKey}
                  selectedApp={selectedApp}
                  setSelectedApp={setSelectedApp}
                  setActiveTab={setActiveTab}
                />
              </div>
            )}

            {activeTab === 'apps' && (
              <ApplicationsTab
                user={user}
                setShowCreateApp={setShowCreateApp}
              />
            )}

            {activeTab === 'docs' && <DocumentationTab />}
          </div>
        </div>
      </div>

      {/* Create Key Modal with Reseller Restrictions */}
      {showCreateKey && canCreateMoreKeys && (
        <CreateKeyModal
          user={user}
          selectedApp={selectedApp}
          onClose={() => setShowCreateKey(false)}
          onSuccess={() => {
            setShowCreateKey(false);
            queryClient.invalidateQueries({ queryKey: ['user-keys'] });
            queryClient.invalidateQueries({ queryKey: ['reseller-details'] });
          }}
        />
      )}

      {showCreateApp && (
        <CreateAppModal
          user={user}
          onClose={() => setShowCreateApp(false)}
          onSuccess={() => {
            setShowCreateApp(false);
            queryClient.invalidateQueries({ queryKey: ['user-applications'] });
          }}
        />
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    battleReminders: true,
    tribeUpdates: true,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTribeSwitch, setShowTribeSwitch] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    // TODO: Save to backend
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Delete account');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-tribe pb-20">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-heritage-orange transition-colors"
          >
            ← Back
          </button>
          <h1 className="font-headline text-2xl text-white">Settings</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Account Section */}
        <div className="card-glass">
          <h2 className="font-headline text-xl text-white mb-4">Account</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-semibold">Username</div>
                <div className="text-gray-400 text-sm">@{user?.username}</div>
              </div>
              <button className="text-heritage-orange hover:text-heritage-gold transition-colors font-semibold">
                Edit
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-semibold">Email</div>
                <div className="text-gray-400 text-sm">{user?.email || 'Not set'}</div>
              </div>
              <button className="text-heritage-orange hover:text-heritage-gold transition-colors font-semibold">
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card-glass">
          <h2 className="font-headline text-xl text-white mb-4">Notifications</h2>
          
          <div className="space-y-4">
            {[
              { key: 'notifications', label: 'Push Notifications', desc: 'Get notified about battles and votes' },
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Weekly summary emails' },
              { key: 'battleReminders', label: 'Battle Reminders', desc: 'Remind me when battles are ending' },
              { key: 'tribeUpdates', label: 'Tribe Updates', desc: 'Updates about your tribe\'s progress' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="text-white font-semibold">{item.label}</div>
                  <div className="text-gray-400 text-sm">{item.desc}</div>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    settings[item.key] ? 'bg-savannah-green' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    settings[item.key] ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tribe Section */}
        <div className="card-glass">
          <h2 className="font-headline text-xl text-white mb-4">Tribe</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-semibold">Current Tribe</div>
                <div className="text-gray-400 text-sm">🦁 Lagos Lions</div>
              </div>
              <button
                onClick={() => setShowTribeSwitch(true)}
                className="text-heritage-orange hover:text-heritage-gold transition-colors font-semibold"
              >
                Switch
              </button>
            </div>
            {showTribeSwitch && (
              <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                <p className="text-yellow-300 text-sm mb-3">
                  ⚠️ You can switch tribes after 30 days. Your current rank will be reset.
                </p>
                <Button className="btn-outline border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:text-white">
                  Change Tribe (Available in 12 days)
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Section */}
        <div className="card-glass">
          <h2 className="font-headline text-xl text-white mb-4">Subscription</h2>
          
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white font-semibold">
                  {user?.subscription?.status === 'warrior' ? 'Warrior Plan' : 'Free Plan'}
                </div>
                <div className="text-gray-400 text-sm">
                  {user?.subscription?.status === 'warrior' 
                    ? '$4.99/month • Unlimited access' 
                    : '3 transformations per day'}
                </div>
              </div>
              {user?.subscription?.status !== 'warrior' && (
                <Button
                  onClick={() => navigate('/upgrade')}
                  className="btn-primary"
                >
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="card-glass">
          <h2 className="font-headline text-xl text-white mb-4">Support</h2>
          
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <div className="text-white font-semibold">Help Center</div>
              <div className="text-gray-400 text-sm">Get help and find answers</div>
            </button>
            <button className="w-full text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <div className="text-white font-semibold">Contact Support</div>
              <div className="text-gray-400 text-sm">We're here to help</div>
            </button>
            <button className="w-full text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <div className="text-white font-semibold">Terms of Service</div>
              <div className="text-gray-400 text-sm">Read our terms</div>
            </button>
            <button className="w-full text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <div className="text-white font-semibold">Privacy Policy</div>
              <div className="text-gray-400 text-sm">How we protect your data</div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card-glass border-masai-red/50">
          <h2 className="font-headline text-xl text-masai-red mb-4">Danger Zone</h2>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left"
            >
              <div className="text-white font-semibold">Log Out</div>
              <div className="text-gray-400 text-sm">Sign out of your account</div>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full p-4 bg-masai-red/20 border border-masai-red rounded-lg hover:bg-masai-red/30 transition-all text-left"
            >
              <div className="text-masai-red font-semibold">Delete Account</div>
              <div className="text-gray-400 text-sm">Permanently delete your account and data</div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-gray-400 text-sm space-y-1">
          <div>Afroverse v1.0.0</div>
          <div>Built with pride 🔥👑🌍</div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="card-glass max-w-md w-full p-6">
            <h3 className="font-headline text-2xl text-white mb-4">Delete Account?</h3>
            <p className="text-gray-300 mb-6">
              This action cannot be undone. All your transformations, battles, and progress will be permanently deleted.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-masai-red hover:bg-red-700 text-white font-bold"
              >
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoToChat = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Profile
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your account and view your stats
          </p>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              {user?.username}
            </h2>
            
            <div className="text-gray-300 space-y-2">
              <p>📱 {user?.phone}</p>
              <p>🎨 {user?.subscription?.status === 'warrior' ? 'Warrior Plan' : 'Free Plan'}</p>
              <p>📅 Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="mt-6">
              <Button
                onClick={handleGoToChat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                💬 Go to Chat
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

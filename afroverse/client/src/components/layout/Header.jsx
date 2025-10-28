import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { selectConversations } from '../../store/slices/chatSlice';
import Button from '../common/Button';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const conversations = useSelector(selectConversations);

  // Calculate unread count
  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-white font-bold text-xl">Afroverse</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/transform"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Transform
            </Link>
            <Link
              to="/battles"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Battles
            </Link>
            <Link
              to="/leaderboard"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              to="/chat"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors relative"
            >
              Chat
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/creators"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Creators
            </Link>
            <Link
              to="/achievements"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Achievements
            </Link>
            <Link
              to="/feed"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Feed
            </Link>
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{user.username}</p>
                  <p className="text-gray-400 text-xs">
                    {user.subscription?.status === 'warrior' ? 'Warrior' : 'Free'} Plan
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.username?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

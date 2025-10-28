import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import TribeStatusBanner from '../tribe/TribeStatusBanner';

const BottomNavLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navItems = [
    {
      id: 'feed',
      label: 'Feed',
      icon: '🔥',
      activeIcon: '🔥',
      path: '/feed',
      description: 'Battle Feed'
    },
    {
      id: 'tribe',
      label: 'Tribe',
      icon: '⚔️',
      activeIcon: '⚔️',
      path: '/tribe',
      description: 'Your Tribe'
    },
    {
      id: 'create',
      label: 'Create',
      icon: '➕',
      activeIcon: '➕',
      path: '/transform',
      isSpecial: true,
      description: 'Transform'
    },
    {
      id: 'leaderboard',
      label: 'Ranks',
      icon: '🏆',
      activeIcon: '🏆',
      path: '/leaderboard',
      description: 'Leaderboard'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      activeIcon: '👤',
      path: '/profile',
      description: 'Your Profile'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavClick = (item) => {
    if (item.isSpecial) {
      // For create button, show modal or navigate
      navigate(item.path);
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
      {/* Tribe Status Banner */}
      {user?.tribe && <TribeStatusBanner tribe={user.tribe} />}

      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-screen-xl mx-auto px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const active = isActive(item.path);
              
              if (item.isSpecial) {
                // Special Create Button (FAB-style)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className="relative -mt-8 group"
                  >
                    <div className="relative">
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      
                      {/* Main button */}
                      <div className="relative w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-200">
                        <span className="text-3xl">{item.icon}</span>
                      </div>
                    </div>
                    
                    {/* Label */}
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs font-semibold whitespace-nowrap">
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`flex flex-col items-center justify-center space-y-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className={`text-2xl transition-transform duration-200 ${
                    active ? 'scale-110' : 'scale-100'
                  }`}>
                    {active ? item.activeIcon : item.icon}
                  </span>
                  <span className={`text-xs font-medium transition-colors duration-200 ${
                    active ? 'text-white' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default BottomNavLayout;



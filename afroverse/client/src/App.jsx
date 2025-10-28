import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import { store } from './store';

// Pages
import Authentication from './pages/Authentication';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Transform from './pages/Transform';
import Battle from './pages/Battle';
import BattleDetail from './pages/BattleDetail';
import Battles from './pages/Battles';
import Feed from './pages/Feed';
import BattleChallenge from './pages/BattleChallenge';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import ProfilePage from './pages/ProfilePage';
import TribePage from './pages/TribePage';
import SettingsPage from './pages/SettingsPage';
import ChallengesPage from './pages/ChallengesPage';
import EventsPage from './pages/EventsPage';
import ChatPage from './pages/ChatPage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import CreatorDiscoveryPage from './pages/CreatorDiscoveryPage';
import AchievementsPage from './pages/AchievementsPage';
import FeedPage from './pages/FeedPage';
import PublicVideoPlayer from './pages/PublicVideoPlayer';
import NotFound from './pages/NotFound';

// Vibranium Component Library (Design System Showcase)
import VibraniumComponentLibrary from './components/common/VibraniumComponentLibrary';

// Packet 7 - Hi-Fi Screen Mockups
import LandingHero from './pages/LandingHero';
import CreateFlow from './pages/CreateFlow';
import TransformationResult from './pages/TransformationResult';
import BattleFeed from './pages/BattleFeed';
import BattleLobby from './pages/BattleLobby';
import ShareFlow from './pages/ShareFlow';
import TribeSelection from './pages/TribeSelection';
import LeaderboardPage from './pages/LeaderboardPage';
import UserProfile from './pages/UserProfile';
import WhatsAppChallenge from './pages/WhatsAppChallenge';

// Components
import Layout from './components/layout/Layout';
import BottomNavLayout from './components/layout/BottomNavLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AchievementPopup } from './components/achievements';
import SoftPaywallModal from './components/payment/SoftPaywallModal';

// Protected Route with Bottom Nav Layout
function ProtectedBottomNavLayout({ children }) {
  return React.createElement(ProtectedRoute, null,
    React.createElement(BottomNavLayout, null, children)
  );
}

// Protected Route with Standard Layout (for pages that need header/footer)
function ProtectedLayout({ children }) {
  return React.createElement(ProtectedRoute, null,
    React.createElement(Layout, null, children)
  );
}

function App() {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Landing Page (Public) */}
              <Route path="/welcome" element={<Landing />} />
              
              {/* Public Routes */}
              <Route path="/auth" element={<Authentication />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              
              {/* WhatsApp Entry Point - Public Battle Challenge */}
              <Route path="/challenge/:shortCode" element={<BattleChallenge />} />
              <Route path="/b/:shortCode" element={<BattleChallenge />} />
              
              {/* Public Video Player */}
              <Route path="/v/:videoId" element={<PublicVideoPlayer />} />
              
              {/* Design System Showcase */}
              <Route path="/design-system" element={<VibraniumComponentLibrary />} />
              
              {/* PACKET 7 - Hi-Fi Screen Mockups */}
              {/* <Route path="/landing-hero" element={<LandingHero />} />
              <Route path="/create-flow" element={<CreateFlow />} />
              <Route path="/transformation-result" element={<TransformationResult />} />
              <Route path="/battle-feed" element={<BattleFeed />} />
              <Route path="/battle-lobby/:battleId" element={<BattleLobby />} />
              <Route path="/share" element={<ShareFlow />} />
              <Route path="/tribe-selection" element={<TribeSelection />} />
              <Route path="/leaderboard-page" element={<LeaderboardPage />} />
              <Route path="/user-profile" element={<UserProfile />} />
              <Route path="/whatsapp-challenge/:shortCode" element={<WhatsAppChallenge />} /> */}
              
              {/* Main App Routes with Bottom Navigation (TikTok-style) */}
              <Route path="/" element={<Navigate to="/feed" replace />} />
              <Route path="/feed" element={<ProtectedBottomNavLayout><Feed /></ProtectedBottomNavLayout>} />
              <Route path="/transform" element={<ProtectedBottomNavLayout><Transform /></ProtectedBottomNavLayout>} />
              <Route path="/leaderboard" element={<ProtectedBottomNavLayout><Leaderboard /></ProtectedBottomNavLayout>} />
              <Route path="/profile" element={<ProtectedBottomNavLayout><ProfilePage /></ProtectedBottomNavLayout>} />
              
              {/* Tribe Route (with bottom nav) */}
              <Route path="/tribe" element={<ProtectedBottomNavLayout><TribePage /></ProtectedBottomNavLayout>} />
              
              {/* Battle Routes */}
              <Route path="/battle/:battleId" element={<ProtectedRoute><BattleDetail /></ProtectedRoute>} />
              <Route path="/battles" element={<ProtectedLayout><Battles /></ProtectedLayout>} />
              
              {/* Settings & System */}
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/upgrade" element={<ProtectedRoute><SoftPaywallModal isOpen={true} onClose={() => {}} onUpgrade={() => {}} /></ProtectedRoute>} />
              
              {/* Other Protected Routes (standard layout) */}
              <Route path="/challenges" element={<ProtectedLayout><ChallengesPage /></ProtectedLayout>} />
              <Route path="/events" element={<ProtectedLayout><EventsPage /></ProtectedLayout>} />
              <Route path="/chat" element={<ProtectedLayout><ChatPage /></ProtectedLayout>} />
              <Route path="/profile/:username" element={<ProtectedLayout><CreatorProfilePage /></ProtectedLayout>} />
              <Route path="/creators" element={<ProtectedLayout><CreatorDiscoveryPage /></ProtectedLayout>} />
              <Route path="/achievements" element={<ProtectedLayout><AchievementsPage /></ProtectedLayout>} />
              
              {/* Legacy Routes */}
              <Route path="/home" element={<Navigate to="/feed" replace />} />
              
              {/* 404 */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </Router>
        <AchievementPopup />
      </ChakraProvider>
    </Provider>
  );
}

export default App;

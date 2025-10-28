import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const BattleChallenge = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [battle, setBattle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedSide, setSelectedSide] = useState(null);

  useEffect(() => {
    // Fetch battle data
    const fetchBattle = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/battles/challenge/${shortCode}`);
        // const data = await response.json();
        
        // Mock data
        const mockBattle = {
          id: shortCode,
          leftUser: 'Challenger',
          leftImage: '/placeholder.jpg',
          leftStyle: 'Maasai Warrior',
          rightUser: 'You',
          rightImage: null,
          rightStyle: 'Accept Challenge',
          title: 'Epic Battle Challenge!',
          message: 'Think you can beat my transformation? 🔥'
        };
        
        setBattle(mockBattle);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading battle:', error);
        setIsLoading(false);
      }
    };

    fetchBattle();
  }, [shortCode]);

  const handleVote = (side) => {
    if (!isAuthenticated) {
      // Save intent and redirect to auth
      sessionStorage.setItem('postAuthAction', JSON.stringify({
        type: 'vote',
        battleId: shortCode,
        side
      }));
      navigate('/auth?from=battle');
      return;
    }

    setSelectedSide(side);
    setHasVoted(true);

    // TODO: Call vote API
    // voteOnBattle(shortCode, side);
  };

  const handleAcceptChallenge = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('postAuthAction', JSON.stringify({
        type: 'accept_challenge',
        battleId: shortCode
      }));
      navigate('/auth?from=battle');
      return;
    }

    navigate('/transform?challenge=' + shortCode);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader size="xl" color="white" />
          <p className="text-white mt-4">Loading battle...</p>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Battle Not Found</h1>
          <Button onClick={() => navigate('/feed')}>
            Go to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xl">⚔️</span>
            </div>
            <div>
              <h1 className="text-white font-bold">Battle Challenge</h1>
              <p className="text-gray-400 text-xs">From WhatsApp</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Challenge Message */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6 mb-8 border-2 border-orange-500/50 text-center">
          <div className="text-6xl mb-4 animate-bounce">🔥</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            You've Been Challenged!
          </h2>
          <p className="text-xl text-orange-200">
            {battle.message}
          </p>
        </div>

        {/* Battle Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Challenger Side */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-center mb-4">
              <h3 className="text-white font-bold text-xl mb-2">The Challenger</h3>
              <div className="aspect-square rounded-xl overflow-hidden border-4 border-purple-500/50 mb-4">
                <img
                  src={battle.leftImage}
                  alt={battle.leftUser}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">👤</span>
                <span className="text-white font-bold">{battle.leftUser}</span>
              </div>
              <p className="text-gray-300 text-sm">{battle.leftStyle}</p>
            </div>

            {!hasVoted && (
              <Button
                onClick={() => handleVote('left')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Vote for Challenger
              </Button>
            )}
          </div>

          {/* Your Side */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-500/50">
            <div className="text-center mb-4">
              <h3 className="text-white font-bold text-xl mb-2">You</h3>
              <div className="aspect-square rounded-xl overflow-hidden border-4 border-green-500/50 mb-4 bg-black/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">❓</div>
                  <p className="text-white font-bold">Your Turn!</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">Create your transformation to compete</p>
            </div>

            <Button
              onClick={handleAcceptChallenge}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
            >
              🎨 Accept Challenge & Transform
            </Button>
          </div>
        </div>

        {/* After Vote */}
        {hasVoted && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center animate-fade-in">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-white font-bold text-2xl mb-2">Vote Submitted!</h3>
            <p className="text-gray-300 mb-6">
              Now create your own transformation and join the battle feed!
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => navigate('/transform')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                🎨 Create Your Own
              </Button>
              <Button
                onClick={() => navigate('/feed')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Explore Feed
              </Button>
            </div>
          </div>
        )}

        {/* CTA for Non-Users */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/50 text-center">
            <h3 className="text-white font-bold text-xl mb-2">
              Join Afroverse to Vote & Battle! 🔥
            </h3>
            <p className="text-gray-300 mb-4">
              Create your account to vote on battles and create your own transformations
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              Sign Up Free 🚀
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BattleChallenge;



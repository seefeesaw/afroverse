import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Confetti from '../components/common/Confetti';
import EnhancedShareModal from '../components/common/EnhancedShareModal';

const BattleDetail = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  
  const [battle, setBattle] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedSide, setSelectedSide] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Simulate battle data
  useEffect(() => {
    // TODO: Replace with actual API call
    const mockBattle = {
      id: battleId,
      status: 'active', // 'active', 'completed'
      leftUser: {
        username: 'Lion_234',
        avatar: '/avatars/1.jpg',
        image: '/transformations/1.jpg',
        style: 'Maasai Warrior',
        votes: 342,
        percentage: 58
      },
      rightUser: {
        username: 'Pharaoh_89',
        avatar: '/avatars/2.jpg',
        image: '/transformations/2.jpg',
        style: 'Egyptian Pharaoh',
        votes: 248,
        percentage: 42
      },
      totalVotes: 590,
      endsAt: Date.now() + (23 * 60 * 60 * 1000 + 12 * 60 * 1000), // 23h 12m from now
      tribe: 'Lagos Lions',
      shareUrl: `${window.location.origin}/b/${battleId}`
    };
    
    setBattle(mockBattle);
  }, [battleId]);

  // Countdown timer
  useEffect(() => {
    if (!battle?.endsAt) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = battle.endsAt - now;
      
      if (diff <= 0) {
        setTimeLeft('Battle Ended');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [battle]);

  const handleVote = (side) => {
    if (hasVoted || battle.status !== 'active') return;

    setSelectedSide(side);
    setHasVoted(true);
    setShowConfetti(true);

    // TODO: Call vote API
    // voteOnBattle(battleId, side);

    setTimeout(() => setShowConfetti(false), 3000);
  };

  if (!battle) {
    return (
      <div className="min-h-screen bg-gradient-tribe flex items-center justify-center">
        <div className="text-white text-xl">Loading battle...</div>
      </div>
    );
  }

  const isCompleted = battle.status === 'completed';
  const winner = battle.leftUser.votes > battle.rightUser.votes ? 'left' : 'right';

  return (
    <div className="min-h-screen bg-gradient-tribe">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-heritage-orange transition-colors"
          >
            ← Back
          </button>
          <h1 className="font-headline text-xl text-white">Battle Details</h1>
          <button
            onClick={() => setShowShareModal(true)}
            className="text-white hover:text-heritage-orange transition-colors"
          >
            📤 Share
          </button>
        </div>
      </div>

      {/* Timer Bar */}
      {battle.status === 'active' && (
        <div className="bg-heritage-orange py-3 px-6 text-center">
          <div className="flex items-center justify-center space-x-3 text-white">
            <span className="text-2xl">⏳</span>
            <span className="font-bold text-lg">{timeLeft} left</span>
          </div>
        </div>
      )}

      {/* Battle Result (if completed) */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-heritage-gold to-yellow-500 py-6 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-headline text-3xl text-white mb-2">
              🏆 BATTLE WINNER
            </h2>
            <div className="text-2xl font-bold text-heritage-brown">
              @{winner === 'left' ? battle.leftUser.username : battle.rightUser.username}
            </div>
          </div>
        </div>
      )}

      {/* Main Battle Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Battle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left User */}
          <div className={`card-glass relative overflow-hidden ${
            isCompleted && winner === 'left' ? 'ring-4 ring-heritage-gold' : ''
          }`}>
            {isCompleted && winner === 'left' && (
              <div className="absolute top-4 right-4 z-10 bg-heritage-gold text-heritage-brown px-4 py-2 rounded-full font-bold text-sm">
                👑 WINNER
              </div>
            )}
            
            <div className="aspect-square rounded-xl overflow-hidden mb-4">
              <img
                src={battle.leftUser.image}
                alt={battle.leftUser.username}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-heritage-orange to-heritage-gold" />
              <div>
                <div className="text-white font-bold text-lg">@{battle.leftUser.username}</div>
                <div className="text-gray-400 text-sm">{battle.leftUser.style}</div>
              </div>
            </div>

            {/* Vote Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-bold">{battle.leftUser.percentage}%</span>
                <span className="text-gray-400">{battle.leftUser.votes} votes</span>
              </div>
              <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-heritage-orange to-heritage-gold transition-all duration-1000"
                  style={{ width: `${battle.leftUser.percentage}%` }}
                />
              </div>
            </div>

            {/* Vote Button */}
            {!hasVoted && battle.status === 'active' && (
              <Button
                onClick={() => handleVote('left')}
                className="w-full mt-4 btn-primary"
              >
                👈 Vote for {battle.leftUser.username}
              </Button>
            )}

            {hasVoted && selectedSide === 'left' && (
              <div className="mt-4 bg-green-500/20 border border-green-500 rounded-lg p-3 text-center">
                <span className="text-green-400 font-bold">✓ Your Vote</span>
              </div>
            )}
          </div>

          {/* Right User */}
          <div className={`card-glass relative overflow-hidden ${
            isCompleted && winner === 'right' ? 'ring-4 ring-heritage-gold' : ''
          }`}>
            {isCompleted && winner === 'right' && (
              <div className="absolute top-4 right-4 z-10 bg-heritage-gold text-heritage-brown px-4 py-2 rounded-full font-bold text-sm">
                👑 WINNER
              </div>
            )}
            
            <div className="aspect-square rounded-xl overflow-hidden mb-4">
              <img
                src={battle.rightUser.image}
                alt={battle.rightUser.username}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
              <div>
                <div className="text-white font-bold text-lg">@{battle.rightUser.username}</div>
                <div className="text-gray-400 text-sm">{battle.rightUser.style}</div>
              </div>
            </div>

            {/* Vote Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-bold">{battle.rightUser.percentage}%</span>
                <span className="text-gray-400">{battle.rightUser.votes} votes</span>
              </div>
              <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${battle.rightUser.percentage}%` }}
                />
              </div>
            </div>

            {/* Vote Button */}
            {!hasVoted && battle.status === 'active' && (
              <Button
                onClick={() => handleVote('right')}
                className="w-full mt-4 btn-primary"
              >
                Vote for {battle.rightUser.username} 👉
              </Button>
            )}

            {hasVoted && selectedSide === 'right' && (
              <div className="mt-4 bg-green-500/20 border border-green-500 rounded-lg p-3 text-center">
                <span className="text-green-400 font-bold">✓ Your Vote</span>
              </div>
            )}
          </div>
        </div>

        {/* Battle Info */}
        <div className="card-glass mb-8">
          <h3 className="font-headline text-2xl text-white mb-4">Battle Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">⚔️</div>
              <div className="text-white font-bold">{battle.totalVotes}</div>
              <div className="text-gray-400 text-sm">Total Votes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🦁</div>
              <div className="text-white font-bold">{battle.tribe}</div>
              <div className="text-gray-400 text-sm">Tribe</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">{battle.status === 'active' ? '🔥' : '✓'}</div>
              <div className="text-white font-bold capitalize">{battle.status}</div>
              <div className="text-gray-400 text-sm">Status</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📤</div>
              <button
                onClick={() => setShowShareModal(true)}
                className="text-heritage-orange font-bold hover:text-heritage-gold transition-colors"
              >
                Share
              </button>
              <div className="text-gray-400 text-sm">Spread the word</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isCompleted && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setShowShareModal(true)}
              className="btn-primary"
            >
              📤 Share Victory
            </Button>
            <Button
              onClick={() => navigate('/transform')}
              className="btn-secondary"
            >
              🎨 Start New Battle
            </Button>
            <Button
              onClick={() => {/* TODO: Implement rematch */}}
              className="btn-outline"
            >
              ⚔️ Rematch
            </Button>
          </div>
        )}

        {hasVoted && battle.status === 'active' && (
          <div className="card-glass bg-green-500/10 border-green-500">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="font-headline text-2xl text-white mb-2">Vote Counted!</h3>
              <p className="text-gray-300 mb-4">
                🔥 Help your warrior win — share this battle
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={() => setShowShareModal(true)}
                  className="btn-primary"
                >
                  📤 Share Battle
                </Button>
                <Button
                  onClick={() => navigate('/feed')}
                  variant="outline"
                  className="btn-outline"
                >
                  Continue Swiping →
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <EnhancedShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        battleData={{
          shareUrl: battle.shareUrl,
          imageUrl: battle.leftUser.image,
          shareText: `🔥 Epic battle between @${battle.leftUser.username} and @${battle.rightUser.username}! Who do you think will win? ⚔️ Vote now!`
        }}
      />
    </div>
  );
};

export default BattleDetail;



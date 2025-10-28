import React from 'react';
import { ChallengeDashboard, ChallengeLeaderboard } from '../components/challenge';

const ChallengesPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <ChallengeDashboard />
        
        <div className="mt-12">
          <ChallengeLeaderboard />
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;

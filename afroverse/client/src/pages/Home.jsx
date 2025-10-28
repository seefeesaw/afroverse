import React from 'react';
import Card from '../components/common/Card';
import { ChallengeWidget } from '../components/challenge';
import { EventWidget } from '../components/event';
import { ChatWidget } from '../components/chat';
import { CreatorWidget } from '../components/creator';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleViewAllChallenges = () => {
    navigate('/challenges');
  };

  const handleViewAllEvents = () => {
    navigate('/events');
  };

  const handleViewChat = () => {
    navigate('/chat');
  };

  const handleViewCreators = () => {
    navigate('/creators');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Afroverse
          </h1>
          <p className="text-gray-300 text-lg">
            Transform your photos with AI-powered African cultural styles
          </p>
        </div>
        
        {/* Daily Challenges Widget */}
        <div className="mb-8">
          <ChallengeWidget onViewAll={handleViewAllChallenges} />
        </div>
        
        {/* Events Widget */}
        <div className="mb-8">
          <EventWidget onViewAll={handleViewAllEvents} />
        </div>
        
        {/* Chat Widget */}
        <div className="mb-8">
          <ChatWidget onViewChat={handleViewChat} />
        </div>
        
        {/* Creator Widget */}
        <div className="mb-8">
          <CreatorWidget onViewCreators={handleViewCreators} />
        </div>
        
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Transform?
            </h2>
            <p className="text-gray-300 mb-8">
              Upload your photo and let AI transform it with authentic African cultural styles
            </p>
            <a 
              href="/transform" 
              className="btn-primary inline-block"
            >
              Start Transforming
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;

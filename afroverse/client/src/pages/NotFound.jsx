import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">😵</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-white mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-300 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Go Home
            </Button>
          </Link>
          
          <Link to="/transform">
            <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
              Start Transforming
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;

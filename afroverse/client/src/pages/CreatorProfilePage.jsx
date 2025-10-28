import React from 'react';
import { useParams } from 'react-router-dom';
import CreatorProfile from '../components/creator/CreatorProfile';

const CreatorProfilePage = () => {
  const { username } = useParams();

  return <CreatorProfile />;
};

export default CreatorProfilePage;

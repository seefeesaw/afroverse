import { useState, useCallback } from 'react';
import api from '../services/api';

const useVideo = () => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const createVideo = useCallback(async (videoData) => {
    setStatus('loading');
    setError(null);

    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(videoData).forEach(key => {
        if (videoData[key] !== null && videoData[key] !== undefined) {
          formData.append(key, videoData[key]);
        }
      });

      const response = await api.post('/video/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setStatus('success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create video';
      setError(errorMessage);
      setStatus('error');
      throw new Error(errorMessage);
    }
  }, []);

  const getVideoStatus = useCallback(async (videoId) => {
    try {
      const response = await api.get(`/video/status/${videoId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get video status';
      throw new Error(errorMessage);
    }
  }, []);

  const getVideoHistory = useCallback(async (userId, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.cursor) params.append('cursor', options.cursor);
      if (options.variant) params.append('variant', options.variant);

      const response = await api.get(`/video/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get video history';
      throw new Error(errorMessage);
    }
  }, []);

  const deleteVideo = useCallback(async (videoId) => {
    try {
      const response = await api.delete(`/video/${videoId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete video';
      throw new Error(errorMessage);
    }
  }, []);

  const shareVideo = useCallback(async (videoId, platform) => {
    try {
      const response = await api.post(`/video/${videoId}/share`, { platform });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to share video';
      throw new Error(errorMessage);
    }
  }, []);

  const viewVideo = useCallback(async (videoId) => {
    try {
      const response = await api.post(`/video/${videoId}/view`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to track view';
      throw new Error(errorMessage);
    }
  }, []);

  const likeVideo = useCallback(async (videoId) => {
    try {
      const response = await api.post(`/video/${videoId}/like`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to like video';
      throw new Error(errorMessage);
    }
  }, []);

  const getAudioTracks = useCallback(async () => {
    try {
      const response = await api.get('/video/audio-tracks');
      return response.data.tracks;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get audio tracks';
      throw new Error(errorMessage);
    }
  }, []);

  const getVideoStyles = useCallback(async () => {
    try {
      const response = await api.get('/video/styles');
      return response.data.styles;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get video styles';
      throw new Error(errorMessage);
    }
  }, []);

  const getPublicVideo = useCallback(async (videoId) => {
    try {
      const response = await api.get(`/video/${videoId}/public`);
      return response.data.video;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get video';
      throw new Error(errorMessage);
    }
  }, []);

  // Full-body video functions
  const createFullBodyVideo = useCallback(async (videoData) => {
    setStatus('loading');
    setError(null);

    try {
      const response = await api.post('/video/fullbody/create', videoData);
      setStatus('success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create full-body video';
      setError(errorMessage);
      setStatus('error');
      throw new Error(errorMessage);
    }
  }, []);

  const getMotionPacks = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.region) params.append('region', filters.region);
      if (filters.complexity) params.append('complexity', filters.complexity);
      if (filters.bpm) params.append('bpm', filters.bpm);

      const response = await api.get(`/video/motion-packs?${params.toString()}`);
      return response.data.motionPacks;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get motion packs';
      throw new Error(errorMessage);
    }
  }, []);

  const getRecommendedMotionPacks = useCallback(async (preferences = {}) => {
    try {
      const params = new URLSearchParams();
      if (preferences.style) params.append('style', preferences.style);
      if (preferences.vibe) params.append('vibe', preferences.vibe);

      const response = await api.get(`/video/motion-packs/recommended?${params.toString()}`);
      return response.data.recommendations;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get recommended motion packs';
      throw new Error(errorMessage);
    }
  }, []);

  const getFullBodyVideoStats = useCallback(async () => {
    try {
      const response = await api.get('/video/fullbody/stats');
      return response.data.stats;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get full-body video stats';
      throw new Error(errorMessage);
    }
  }, []);

  return {
    status,
    error,
    createVideo,
    getVideoStatus,
    getVideoHistory,
    deleteVideo,
    shareVideo,
    viewVideo,
    likeVideo,
    getAudioTracks,
    getVideoStyles,
    getPublicVideo,
    // Full-body video functions
    createFullBodyVideo,
    getMotionPacks,
    getRecommendedMotionPacks,
    getFullBodyVideoStats,
  };
};

export default useVideo;
export { useVideo };

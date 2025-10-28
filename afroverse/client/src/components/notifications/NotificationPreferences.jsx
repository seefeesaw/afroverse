import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';

const NotificationPreferences = ({ className = '' }) => {
  const {
    preferences,
    loading,
    errors,
    updatePreferences,
    validatePreferences,
    getChannelDisplayName,
    getCategoryDisplayName,
    clearErrors
  } = useNotifications();
  
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Update local preferences when Redux state changes
  useEffect(() => {
    setLocalPreferences(preferences);
    setIsDirty(false);
    setValidationErrors({});
  }, [preferences]);

  // Handle preference change
  const handlePreferenceChange = (path, value) => {
    const newPreferences = { ...localPreferences };
    const keys = path.split('.');
    let current = newPreferences;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    setLocalPreferences(newPreferences);
    setIsDirty(true);
    
    // Clear validation errors for this field
    if (validationErrors[path]) {
      const newErrors = { ...validationErrors };
      delete newErrors[path];
      setValidationErrors(newErrors);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      // Validate preferences
      const validation = validatePreferences(localPreferences);
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return;
      }
      
      // Clear any existing errors
      clearErrors();
      
      // Update preferences
      await updatePreferences(localPreferences);
      
      setIsDirty(false);
      setValidationErrors({});
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Handle reset
  const handleReset = () => {
    setLocalPreferences(preferences);
    setIsDirty(false);
    setValidationErrors({});
  };

  // Get channel settings
  const getChannelSettings = (channel) => {
    return localPreferences.channels[channel] || { enabled: false };
  };

  // Get category settings
  const getCategorySettings = (category) => {
    return localPreferences.categories[category] || false;
  };

  // Get quiet hours settings
  const getQuietHoursSettings = () => {
    return localPreferences.quietHours || {};
  };

  // Get frequency caps settings
  const getFrequencyCapsSettings = () => {
    return localPreferences.frequencyCaps || {};
  };

  // Render channel settings
  const renderChannelSettings = () => {
    const channels = ['whatsapp', 'push', 'inapp'];
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Channels</h3>
        {channels.map(channel => {
          const settings = getChannelSettings(channel);
          const isEnabled = settings.enabled;
          
          return (
            <div key={channel} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {channel === 'whatsapp' && '📱'}
                  {channel === 'push' && '🔔'}
                  {channel === 'inapp' && '📢'}
                </div>
                <div>
                  <div className="text-white font-medium">
                    {getChannelDisplayName(channel)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {channel === 'whatsapp' && 'Receive notifications via WhatsApp'}
                    {channel === 'push' && 'Receive push notifications in browser'}
                    {channel === 'inapp' && 'Receive in-app notifications and banners'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => handlePreferenceChange(`channels.${channel}.enabled`, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render category settings
  const renderCategorySettings = () => {
    const categories = [
      { key: 'transactional', name: 'Transactional', description: 'OTP, battle events, transformation ready' },
      { key: 'streak', name: 'Streak', description: 'Streak at risk, streak milestones' },
      { key: 'battle', name: 'Battle', description: 'Battle live, battle results, battle reminders' },
      { key: 'tribe', name: 'Tribe', description: 'Tribe hour, tribe events' },
      { key: 'leaderboard', name: 'Leaderboard', description: 'Rank changes, leaderboard updates' },
      { key: 'lifecycle', name: 'Lifecycle', description: 'Welcome, comeback, winback messages' }
    ];
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Categories</h3>
        {categories.map(category => {
          const isEnabled = getCategorySettings(category.key);
          
          return (
            <div key={category.key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {category.key === 'transactional' && '🔐'}
                  {category.key === 'streak' && '🔥'}
                  {category.key === 'battle' && '⚔️'}
                  {category.key === 'tribe' && '🏛️'}
                  {category.key === 'leaderboard' && '📈'}
                  {category.key === 'lifecycle' && '🎯'}
                </div>
                <div>
                  <div className="text-white font-medium">
                    {category.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {category.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => handlePreferenceChange(`categories.${category.key}`, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render quiet hours settings
  const renderQuietHoursSettings = () => {
    const quietHours = getQuietHoursSettings();
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Quiet Hours</h3>
        
        <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-white font-medium">Enable Quiet Hours</div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quietHours.enabled}
                onChange={(e) => handlePreferenceChange('quietHours.enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {quietHours.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={quietHours.start}
                    onChange={(e) => handlePreferenceChange('quietHours.start', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={quietHours.end}
                    onChange={(e) => handlePreferenceChange('quietHours.end', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">Bypass for Transactional</div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quietHours.bypassTransactional}
                    onChange={(e) => handlePreferenceChange('quietHours.bypassTransactional', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render frequency caps settings
  const renderFrequencyCapsSettings = () => {
    const caps = getFrequencyCapsSettings();
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Frequency Caps</h3>
        
        <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Per Hour
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={caps.perHour}
                onChange={(e) => handlePreferenceChange('frequencyCaps.perHour', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Per Day
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={caps.perDay}
                onChange={(e) => handlePreferenceChange('frequencyCaps.perDay', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
          <div className="flex items-center space-x-2">
            {isDirty && (
              <Button
                onClick={handleReset}
                className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2"
              >
                Reset
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!isDirty || loading.preferences}
              className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
            >
              {loading.preferences ? (
                <>
                  <Loader size="small" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
        
        {errors.preferences && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-400/30 rounded-lg">
            <p className="text-red-400">{errors.preferences}</p>
          </div>
        )}
        
        <div className="space-y-8">
          {renderChannelSettings()}
          {renderCategorySettings()}
          {renderQuietHoursSettings()}
          {renderFrequencyCapsSettings()}
        </div>
      </Card>
    </div>
  );
};

export default NotificationPreferences;

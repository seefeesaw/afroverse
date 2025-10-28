import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Loader } from '../common/Loader';

const PushNotificationManager = ({ className = '' }) => {
  const {
    pushNotification,
    loading,
    errors,
    requestPushPermission,
    unsubscribeFromPush,
    testPush,
    clearErrors
  } = useNotifications();
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Handle permission request
  const handlePermissionRequest = async () => {
    try {
      clearErrors();
      const result = await requestPushPermission();
      
      if (result.granted) {
        setTestResult({ success: true, message: 'Push notifications enabled successfully!' });
      } else {
        setTestResult({ success: false, message: `Permission ${result.permission}. ${result.error || ''}` });
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    }
  };

  // Handle unsubscribe
  const handleUnsubscribe = async () => {
    try {
      clearErrors();
      await unsubscribeFromPush();
      setTestResult({ success: true, message: 'Push notifications disabled successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    }
  };

  // Handle test notification
  const handleTestNotification = async () => {
    try {
      setIsTesting(true);
      clearErrors();
      
      await testPush('Test Notification', 'This is a test notification from Afroverse!');
      
      setTestResult({ success: true, message: 'Test notification sent successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Get permission status
  const getPermissionStatus = () => {
    switch (pushNotification.permission) {
      case 'granted':
        return { status: 'enabled', color: 'green', icon: '✅' };
      case 'denied':
        return { status: 'disabled', color: 'red', icon: '❌' };
      default:
        return { status: 'not-requested', color: 'yellow', icon: '⚠️' };
    }
  };

  // Get permission display text
  const getPermissionDisplayText = () => {
    const status = getPermissionStatus();
    return `${status.icon} ${status.status.charAt(0).toUpperCase() + status.status.slice(1)}`;
  };

  // Get permission color
  const getPermissionColor = () => {
    const status = getPermissionStatus();
    return status.color;
  };

  // Render permission status
  const renderPermissionStatus = () => {
    const status = getPermissionStatus();
    
    return (
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{status.icon}</div>
          <div>
            <div className="text-white font-medium">
              Push Notifications
            </div>
            <div className={`text-sm ${
              status.color === 'green' ? 'text-green-400' :
              status.color === 'red' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {getPermissionDisplayText()}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {pushNotification.permission === 'granted' ? (
            <Button
              onClick={handleUnsubscribe}
              disabled={loading.push}
              className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
            >
              {loading.push ? (
                <>
                  <Loader size="small" />
                  <span className="ml-2">Disabling...</span>
                </>
              ) : (
                'Disable'
              )}
            </Button>
          ) : (
            <Button
              onClick={handlePermissionRequest}
              disabled={loading.push}
              className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
            >
              {loading.push ? (
                <>
                  <Loader size="small" />
                  <span className="ml-2">Enabling...</span>
                </>
              ) : (
                'Enable'
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render test section
  const renderTestSection = () => {
    if (pushNotification.permission !== 'granted') {
      return null;
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Test Notifications</h3>
        
        <Card className="p-4 bg-gray-800/50">
          <div className="space-y-4">
            <div className="text-gray-300 text-sm">
              Send a test notification to verify that push notifications are working correctly.
            </div>
            
            <Button
              onClick={handleTestNotification}
              disabled={isTesting || loading.test}
              className="w-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting || loading.test ? (
                <>
                  <Loader size="small" />
                  <span className="ml-2">Sending Test...</span>
                </>
              ) : (
                'Send Test Notification'
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // Render browser support
  const renderBrowserSupport = () => {
    if (pushNotification.supported) {
      return null;
    }

    return (
      <Card className="p-4 bg-yellow-900/20 border border-yellow-400/30">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <div className="text-yellow-400 font-medium">
              Browser Not Supported
            </div>
            <div className="text-gray-300 text-sm">
              Your browser does not support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Render test result
  const renderTestResult = () => {
    if (!testResult) {
      return null;
    }

    return (
      <Card className={`p-4 ${
        testResult.success 
          ? 'bg-green-900/20 border border-green-400/30' 
          : 'bg-red-900/20 border border-red-400/30'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {testResult.success ? '✅' : '❌'}
          </div>
          <div>
            <div className={`font-medium ${
              testResult.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {testResult.success ? 'Success' : 'Error'}
            </div>
            <div className="text-gray-300 text-sm">
              {testResult.message}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Render error
  const renderError = () => {
    if (!errors.push) {
      return null;
    }

    return (
      <Card className="p-4 bg-red-900/20 border border-red-400/30">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">❌</div>
          <div>
            <div className="text-red-400 font-medium">
              Error
            </div>
            <div className="text-gray-300 text-sm">
              {errors.push}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Render instructions
  const renderInstructions = () => {
    if (pushNotification.permission === 'granted') {
      return null;
    }

    return (
      <Card className="p-4 bg-blue-900/20 border border-blue-400/30">
        <div className="space-y-3">
          <div className="text-blue-400 font-medium">
            How to Enable Push Notifications
          </div>
          <div className="text-gray-300 text-sm space-y-2">
            <div>1. Click the "Enable" button above</div>
            <div>2. Allow notifications when prompted by your browser</div>
            <div>3. You'll receive notifications for important events like:</div>
            <div className="ml-4 space-y-1">
              <div>• Battle live notifications</div>
              <div>• Streak at risk alerts</div>
              <div>• Transformation ready updates</div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className={className}>
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Push Notifications</h2>
        
        <div className="space-y-6">
          {renderBrowserSupport()}
          {renderPermissionStatus()}
          {renderInstructions()}
          {renderTestSection()}
          {renderTestResult()}
          {renderError()}
        </div>
      </Card>
    </div>
  );
};

export default PushNotificationManager;

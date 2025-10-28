import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Button } from '../common/Button';

const InAppBanner = ({ className = '' }) => {
  const { activeBanners, dismissBanner, handleBannerAction } = useNotifications();
  const [visibleBanners, setVisibleBanners] = useState([]);

  // Update visible banners when active banners change
  useEffect(() => {
    setVisibleBanners(activeBanners);
  }, [activeBanners]);

  // Handle banner dismiss
  const handleDismiss = (bannerId) => {
    dismissBanner(bannerId);
  };

  // Handle banner action
  const handleAction = async (bannerId, actionId) => {
    await handleBannerAction(bannerId, actionId);
  };

  // Get banner classes
  const getBannerClasses = (banner) => {
    const baseClasses = 'fixed left-0 right-0 z-50 transform transition-all duration-300 ease-in-out';
    const positionClasses = banner.priority === 'high' ? 'top-0' : 'top-16';
    const colorClasses = `bg-gradient-to-r ${banner.color} to-gray-800`;
    
    return `${baseClasses} ${positionClasses} ${colorClasses}`;
  };

  // Get banner content classes
  const getBannerContentClasses = () => {
    return 'px-4 py-3 shadow-lg border-b border-gray-700';
  };

  // Get banner icon classes
  const getBannerIconClasses = () => {
    return 'text-2xl mr-3 flex-shrink-0';
  };

  // Get banner text classes
  const getBannerTextClasses = () => {
    return 'text-white font-medium';
  };

  // Get banner body classes
  const getBannerBodyClasses = () => {
    return 'text-gray-200 text-sm mt-1';
  };

  // Get action button classes
  const getActionButtonClasses = (action) => {
    const baseClasses = 'px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200';
    
    if (action.id === 'dismiss') {
      return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700`;
    }
    
    return `${baseClasses} bg-blue-500 text-white hover:bg-blue-600`;
  };

  // Render banner
  const renderBanner = (banner) => {
    return (
      <div
        key={banner.id}
        className={getBannerClasses(banner)}
        style={{
          backgroundColor: banner.color,
          backgroundImage: `linear-gradient(135deg, ${banner.color}20, ${banner.color}40)`
        }}
      >
        <div className={getBannerContentClasses()}>
          <div className="flex items-start">
            {/* Icon */}
            <div className={getBannerIconClasses()}>
              {banner.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className={getBannerTextClasses()}>
                {banner.title}
              </div>
              {banner.body && (
                <div className={getBannerBodyClasses()}>
                  {banner.body}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {banner.actions.map((action) => (
                <Button
                  key={action.id}
                  onClick={() => handleAction(banner.id, action.id)}
                  className={getActionButtonClasses(action)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    return null;
  };

  // Render banners
  const renderBanners = () => {
    if (visibleBanners.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-2">
        {visibleBanners.map(renderBanner)}
      </div>
    );
  };

  return (
    <div className={className}>
      {renderBanners()}
    </div>
  );
};

export default InAppBanner;

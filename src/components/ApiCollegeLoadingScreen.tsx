import React from 'react';

interface ApiCollegeLoadingScreenProps {
  compact?: boolean;
}

const ApiCollegeLoadingScreen: React.FC<ApiCollegeLoadingScreenProps> = ({ compact = false }) => {
  return (
    <div
      className={`api-loading-screen${compact ? ' api-loading-screen--compact' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="api-loading-card">
        <div className="api-loading-orb" aria-hidden="true">
          <span />
        </div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default ApiCollegeLoadingScreen;

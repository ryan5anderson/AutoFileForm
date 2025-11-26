import React from 'react';
import { useNavigate } from 'react-router-dom';

import { colleges } from '../config';
import { asset } from '../utils/asset';
import './CollegeSelector.css';

const CollegeSelector: React.FC = () => {
  const navigate = useNavigate();
  
  // Debug logging removed for production
  // console.log('CollegeSelector rendering');
  // console.log('Colleges config:', colleges);

  const handleCollegeSelect = (collegeKey: string) => {
    // console.log('Navigating to:', collegeKey);
    navigate(`/${collegeKey}`);
  };

  const handleTestApiClick = () => {
    navigate('/test-api');
  };

  return (
    <div className="college-selector">
      <div className="college-selector-header">
        <h1>Select Your College</h1>
        <p>Choose your college to access the merchandise order form</p>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 'var(--space-6)'
      }}>
        <button
          onClick={handleTestApiClick}
          style={{
            padding: 'var(--space-3) var(--space-6)',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg)';
            e.currentTarget.style.color = 'var(--color-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          Test API
        </button>
      </div>
      
      <div className="college-buttons">
        {Object.entries(colleges).map(([key, college]) => (
          <button
            key={key}
            className="college-button"
            onClick={() => handleCollegeSelect(key)}
          >
            <div className="college-logo">
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
              <img 
                src={asset(college.logo)} 
                alt={`${college.name} Logo`}
                onError={(e) => {
                  // Fallback to a default logo if the college logo doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.src = asset('logo/asulogo.png');
                }}
              />
            </div>
            <div className="college-info">
              <h2>{college.name}</h2>
              <span className="college-key">{key}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CollegeSelector;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colleges } from '../config';
import './CollegeSelector.css';

const CollegeSelector: React.FC = () => {
  const navigate = useNavigate();
  
  console.log('CollegeSelector rendering');
  console.log('Colleges config:', colleges);

  const handleCollegeSelect = (collegeKey: string) => {
    console.log('Navigating to:', collegeKey);
    navigate(`/${collegeKey}`);
  };

  return (
    <div className="college-selector">
      <div className="college-selector-header">
        <h1>Select Your College</h1>
        <p>Choose your college to access the merchandise order form</p>
      </div>
      
      <div className="college-buttons">
        {Object.entries(colleges).map(([key, college]) => (
          <button
            key={key}
            className="college-button"
            onClick={() => handleCollegeSelect(key)}
          >
            <div className="college-logo">
              <img 
                src={process.env.PUBLIC_URL + college.logo} 
                alt={`${college.name} Logo`}
                onError={(e) => {
                  // Fallback to a default logo if the college logo doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.src = process.env.PUBLIC_URL + '/logo/asulogo.png';
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

import React from 'react';
import { useNavigate } from 'react-router-dom';

import { colleges } from '../config';
import { asset } from '../utils/asset';
import './CollegeSelector.css';

const CollegeSelector: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleCollegeSelect = (collegeKey: string) => {
    navigate(`/${collegeKey}`);
  };

  const filteredColleges = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return Object.entries(colleges);
    }
    return Object.entries(colleges).filter(([, college]) =>
      college.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const hasNoResults = filteredColleges.length === 0;

  return (
    <div className="college-selector">
      <div className="college-selector-header">
        <h1>Select Your College</h1>
        <p>Choose your college to access the merchandise order form</p>
      </div>

      <div className="college-controls">
        <input
          className="college-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search schools..."
          aria-label="Search schools"
        />
      </div>

      {hasNoResults && (
        <div className="college-status">No schools found for "{searchQuery.trim()}".</div>
      )}

      <div className="college-buttons">
        {filteredColleges.map(([key, college]) => (
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

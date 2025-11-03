import React from 'react';
import { useNavigate } from 'react-router-dom';

import { colleges } from '../../config';
import { asset } from '../../utils/asset';
import '../../components/CollegeSelector.css';

const AdminCollegeSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleCollegeSelect = (collegeKey: string) => {
    navigate(`/admin/college/${collegeKey}`);
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="admin-college-selection" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      backgroundAttachment: 'fixed',
      padding: '2rem',
      paddingTop: 'calc(64px + 2rem)'
    }}>
      <div className="admin-college-selection-header" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <button 
          onClick={handleBackToAdmin}
          className="admin-back-button"
          style={{ 
            marginBottom: '2rem',
            background: 'transparent',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f9fafb';
            e.currentTarget.style.color = '#374151';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = '#f9fafb';
            e.currentTarget.style.color = '#374151';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          ← Back to Admin Dashboard
        </button>
        <div className="college-selector-header">
          <h1>Manage Colleges</h1>
          <p>Select a college to view its products</p>
        </div>
      </div>
      
      <div className="college-buttons" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {Object.entries(colleges).map(([key, college]) => (
          <button
            key={key}
            className="college-button"
            onClick={() => handleCollegeSelect(key)}
          >
            <div className="college-logo">
              <img 
                src={asset(college.logo)} 
                alt={`${college.name} Logo`}
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

export default AdminCollegeSelection;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colleges } from '../../config';
import { asset } from '../utils/asset';
import CardGrid from './CardGrid';
import Card from './Card';
import styles from './CollegeSelector.module.css';

const CollegeSelector: React.FC = () => {
  const navigate = useNavigate();
  
  console.log('CollegeSelector rendering');
  console.log('Colleges config:', colleges);

  const handleCollegeSelect = (collegeKey: string) => {
    console.log('Navigating to:', collegeKey);
    navigate(`/${collegeKey}`);
  };

  return (
    <div className={styles.collegeSelector}>
      <CardGrid.Header>
        <CardGrid.Title>Select Your College</CardGrid.Title>
        <CardGrid.Description>
          Choose your college to access the merchandise order form
        </CardGrid.Description>
      </CardGrid.Header>
      
      <CardGrid minCardWidth="18rem" className={styles.collegeGrid}>
        {Object.entries(colleges).map(([key, college]) => (
          <Card
            key={key}
            variant="elevated"
            interactive
            onClick={() => handleCollegeSelect(key)}
            className={styles.collegeCard}
          >
            <div className={styles.collegeLogo}>
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
            <div className={styles.collegeInfo}>
              <h2>{college.name}</h2>
              <span className={styles.collegeKey}>{key}</span>
            </div>
          </Card>
        ))}
      </CardGrid>
    </div>
  );
};

export default CollegeSelector;

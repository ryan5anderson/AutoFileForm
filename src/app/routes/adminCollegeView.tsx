import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { colleges } from '../../config';
import CategorySection from '../../features/components/CategorySection';
import { Category } from '../../types';
import CollapsibleSidebar from '../layout/CollapsibleSidebar';
import Header from '../layout/Header';
import '../../styles/college-pages.css';

const AdminCollegeView: React.FC = () => {
  const navigate = useNavigate();
  const { collegeKey } = useParams();
  const collegeConfig = collegeKey ? colleges[collegeKey as keyof typeof colleges] : undefined;
  
  const sortedCategories = useMemo(() => {
    if (!collegeConfig) return [];
    const list = [...collegeConfig.categories];
    // Move display options to the bottom if present
    return list.sort((a, b) => {
      const aIsDisplay = a.hasDisplayOptions || a.name.toLowerCase().includes('display options');
      const bIsDisplay = b.hasDisplayOptions || b.name.toLowerCase().includes('display options');
      if (aIsDisplay && !bIsDisplay) return 1;
      if (!aIsDisplay && bIsDisplay) return -1;
      return 0;
    });
  }, [collegeConfig]);

  const collegeName = collegeConfig ? collegeConfig.name : 'College';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Apply college-specific theme
  useEffect(() => {
    if (collegeKey === 'arizonastate') {
      document.documentElement.style.setProperty('--color-primary', '#8c2434');
    } else if (collegeKey === 'michiganstate') {
      document.documentElement.style.setProperty('--color-primary', '#166534');
    } else if (collegeKey === 'oregonuniversity') {
      document.documentElement.style.setProperty('--color-primary', '#007030');
    } else if (collegeKey === 'westvirginiauniversity') {
      document.documentElement.style.setProperty('--color-primary', '#002855');
    } else if (collegeKey === 'pittsburghuniversity') {
      document.documentElement.style.setProperty('--color-primary', '#003594');
    } else if (collegeKey === 'alabamauniversity') {
      document.documentElement.style.setProperty('--color-primary', '#9E1B32');
    } else {
      document.documentElement.style.setProperty('--color-primary', '#111111');
    }
  }, [collegeKey]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBackToColleges = () => {
    navigate('/admin/colleges');
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = sortedCategories.map(cat => {
        const id = cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
        return { id, element: document.getElementById(id) };
      }).filter(section => section.element);

      const currentSection = sections.find(section => {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          return rect.top <= 200 && rect.bottom >= 200;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sortedCategories]);

  if (!collegeConfig) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#dc2626' }}>
        <h2>College not found</h2>
        <button onClick={handleBackToColleges} className="btn-primary">
          Back to College Selection
        </button>
      </div>
    );
  }

  // Empty form data for read-only view
  const emptyFormData = {
    quantities: {},
    shirtVersions: {},
    shirtSizeCounts: {},
    displayOptions: {},
    sweatpantJoggerOptions: {},
    pantOptions: {},
    colorOptions: {},
    shirtColorSizeCounts: {},
    infantSizeCounts: {},
  };

  return (
    <div className="college-page-container">
      <div className="college-page-header">
        <Header 
          showSidebarToggle={true} 
          onSidebarToggle={toggleSidebar}
        />
      </div>
      
      <CollapsibleSidebar
        categories={sortedCategories}
        activeSection={activeSection}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onBackToColleges={handleBackToColleges}
        showCategories={true}
      />
      
      <main className="college-page-main">
        <div className="admin-college-view-header">
          <button 
            onClick={handleBackToColleges}
            className="admin-back-button"
            style={{ marginBottom: '1rem' }}
          >
            ← Back to College Selection
          </button>
          <div className="college-page-title">
            <h1>{collegeName} Products</h1>
            <p>Read-only view of available products</p>
          </div>
        </div>
        
        <div className="admin-read-only-notice" style={{
          padding: '1rem',
          marginBottom: '2rem',
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          color: '#92400e',
          textAlign: 'center'
        }}>
          <strong>Read-Only Mode:</strong> This is a preview view. Products cannot be added to cart or ordered from this page.
        </div>
        
        {sortedCategories.map((category: Category) => (
          <CategorySection
            key={category.name}
            category={category}
            quantities={emptyFormData.quantities}
            shirtVersions={emptyFormData.shirtVersions}
            shirtSizeCounts={emptyFormData.shirtSizeCounts}
            displayOptions={emptyFormData.displayOptions}
            sweatpantJoggerOptions={emptyFormData.sweatpantJoggerOptions}
            pantOptions={emptyFormData.pantOptions}
            colorOptions={emptyFormData.colorOptions}
            shirtColorSizeCounts={emptyFormData.shirtColorSizeCounts}
            infantSizeCounts={emptyFormData.infantSizeCounts}
            invalidProductPaths={[]}
            validProductPaths={[]}
            readOnly={true}
            college={collegeKey}
            isAdmin={true}
          />
        ))}
      </main>
    </div>
  );
};

export default AdminCollegeView;


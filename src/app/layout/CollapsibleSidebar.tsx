import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';

interface CollapsibleSidebarProps {
  categories: Category[];
  activeSection?: string;
  isOpen: boolean;
  onToggle: () => void;
  onBackToColleges: () => void;
  showCategories?: boolean;
}

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({ 
  categories, 
  activeSection, 
  isOpen, 
  onToggle, 
  onBackToColleges,
  showCategories = true
}) => {
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  React.useEffect(() => {
    const handler = () => onToggle();
    window.addEventListener('global-sidebar-toggle', handler);
    return () => window.removeEventListener('global-sidebar-toggle', handler);
  }, [onToggle]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768) {
        onToggle();
      }
    }
  };

  const getSectionId = (categoryName: string) => {
    return categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
  };

  const toggleCategories = () => {
    setCategoriesExpanded(!categoriesExpanded);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`collapsible-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
          <button 
            className="sidebar-close"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Back to Colleges */}
          <button
            className="sidebar-nav-item back-button"
            onClick={onBackToColleges}
          >
            <span className="nav-icon">←</span>
            <span className="nav-text">Back to Colleges</span>
          </button>

          {/* Categories Dropdown - Only show on form and summary pages */}
          {showCategories && categories.length > 0 && (
            <div className="sidebar-section">
              <button
                className={`sidebar-nav-item dropdown-toggle ${categoriesExpanded ? 'expanded' : ''}`}
                onClick={toggleCategories}
              >
                <span className="nav-icon">📋</span>
                <span className="nav-text">Categories</span>
                <span className="dropdown-arrow">
                  {categoriesExpanded ? '▼' : '▶'}
                </span>
              </button>

              {categoriesExpanded && (
                <div className="dropdown-content">
                  {categories.map((category) => {
                    const sectionId = getSectionId(category.name);
                    const isActive = activeSection === sectionId;
                    
                    return (
                      <button
                        key={category.name}
                        className={`dropdown-item ${isActive ? 'active' : ''}`}
                        onClick={() => scrollToSection(sectionId)}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* About Us & Contact Us Links */}
          <Link
            to="/about"
            className="sidebar-nav-item sidebar-link"
            onClick={onToggle}
          >
            <span className="nav-icon">ℹ️</span>
            <span className="nav-text">About Us</span>
          </Link>

          <Link
            to="/contact"
            className="sidebar-nav-item sidebar-link"
            onClick={onToggle}
          >
            <span className="nav-icon">📧</span>
            <span className="nav-text">Contact Us</span>
          </Link>
        </nav>

        <style>{`
          .sidebar-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            animation: fadeIn 0.3s ease forwards;
          }

          @keyframes fadeIn {
            to { opacity: 1; }
          }

          .collapsible-sidebar {
            position: fixed;
            top: 0;
            left: -320px;
            width: 320px;
            height: 100vh;
            background: white;
            border-right: 1px solid #e2e8f0;
            box-shadow: 4px 0 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            transition: left 0.3s ease;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
          }

          .collapsible-sidebar.open {
            left: 0;
          }

          .sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
          }

          .sidebar-header h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
          }

          .sidebar-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #6b7280;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
          }

          .sidebar-close:hover {
            background: #e5e7eb;
            color: #374151;
          }

          .sidebar-nav {
            padding: 16px;
            flex: 1;
          }

          .sidebar-nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 14px 16px;
            margin-bottom: 8px;
            background: transparent;
            border: none;
            border-radius: 8px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #374151;
            font-size: 0.875rem;
            font-weight: 500;
            position: relative;
          }

          .sidebar-nav-item:hover {
            background: #f3f4f6;
            color: #1f2937;
          }

          .sidebar-nav-item.back-button {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            margin-bottom: 16px;
          }

          .sidebar-nav-item.back-button:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
          }

          .sidebar-link {
            text-decoration: none;
          }

          .dropdown-toggle {
            justify-content: space-between !important;
          }

          .dropdown-toggle.expanded {
            background: #f3f4f6;
          }

          .nav-icon {
            font-size: 16px;
            min-width: 20px;
            text-align: center;
          }

          .nav-text {
            flex: 1;
          }

          .dropdown-arrow {
            font-size: 12px;
            color: #6b7280;
            transition: transform 0.2s ease;
          }

          .dropdown-content {
            margin-left: 32px;
            border-left: 2px solid #e5e7eb;
            padding-left: 16px;
            margin-top: 8px;
            animation: slideDown 0.3s ease;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              max-height: 0;
            }
            to {
              opacity: 1;
              max-height: 400px;
            }
          }

          .dropdown-item {
            display: block;
            width: 100%;
            padding: 12px 16px;
            margin-bottom: 4px;
            background: transparent;
            border: none;
            border-radius: 6px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #6b7280;
            font-size: 0.8125rem;
            font-weight: 500;
          }

          .dropdown-item:hover {
            background: #f9fafb;
            color: #374151;
          }

          .dropdown-item.active {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
          }

          .dropdown-item.active:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          }

          .sidebar-section {
            margin-bottom: 8px;
          }

          /* Mobile adjustments */
          @media (max-width: 768px) {
            .collapsible-sidebar {
              width: 280px;
              left: -280px;
            }
          }

          /* Custom scrollbar */
          .collapsible-sidebar::-webkit-scrollbar {
            width: 4px;
          }

          .collapsible-sidebar::-webkit-scrollbar-track {
            background: #f1f5f9;
          }

          .collapsible-sidebar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 2px;
          }

          .collapsible-sidebar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    </>
  );
};

export default CollapsibleSidebar;

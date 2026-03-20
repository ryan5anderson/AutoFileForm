import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { colleges } from '../config';
import { fetchColleges, getCollegesFromCache, getProxiedImageUrl, type CollegeData } from '../services/collegeApiService';
import { getSchoolBrandPalette } from '../utils/collegeBranding';
import { asset } from '../utils/asset';
import './CollegeSelector.css';

const CollegeSelector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showApiSchools, setShowApiSchools] = React.useState(true);
  const [apiColleges, setApiColleges] = React.useState<CollegeData[]>([]);
  const [isLoadingApiColleges, setIsLoadingApiColleges] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  
  // Debug logging removed for production
  // console.log('CollegeSelector rendering');
  // console.log('Colleges config:', colleges);

  const handleCollegeSelect = (collegeKey: string) => {
    // console.log('Navigating to:', collegeKey);
    navigate(`/${collegeKey}`);
  };

  const handleApiCollegeSelect = (orderTemplateId: string) => {
    navigate(`/api-school/${encodeURIComponent(orderTemplateId)}`);
  };

  const fetchApiColleges = React.useCallback(async () => {
    // Sync cache check: skip loading state when colleges are already cached
    const cached = getCollegesFromCache();
    if (cached) {
      const seen = new Set<string>();
      const deduped = cached.filter((college) => {
        if (seen.has(college.school_ID)) {
          return false;
        }
        seen.add(college.school_ID);
        return true;
      });
      setApiColleges(deduped);
      setApiError(null);
      return;
    }

    setIsLoadingApiColleges(true);
    setApiError(null);
    try {
      const results = await fetchColleges();
      const seen = new Set<string>();
      const deduped = results.filter((college) => {
        if (seen.has(college.school_ID)) {
          return false;
        }
        seen.add(college.school_ID);
        return true;
      });
      setApiColleges(deduped);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch API schools.';
      setApiError(message);
      setApiColleges([]);
    } finally {
      setIsLoadingApiColleges(false);
    }
  }, []);

  React.useEffect(() => {
    const routeState = location.state as { showApiSchools?: boolean } | null;
    const shouldShowApiSchools = routeState?.showApiSchools;

    if (typeof shouldShowApiSchools === 'boolean') {
      setShowApiSchools(shouldShowApiSchools);
      if (shouldShowApiSchools) {
        void fetchApiColleges();
      } else {
        setApiError(null);
      }
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    if (showApiSchools) {
      void fetchApiColleges();
    }
  }, [fetchApiColleges, location.pathname, location.state, navigate, showApiSchools]);

  const filteredLocalColleges = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return Object.entries(colleges);
    }
    return Object.entries(colleges).filter(([, college]) =>
      college.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredApiColleges = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return apiColleges;
    }
    return apiColleges.filter((college) => college.schoolName.toLowerCase().includes(query));
  }, [apiColleges, searchQuery]);

  const hasNoResults =
    !isLoadingApiColleges &&
    (showApiSchools ? filteredApiColleges.length === 0 : filteredLocalColleges.length === 0);

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

      {showApiSchools && isLoadingApiColleges && (
        <div className="college-status">Loading API schools...</div>
      )}
      {showApiSchools && apiError && (
        <div className="college-status college-status--error">{apiError}</div>
      )}
      {hasNoResults && (
        <div className="college-status">No schools found for "{searchQuery.trim()}".</div>
      )}
      
      <div className="college-buttons">
        {showApiSchools
          ? filteredApiColleges.map((college) => {
              const palette = getSchoolBrandPalette(college.schoolColors);
              const displayName = college.schoolName.trim();
              const displayMascot = (college.mascot || '').trim();
              return (
                <button
                  key={`${college.school_ID}-${college.orderNumTemplate}`}
                  className="college-button college-button--themed"
                  style={
                    {
                      '--college-accent': palette.primary,
                      '--college-accent-secondary': palette.secondary,
                      '--college-accent-surface': palette.accentSurface,
                      '--college-accent-surface-strong': palette.accentSurfaceStrong,
                      '--college-accent-border': palette.accentBorder,
                      '--college-accent-ring': palette.accentRing,
                      '--college-accent-text': palette.textOnPrimary,
                    } as React.CSSProperties
                  }
                  onClick={() => handleApiCollegeSelect(college.orderNumTemplate)}
                >
                  <div className="college-logo">
                    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                    <img
                      src={getProxiedImageUrl(college.logoUrl) || asset('logo/asulogo.png')}
                      alt={`${displayName} Logo`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = asset('logo/asulogo.png');
                      }}
                    />
                  </div>
                  <div className="college-info">
                    <h2>{displayName}</h2>
                    <div className="college-meta-row">
                      <span className="college-key">{displayMascot || 'Mascot unavailable'}</span>
                    </div>
                  </div>
                </button>
              );
            })
          : filteredLocalColleges.map(([key, college]) => (
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

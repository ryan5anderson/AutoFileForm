import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { parseSizeScale } from '../../config/garmentRatios';
import { GarmentRatio } from '../../services/firebaseGarmentRatioService';

interface GarmentRatioEditorProps {
  ratio: GarmentRatio | null;
  garmentName: string;
  collegeKey: string;
  onSave: () => void;
  onCancel: () => void;
  onRevert?: () => void;
}

const GarmentRatioEditor: React.FC<GarmentRatioEditorProps> = ({
  ratio,
  garmentName,
  collegeKey,
  onSave,
  onCancel,
  onRevert
}) => {
  const [editedRatio, setEditedRatio] = useState<Partial<GarmentRatio>>({});
  const [saving, setSaving] = useState(false);
  const [reverting, setReverting] = useState(false);

  useEffect(() => {
    if (ratio) {
      setEditedRatio({ ...ratio });
    }
  }, [ratio]);

  // Available size scales
  const availableSizeScales = useMemo(() => [
    'XS-XL',
    'S-XL',
    'S-XXL',
    'S-XXXL',
    'SM-XL',
    '6M-12M',
    'N/A'
  ], []);

  // Size to field mapping configuration - single source of truth
  type SizeFieldAccessor = {
    get: (ratio: Partial<GarmentRatio>) => number;
    set: (ratio: Partial<GarmentRatio>, value: number) => void;
  };

  const sizeFieldMap: Record<string, SizeFieldAccessor> = useMemo(() => ({
    'XS': {
      get: (r) => typeof r.XS === 'number' ? r.XS : 0,
      set: (r, v) => { r.XS = v; }
    },
    'S': {
      get: (r) => typeof r.Small === 'number' ? r.Small : 0,
      set: (r, v) => { r.Small = v; }
    },
    'M': {
      get: (r) => typeof r.Medium === 'number' ? r.Medium : 0,
      set: (r, v) => { r.Medium = v; }
    },
    'L': {
      get: (r) => typeof r.Large === 'number' ? r.Large : 0,
      set: (r, v) => { r.Large = v; }
    },
    'XL': {
      get: (r) => typeof r.XL === 'number' ? r.XL : 0,
      set: (r, v) => { r.XL = v; }
    },
    'XXL': {
      get: (r) => typeof r["2X"] === 'number' ? r["2X"] : 0,
      set: (r, v) => { r["2X"] = v; }
    },
    'XXXL': {
      get: (r) => typeof r["3X"] === 'number' ? r["3X"] : 0,
      set: (r, v) => { r["3X"] = v; }
    },
    '6M': {
      get: (r) => typeof r["6M"] === 'number' ? r["6M"] : 0,
      set: (r, v) => { r["6M"] = v; }
    },
    '12M': {
      get: (r) => typeof r["12M"] === 'number' ? r["12M"] : 0,
      set: (r, v) => { r["12M"] = v; }
    },
    'SM': {
      get: (r) => r.Sizes?.SM || 0,
      set: (r, v) => { r.Sizes = { ...r.Sizes, SM: v }; }
    },
    'L/XL': {
      get: (r) => r.Sizes?.LXL || 0,
      set: (r, v) => { r.Sizes = { ...r.Sizes, LXL: v }; }
    }
  }), []);

  // Reusable function to get size value from any ratio
  const getSizeValue = useCallback((size: string, ratioToCheck: Partial<GarmentRatio> = editedRatio): number => {
    const accessor = sizeFieldMap[size];
    return accessor ? accessor.get(ratioToCheck) : 0;
  }, [sizeFieldMap, editedRatio]);

  // Reusable function to set size value in a ratio object
  const setSizeValue = useCallback((size: string, value: number, ratioToUpdate: Partial<GarmentRatio>): void => {
    const accessor = sizeFieldMap[size];
    if (accessor) {
      accessor.set(ratioToUpdate, value);
    }
  }, [sizeFieldMap]);

  // Helper function to validate Set Pack matches Size Distribution
  const validateSetPackMatchesDistribution = useCallback((ratioToValidate: Partial<GarmentRatio>): boolean => {
    const setPack = ratioToValidate["Set Pack"];
    const sizeScale = ratioToValidate["Size Scale"] || ratio?.["Size Scale"] || '';
    
    // If size scale is "N/A", no validation needed (Set Pack is just the increment step)
    if (sizeScale === 'N/A') {
      return true;
    }
    
    const sizesToValidate = parseSizeScale(sizeScale);
    
    if (setPack === null || setPack === undefined) {
      return false;
    }
    
    const distributionTotal = sizesToValidate.reduce((total, size) => {
      return total + getSizeValue(size, ratioToValidate);
    }, 0);
    
    return setPack === distributionTotal;
  }, [ratio, getSizeValue]);

  const handleSave = async () => {
    if (!ratio) return;
    
    // Get current size scale to check if validation is needed
    const currentSizeScale = editedRatio["Size Scale"] || ratio["Size Scale"] || '';
    
    // Only validate if size scale is not "N/A"
    if (currentSizeScale !== 'N/A' && !validateSetPackMatchesDistribution(editedRatio)) {
      alert('Cannot save: Set Pack value must match the total of Size Distribution values.');
      return;
    }
    
    setSaving(true);
    try {
      const { firebaseGarmentRatioService } = await import('../../services/firebaseGarmentRatioService');
      await firebaseGarmentRatioService.updateGarmentRatio(garmentName, editedRatio, collegeKey);
      
      // Clear cache to force refresh
      const { clearRatiosCache } = await import('../../config/garmentRatios');
      clearRatiosCache(collegeKey);
      
      onSave();
    } catch (error) {
      console.error('Error saving ratio:', error);
      alert('Failed to save ratio. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevertToDefault = async () => {
    if (!window.confirm('Are you sure you want to revert to default values? This will remove any college-specific overrides.')) {
      return;
    }

    setReverting(true);
    try {
      const { firebaseGarmentRatioService } = await import('../../services/firebaseGarmentRatioService');
      
      // Delete the college-specific override
      await firebaseGarmentRatioService.deleteGarmentRatioOverride(garmentName, collegeKey);
      
      // Clear cache to force refresh
      const { clearRatiosCache } = await import('../../config/garmentRatios');
      clearRatiosCache(collegeKey);
      clearRatiosCache(); // Also clear default cache to ensure fresh load
      
      // Load default ratio from JSON file (via Firebase service which falls back to JSON)
      const defaultRatios = await firebaseGarmentRatioService.getGarmentRatios(); // Get default ratios
      const defaultRatio = defaultRatios.find(r => r.Name.toLowerCase() === garmentName.toLowerCase());
      
      if (defaultRatio) {
        // Update the editor with default values immediately
        setEditedRatio({ ...defaultRatio });
      }
      
      // Small delay to ensure Firebase deletion is complete, then reload
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Reload the page data to reflect the change (will now use default)
      if (onRevert) {
        onRevert();
      } else {
        onSave(); // Reload the page data
      }
    } catch (error) {
      console.error('Error reverting to default:', error);
      alert('Failed to revert to default. Please try again.');
    } finally {
      setReverting(false);
    }
  };

  const handleSizeScaleChange = useCallback((newScale: string) => {
    setEditedRatio(prev => {
      const updated = { ...prev };
      updated["Size Scale"] = newScale;
      
      // Get the new sizes for this scale
      const newSizes = parseSizeScale(newScale);
      const oldSizes = parseSizeScale(prev["Size Scale"] || ratio?.["Size Scale"] || '');
      
      // Remove sizes that are no longer in the scale (set to 0)
      const sizesToRemove = oldSizes.filter(size => !newSizes.includes(size));
      sizesToRemove.forEach(size => {
        setSizeValue(size, 0, updated);
      });
      
      // Initialize new sizes to 0 if they don't exist
      const sizesToAdd = newSizes.filter(size => !oldSizes.includes(size));
      sizesToAdd.forEach(size => {
        setSizeValue(size, 0, updated);
      });
      
      return updated;
    });
  }, [ratio, setSizeValue]);

  const updateSizeDistribution = useCallback((size: string, value: number) => {
    setEditedRatio(prev => {
      const updated = { ...prev };
      setSizeValue(size, value, updated);
      return updated;
    });
  }, [setSizeValue]);

  // Determine which sizes to show based on size scale
  const sizeScale = editedRatio["Size Scale"] || ratio?.["Size Scale"] || '';
  const sizesToShow = useMemo(() => parseSizeScale(sizeScale), [sizeScale]);

  // Calculate total of size distribution
  const calculateSizeDistributionTotal = useCallback((): number => {
    return sizesToShow.reduce((total, size) => total + getSizeValue(size), 0);
  }, [sizesToShow, getSizeValue]);

  // Validate that Set Pack matches Size Distribution total
  const isValid = useCallback((): boolean => {
    return validateSetPackMatchesDistribution(editedRatio);
  }, [editedRatio, validateSetPackMatchesDistribution]);

  if (!ratio) return null;

  return (
    <div className="single-option-panel">
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(17, 17, 17, 0.05)',
        border: '1px solid var(--color-primary)',
        borderRadius: 'var(--radius)',
        marginBottom: '1.5rem',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text)',
        textAlign: 'center',
        lineHeight: '1.5'
      }}>
        <strong style={{ color: 'var(--color-primary)' }}>Note:</strong> Editing this garment ratio will update all garments of this type (<strong>{garmentName}</strong>) for this college.
      </div>
      <div className="field">
        <div className="field-label">Set Pack</div>
        <div className="field-control">
          <input
            type="number"
            value={editedRatio["Set Pack"] ?? ''}
            onChange={(e) => setEditedRatio(prev => ({ ...prev, "Set Pack": e.target.value ? parseInt(e.target.value) : null }))}
            style={{
              padding: '0.5rem',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--font-size-base)',
              width: '100%',
              maxWidth: '200px',
              textAlign: 'center'
            }}
          />
        </div>
      </div>

      <div className="field">
        <div className="field-label">Size Scale</div>
        <div className="field-control">
          <select
            value={editedRatio["Size Scale"] ?? ratio["Size Scale"] ?? ''}
            onChange={(e) => handleSizeScaleChange(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--font-size-base)',
              width: '100%',
              maxWidth: '200px',
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              cursor: 'pointer'
            }}
          >
            {availableSizeScales.map((scale) => (
              <option key={scale} value={scale}>
                {scale}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sizesToShow.length > 0 && (
        <div className="field">
          <div className="field-label">Size Distribution (per pack)</div>
          <div className="field-control">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '0.75rem'
            }}>
              {sizesToShow.map((size) => (
                <div key={size} style={{
                  padding: '0.75rem',
                  background: 'var(--color-bg)',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-gray-500)',
                    marginBottom: '0.5rem',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    {size}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={getSizeValue(size)}
                    onChange={(e) => updateSizeDistribution(size, parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      padding: '0.5rem',
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--font-size-base)',
                      textAlign: 'center',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sizesToShow.length > 0 && !isValid() && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: 'var(--radius)',
          marginTop: '1rem',
          fontSize: 'var(--font-size-sm)',
          color: 'rgba(220, 38, 38, 0.9)',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          <strong>Validation Error:</strong> Set Pack ({editedRatio["Set Pack"] ?? 'not set'}) must equal the total of Size Distribution ({calculateSizeDistributionTotal()}). Please adjust the values to match.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSave}
            disabled={saving || reverting || (sizesToShow.length > 0 && !isValid())}
            className="done-btn"
            style={{ 
              flex: 1,
              opacity: (saving || reverting || (sizesToShow.length > 0 && !isValid())) ? 0.5 : 1,
              cursor: (saving || reverting || (sizesToShow.length > 0 && !isValid())) ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving || reverting}
            style={{
              flex: 1,
              padding: '0.875rem 1.5rem',
              background: 'var(--color-bg)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-text)',
              cursor: (saving || reverting) ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)'
            }}
          >
            Cancel
          </button>
        </div>
        <button
          onClick={handleRevertToDefault}
          disabled={saving || reverting}
          style={{
            padding: '0.875rem 1.5rem',
            background: 'var(--color-bg)',
            border: '2px solid var(--color-danger)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-danger)',
            cursor: (saving || reverting) ? 'not-allowed' : 'pointer',
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            opacity: (saving || reverting) ? 0.5 : 1
          }}
        >
          {reverting ? 'Reverting...' : 'Revert to Default'}
        </button>
      </div>
    </div>
  );
};

export default GarmentRatioEditor;


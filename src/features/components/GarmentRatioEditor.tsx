import React, { useState, useEffect } from 'react';

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

  const handleSave = async () => {
    if (!ratio) return;
    
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

  const updateSizeDistribution = (size: string, value: number) => {
    setEditedRatio(prev => {
      const updated = { ...prev };
      
      // Map size codes to JSON fields
      if (size === 'XS') {
        updated.XS = value;
      } else if (size === 'S') {
        updated.Small = value;
      } else if (size === 'M') {
        updated.Medium = value;
      } else if (size === 'L') {
        updated.Large = value;
      } else if (size === 'XL') {
        updated.XL = value;
      } else if (size === 'XXL') {
        updated["2X"] = value;
      } else if (size === 'XXXL') {
        updated["3X"] = value;
      } else if (size === '6M') {
        updated["6M"] = value;
      } else if (size === '12M') {
        updated["12M"] = value;
      } else if (size === 'SM') {
        updated.Sizes = { ...updated.Sizes, SM: value };
      } else if (size === 'L/XL') {
        updated.Sizes = { ...updated.Sizes, LXL: value };
      }
      
      return updated;
    });
  };

  const getSizeValue = (size: string): number => {
    if (size === 'XS') return typeof editedRatio.XS === 'number' ? editedRatio.XS : 0;
    if (size === 'S') return typeof editedRatio.Small === 'number' ? editedRatio.Small : 0;
    if (size === 'M') return typeof editedRatio.Medium === 'number' ? editedRatio.Medium : 0;
    if (size === 'L') return typeof editedRatio.Large === 'number' ? editedRatio.Large : 0;
    if (size === 'XL') return typeof editedRatio.XL === 'number' ? editedRatio.XL : 0;
    if (size === 'XXL') return typeof editedRatio["2X"] === 'number' ? editedRatio["2X"] : 0;
    if (size === 'XXXL') return typeof editedRatio["3X"] === 'number' ? editedRatio["3X"] : 0;
    if (size === '6M') return typeof editedRatio["6M"] === 'number' ? editedRatio["6M"] : 0;
    if (size === '12M') return typeof editedRatio["12M"] === 'number' ? editedRatio["12M"] : 0;
    if (size === 'SM') return editedRatio.Sizes?.SM || 0;
    if (size === 'L/XL') return editedRatio.Sizes?.LXL || 0;
    return 0;
  };

  if (!ratio) return null;

  // Determine which sizes to show based on size scale
  const sizeScale = editedRatio["Size Scale"] || ratio["Size Scale"] || '';
  const sizesToShow: string[] = [];
  
  if (sizeScale.includes('6M')) {
    sizesToShow.push('6M', '12M');
  } else if (sizeScale === 'SM-XL') {
    sizesToShow.push('SM', 'L/XL');
  } else {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    if (sizeScale.includes('-')) {
      const parts = sizeScale.split('-');
      const start = parts[0].trim();
      const end = parts[1].trim();
      const startIdx = sizeOrder.indexOf(start);
      const endIdx = sizeOrder.indexOf(end);
      if (startIdx >= 0 && endIdx >= 0) {
        sizesToShow.push(...sizeOrder.slice(startIdx, endIdx + 1));
      }
    }
  }

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
          <input
            type="text"
            value={editedRatio["Size Scale"] ?? ratio["Size Scale"] ?? ''}
            onChange={(e) => setEditedRatio(prev => ({ ...prev, "Size Scale": e.target.value }))}
            style={{
              padding: '0.5rem',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--font-size-base)',
              width: '100%',
              maxWidth: '200px'
            }}
          />
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSave}
            disabled={saving || reverting}
            className="done-btn"
            style={{ flex: 1 }}
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


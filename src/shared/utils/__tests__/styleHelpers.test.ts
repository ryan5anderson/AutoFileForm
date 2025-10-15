import {
  validateCSSCustomProperty,
  createStyleProps,
  createValidatedStyleProps,
  validateDesignTokenUsage,
  cssVar,
  getCSSVar,
  combineStyles
} from '../styleHelpers';



describe('styleHelpers', () => {
  describe('in development mode', () => {
    // Mock console methods for testing warnings
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalEnv = process.env;
    let mockWarn: jest.Mock;
    let mockError: jest.Mock;

    beforeEach(() => {
      mockWarn = jest.fn();
      mockError = jest.fn();
      console.warn = mockWarn;
      console.error = mockError;
      // Mock NODE_ENV for development warnings
      process.env = {
        ...originalEnv,
        NODE_ENV: 'development',
      };
    });

    afterEach(() => {
      console.warn = originalWarn;
      console.error = originalError;
      process.env = originalEnv;
    });

  describe('validateCSSCustomProperty', () => {
    it('should validate correct CSS custom properties', () => {
      expect(validateCSSCustomProperty('--color-primary', '#166534')).toBe(true);
      expect(validateCSSCustomProperty('--space-3', '1rem')).toBe(true);
    });

    it('should reject properties not starting with --', () => {
      expect(validateCSSCustomProperty('color-primary', '#166534')).toBe(false);
      expect(mockWarn).toHaveBeenCalledWith(
        'Invalid CSS custom property: "color-primary". Must start with \'--\''
      );
    });

    it('should reject properties with spaces', () => {
      expect(validateCSSCustomProperty('--color primary', '#166534')).toBe(false);
      expect(mockWarn).toHaveBeenCalledWith(
        'Invalid CSS custom property: "--color primary". Property names cannot contain spaces'
      );
    });

    it('should warn about reserved keywords', () => {
      validateCSSCustomProperty('--test-prop', 'initial');
      expect(mockWarn).toHaveBeenCalledWith(
        'CSS custom property "--test-prop" uses reserved keyword "initial". This may cause unexpected behavior.'
      );
    });

    it('should warn about !important usage', () => {
      validateCSSCustomProperty('--test-prop', 'red !important');
      expect(mockWarn).toHaveBeenCalledWith(
        'CSS custom property "--test-prop" contains !important. This is generally not recommended.'
      );
    });
  });

  describe('createStyleProps', () => {
    it('should create valid style props from CSS custom properties', () => {
      const result = createStyleProps({
        '--color-primary': '#166534',
        '--space-3': '1rem'
      });

      expect(result).toEqual({
        '--color-primary': '#166534',
        '--space-3': '1rem'
      });
    });

    it('should filter out invalid properties', () => {
      const result = createStyleProps({
        '--valid-prop': 'value',
        'invalid-prop': 'value'
      });

      expect(result).toEqual({
        '--valid-prop': 'value'
      });
      expect(mockWarn).toHaveBeenCalled();
    });
  });

  describe('validateDesignTokenUsage', () => {
    it('should warn about raw color values', () => {
      validateDesignTokenUsage('--test-color', '#ff0000');
      expect(mockWarn).toHaveBeenCalledWith(
        'CSS custom property "--test-color" uses raw color value "#ff0000". Consider using design tokens like var(--color-primary).'
      );
    });

    it('should warn about raw pixel values in spacing properties', () => {
      validateDesignTokenUsage('--test-padding', '16px');
      expect(mockWarn).toHaveBeenCalledWith(
        'CSS custom property "--test-padding" uses raw pixel value "16px". Consider using design tokens like var(--space-3).'
      );
    });

    it('should allow design token values', () => {
      expect(validateDesignTokenUsage('--test-color', 'var(--color-primary)')).toBe(true);
      expect(validateDesignTokenUsage('--test-spacing', 'var(--space-3)')).toBe(true);
      expect(mockWarn).not.toHaveBeenCalled();
    });
  });

  describe('createValidatedStyleProps', () => {
    it('should create validated style props in non-strict mode', () => {
      const result = createValidatedStyleProps({
        '--valid-prop': 'var(--color-primary)',
        '--invalid-color': '#ff0000'
      });

      expect(result).toEqual({
        '--valid-prop': 'var(--color-primary)',
        '--invalid-color': '#ff0000'
      });
    });

    it('should reject invalid tokens in strict mode', () => {
      const result = createValidatedStyleProps({
        '--valid-prop': 'var(--color-primary)',
        '--invalid-color': '#ff0000'
      }, { strict: true });

      expect(result).toEqual({
        '--valid-prop': 'var(--color-primary)'
      });
      expect(mockError).toHaveBeenCalledWith(
        'Strict mode: Rejecting CSS custom property "--invalid-color" due to design token validation failure.'
      );
    });
  });
  }); // Close the "in development mode" describe block

  // Tests that don't require development mode
  describe('utility functions', () => {
    describe('cssVar', () => {
      it('should create CSS custom property names', () => {
        expect(cssVar('color-primary')).toBe('--color-primary');
        expect(cssVar('--space-3')).toBe('--space-3');
      });
    });

    describe('getCSSVar', () => {
      it('should create CSS var() functions', () => {
        expect(getCSSVar('--color-primary')).toBe('var(--color-primary)');
        expect(getCSSVar('--color-primary', '#166534')).toBe('var(--color-primary, #166534)');
      });
    });

    describe('combineStyles', () => {
      it('should combine CSS classes with dynamic styles', () => {
        const result = combineStyles('base-class', {
          '--custom-prop': 'value'
        });

        expect(result).toEqual({
          className: 'base-class',
          style: {
            '--custom-prop': 'value'
          }
        });
      });

      it('should handle array of classes', () => {
        const result = combineStyles(['class1', 'class2']);
        expect(result).toEqual({
          className: 'class1 class2'
        });
      });

      it('should handle no dynamic styles', () => {
        const result = combineStyles('base-class');
        expect(result).toEqual({
          className: 'base-class'
        });
      });
    });
  });
});
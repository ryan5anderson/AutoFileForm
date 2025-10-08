# Unused Code Analysis

## Summary
This document identifies unused code, dependencies, and files in the AutoFileForm codebase as of October 8, 2025.

---

## ❌ UNUSED NPM DEPENDENCIES

### 1. **zustand** (v5.0.6)
- **Location**: `package.json` dependencies
- **Status**: Installed but never imported anywhere in the codebase
- **Recommendation**: Remove unless planning to migrate from useState to Zustand
- **Command**: `npm uninstall zustand`

### 2. **classnames** (v2.5.1)
- **Location**: `package.json` dependencies
- **Status**: Installed but never imported anywhere in the codebase
- **Recommendation**: Remove - not being used for conditional className generation
- **Command**: `npm uninstall classnames`

---

## ❌ UNUSED UTILITY FILES

### 1. **src/utils/format.ts**
- **Exports**: `formatCurrency`, `formatDate`, `pluralize`, `formatPhoneNumber`
- **Status**: File exists and exports utility functions, but NONE are imported or used anywhere
- **Recommendation**: Delete file or keep if planning to use for future features
- **Impact**: Low - completely isolated

### 2. **src/utils/guard.ts**
- **Exports**: `isString`, `isNumber`, `isObject`, `isArray`, `isDefined`, `hasProperty`
- **Status**: Type guards exported but never imported or used
- **Recommendation**: Delete file unless needed for future type safety
- **Impact**: Low - completely isolated

### 3. **src/reportWebVitals.ts**
- **Status**: Standard CRA file, but never imported in `src/index.tsx`
- **Recommendation**: Either import and use it, or delete it
- **Impact**: Low - optional performance monitoring

---

## ⚠️ UNUSED DOCUMENTATION FILES

### Root Directory Text Files
These appear to be development notes that could be archived or moved:

1. **dadNotes.txt** - Development requirements/notes
2. **refactor.txt** - Refactoring plan (already implemented)
3. **v2Notes.txt** - Version 2 planning notes

**Recommendation**: 
- Move to a `docs/planning/` directory or delete if no longer needed
- These don't affect the build but clutter the root directory

---

## ⚠️ SCRIPTS DIRECTORY

### Files in `/scripts/`
1. **extract_pdf_images_with_captions.py** - Python script for image extraction
2. **WVU Approval Flyer_email.pdf** - Reference document
3. **BUGFIX.md** - Bug documentation
4. **README.md** - Scripts documentation

**Recommendation**: 
- Keep if these are utility scripts used for content management
- Document their purpose in the main README or scripts/README.md

---

## ✅ POTENTIALLY REDUNDANT BUT USED

### 1. **src/setupTests.ts**
- **Purpose**: Jest-DOM configuration for testing
- **Status**: Used by test infrastructure but no tests currently exist
- **Recommendation**: Keep - needed if you add tests in the future

### 2. **gh-pages** dependency
- **Status**: Listed in devDependencies
- **Usage**: Used in `deploy:clean` script but not in main `deploy` script
- **Recommendation**: Keep - valid deployment tool

---

## 📊 COLLEGE CONFIGURATIONS

### Configured Colleges (3 total)
✅ **Michigan State** - Fully configured
✅ **Arizona State** - Fully configured  
✅ **West Virginia University** - Fully configured

All three are actively used and have complete configurations.

---

## 🔍 CODE QUALITY OBSERVATIONS

### Well-Organized Code (No Issues)
- All React components are being used
- All feature utilities are imported and used
- All UI components (Card, Field, ButtonIcon) are actively used
- Type definitions are all referenced
- Context and hooks are properly utilized

### Areas of Excellence
1. **Good modular structure** - features, components, utils properly separated
2. **TypeScript integration** - comprehensive type safety
3. **No dead routes** - all route components are used
4. **Clean dependency tree** - almost no unused imports

---

## 📝 RECOMMENDATIONS

### High Priority (Remove These)
1. ❌ Uninstall `zustand` - Not being used
2. ❌ Uninstall `classnames` - Not being used
3. ❌ Delete `src/utils/format.ts` - No imports found
4. ❌ Delete `src/utils/guard.ts` - No imports found

### Medium Priority (Clean Up)
5. 📁 Move or delete `dadNotes.txt`, `refactor.txt`, `v2Notes.txt`
6. 📁 Document or organize `/scripts/` directory purpose

### Low Priority (Consider)
7. 🔧 Either use or remove `reportWebVitals.ts`
8. 🧪 Consider adding tests (setupTests.ts is ready but no tests exist)

---

## 💾 ESTIMATED SPACE SAVINGS

- **npm dependencies**: ~500KB (zustand + classnames)
- **Source files**: ~2KB (format.ts + guard.ts + reportWebVitals.ts)
- **Documentation**: ~5KB (planning notes)
- **Total**: ~507KB

---

## ✅ COMMANDS TO CLEAN UP

```bash
# Remove unused npm packages
npm uninstall zustand classnames

# Remove unused utility files (if confirmed not needed)
rm src/utils/format.ts
rm src/utils/guard.ts
rm src/reportWebVitals.ts

# Update src/utils/index.ts to remove references
# (Will need to remove export lines for format and guard)

# Optionally organize documentation
mkdir -p docs/planning
mv dadNotes.txt refactor.txt v2Notes.txt docs/planning/
```

---

## 📚 NOTES

- The codebase is generally very clean with minimal unused code
- Most "unused" items appear to be leftover from initial CRA setup or abandoned refactoring plans
- The main application code is well-organized and actively used
- No significant architectural debt identified


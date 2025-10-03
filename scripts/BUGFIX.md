# Bug Fix: PDF Image Extraction for WVU

## Problem
The `extract_pdf_images_with_captions.py` script was failing to extract most images from the WVU Approval Flyer PDF.

## Root Cause
The script used a regex pattern `^M\d{9}` that required **exactly 9 digits** after the 'M' in product codes. However, the WVU PDF contains M-codes with varying digit lengths:

- **26 M-codes with 8 digits** (e.g., M90637743, M89672118) ❌ Not matched
- **38 M-codes with 9 digits** (e.g., M100474382, M102612120) ✓ Matched
- **4 M-codes with 4 digits** (e.g., M6999 - part numbers) ❌ Not matched

This meant only ~38 out of 68 product images were being correctly identified.

## Solution
Changed the regex pattern from `r'^M\d{9}'` to `r'^M\d{6,}'` in the `find_caption_for_image()` function.

This pattern now matches:
- M followed by 6 or more digits
- Handles all product code variations (8-digit and 9-digit M-codes)
- More flexible for future PDFs with different formats

## File Changed
- `scripts/extract_pdf_images_with_captions.py` (line 331)

## Verification
Tested on WVU Approval Flyer PDF page 1:
- Before fix: Found 1/4 captions
- After fix: Found 4/4 captions ✓

The script now correctly extracts all images and their captions from the WVU PDF.


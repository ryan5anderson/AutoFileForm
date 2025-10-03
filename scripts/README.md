# PDF Image Extraction Script

## Overview

The `extract_pdf_images_with_captions.py` script extracts images from PDF art approval flyers, automatically categorizes them, saves them to the appropriate public folders, and updates the college configuration files.

## Features

- ✅ Interactive college selection (Arizona State or Michigan State)
- ✅ Automatic image extraction with caption detection
- ✅ Smart categorization (beanies, hats, shirts, etc.)
- ✅ Clean slate approach (removes existing images before extraction)
- ✅ Automatic JSON config updates
- ✅ Category creation for new product types

## Installation

Install required dependencies:

```bash
pip install PyMuPDF pandas
```

## Usage

### Basic Usage

```bash
python scripts/extract_pdf_images_with_captions.py path/to/artwork.pdf
```

The script will:
1. Prompt you to select a college (1 for Arizona State, 2 for Michigan State)
2. Clean existing images in the selected college folder
3. Extract images from the PDF
4. Categorize images based on product type
5. Save images to `public/{CollegeName}/{category}/`
6. Update `src/config/colleges/{college}.json` with image filenames

### Advanced Options

```bash
python scripts/extract_pdf_images_with_captions.py artwork.pdf --format jpg --debug
```

**Available Options:**
- `--format png|jpg` - Image format (default: png)
- `--max_gap 110.0` - Max vertical gap for caption detection (default: 110)
- `--min_overlap_ratio 0.30` - Min horizontal overlap ratio (default: 0.30)
- `--debug` - Print debug information for first page
- `--zip` - Create a ZIP file of extracted images

## Categorization Rules

Images are automatically categorized based on keywords in their captions:

| Keyword | Category Folder |
|---------|----------------|
| beanie | `beanie/` |
| bottle | `bottle/` |
| card | `card/` |
| hat | `hat/` |
| flannels | `flannels/` |
| plush | `plush/` |
| jacket | `jacket/` |
| shorts | `shorts/` |
| socks | `socks/` |
| sticker | `sticker/` |
| pants | `pants/` |
| banner | `banner/` |
| jr (as word) | `tshirt/women/` |
| *default* | `tshirt/men/` |

**Note:** Matching is case-insensitive and first match wins.

## Output

### Directory Structure
```
public/
├── ArizonaState/
│   ├── beanie/
│   │   └── M102300460_SHE1CB_Custom_Logo_Maroon_Beanie.png
│   ├── tshirt/
│   │   ├── men/
│   │   │   └── M102595496_SH2FDC_Custom_DTF_on_Maroon.png
│   │   └── women/
│   │       └── M102074486_SDSORS_Jr_Socrates_DTF_on_Steel.png
│   └── ...
└── MichiganState/
    └── ...
```

### Manifest File

A `manifest.csv` file is created in the output directory with columns:
- `page` - PDF page number
- `image_index_on_page` - Image index on that page
- `filename` - Extracted filename
- `caption` - Detected caption text
- `category_subfolder` - Category folder path
- `output_path` - Full relative path

### Config Update

The script automatically updates `src/config/colleges/{college}.json`:

**Before:**
```json
{
  "name": "Arizona State",
  "categories": [
    {
      "name": "Beanies",
      "path": "beanie",
      "images": []
    }
  ]
}
```

**After:**
```json
{
  "name": "Arizona State",
  "categories": [
    {
      "name": "Beanies",
      "path": "beanie",
      "images": [
        "M102300460_SHE1CB_Custom_Logo_Maroon_Beanie.png",
        "M102300567_SHE1CB_Custom_Logo_Gray_Beanie.png"
      ]
    }
  ]
}
```

## Troubleshooting

### Caption Detection Issues

If captions aren't being detected correctly, try adjusting:
- `--max_gap` - Increase if captions are far below images
- `--min_overlap_ratio` - Decrease if captions are offset horizontally
- `--debug` - Enable to see detection details

### Missing Categories

If a product type isn't categorized correctly:
1. Check the categorization rules in the script
2. The script will automatically create new categories if needed
3. New categories appear at the end of the config file

## Example Workflow

```bash
# 1. Get the art approval PDF
# 2. Run the extraction script
python scripts/extract_pdf_images_with_captions.py "Art Approval Flyer_Email.pdf"

# 3. Select college when prompted
Select target college:
  1. Arizona State
  2. Michigan State

Enter your choice (1 or 2): 1

# 4. Script processes and displays progress
✓ Selected: ArizonaState
📂 Output directory: C:\...\public\ArizonaState
🧹 Cleaning existing images...
   Deleted 45 existing images
📄 Processing PDF: Art Approval Flyer_Email.pdf
==================================================
Saved 38 images to C:\...\public\ArizonaState
📋 Building category image map...
⚙️  Updating JSON configuration...
✅ Updated config: C:\...\src\config\colleges\arizonastate.json
   - Updated 12 categories
   - Total images: 38
==================================================
✨ EXTRACTION COMPLETE!
```

## Notes

- The script uses a "clean slate" approach - all existing images in the target college folder are deleted before extraction
- Folder structure is preserved, only image files are removed
- The JSON config is completely regenerated with new image lists
- Categories not present in the extraction will have empty `images` arrays


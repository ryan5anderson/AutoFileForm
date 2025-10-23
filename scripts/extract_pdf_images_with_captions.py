#!/usr/bin/env python3
"""
Development-only helper script.

Run whatever background tasks you need here (e.g., file watching,
image processing, syncing). This file is ignored by production builds
because it is not imported anywhere by the React app and lives outside
the build pipeline.
"""

#!/usr/bin/env python3
"""
Extract images from a PDF, categorize them, and update college configs.

This script:
1. Prompts user to select a college (Arizona State, Michigan State, West Virginia University, University of Pittsburgh, or Alabama University)
2. Extracts images from PDF and names them using captions
3. Categorizes images into subfolders (beanie, tshirt/men, etc.)
4. Cleans existing images in the target college's public folder
5. Updates the corresponding JSON config with extracted image filenames

Dependencies:
    pip install PyMuPDF pandas

Usage:
    python scripts/extract_pdf_images_with_captions.py input.pdf
    
    # Script will prompt:
    # Select college:
    #   1. Arizona State
    #   2. Michigan State
    #   3. West Virginia University
    #   4. University of Pittsburgh
    #   5. Alabama University
    # Enter your choice (1, 2, 3, 4, or 5): 1
    
    # Then extracts to public/ArizonaState/ and updates arizonastate.json

Key Options:
    --format: png or jpg (default: png)
    --max_gap: max vertical gap below image to search for caption (default 110)
    --min_overlap_ratio: min horizontal overlap (fraction of image width) (default 0.30)
    --debug: print debug info for first page
    --zip: create a .zip of the output directory

Note:
    The script handles M-codes with varying digit lengths (8-9 digits).
    Examples: M102595496, M90637743, M89672118
"""

import argparse
import re
import json
import os
import glob
import hashlib
from pathlib import Path
import fitz  # PyMuPDF
import pandas as pd
import zipfile
from typing import List, Tuple, Dict, Any, Optional, Set

# ----------------------------
# Utilities
# ----------------------------

def prompt_college_selection() -> Tuple[str, str]:
    """
    Prompt user to select a college.
    Returns (college_folder_name, config_file_name)
    e.g., ('ArizonaState', 'arizonastate')
    """
    print("\n" + "="*50)
    print("PDF IMAGE EXTRACTOR - College Selection")
    print("="*50)
    print("\nSelect target college:")
    print("  1. Arizona State")
    print("  2. Michigan State")
    print("  3. West Virginia University")
    print("  4. University of Pittsburgh")
    print("  5. Alabama University")
    print()
    
    while True:
        choice = input("Enter your choice (1, 2, 3, 4, or 5): ").strip()
        if choice == "1":
            return ("ArizonaState", "arizonastate")
        elif choice == "2":
            return ("MichiganState", "michiganstate")
        elif choice == "3":
            return ("WestVirginiaUniversity", "westvirginiauniversity")
        elif choice == "4":
            return ("PittsburghUniversity", "pittsburghuniversity")
        elif choice == "5":
            return ("AlabamaUniversity", "alabamauniversity")
        else:
            print("Invalid choice. Please enter 1, 2, 3, 4, or 5.")

def clean_existing_images(college_dir: Path) -> int:
    """
    Delete all existing images in the college directory (clean slate).
    Keeps folder structure intact.
    Returns count of deleted files.
    """
    if not college_dir.exists():
        return 0
    
    deleted_count = 0
    image_extensions = ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp', '*.svg']
    
    # Walk through all subdirectories
    for root, dirs, files in os.walk(college_dir):
        root_path = Path(root)
        for ext in image_extensions:
            for img_file in root_path.glob(ext):
                if img_file.is_file():
                    img_file.unlink()
                    deleted_count += 1
    
    return deleted_count

def update_college_config(
    college_config_name: str,
    category_image_map: Dict[str, List[str]],
    script_dir: Path
) -> None:
    """
    Update the college's JSON config with extracted images.
    
    Args:
        college_config_name: 'arizonastate' or 'michiganstate' (lowercase)
        category_image_map: {'beanie': ['file1.png', ...], 'tshirt/men': [...]}
        script_dir: Path to the scripts directory (to navigate to src/)
    """
    # Navigate from scripts/ to src/config/colleges/
    project_root = script_dir.parent
    config_path = project_root / "src" / "config" / "colleges" / f"{college_config_name}.json"
    
    if not config_path.exists():
        print(f"Warning: Config file not found at {config_path}")
        return
    
    # Load existing config
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    # Create a mapping of path -> category index for quick lookup
    path_to_category_idx = {}
    for idx, category in enumerate(config.get('categories', [])):
        path_to_category_idx[category['path']] = idx
    
    # Update existing categories and track which paths were processed
    processed_paths = set()
    for category_path, image_files in category_image_map.items():
        if category_path in path_to_category_idx:
            # Update existing category
            idx = path_to_category_idx[category_path]
            config['categories'][idx]['images'] = sorted(image_files)
            processed_paths.add(category_path)
        else:
            # Create new category entry
            category_name = category_path.replace('/', ' ').title()
            new_category = {
                "name": category_name,
                "path": category_path,
                "images": sorted(image_files)
            }
            config['categories'].append(new_category)
            processed_paths.add(category_path)
            print(f"  ℹ Created new category: {category_name} (path: {category_path})")
    
    # Clear images arrays for categories that weren't in the extraction
    for category in config['categories']:
        if category['path'] not in processed_paths:
            category['images'] = []
    
    # Write updated config back
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Updated config: {config_path}")
    print(f"   - Updated {len(processed_paths)} categories")
    total_images = sum(len(imgs) for imgs in category_image_map.values())
    print(f"   - Total images: {total_images}")

def slugify(s: str, max_len: int = 160) -> str:
    """Make a safe filename: collapse spaces, remove specials, replace spaces with underscores."""
    s = re.sub(r"\s+", " ", (s or "")).strip()
    s = re.sub(r"[^\w\-. ]", "", s)  # keep word chars, dash, dot, space
    s = s.replace("/", "-").replace("\\", "-")
    s = re.sub(r"\s", "_", s)
    if not s:
        s = "image"
    return s[:max_len]

def horiz_overlap(a: Tuple[float, float, float, float],
                  b: Tuple[float, float, float, float]) -> float:
    ax0, ay0, ax1, ay1 = a
    bx0, by0, bx1, by1 = b
    return max(0, min(ax1, bx1) - max(ax0, bx0))

def unique_path(base_dir: Path, base_name: str, ext: str) -> Path:
    p = base_dir / f"{base_name}{ext}"
    i = 2
    while p.exists():
        p = base_dir / f"{base_name} ({i}){ext}"
        i += 1
    return p

def categorize_image(caption: str) -> str:
    """
    Categorize an image based on its caption/title using case-insensitive matching.
    Returns the subfolder path (e.g., 'beanie/', 'tshirt/women/', etc.)
    
    Rules applied in order (first match wins):
    1. Beanie → beanie/
    2. Bottle → bottle/
    3. header → signage/
    4. card → signage/
    5. hat → hat/
    6. flannels → flannels/
    7. plush → plush/
    8. fleece → jacket/
    9. jacket → jacket/
    10. side_print → shorts/
    11. shorts → shorts/
    12. socks → socks/
    13. sticker → sticker/
    14. jogger → pants/
    15. pants → pants/
    16. banner → banner/
    17. shelf → banner/
    18. jr (as word) → tshirt/women/
    19. default → tshirt/men/
    """
    caption_lower = caption.lower()
    
    # Check each rule in order (more specific rules first)
    if "beanie" in caption_lower:
        return "beanie"
    if "bottle" in caption_lower:
        return "bottle"
    # header → signage (must come before card)
    if "header" in caption_lower:
        return "signage"
    if "card" in caption_lower:
        return "signage"
    if "hat" in caption_lower:
        return "hat"
    if "flannels" in caption_lower:
        return "flannels"
    if "plush" in caption_lower:
        return "plush"
    # fleece → jacket (must come before jacket)
    if "fleece" in caption_lower:
        return "jacket"
    if "jacket" in caption_lower:
        return "jacket"
    # side_print → shorts (must come before shorts)
    if "side_print" in caption_lower or "side print" in caption_lower:
        return "shorts"
    if "shorts" in caption_lower:
        return "shorts"
    if "socks" in caption_lower:
        return "socks"
    if "sticker" in caption_lower:
        return "sticker"
    # jogger → pants (must come before pants)
    if "jogger" in caption_lower:
        return "pants"
    if "pants" in caption_lower:
        return "pants"
    if "banner" in caption_lower:
        return "banner"
    if "shelf" in caption_lower:
        return "banner"
    
    # Check for "jr" as a word (with word boundaries)
    # Match: jr, Jr, JR, jr., jr,, jr-, etc.
    if re.search(r'\bjr\b', caption_lower):
        return "tshirt/women"
    
    # Default fallback
    return "tshirt/men"

# ----------------------------
# Page parsing
# ----------------------------

def lines_from_page(page: fitz.Page) -> List[Tuple[str, Tuple[float, float, float, float]]]:
    """
    Return list of (text, bbox) for each text line on the page using 'dict' format.
    bbox = (x0, y0, x1, y1)

    Lines are returned sorted top-to-bottom by their y0 coordinate.
    """
    # Use 'dict' format instead of 'rawdict' - it has better text extraction
    text_dict = page.get_text("dict")
    lines: List[Tuple[str, Tuple[float, float, float, float]]] = []
    
    for b in text_dict.get("blocks", []):
        if b.get("type") == 0:  # text block
            for l in b.get("lines", []):
                text = "".join(s.get("text", "") for s in l.get("spans", []))
                text = (text or "").strip()
                if text:
                    bbox = tuple(l.get("bbox", (0, 0, 0, 0)))
                    lines.append((text, bbox))  # type: ignore
    
    # sort lines top-to-bottom for easier neighbor searching / merging
    lines.sort(key=lambda t: t[1][1])
    return lines

def get_image_hash(image_bytes: bytes) -> str:
    """Generate a hash of image bytes for deduplication."""
    return hashlib.md5(image_bytes).hexdigest()

def images_from_page(page: fitz.Page) -> List[Dict[str, Any]]:
    """
    Return list of dicts for images detected via rawdict:
    { 'bytes': bytes, 'bbox': (x0,y0,x1,y1), 'ext': 'jpeg'/'png'/..., 'hash': str }
    """
    raw = page.get_text("rawdict")
    imgs = []
    for b in raw.get("blocks", []):
        if b.get("type") == 1 and b.get("image") is not None:
            img_bytes = b.get("image")
            imgs.append({
                "bytes": img_bytes,
                "bbox": tuple(b.get("bbox", (0, 0, 0, 0))),  # type: ignore
                "ext": b.get("ext", "png"),
                "hash": get_image_hash(img_bytes),
                "size": len(img_bytes)
            })
    return imgs

def find_caption_for_image(
    img_bbox: Tuple[float, float, float, float],
    lines: List[Tuple[str, Tuple[float, float, float, float]]],
    page_height: float,
    max_vertical_gap: float = 110,
    min_overlap_ratio: float = 0.30,
    debug: bool = False,
) -> Optional[str]:
    """
    Find a caption for an image by looking for text lines that:
    1. Start with M followed by digits (product codes like M102595496 or M90637743)
    2. Are positioned below or near the image
    3. Have reasonable horizontal alignment with the image
    
    Falls back to generic pageN_imageM naming if no match found.
    """
    x0, y0, x1, y1 = img_bbox
    img_w = max(1.0, x1 - x0)
    img_center_x = (x0 + x1) / 2.0
    
    # Pattern to match product codes - flexible to handle 8-9 digit M-codes
    # Examples: "M102595496", "M90637743", "M89672118"
    product_pattern = re.compile(r'^M\d{6,}')
    
    if debug:
        print(f"\n=== Image bbox: ({x0:.1f}, {y0:.1f}, {x1:.1f}, {y1:.1f}) ===")
        print(f"Image width: {img_w:.1f}, center_x: {img_center_x:.1f}")
        print("\nAll lines on page:")
        for text, (lx0, ly0, lx1, ly1) in lines:
            if product_pattern.match(text):
                print(f"  MATCH: '{text[:60]}...' @ ({lx0:.1f}, {ly0:.1f}, {lx1:.1f}, {ly1:.1f})")

    def candidate_score(lx0: float, ly0: float, lx1: float, ly1: float, vertical_dist: float) -> float:
        """Smaller is better. Prioritize vertical proximity and horizontal alignment."""
        line_center = (lx0 + lx1) / 2.0
        center_penalty = abs(line_center - img_center_x) / max(img_w, 1.0)
        return abs(vertical_dist) + 0.3 * center_penalty

    best: Optional[Tuple[str, Tuple[float, float, float, float]]] = None
    best_score = float("inf")

    # Search below the image first (primary location)
    for text, (lx0, ly0, lx1, ly1) in lines:
        if not product_pattern.match(text):
            continue
            
        # Check if line is below image
        if ly0 >= y1 and (ly0 - y1) <= max_vertical_gap:
            overlap = horiz_overlap(img_bbox, (lx0, ly0, lx1, ly1))
            line_center = (lx0 + lx1) / 2.0
            center_distance_px = abs(line_center - img_center_x)
            
            # More lenient matching - just needs some overlap or reasonable centering
            if overlap >= 0.05 * img_w or center_distance_px <= img_w:
                score = candidate_score(lx0, ly0, lx1, ly1, ly0 - y1)
                if score < best_score:
                    best = (text, (lx0, ly0, lx1, ly1))
                    best_score = score
                    if debug:
                        print(f"  BELOW candidate: '{text[:50]}' score={score:.2f}")

    # Fallback: search above the image (sometimes captions are at top)
    if not best:
        above_gap = min(50.0, max_vertical_gap * 0.5)
        for text, (lx0, ly0, lx1, ly1) in lines:
            if not product_pattern.match(text):
                continue
                
            if y0 >= ly1 and (y0 - ly1) <= above_gap:
                overlap = horiz_overlap(img_bbox, (lx0, ly0, lx1, ly1))
                line_center = (lx0 + lx1) / 2.0
                center_distance_px = abs(line_center - img_center_x)
                
                if overlap >= 0.05 * img_w or center_distance_px <= img_w:
                    score = candidate_score(lx0, ly0, lx1, ly1, y0 - ly1)
                    if score < best_score:
                        best = (text, (lx0, ly0, lx1, ly1))
                        best_score = score
                        if debug:
                            print(f"  ABOVE candidate: '{text[:50]}' score={score:.2f}")

    # Even more lenient fallback: any product code on the page near the image vertically
    if not best:
        extended_gap = max_vertical_gap * 2
        for text, (lx0, ly0, lx1, ly1) in lines:
            if not product_pattern.match(text):
                continue
            
            # Check if within extended vertical range
            vertical_dist = min(abs(ly0 - y1), abs(y0 - ly1))
            if vertical_dist <= extended_gap:
                line_center = (lx0 + lx1) / 2.0
                center_distance_px = abs(line_center - img_center_x)
                
                if center_distance_px <= img_w * 1.5:
                    score = candidate_score(lx0, ly0, lx1, ly1, vertical_dist)
                    if score < best_score:
                        best = (text, (lx0, ly0, lx1, ly1))
                        best_score = score
                        if debug:
                            print(f"  EXTENDED candidate: '{text[:50]}' score={score:.2f}")

    if not best:
        if debug:
            print("  NO MATCH FOUND")
        return None

    if debug:
        print(f"  SELECTED: '{best[0][:60]}'")
    return best[0].strip()

# ----------------------------
# Main extraction routine
# ----------------------------

def extract_images_with_captions(
    pdf_path: Path,
    outdir: Path,
    img_format: str = "png",
    also_zip: bool = False,
    max_vertical_gap: float = 110.0,
    min_overlap_ratio: float = 0.30,
    debug: bool = False,
) -> Path:
    outdir.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf_path.as_posix())

    manifest_rows = []
    saved_count = 0
    skipped_duplicates = 0
    failed_captions = 0
    
    # Track seen images by hash to avoid duplicates
    seen_hashes: Set[str] = set()
    # Track captions to handle multiple images with same caption
    caption_usage: Dict[str, int] = {}

    for pno in range(len(doc)):
        page = doc[pno]
        page_rect = page.rect
        lines = lines_from_page(page)
        page_text = page.get_text("text")
        images = images_from_page(page)
        
        print(f"Page {pno + 1}: Found {len(images)} images")

        for idx, img in enumerate(images, start=1):
            # Skip duplicate images based on hash
            img_hash = img["hash"]
            if img_hash in seen_hashes:
                skipped_duplicates += 1
                if debug:
                    print(f"  Skipping duplicate image (hash: {img_hash[:8]}...)")
                continue
            
            seen_hashes.add(img_hash)
            
            caption = find_caption_for_image(
                img["bbox"], lines, page_rect.height,
                max_vertical_gap=max_vertical_gap,
                min_overlap_ratio=min_overlap_ratio,
                debug=debug and pno == 0  # Only debug first page
            )
            
            if not caption:
                caption = f"page{pno+1}_image{idx}"
                failed_captions += 1
                print(f"  ⚠️  No caption found for image {idx} on page {pno+1}, using: {caption}")

            # Categorize the image based on caption
            category = categorize_image(caption)
            
            # Create category subfolder
            category_dir = outdir / category
            category_dir.mkdir(parents=True, exist_ok=True)
            
            base = slugify(caption)

            # Choose suffix based on requested format; we always dump the raw bytes from PDF
            req = img_format.lower()
            if req == "jpg":
                suffix = ".jpg"
            else:
                suffix = ".png"

            out_path = unique_path(category_dir, base, suffix)
            with open(out_path, "wb") as f:
                f.write(img["bytes"])
            saved_count += 1
            
            print(f"  ✓ Saved: {out_path.name} → {category}/")

            manifest_rows.append({
                "page": pno + 1,
                "image_index_on_page": idx,
                "filename": out_path.name,
                "caption": caption,
                "category_subfolder": category,
                "output_path": str(out_path.relative_to(outdir)),
                "image_hash": img_hash,
                "image_size_bytes": img["size"]
            })

    # Write manifest
    manifest_df = pd.DataFrame(manifest_rows)
    manifest_csv = outdir / "manifest.csv"
    manifest_df.to_csv(manifest_csv, index=False)

    # Optional ZIP
    if also_zip:
        zip_path = outdir.with_suffix(".zip")
        with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, files in outdir.walk():
                for file in files:
                    file_path = root / file
                    arcname = file_path.relative_to(outdir)
                    zf.write(file_path, arcname=str(arcname))
        print(f"Zipped output: {zip_path}")
        return zip_path

    print(f"\n{'='*50}")
    print(f"✓ Saved {saved_count} unique images to {outdir}")
    print(f"⊗ Skipped {skipped_duplicates} duplicate images")
    print(f"⚠  {failed_captions} images with generic names (caption detection failed)")
    print(f"📊 Manifest: {manifest_csv}")
    return manifest_csv

# ----------------------------
# CLI
# ----------------------------

def main():
    # Step 1: Prompt for college selection FIRST
    college_folder, college_config = prompt_college_selection()
    
    print(f"\n✓ Selected: {college_folder}")
    
    # Step 2: Parse command line arguments
    parser = argparse.ArgumentParser(description="Extract images from a PDF and name them using the caption beneath each image.")
    parser.add_argument("pdf", type=str, help="Path to the input PDF.")
    parser.add_argument("--format", type=str, default="png", choices=["png", "jpg"], help="Image filename suffix to use")
    parser.add_argument("--zip", action="store_true", help="Also create a .zip of the output directory")
    parser.add_argument("--max_gap", type=float, default=110.0, help="Max vertical gap (px) to search below an image for its caption")
    parser.add_argument("--min_overlap_ratio", type=float, default=0.30, help="Min horizontal overlap ratio between image and caption line")
    parser.add_argument("--debug", action="store_true", help="Print debug info for first page")
    args = parser.parse_args()

    pdf_path = Path(args.pdf).expanduser().resolve()
    
    # Step 3: Set output directory to public/{CollegeName}/
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    outdir = project_root / "public" / college_folder
    
    print(f"\n📂 Output directory: {outdir}")
    
    # Step 4: Clean existing images (clean slate)
    print("\n🧹 Cleaning existing images...")
    deleted_count = clean_existing_images(outdir)
    if deleted_count > 0:
        print(f"   Deleted {deleted_count} existing images")
    else:
        print("   No existing images found")
    
    # Step 5: Extract images with captions
    print(f"\n📄 Processing PDF: {pdf_path}")
    print("="*50)
    manifest_path = extract_images_with_captions(
        pdf_path=pdf_path,
        outdir=outdir,
        img_format=args.format,
        also_zip=args.zip,
        max_vertical_gap=args.max_gap,
        min_overlap_ratio=args.min_overlap_ratio,
        debug=args.debug,
    )
    
    # Step 6: Build category_image_map from manifest
    print("\n📋 Building category image map...")
    manifest_csv = outdir / "manifest.csv"
    if manifest_csv.exists():
        df = pd.read_csv(manifest_csv)
        category_image_map: Dict[str, List[str]] = {}
        
        for _, row in df.iterrows():
            category = row['category_subfolder']
            filename = row['filename']
            
            if category not in category_image_map:
                category_image_map[category] = []
            category_image_map[category].append(filename)
        
        # Step 7: Update JSON config
        print("\n⚙️  Updating JSON configuration...")
        update_college_config(college_config, category_image_map, script_dir)
        
        # Step 8: Success message
        print("\n" + "="*50)
        print("✨ EXTRACTION COMPLETE!")
        print("="*50)
        print(f"📁 Images saved to: {outdir}")
        print(f"⚙️  Config updated: src/config/colleges/{college_config}.json")
        print(f"📊 Manifest: {manifest_csv}")
    else:
        print("\n⚠️  Warning: Manifest file not created")
    
    print()

if __name__ == "__main__":
    main()



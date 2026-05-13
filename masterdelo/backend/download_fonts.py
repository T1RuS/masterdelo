"""
Download DejaVuSans fonts for PDF generation.
Run: python download_fonts.py
"""
import urllib.request
import os

FONTS_DIR = os.path.join(os.path.dirname(__file__), "fonts")
os.makedirs(FONTS_DIR, exist_ok=True)

fonts = {
    "DejaVuSans.ttf": "https://github.com/dejavu-fonts/dejavu-fonts/raw/refs/heads/master/ttf/DejaVuSans.ttf",
    "DejaVuSans-Bold.ttf": "https://github.com/dejavu-fonts/dejavu-fonts/raw/refs/heads/master/ttf/DejaVuSans-Bold.ttf",
}

for filename, url in fonts.items():
    path = os.path.join(FONTS_DIR, filename)
    if os.path.exists(path):
        print(f"✓ {filename} already exists")
        continue
    print(f"Downloading {filename}...")
    urllib.request.urlretrieve(url, path)
    print(f"✓ Saved to {path}")

print("Done!")

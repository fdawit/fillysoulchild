from pathlib import Path
import json

IMAGE_FOLDER = Path("images/film")
OUTPUT_FILE = Path("photos.json")

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def title_from_filename(filename: str) -> str:
    stem = Path(filename).stem
    cleaned = stem.replace("-", " ").replace("_", " ").strip()
    return cleaned.title()


def main() -> None:
    photos = []

    for file_path in sorted(IMAGE_FOLDER.iterdir()):
        if file_path.suffix.lower() in VALID_EXTENSIONS:
            title = title_from_filename(file_path.name)
            photos.append({
                "src": str(file_path).replace("\\", "/"),
                "title": title,
                "alt": title,
                "meta": ""
            })

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        json.dump(photos, file, indent=2)

    print(f"Wrote {len(photos)} photos to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()

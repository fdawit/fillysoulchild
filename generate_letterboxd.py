from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from html import unescape
from pathlib import Path
from urllib.request import Request, urlopen

USERNAME = "fillyvanilli"
RSS_URL = f"https://letterboxd.com/{USERNAME}/rss/"
OUTPUT_FILE = Path("letterboxd.json")
LIMIT = 6

IMG_RE = re.compile(r'<img[^>]+src="([^"]+)"', re.IGNORECASE)
P_RE = re.compile(r"<p>(.*?)</p>", re.IGNORECASE | re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")
SPACE_RE = re.compile(r"\s+")


def local_name(tag: str) -> str:
    return tag.split("}", 1)[-1]


def clean_text(text: str) -> str:
    text = TAG_RE.sub("", text)
    text = unescape(text)
    return SPACE_RE.sub(" ", text).strip()


def parse_description(description_html: str) -> tuple[str, str]:
    poster = ""
    poster_match = IMG_RE.search(description_html)
    if poster_match:
        poster = unescape(poster_match.group(1))

    paragraphs = [clean_text(p) for p in P_RE.findall(description_html)]
    note_parts = [
        p for p in paragraphs
        if p and not p.lower().startswith("watched on ")
    ]
    note = " ".join(note_parts).strip()

    return poster, note


def parse_item(item: ET.Element) -> dict:
    fields: dict[str, str] = {}

    for child in item:
        fields[local_name(child.tag)] = (child.text or "").strip()

    description_html = fields.get("description", "")
    poster, note = parse_description(description_html)

    rating_raw = fields.get("memberRating", "")
    year_raw = fields.get("filmYear", "")

    rating = float(rating_raw) if rating_raw else None
    year = int(year_raw) if year_raw.isdigit() else None

    return {
        "title": fields.get("filmTitle") or fields.get("title", "Untitled"),
        "year": year,
        "rating": rating,
        "watched_date": fields.get("watchedDate", ""),
        "rewatch": fields.get("rewatch", "") == "Yes",
        "link": fields.get("link", ""),
        "poster": poster,
        "note": note,
    }


def main() -> None:
    request = Request(
        RSS_URL,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    with urlopen(request, timeout=20) as response:
        xml_text = response.read().decode("utf-8", errors="replace")

    root = ET.fromstring(xml_text.lstrip())
    channel = root.find("channel")

    if channel is None:
        raise RuntimeError("Could not find RSS channel.")

    items = channel.findall("item")
    entries = [parse_item(item) for item in items]

    diary_entries = [
        entry for entry in entries
        if entry["title"] and entry["watched_date"]
    ][:LIMIT]

    OUTPUT_FILE.write_text(
        json.dumps(diary_entries, indent=2),
        encoding="utf-8"
    )

    print(f"Wrote {len(diary_entries)} diary entries to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
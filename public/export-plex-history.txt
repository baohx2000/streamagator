#!/usr/bin/env python3
"""
Export Plex watch history to CSV for use with Streamagator.

Usage:
    python export-plex-history.py --url YOUR_SERVER_URL --token YOUR_TOKEN
    python export-plex-history.py --url YOUR_SERVER_URL --token YOUR_TOKEN --output my-plex-history.csv

Finding your server URL and token:
    1. Open Plex Web and press F12 to open browser DevTools
    2. Go to the Network tab
    3. Click anything in Plex to trigger a request
    4. Find any request to your Plex server — copy the base URL (e.g. https://…plex.direct:32400)
       and the X-Plex-Token value from that request's URL or headers
    Note: if running Plex locally, the URL is typically http://localhost:32400

Output CSV columns:
    Date        - ISO 8601 date (YYYY-MM-DD)
    Title       - Movie title, or TV show name
    Type        - "movie" or "episode"
    Season      - Season number (episodes only)
    Episode     - Episode number (episodes only)
    EpisodeTitle - Episode title (episodes only)
"""

import argparse
import csv
import sys
from datetime import datetime, timezone

try:
    import requests
except ImportError:
    print("Error: 'requests' is required. Install it with: pip install requests")
    sys.exit(1)


PAGE_SIZE = 300


def fetch_history(base_url: str, token: str) -> list[dict]:
    """Fetch all watch history from Plex, handling pagination."""
    base_url = base_url.rstrip("/")
    headers = {
        "X-Plex-Token": token,
        "Accept": "application/json",
    }
    url = f"{base_url}/status/sessions/history/all"

    all_items = []
    start = 0

    while True:
        params = {
            "sort": "viewedAt:desc",
            "X-Plex-Container-Start": start,
            "X-Plex-Container-Size": PAGE_SIZE,
        }
        try:
            resp = requests.get(url, headers=headers, params=params, timeout=30)
        except requests.exceptions.ConnectionError:
            print(f"Error: Could not connect to Plex at {base_url}")
            print("Make sure your Plex server is running and the URL is correct.")
            sys.exit(1)

        if resp.status_code == 401:
            print("Error: Invalid Plex token. Check your X-Plex-Token value.")
            sys.exit(1)
        if not resp.ok:
            print(f"Error: Plex returned HTTP {resp.status_code}: {resp.text[:200]}")
            sys.exit(1)

        data = resp.json()
        container = data.get("MediaContainer", {})
        items = container.get("Metadata", [])

        if not items:
            break

        all_items.extend(items)
        total = container.get("totalSize", container.get("size", 0))
        start += len(items)

        print(f"  Fetched {len(all_items)} / {total} entries...", end="\r")

        if start >= total:
            break

    print(f"  Fetched {len(all_items)} total entries.        ")
    return all_items


def normalize(item: dict) -> dict | None:
    """Convert a Plex history item to a flat CSV row."""
    viewed_at = item.get("viewedAt")
    if not viewed_at:
        return None

    # viewedAt is a Unix timestamp
    dt = datetime.fromtimestamp(int(viewed_at), tz=timezone.utc)
    date_str = dt.strftime("%Y-%m-%d")

    media_type = item.get("type", "")

    if media_type == "movie":
        return {
            "Date": date_str,
            "Title": item.get("title", "").strip(),
            "Type": "movie",
            "Season": "",
            "Episode": "",
            "EpisodeTitle": "",
        }
    elif media_type == "episode":
        show_title = item.get("grandparentTitle", "").strip()
        episode_title = item.get("title", "").strip()
        season = item.get("parentIndex", "")
        episode = item.get("index", "")
        return {
            "Date": date_str,
            "Title": show_title,
            "Type": "episode",
            "Season": str(season) if season != "" else "",
            "Episode": str(episode) if episode != "" else "",
            "EpisodeTitle": episode_title,
        }
    else:
        # Skip music, clips, etc.
        return None


def main():
    parser = argparse.ArgumentParser(
        description="Export Plex watch history to CSV for Streamagator"
    )
    parser.add_argument(
        "--url",
        required=True,
        help="Plex server URL (e.g. http://localhost:32400 or http://192.168.1.x:32400)",
    )
    parser.add_argument(
        "--token",
        required=True,
        help="Plex authentication token (X-Plex-Token)",
    )
    parser.add_argument(
        "--output",
        default="plex-history.csv",
        help="Output CSV filename (default: plex-history.csv)",
    )
    args = parser.parse_args()

    print(f"Connecting to Plex at {args.url} ...")
    items = fetch_history(args.url, args.token)

    rows = [r for item in items if (r := normalize(item)) is not None]
    skipped = len(items) - len(rows)

    if not rows:
        print("No watch history found. Make sure your Plex server has history recorded.")
        sys.exit(0)

    fieldnames = ["Date", "Title", "Type", "Season", "Episode", "EpisodeTitle"]
    with open(args.output, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} entries to {args.output}")
    if skipped:
        print(f"  (Skipped {skipped} non-video items: music, clips, etc.)")


if __name__ == "__main__":
    main()

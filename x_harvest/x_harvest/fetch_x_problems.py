import os
import requests
import csv
import time

BEARER_TOKEN = os.environ.get("BEARER_TOKEN")
if not BEARER_TOKEN:
    raise SystemExit("Set BEARER_TOKEN env var first.")

QUERIES = [
    'anyone else app lang:en -is:retweet',
    'why does my app keep crashing lang:en -is:retweet',
    'tired of subscriptions lang:en -is:retweet'
]

MAX_RESULTS = 50
PAGES_PER_QUERY = 3

BASE_URL = "https://api.x.com/2/tweets/search/recent"
headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}

def fetch_for_query(query):
    params = {
        "query": query,
        "max_results": MAX_RESULTS,
        "tweet.fields": "created_at,public_metrics"
    }
    all_rows = []
    next_token = None

    for _ in range(PAGES_PER_QUERY):
        if next_token:
            params["next_token"] = next_token

        resp = requests.get(BASE_URL, headers=headers, params=params)
        resp.raise_for_status()
        js = resp.json()

        for t in js.get("data", []):
            m = t.get("public_metrics", {})
            all_rows.append([
                query,
                t["id"],
                t.get("created_at", ""),
                t["text"],
                m.get("like_count", 0),
                m.get("retweet_count", 0),
            ])

        meta = js.get("meta", {})
        next_token = meta.get("next_token")
        if not next_token:
            break

        time.sleep(1)

    return all_rows

def main():
    with open("x_posts_raw.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["query", "tweet_id", "created_at", "text", "like_count", "retweet_count"])

        for q in QUERIES:
            print(f"Fetching for query: {q}")
            rows = fetch_for_query(q)
            for r in rows:
                w.writerow(r)

    print("Done. Saved to x_posts_raw.csv")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Add a content-hash version (?v=xxxxxxxx) to every /assets/*.css and /assets/*.js
reference in the site's HTML, so browsers fetch a new file as soon as it changes.

Run from the repository root after editing any CSS/JS (build_pages.py runs it too):
    python3 scripts/stamp_assets.py
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REF = re.compile(r'((?:href|src)=")(/assets/[^"?]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')


def stamp(html_path):
    text = html_path.read_text(encoding="utf-8")

    def repl(m):
        asset = ROOT / m.group(2).lstrip("/")
        if not asset.exists():
            return m.group(0)
        digest = hashlib.sha1(asset.read_bytes()).hexdigest()[:8]
        return f"{m.group(1)}{m.group(2)}?v={digest}{m.group(3)}"

    new = REF.sub(repl, text)
    if new != text:
        html_path.write_text(new, encoding="utf-8")
        return True
    return False


def main():
    pages = [p for p in ROOT.rglob("*.html") if ".git" not in p.parts and "node_modules" not in p.parts]
    changed = [p.relative_to(ROOT) for p in pages if stamp(p)]
    print(f"stamped {len(changed)} of {len(pages)} pages")


if __name__ == "__main__":
    main()

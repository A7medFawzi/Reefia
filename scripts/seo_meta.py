#!/usr/bin/env python3
"""Sets titles, descriptions and social share tags on the hand-written pages
(home and RFQ, EN + AR). Product, privacy and 404 pages get theirs from build_pages.py."""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://reefiya.com"

PAGES = {
    "index.html": dict(lang="en", og="en-home",
        title="Reefiya (ريفيا) | Egyptian Sweet Potato Exporter",
        desc="Reefiya (ريفيا) exports Egyptian sweet potatoes from Alexandria: Beauregard, Bellevue and Egyptian varieties, graded S to XL. Fresh, industrial and frozen. Request a quote.",
        alt="Reefiya: Egyptian sweet potatoes packed in export cartons"),
    "ar/index.html": dict(lang="ar", og="ar-home",
        title="ريفيا Reefiya | شركة تصدير البطاطا الحلوة المصرية",
        desc="شركة ريفيا (Reefiya) لتصدير البطاطا الحلوة المصرية من الإسكندرية: بوريجارد وبيلفيو والأصناف المصرية، مفروزة من S إلى XL. طازجة وصناعية ومجمدة. اطلب عرض سعر.",
        alt="ريفيا: بطاطا حلوة مصرية معبأة في كراتين تصدير"),
    "rfq.html": dict(lang="en", og="en-rfq",
        title="Request a Quote | Reefiya Egyptian Sweet Potato Export",
        desc="Request an export quotation from Reefiya (ريفيا): fresh, industrial or frozen Egyptian sweet potatoes, FOB, CFR or CIF. Our export team replies within 1–2 business days.",
        alt="Reefiya cartons of sweet potatoes on an export pallet"),
    "ar/rfq.html": dict(lang="ar", og="ar-rfq",
        title="اطلب عرض سعر | ريفيا Reefiya لتصدير البطاطا الحلوة المصرية",
        desc="اطلب عرض سعر من شركة ريفيا (Reefiya) لتصدير البطاطا الحلوة المصرية: طازجة أو صناعية أو مجمدة، بشروط FOB أو CFR أو CIF. فريق التصدير يرد خلال يوم إلى يومين عمل.",
        alt="كراتين ريفيا من البطاطا الحلوة على بالتة تصدير"),
}
LOCALE = {"en": ("en_US", "ar_EG"), "ar": ("ar_EG", "en_US")}


def set_attr(s, selector, value):
    """Replace content="…" of the first <meta {selector} …> tag."""
    pat = re.compile(r'(<meta\s+' + re.escape(selector) + r'\s+content=")[^"]*(")')
    s, n = pat.subn(lambda m: m.group(1) + html.escape(value, quote=True) + m.group(2), s, count=1)
    return s, n


def main():
    for f, d in PAGES.items():
        p = ROOT / f
        s = p.read_text(encoding="utf-8")
        s = re.sub(r"<title>[^<]*</title>", "<title>" + html.escape(d["title"]) + "</title>", s, count=1)
        img = f'{SITE}/og/{d["og"]}.jpg'
        loc, alt_loc = LOCALE[d["lang"]]
        for sel, val in [('name="description"', d["desc"]), ('property="og:title"', d["title"]),
                         ('property="og:description"', d["desc"]), ('property="og:image"', img),
                         ('property="og:image:secure_url"', img), ('property="og:locale"', loc),
                         ('name="twitter:title"', d["title"]), ('name="twitter:description"', d["desc"]),
                         ('name="twitter:image"', img)]:
            s, n = set_attr(s, sel, val)
            assert n == 1, (f, sel)
        # alternate locale + image alt text (added once)
        s = re.sub(r'\s*<meta property="og:locale:alternate"[^>]*>', "", s)
        s = re.sub(r'\s*<meta (?:property="og:image:alt"|name="twitter:image:alt")[^>]*>', "", s)
        s = s.replace(f'<meta property="og:locale" content="{loc}">',
                      f'<meta property="og:locale" content="{loc}">\n  <meta property="og:locale:alternate" content="{alt_loc}">', 1)
        a = html.escape(d["alt"], quote=True)
        s = re.sub(r'(<meta property="og:image:height" content="630">)',
                   r'\1\n  <meta property="og:image:alt" content="' + a + '">', s, count=1)
        s = re.sub(r'(<meta name="twitter:image" content="[^"]*">)',
                   r'\1\n  <meta name="twitter:image:alt" content="' + a + '">', s, count=1)
        # The HTML-file method verifies the site; this meta held the file name, not a token
        s = re.sub(r'\s*<meta name="google-site-verification"[^>]*>', "", s)
        p.write_text(s, encoding="utf-8")
        print("updated", f)


if __name__ == "__main__":
    main()

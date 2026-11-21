#!/usr/bin/env python3
"""Generate the per-variety landing pages (EN + AR).

Run from the repository root:  python3 scripts/build_varieties.py
Edit the CONTENT below, then re-run; the HTML files are overwritten.
Facts come from the company's own copy (homepage + llms.txt).
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://reefiya.com"
WA = "201290099230"
SLUGS = ["beauregard", "bellevue", "egyptian"]

SIZES = [("S", "100 – 150 g"), ("M", "150 – 300 g"), ("L1", "300 – 450 g"), ("L2", "450 – 600 g"), ("XL", "600 – 850 g+")]

T = {
    "en": {
        "dir": "ltr",
        "locale": "en_US",
        "fonts": "family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Plus+Jakarta+Sans:wght@400;600;700;800",
        "home": "/",
        "rfq": "/rfq",
        "base": "/varieties/",
        "nav_home": "Home",
        "nav_varieties": "Varieties",
        "nav_quote": "Request a quote",
        "lang_switch": "العربية",
        "crumb_varieties": "Sweet potato varieties",
        "cta_quote": "Request a quotation ↗",
        "cta_wa": "WhatsApp the export desk",
        "facts": ["Origin", "Sizes", "Packing", "Shipping"],
        "fact_origin": "Egypt · Nile Delta",
        "fact_sizes": "S · M · L1 · L2 · XL",
        "fact_packing": "Cartons · Mesh bags · Bins",
        "fact_shipping": "40ft reefer · FOB / CFR / CIF",
        "h_profile": "Product profile",
        "h_sizes": "Calibration & sizing",
        "sizes_sub": "Graded to EU-style weight bands. Mixed or single sizes per order, based on the destination market.",
        "th_grade": "Grade",
        "th_weight": "Weight per tuber",
        "th_use": "Typical use",
        "size_uses": ["Micro / snack packs", "Standard supermarket pre-pack", "Premium loose retail display", "Large catering & culinary use", "Processing, roasting & purée"],
        "h_pack": "Packing options",
        "pack_sub": "Every order is packed to the buyer's specification, including private label.",
        "pack": [
            ("Telescopic cartons", "5 kg & 6 kg net, ventilated export cardboard. About 2,000–2,400 cartons per 40ft reefer.", "/pkg-carton-boxes.webp"),
            ("Mesh bags", "10 kg & 20 kg breathable polypropylene bags for wholesale markets and distributors.", "/pkg-mesh-bags.webp"),
            ("Jumbo pallet bins", "500 kg & 1,000 kg bins for processors, food factories and repacking stations.", "/pkg-pallet-bins.webp"),
        ],
        "private_label": "Private label available: custom box printing, buyer branding, barcodes and country-specific traceability labels.",
        "h_quality": "Curing, quality & cold chain",
        "quality": [
            "Cured at 28–30 °C and 90–95 % relative humidity to heal skin, set the peel and limit shrinkage before the voyage.",
            "Shipped in 40ft high-cube reefers held at 13–15 °C and about 85 % relative humidity with active air exchange.",
            "GLOBALG.A.P. farm traceability, ISO 22000 / HACCP packhouse hygiene, and Egyptian Agricultural Quarantine phytosanitary inspection before departure.",
            "FOB Alexandria or Damietta; CFR / CIF to ports such as Rotterdam, Antwerp, Felixstowe, Hamburg, Valencia, Jeddah and Jebel Ali. Short-sea transit to Southern and Western Europe takes about 4–7 days.",
        ],
        "h_others": "Other varieties",
        "band_h": "Need a quotation for {name}?",
        "band_p": "Tell us the size, packing, volume and destination port. We reply within 1–2 business days.",
        "footer_rights": "REEFIYA Agricultural Export · Alexandria, Egypt",
        "wa_msg": "Hello REEFIYA Export Desk, I would like a quotation for {name} sweet potatoes.",
    },
    "ar": {
        "dir": "rtl",
        "locale": "ar_EG",
        "fonts": "family=Alexandria:wght@600;700;800&family=Cairo:wght@400;600;700;800",
        "home": "/ar/",
        "rfq": "/ar/rfq",
        "base": "/ar/varieties/",
        "nav_home": "الرئيسية",
        "nav_varieties": "الأصناف",
        "nav_quote": "اطلب عرض سعر",
        "lang_switch": "English",
        "crumb_varieties": "أصناف البطاطا الحلوة",
        "cta_quote": "اطلب عرض سعر ↖",
        "cta_wa": "تواصل مع مكتب التصدير واتساب",
        "facts": ["المنشأ", "الأحجام", "التعبئة", "الشحن"],
        "fact_origin": "مصر · دلتا النيل",
        "fact_sizes": "S · M · L1 · L2 · XL",
        "fact_packing": "كراتين · أجولة شبك · صناديق",
        "fact_shipping": 'حاوية مبردة 40 قدم · <bdi dir="ltr">FOB / CFR / CIF</bdi>',
        "h_profile": "مواصفات الصنف",
        "h_sizes": "الفرز والأحجام",
        "sizes_sub": "فرز حسب شرائح الوزن المعتمدة في الأسواق الأوروبية، بحجم واحد أو أحجام مختلطة حسب سوق الوجهة.",
        "th_grade": "الدرجة",
        "th_weight": "وزن الدرنة",
        "th_use": "الاستخدام المعتاد",
        "size_uses": ["عبوات صغيرة / سناك", "عبوات السوبرماركت القياسية", "العرض الفاخر بالقطعة", "المطاعم والتموين", "التصنيع والتحميص والهريس"],
        "h_pack": "خيارات التعبئة",
        "pack_sub": "كل طلب يتعبأ حسب مواصفات المشتري، مع إمكانية العلامة الخاصة.",
        "pack": [
            ("كراتين تلسكوبية", "وزن صافي 5 و 6 كجم، كرتون تصدير مهوّى. حوالي 2,000–2,400 كرتونة في الحاوية المبردة 40 قدم.", "/pkg-carton-boxes.webp"),
            ("أجولة شبك", "أجولة بولي بروبلين 10 و 20 كجم لأسواق الجملة والموزعين.", "/pkg-mesh-bags.webp"),
            ("صناديق جامبو", "صناديق 500 و 1,000 كجم لمصانع التصنيع الغذائي ومحطات إعادة التعبئة.", "/pkg-pallet-bins.webp"),
        ],
        "private_label": "العلامة الخاصة متاحة: طباعة الكرتون، وعلامة المشتري التجارية، والباركود، وملصقات التتبع حسب كل دولة.",
        "h_quality": "المعالجة والجودة وسلسلة التبريد",
        "quality": [
            "معالجة (Curing) على 28–30 درجة مئوية ورطوبة نسبية 90–95% لالتئام القشرة وتثبيتها وتقليل الفاقد قبل الرحلة البحرية.",
            'الشحن في حاويات مبردة 40 قدم <bdi dir="ltr">High-Cube</bdi> على 13–15 درجة مئوية ورطوبة حوالي 85% مع تجديد هواء مستمر.',
            'تتبع زراعي <bdi dir="ltr">GLOBALG.A.P.</bdi>، ونظافة محطة التعبئة وفق <bdi dir="ltr">ISO 22000 / HACCP</bdi>، وفحص الحجر الزراعي المصري قبل الشحن.',
            '<bdi dir="ltr">FOB</bdi> من الإسكندرية أو دمياط، و<bdi dir="ltr">CFR / CIF</bdi> لموانئ مثل روتردام وأنتويرب وفيليكستو وهامبورج وفالنسيا وجدة وجبل علي. الشحن لموانئ جنوب وغرب أوروبا حوالي 4–7 أيام.',
        ],
        "h_others": "أصناف أخرى",
        "band_h": "محتاج عرض سعر لـ{name}؟",
        "band_p": "قولنا الحجم والتعبئة والكمية وميناء الوصول، وهنرد عليك خلال 1–2 يوم عمل.",
        "footer_rights": "ريفيا للتصدير الزراعي · الإسكندرية، مصر",
        "wa_msg": "مرحباً مكتب تصدير ريفيا، أود الحصول على عرض سعر لبطاطا {name}.",
    },
}

V = {
    "beauregard": {
        "img": "/produce-beauregard-tight.webp",
        "photo": "/card_photo_beauregard.webp",
        "en": {
            "name": "Beauregard",
            "title": "Beauregard Sweet Potatoes from Egypt | Export Supplier — REEFIYA",
            "desc": "Egyptian Beauregard sweet potatoes for export: copper-red skin, deep orange flesh, graded S–XL, cured and shipped in 40ft reefers to Europe and the GCC. Available July–March.",
            "eyebrow": "Commercial variety",
            "h1": "Beauregard sweet potatoes, <em>grown and packed in Egypt.</em>",
            "lead": "The world's most widely traded sweet potato: vivid copper-red skin, deep orange flesh and high natural sweetness, graded and packed to your market's specification.",
            "profile": [
                "Vivid copper-red skin with deep orange, nutritious flesh.",
                "High natural sweetness (brix) and high commercial yield.",
                "Suited to European retail, supermarkets, processing and foodservice.",
                "High-volume export availability from July through March.",
            ],
            "season": "July – March",
            "alt": "Beauregard sweet potatoes from Egypt",
        },
        "ar": {
            "name": "بوريجارد",
            "title": "بطاطا حلوة بوريجارد مصرية للتصدير | ريفيا",
            "desc": "بطاطا حلوة مصرية صنف بوريجارد للتصدير: قشرة نحاسية حمراء ولب برتقالي، مفروزة من S إلى XL، معالجة ومشحونة في حاويات مبردة لأوروبا والخليج. متاحة من يوليو إلى مارس.",
            "eyebrow": "صنف تجاري",
            "h1": "بطاطا حلوة بوريجارد، <em>مزروعة ومعبأة في مصر.</em>",
            "lead": "أكثر أصناف البطاطا الحلوة تداولاً في العالم: قشرة نحاسية حمراء زاهية، ولب برتقالي غامق، وحلاوة طبيعية عالية، مفروزة ومعبأة حسب مواصفات سوقك.",
            "profile": [
                "قشرة نحاسية حمراء زاهية ولب برتقالي غامق غني بالقيمة الغذائية.",
                "حلاوة طبيعية عالية (brix) وإنتاجية تجارية مرتفعة.",
                "مناسب لتجزئة السوبرماركت الأوروبية والتصنيع والمطاعم.",
                "متاح للتصدير بكميات كبيرة من يوليو حتى مارس.",
            ],
            "season": "يوليو – مارس",
            "alt": "بطاطا حلوة بوريجارد مصرية",
        },
    },
    "bellevue": {
        "img": "/produce-bellevue-tight.webp",
        "photo": "/card_photo_bellevue.webp",
        "en": {
            "name": "Bellevue",
            "title": "Bellevue Sweet Potatoes from Egypt | Export Supplier — REEFIYA",
            "desc": "Egyptian Bellevue sweet potatoes for premium fresh retail: smooth light-copper skin, uniform cylindrical shape, strong shelf life. Graded S–XL and shipped in 40ft reefers.",
            "eyebrow": "Fresh market variety",
            "h1": "Bellevue sweet potatoes, <em>made for the retail shelf.</em>",
            "lead": "Smooth skin, a uniform shape and strong post-harvest resilience make Bellevue the choice for premium fresh retail programmes in Western Europe.",
            "profile": [
                "Exceptionally smooth, light-copper skin.",
                "Consistent, uniform cylindrical shape for clean retail presentation.",
                "Firm orange interior and superior post-harvest resilience.",
                "Prepared for premium fresh retail in the Netherlands, Germany, the UK and France.",
            ],
            "season": None,
            "alt": "Bellevue sweet potatoes from Egypt",
        },
        "ar": {
            "name": "بيلفيو",
            "title": "بطاطا حلوة بيلفيو مصرية للتصدير | ريفيا",
            "desc": "بطاطا حلوة مصرية صنف بيلفيو للتجزئة الطازجة: قشرة نحاسية فاتحة ناعمة، وشكل أسطواني منتظم، وصلاحية ممتازة. مفروزة من S إلى XL ومشحونة في حاويات مبردة.",
            "eyebrow": "صنف السوق الطازج",
            "h1": "بطاطا حلوة بيلفيو، <em>مصممة لرفوف التجزئة.</em>",
            "lead": "قشرة ناعمة، وشكل منتظم، وتحمّل ممتاز بعد الحصاد، وده اللي بيخلي بيلفيو الاختيار الأول لبرامج التجزئة الطازجة في غرب أوروبا.",
            "profile": [
                "قشرة نحاسية فاتحة ناعمة جداً.",
                "شكل أسطواني منتظم ومتناسق لعرض مثالي في التجزئة.",
                "لب برتقالي متماسك وتحمّل ممتاز بعد الحصاد.",
                "مُجهز للتجزئة الطازجة الفاخرة في هولندا وألمانيا والمملكة المتحدة وفرنسا.",
            ],
            "season": None,
            "alt": "بطاطا حلوة بيلفيو مصرية",
        },
    },
    "egyptian": {
        "img": "/produce-egyptian-tight.webp",
        "photo": "/card_photo_egyptian.webp",
        "en": {
            "name": "Egyptian varieties",
            "title": "Egyptian Local Sweet Potato Varieties for Export | REEFIYA",
            "desc": "Traditional Egyptian sweet potato varieties from the Nile Delta: high dry matter, rich earthy sweetness. Seasonal export supply for GCC, Arab and regional wholesale markets.",
            "eyebrow": "Seasonal selection",
            "h1": "Egyptian local varieties, <em>the taste of the Nile Delta.</em>",
            "lead": "Traditional high-sugar varieties grown in fertile Nile Delta silt, sourced according to season, availability and buyer requirements.",
            "profile": [
                "High dry-matter content with a robust, earthy sweetness.",
                "Traditional local varieties grown in fertile Nile Delta soils.",
                "Seasonal supply for Arab, GCC and regional wholesale markets.",
                "Sourced according to season, availability and buyer requirements.",
            ],
            "season": None,
            "alt": "Egyptian local sweet potato varieties",
        },
        "ar": {
            "name": "الأصناف المصرية",
            "title": "أصناف البطاطا الحلوة المصرية البلدي للتصدير | ريفيا",
            "desc": "أصناف بطاطا حلوة مصرية تقليدية من دلتا النيل: مادة جافة عالية وحلاوة طبيعية قوية. توريد موسمي لأسواق الخليج والأسواق العربية وأسواق الجملة الإقليمية.",
            "eyebrow": "اختيار موسمي",
            "h1": "الأصناف المصرية البلدي، <em>طعم دلتا النيل.</em>",
            "lead": "أصناف تقليدية عالية السكريات مزروعة في طمي دلتا النيل الخصب، ويتم توريدها حسب الموسم والمتاح ومتطلبات المشتري.",
            "profile": [
                "نسبة مادة جافة عالية وحلاوة طبيعية قوية.",
                "أصناف محلية تقليدية مزروعة في أراضي دلتا النيل الخصبة.",
                "توريد موسمي لأسواق الخليج والأسواق العربية وأسواق الجملة الإقليمية.",
                "يتم التوريد حسب الموسم والمتاح ومتطلبات المشتري.",
            ],
            "season": None,
            "alt": "أصناف بطاطا حلوة مصرية بلدي",
        },
    },
}

ASK_SEASON = {"en": "Ask the export desk", "ar": "تواصل مع مكتب التصدير"}
SEASON_LABEL = {"en": "Season", "ar": "الموسم"}


def esc(s):
    return html.escape(s, quote=True)


def url(lang, slug):
    return f"{SITE}{T[lang]['base']}{slug}"


def page(lang, slug):
    t, v, c = T[lang], V[slug], V[slug][lang]
    other = "ar" if lang == "en" else "en"
    canonical = url(lang, slug)
    plain_h1 = c["h1"].replace("<em>", "").replace("</em>", "")
    wa = f"https://wa.me/{WA}?text=" + __import__("urllib.parse").parse.quote(t["wa_msg"].format(name=c["name"]))
    season = c["season"] or ASK_SEASON[lang]

    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Product",
                "@id": canonical + "#product",
                "name": plain_h1.rstrip("."),
                "description": c["desc"],
                "image": [SITE + v["photo"], SITE + v["img"]],
                "brand": {"@type": "Brand", "name": "REEFIYA"},
                "category": "Fresh produce > Sweet potatoes",
                "countryOfOrigin": {"@type": "Country", "name": "Egypt"},
                "manufacturer": {"@id": f"{SITE}/#organization"},
                "url": canonical,
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": t["nav_home"], "item": SITE + t["home"]},
                    {"@type": "ListItem", "position": 2, "name": t["crumb_varieties"], "item": SITE + t["home"] + "#produce"},
                    {"@type": "ListItem", "position": 3, "name": c["name"], "item": canonical},
                ],
            },
        ],
    }

    sizes_rows = "\n".join(
        f"            <tr><td>{g}</td><td dir=\"ltr\">{w}</td><td>{esc(u)}</td></tr>"
        for (g, w), u in zip(SIZES, t["size_uses"])
    )
    profile = "\n".join(f"            <li><span>{esc(p)}</span></li>" for p in c["profile"])
    quality = "\n".join(f"            <li><span>{q}</span></li>" for q in t["quality"])  # trusted static copy (may contain <bdi>)
    pack = "\n".join(
        f"""          <div class="v-card">
            <img src="{img}" alt="{esc(name)}" loading="lazy" decoding="async" width="300" height="140">
            <h3>{esc(name)}</h3>
            <p>{esc(desc)}</p>
          </div>"""
        for name, desc, img in t["pack"]
    )
    others = "\n".join(
        f"""          <a class="v-card" href="{t['base']}{s}">
            <img src="{V[s]['img']}" alt="{esc(V[s][lang]['alt'])}" loading="lazy" decoding="async" width="110" height="80">
            <div><h3>{esc(V[s][lang]['name'])}</h3><p>{esc(V[s][lang]['eyebrow'])}</p></div>
          </a>"""
        for s in SLUGS if s != slug
    )
    fact_vals = [t["fact_origin"], t["fact_sizes"], t["fact_packing"], t["fact_shipping"]]
    facts = "\n".join(f"          <li><b>{esc(k)}</b><span>{val}</span></li>" for k, val in zip(t["facts"], fact_vals))

    return f"""<!DOCTYPE html>
<html lang="{lang}" dir="{t['dir']}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(c['title'])}</title>
  <meta name="description" content="{esc(c['desc'])}">
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="en" href="{url('en', slug)}">
  <link rel="alternate" hreflang="ar" href="{url('ar', slug)}">
  <link rel="alternate" hreflang="x-default" href="{url('en', slug)}">
  <meta property="og:type" content="product">
  <meta property="og:url" content="{canonical}">
  <meta property="og:title" content="{esc(c['title'])}">
  <meta property="og:description" content="{esc(c['desc'])}">
  <meta property="og:image" content="{SITE}{v['photo']}">
  <meta property="og:locale" content="{t['locale']}">
  <meta property="og:site_name" content="Reefiya">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#1e481c">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?{t['fonts']}&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/variety.css">
  <link rel="preload" as="image" href="{v['img']}">
  <script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=2)}
  </script>
  <script>try {{ localStorage.setItem('reefiya_lang', '{lang}'); }} catch (e) {{}}</script>
  <script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
  <header class="v-header">
    <div class="wrap">
      <a class="v-logo" href="{t['home']}" aria-label="REEFIYA"><img src="/reefiya-logo-clean.webp" alt="Reefiya" width="124" height="30"></a>
      <nav class="v-nav" aria-label="{esc(t['nav_varieties'])}">
        <a href="{t['home']}">{esc(t['nav_home'])}</a>
        <a href="{t['home']}#produce">{esc(t['nav_varieties'])}</a>
        <a class="v-lang" href="{T[other]['base']}{slug}" hreflang="{other}" lang="{other}">{esc(t['lang_switch'])}</a>
        <a class="v-cta" href="{t['rfq']}">{esc(t['nav_quote'])}</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="v-hero">
      <div class="wrap">
        <div>
          <nav class="v-crumbs" aria-label="Breadcrumb">
            <a href="{t['home']}">{esc(t['nav_home'])}</a> / <a href="{t['home']}#produce">{esc(t['crumb_varieties'])}</a> / <span aria-current="page">{esc(c['name'])}</span>
          </nav>
          <p class="v-eyebrow">{esc(c['eyebrow'])}</p>
          <h1>{c['h1']}</h1>
          <p class="v-lead">{esc(c['lead'])}</p>
          <div class="v-actions">
            <a class="btn btn-primary" href="{t['rfq']}">{esc(t['cta_quote'])}</a>
            <a class="btn btn-whatsapp" href="{wa}" target="_blank" rel="noopener">{esc(t['cta_wa'])}</a>
          </div>
        </div>
        <div class="v-hero-img">
          <img src="{v['img']}" alt="{esc(c['alt'])}" width="1000" height="720" fetchpriority="high">
        </div>
      </div>
    </section>

    <div class="v-facts">
      <div class="wrap">
        <ul>
{facts}
        </ul>
      </div>
    </div>

    <section class="v-section" aria-labelledby="h-profile">
      <div class="wrap v-split">
        <div>
          <h2 id="h-profile">{esc(t['h_profile'])}</h2>
          <ul class="v-list">
{profile}
            <li><span><strong>{esc(SEASON_LABEL[lang])}:</strong> {esc(season)}</span></li>
          </ul>
        </div>
        <div class="v-photo">
          <img src="{v['photo']}" alt="{esc(c['alt'])}" loading="lazy" decoding="async" width="1200" height="800">
        </div>
      </div>
    </section>

    <section class="v-section" aria-labelledby="h-sizes">
      <div class="wrap">
        <h2 id="h-sizes">{esc(t['h_sizes'])}</h2>
        <p class="v-sub">{esc(t['sizes_sub'])}</p>
        <div class="v-table-wrap">
          <table class="v-table">
            <thead><tr><th>{esc(t['th_grade'])}</th><th>{esc(t['th_weight'])}</th><th>{esc(t['th_use'])}</th></tr></thead>
            <tbody>
{sizes_rows}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="v-section" aria-labelledby="h-pack">
      <div class="wrap">
        <h2 id="h-pack">{esc(t['h_pack'])}</h2>
        <p class="v-sub">{esc(t['pack_sub'])}</p>
        <div class="v-grid">
{pack}
        </div>
        <p class="v-note">{esc(t['private_label'])}</p>
      </div>
    </section>

    <section class="v-section" aria-labelledby="h-quality">
      <div class="wrap">
        <h2 id="h-quality">{esc(t['h_quality'])}</h2>
        <ul class="v-list">
{quality}
        </ul>
      </div>
    </section>

    <section class="v-section v-others" aria-labelledby="h-others">
      <div class="wrap">
        <h2 id="h-others">{esc(t['h_others'])}</h2>
        <div class="v-grid">
{others}
        </div>
      </div>
    </section>

    <section class="v-cta-band" aria-labelledby="h-band">
      <div class="wrap">
        <div>
          <h2 id="h-band">{esc(t['band_h'].format(name=c['name']))}</h2>
          <p>{esc(t['band_p'])}</p>
        </div>
        <div class="v-actions">
          <a class="btn btn-primary" href="{t['rfq']}">{esc(t['cta_quote'])}</a>
          <a class="btn btn-ghost" href="mailto:exports@reefiya.com">exports@reefiya.com</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="v-footer">
    <div class="wrap">
      <div>© <span id="y">2026</span> {esc(t['footer_rights'])} · <a href="{t['home']}">reefiya.com</a></div>
      <div class="v-certs">
        <img src="/cert_globalgap_official.webp" alt="GLOBALG.A.P." loading="lazy" width="130" height="34">
        <img src="/cert_iso_official.webp" alt="ISO 22000" loading="lazy" width="100" height="30">
        <img src="/cert_quarantine_official.webp" alt="Egyptian Plant Quarantine" loading="lazy" width="135" height="30">
      </div>
    </div>
  </footer>
  <script>document.getElementById('y').textContent = new Date().getFullYear();</script>
</body>
</html>
"""


def main():
    for lang in ("en", "ar"):
        out_dir = ROOT / T[lang]["base"].strip("/")
        out_dir.mkdir(parents=True, exist_ok=True)
        for slug in SLUGS:
            (out_dir / f"{slug}.html").write_text(page(lang, slug), encoding="utf-8")
            print("wrote", out_dir.relative_to(ROOT) / f"{slug}.html")


if __name__ == "__main__":
    main()

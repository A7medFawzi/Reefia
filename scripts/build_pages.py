#!/usr/bin/env python3
"""Generate the product landing pages (EN + AR) from the Export Catalogue 2026.

Run from the repository root:  python3 scripts/build_pages.py
Edit the content below, then re-run; the HTML files are overwritten.

Source of truth: "Reefiya Export Catalogue 2026" (downloads/reefiya-export-catalogue-2026.pdf).
Only facts stated in the catalogue are used. The one addition is the usual reefer
set point for fresh sweet potatoes, worded as an industry norm, not a company claim.
"""
import html
import json
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://reefiya.com"
WA = "201290099230"
CATALOGUE = "/downloads/reefiya-export-catalogue-2026.pdf"

# ----------------------------------------------------------------------------
# Shared copy
# ----------------------------------------------------------------------------
T = {
    "en": {
        "dir": "ltr", "locale": "en_US",
        "fonts": "family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Plus+Jakarta+Sans:wght@400;600;700;800",
        "home": "/", "rfq": "/rfq", "prefix": "",
        "nav_home": "Home", "nav_products": "Products", "nav_catalogue": "Catalogue (PDF)", "nav_quote": "Request a quote",
        "lang_switch": "العربية", "crumb_products": "Products",
        "cta_quote": "Request a quotation ↗", "cta_wa": "WhatsApp the export desk", "cta_catalogue": "Download the catalogue (PDF)",
        "cta_email": "Email the export desk",
        "h_sizes": "Grading & calibration", "sizes_sub": "Rigorous sorting and uniform sizing to meet buyer specifications. Choose one size or several.",
        "th_grade": "Grade", "th_weight": "Weight per root", "th_use": "Typical channel",
        "sizes": [("S", "100 – 150 g", "Small · retail packs, mixed programmes"),
                  ("M", "150 – 300 g", "Medium · most common retail size"),
                  ("L1", "300 – 450 g", "Large"),
                  ("L2", "450 – 600 g", "Large"),
                  ("XL / Jumbo", "600 g +", "Extra-large · foodservice trade")],
        "sizes_note": "Custom grading, calibrated sizing and buyer-specific specifications are available as part of custom programmes.",
        "calib_alt": "Sweet potatoes calibrated into M, L1, L2 and XL crates",
        "h_pack": "Packaging solutions", "pack_sub": "Corrugated export cartons with ventilation help preserve freshness, product integrity and skin condition in transit.",
        "pack": [("Carton", "Ventilated corrugated export carton", "/pkg-carton-boxes.webp"),
                 ("Wooden crate", "Heavy-duty export crate", "/pkg-wooden-crates.webp"),
                 ("Mesh bag", "Retail packs", "/pkg-mesh-bags.webp"),
                 ("Plastic crate", "Reusable, ventilated", "/pkg-plastic-crates.webp"),
                 ("Bulk pallet bin", "Industrial volumes", "/pkg-pallet-bins.webp")],
        "pack_note": "Not sure what suits your market? We recommend a packing solution and set net weights to your requirement. Private label available: cartons, bags and labels printed to your design.",
        "h_packhouse": "Washed, brushed, sorted, checked.",
        "packhouse_sub": "Every root passes through brush washing, rinsing and mechanical sorting before it is graded to size and packed to the buyer's specification.",
        "packhouse_alts": ["Brush washing line", "Washing rollers", "Sorting conveyor", "Inspection on the sorting belt"],
        "h_ship": "Reefer-ready from dock to destination.",
        "ship": [("Container", "40 ft reefer · ≈ 21,600 kg reference load"),
                 ("Terms", "FOB · CFR · CIF, subject to quotation"),
                 ("Documents", "Prepared per destination market"),
                 ("Temperature", "Controlled temperature and airflow throughout transit; set point agreed per shipment (typically 13–15 °C for fresh sweet potatoes)"),
                 ("Compliance", "GLOBALG.A.P. · ISO 22000 · Egyptian Plant Quarantine")],
        "ship_alts": ["Palletised Reefiya cartons", "Loading a reefer container"],
        "h_others": "More from Reefiya",
        "band_p": "Tell us your variety, size, packing, volume, destination port and preferred Incoterm. We reply within 1–2 business days.",
        "footer": "REEFIYA · Egyptian sweet potatoes · Alexandria, Egypt",
        "facts_fresh": [("Origin", "Egypt · Alexandria hub"), ("Sizes", "S · M · L1 · L2 · XL / Jumbo"),
                        ("Packing", "Cartons · crates · mesh bags · bulk bins"), ("Shipping", "40 ft reefer · FOB / CFR / CIF")],
        "label_profile": "Profile", "label_use": "Use", "label_sizes": "Sizes", "label_packing": "Packing",
        "label_private": "Private label", "label_availability": "Availability",
        "sizes_short": "S · M · L1 · L2 · XL / Jumbo", "packing_short": "Cartons · crates · mesh bags · bulk bins",
        "available": "Available", "confirm": "Confirm at enquiry",
    },
    "ar": {
        "dir": "rtl", "locale": "ar_EG",
        "fonts": "family=Alexandria:wght@600;700;800&family=Cairo:wght@400;600;700;800",
        "home": "/ar/", "rfq": "/ar/rfq", "prefix": "/ar",
        "nav_home": "الرئيسية", "nav_products": "المنتجات", "nav_catalogue": "الكتالوج (PDF)", "nav_quote": "اطلب عرض سعر",
        "lang_switch": "English", "crumb_products": "المنتجات",
        "cta_quote": "اطلب عرض سعر ↖", "cta_wa": "تواصل مع مكتب التصدير واتساب", "cta_catalogue": "حمّل الكتالوج (PDF)",
        "cta_email": "راسل مكتب التصدير",
        "h_sizes": "الفرز والمعايرة", "sizes_sub": "فرز دقيق وأحجام منتظمة حسب مواصفات المشتري. اختار حجم واحد أو أكثر.",
        "th_grade": "الدرجة", "th_weight": "وزن الدرنة", "th_use": "القناة المعتادة",
        "sizes": [("S", "100 – 150 g", "صغير · عبوات التجزئة والبرامج المختلطة"),
                  ("M", "150 – 300 g", "متوسط · الحجم الأكثر طلباً في التجزئة"),
                  ("L1", "300 – 450 g", "كبير"),
                  ("L2", "450 – 600 g", "كبير"),
                  ("XL / Jumbo", "600 g +", "كبير جداً · المطاعم والتموين")],
        "sizes_note": "الفرز حسب الطلب، والمعايرة الدقيقة، والمواصفات الخاصة بكل مشتري متاحة ضمن البرامج المخصصة.",
        "calib_alt": "بطاطا حلوة مفروزة في صناديق M وL1 وL2 وXL",
        "h_pack": "حلول التعبئة", "pack_sub": "كراتين تصدير مموجة ومهوّاة للحفاظ على الطزاجة وسلامة المنتج وحالة القشرة أثناء الشحن.",
        "pack": [("كرتونة", "كرتونة تصدير مموجة مهوّاة", "/pkg-carton-boxes.webp"),
                 ("صندوق خشب", "صندوق تصدير متين", "/pkg-wooden-crates.webp"),
                 ("جوال شبك", "عبوات التجزئة", "/pkg-mesh-bags.webp"),
                 ("صندوق بلاستيك", "قابل لإعادة الاستخدام ومهوّى", "/pkg-plastic-crates.webp"),
                 ("صندوق بالتة جامبو", "للكميات الصناعية", "/pkg-pallet-bins.webp")],
        "pack_note": "مش متأكد إيه المناسب لسوقك؟ بنرشّح لك حل التعبئة ونضبط الوزن الصافي حسب طلبك. العلامة الخاصة متاحة: كراتين وأجولة وملصقات مطبوعة بتصميمك.",
        "h_packhouse": "غسيل وتفريش وفرز وفحص.",
        "packhouse_sub": "كل درنة بتعدّي على الغسيل بالفرش والشطف والفرز الميكانيكي، قبل ما تتدرّج حسب الحجم وتتعبأ حسب مواصفات المشتري.",
        "packhouse_alts": ["خط الغسيل بالفرش", "بكرات الغسيل", "سير الفرز", "الفحص على سير الفرز"],
        "h_ship": "جاهزة للحاوية المبردة من الرصيف للوجهة.",
        "ship": [("الحاوية", 'حاوية مبردة 40 قدم · حمولة مرجعية حوالي 21,600 كجم'),
                 ("شروط الشحن", '<bdi dir="ltr">FOB · CFR · CIF</bdi> حسب عرض السعر'),
                 ("المستندات", "تُجهّز حسب سوق الوجهة"),
                 ("الحرارة", "تحكم في الحرارة وتدفق الهواء طوال الرحلة، ودرجة الضبط تُتفق لكل شحنة (عادةً 13–15 درجة مئوية للبطاطا الحلوة الطازجة)"),
                 ("الاعتمادات", '<bdi dir="ltr">GLOBALG.A.P. · ISO 22000</bdi> · الحجر الزراعي المصري')],
        "ship_alts": ["كراتين ريفيا على البالتات", "تحميل حاوية مبردة"],
        "h_others": "منتجات أخرى من ريفيا",
        "band_p": "قولنا الصنف والحجم والتعبئة والكمية وميناء الوصول وشرط الشحن المفضل، وهنرد عليك خلال 1–2 يوم عمل.",
        "footer": "ريفيا · بطاطا حلوة مصرية · الإسكندرية، مصر",
        "facts_fresh": [("المنشأ", "مصر · مركز الإسكندرية"), ("الأحجام", "S · M · L1 · L2 · XL / Jumbo"),
                        ("التعبئة", "كراتين · صناديق · أجولة شبك · بالتات"), ("الشحن", 'حاوية مبردة 40 قدم · <bdi dir="ltr">FOB / CFR / CIF</bdi>')],
        "label_profile": "المواصفات", "label_use": "الاستخدام", "label_sizes": "الأحجام", "label_packing": "التعبئة",
        "label_private": "العلامة الخاصة", "label_availability": "التوفر",
        "sizes_short": "S · M · L1 · L2 · XL / Jumbo", "packing_short": "كراتين · صناديق · أجولة شبك · بالتات",
        "available": "متاحة", "confirm": "يتم التأكيد عند الاستفسار",
    },
}

# ----------------------------------------------------------------------------
# Pages
# ----------------------------------------------------------------------------
PAGES = {
    "beauregard": {
        "path": "/varieties/beauregard", "kind": "fresh", "card": "/produce-beauregard-tight.webp",
        "hero": "/photos/beauregard-field.webp", "photo": "/photos/beauregard-carton.webp",
        "gallery": ["/photos/beauregard-tray-pack.webp", "/photos/beauregard-overview.webp", "/photos/harvest-field.webp"],
        "en": {
            "name": "Beauregard", "eyebrow": "Export variety",
            "title": "Beauregard Sweet Potatoes from Egypt | Export Supplier — REEFIYA",
            "desc": "Egyptian Beauregard sweet potatoes for export: rich orange flesh, high yield, graded S to XL / Jumbo, packed in cartons, crates, mesh bags or bulk bins and shipped in 40 ft reefers.",
            "h1": "Beauregard sweet potatoes, <em>graded and packed in Egypt.</em>",
            "lead": "A widely traded commercial variety, available in multiple grades, sizes and packing specifications.",
            "profile": "Rich orange flesh · high yield", "use": "Export · retail · wholesale · processing",
            "availability": None, "alt": "Beauregard sweet potatoes in the field",
            "gallery_alts": ["Beauregard packed in a tray carton", "Beauregard in an export carton", "Harvested sweet potatoes in the field"],
        },
        "ar": {
            "name": "بوريجارد", "eyebrow": "صنف تصديري",
            "title": "بطاطا حلوة بوريجارد مصرية للتصدير | ريفيا",
            "desc": "بطاطا حلوة مصرية صنف بوريجارد للتصدير: لب برتقالي غني وإنتاجية عالية، مفروزة من S إلى XL / Jumbo، ومعبأة في كراتين أو صناديق أو أجولة شبك أو بالتات، وتُشحن في حاويات مبردة 40 قدم.",
            "h1": "بطاطا حلوة بوريجارد، <em>مفروزة ومعبأة في مصر.</em>",
            "lead": "صنف تجاري واسع التداول، متاح بدرجات وأحجام ومواصفات تعبئة متعددة.",
            "profile": "لب برتقالي غني · إنتاجية عالية", "use": "تصدير · تجزئة · جملة · تصنيع",
            "availability": None, "alt": "بطاطا حلوة بوريجارد في الأرض",
            "gallery_alts": ["بوريجارد معبأة في كرتونة صواني", "بوريجارد في كرتونة تصدير", "بطاطا حلوة بعد الحصاد في الأرض"],
        },
    },
    "bellevue": {
        "path": "/varieties/bellevue", "kind": "fresh", "card": "/produce-bellevue-tight.webp",
        "hero": "/photos/bellevue-field.webp", "photo": "/photos/bellevue-carton.webp",
        "gallery": ["/photos/bellevue-cartons-pair.webp", "/photos/bellevue-crate.webp", "/photos/harvest-field.webp"],
        "en": {
            "name": "Bellevue", "eyebrow": "Fresh market",
            "title": "Bellevue Sweet Potatoes from Egypt | Export Supplier — REEFIYA",
            "desc": "Egyptian Bellevue sweet potatoes for retail chains, wholesale terminals and foodservice: smooth, uniform skin and a sweet taste. Graded S to XL / Jumbo, private label available.",
            "h1": "Bellevue sweet potatoes, <em>made for the fresh market.</em>",
            "lead": "Selected Egyptian sweet potatoes for retail chains, wholesale terminals and foodservice.",
            "profile": "Smooth, uniform skin · sweet taste", "use": "Fresh market · retail · wholesale",
            "availability": None, "alt": "Bellevue sweet potatoes in the field",
            "gallery_alts": ["Bellevue in export cartons", "Bellevue in a ventilated crate", "Harvested sweet potatoes in the field"],
        },
        "ar": {
            "name": "بيلفيو", "eyebrow": "السوق الطازج",
            "title": "بطاطا حلوة بيلفيو مصرية للتصدير | ريفيا",
            "desc": "بطاطا حلوة مصرية صنف بيلفيو لسلاسل التجزئة وأسواق الجملة والمطاعم: قشرة ناعمة منتظمة وطعم حلو. مفروزة من S إلى XL / Jumbo، والعلامة الخاصة متاحة.",
            "h1": "بطاطا حلوة بيلفيو، <em>مختارة للسوق الطازج.</em>",
            "lead": "بطاطا حلوة مصرية مختارة لسلاسل التجزئة وأسواق الجملة والمطاعم.",
            "profile": "قشرة ناعمة منتظمة · طعم حلو", "use": "السوق الطازج · تجزئة · جملة",
            "availability": None, "alt": "بطاطا حلوة بيلفيو في الأرض",
            "gallery_alts": ["بيلفيو في كراتين تصدير", "بيلفيو في صندوق مهوّى", "بطاطا حلوة بعد الحصاد في الأرض"],
        },
    },
    "egyptian": {
        "path": "/varieties/egyptian", "kind": "fresh", "card": "/produce-egyptian-tight.webp",
        "hero": "/photos/egyptian-field.webp", "photo": "/photos/egyptian-carton.webp",
        "gallery": ["/photos/egyptian-carton-2.webp", "/photos/egyptian-overview.webp", "/photos/harvest-field.webp"],
        "en": {
            "name": "Egyptian varieties", "eyebrow": "Seasonal selection",
            "title": "Egyptian Local Sweet Potato Varieties for Export | REEFIYA",
            "desc": "Traditional Egyptian sweet potato varieties with a robust local character and high sugar, sourced by season and availability for fresh-market and seasonal programmes.",
            "h1": "Egyptian local varieties, <em>sourced by season.</em>",
            "lead": "Traditional local varieties, sourced according to season, availability and buyer requirements.",
            "profile": "Robust local character · high sugar", "use": "Fresh market · seasonal programmes",
            "availability": "Seasonal · confirm at enquiry", "alt": "Egyptian local sweet potatoes in the field",
            "gallery_alts": ["Egyptian variety in an export carton", "Egyptian variety packed for export", "Harvested sweet potatoes in the field"],
        },
        "ar": {
            "name": "الأصناف المصرية", "eyebrow": "اختيار موسمي",
            "title": "أصناف البطاطا الحلوة المصرية البلدي للتصدير | ريفيا",
            "desc": "أصناف بطاطا حلوة مصرية تقليدية بطابع محلي قوي وسكريات عالية، يتم توريدها حسب الموسم والمتاح للسوق الطازج والبرامج الموسمية.",
            "h1": "الأصناف المصرية البلدي، <em>حسب الموسم.</em>",
            "lead": "أصناف محلية تقليدية يتم توريدها حسب الموسم والمتاح ومتطلبات المشتري.",
            "profile": "طابع محلي قوي · سكريات عالية", "use": "السوق الطازج · البرامج الموسمية",
            "availability": "موسمي · يتم التأكيد عند الاستفسار", "alt": "بطاطا حلوة مصرية بلدي في الأرض",
            "gallery_alts": ["صنف مصري في كرتونة تصدير", "صنف مصري معبأ للتصدير", "بطاطا حلوة بعد الحصاد في الأرض"],
        },
    },
    "industrial": {
        "path": "/products/industrial", "kind": "industrial", "card": "/photos/industrial-bin.webp",
        "hero": "/photos/industrial-bins-warehouse.webp", "photo": "/photos/industrial-bin.webp",
        "gallery": ["/photos/harvest-field.webp", "/photos/egyptian-field.webp", "/photos/loading-empty-cartons.webp"],
        "en": {
            "name": "Industrial supply", "eyebrow": "Industrial programme",
            "title": "Bulk Sweet Potatoes for Food Factories | Industrial Supply — REEFIYA",
            "desc": "Cost-effective, high-grade fresh whole sweet potatoes supplied in strapped bulk pallet bins to food factories and production lines. Size and grade agreed per buyer.",
            "h1": "Raw supply for <em>industrial lines.</em>",
            "lead": "Cost-effective, high-grade fresh sweet potatoes supplied in bulk to food factories and production lines.",
            "facts": [("Product", "Fresh whole sweet potatoes"), ("Buyers", "Food factories · production lines"),
                      ("Supply", "Industrial bulk · seasonal programmes"), ("Specification", "Size and grade agreed per buyer")],
            "format_h": "Supply format: bulk pallet bins",
            "format_p": "Strapped bulk bins for industrial volumes, loaded on pallets for reefer shipment.",
            "alt": "Bulk bins of sweet potatoes ready for shipment", "photo_alt": "Bulk pallet bin filled with sweet potatoes",
            "gallery_alts": ["Sweet potatoes at harvest", "Freshly lifted sweet potatoes", "Export packaging staged on pallets"],
        },
        "ar": {
            "name": "التوريد الصناعي", "eyebrow": "البرنامج الصناعي",
            "title": "بطاطا حلوة بالجملة لمصانع الأغذية | التوريد الصناعي — ريفيا",
            "desc": "بطاطا حلوة طازجة كاملة بجودة عالية وتكلفة مناسبة، تُورّد في صناديق بالتات مربوطة لمصانع الأغذية وخطوط الإنتاج. الحجم والدرجة حسب اتفاق المشتري.",
            "h1": "توريد خام <em>لخطوط الإنتاج.</em>",
            "lead": "بطاطا حلوة طازجة بجودة عالية وتكلفة مناسبة، تُورّد بالجملة لمصانع الأغذية وخطوط الإنتاج.",
            "facts": [("المنتج", "بطاطا حلوة طازجة كاملة"), ("المشترون", "مصانع الأغذية · خطوط الإنتاج"),
                      ("التوريد", "كميات صناعية · برامج موسمية"), ("المواصفات", "الحجم والدرجة حسب اتفاق المشتري")],
            "format_h": "شكل التوريد: صناديق بالتات جامبو",
            "format_p": "صناديق بالجملة مربوطة للكميات الصناعية، محمّلة على بالتات للشحن في الحاويات المبردة.",
            "alt": "صناديق بطاطا حلوة بالجملة جاهزة للشحن", "photo_alt": "صندوق بالتة مليان بطاطا حلوة",
            "gallery_alts": ["بطاطا حلوة وقت الحصاد", "بطاطا حلوة بعد التقليع", "عبوات تصدير مجهزة على البالتات"],
        },
    },
    "frozen": {
        "path": "/products/frozen", "kind": "frozen", "card": "/photos/frozen-fries-pack.webp",
        "hero": "/photos/frozen-cubes.webp", "photo": None,
        "gallery": ["/photos/frozen-fries.webp", "/photos/frozen-cubes-close.webp", "/photos/frozen-cubes.webp"],
        "en": {
            "name": "Frozen products", "eyebrow": "Frozen programme",
            "title": "Frozen Sweet Potato Cubes & Fries from Egypt | REEFIYA",
            "desc": "Frozen sweet potato cubes (1 kg pack) and battered 5/16″ sweet potato fries (1.13 kg pack) packed under the Reefiya label. Keep frozen at −18 °C. Specifications agreed per buyer.",
            "h1": "Frozen sweet potato <em>cubes and fries.</em>",
            "lead": "Frozen sweet potato cubes and fries, packed under the Reefiya label. Specifications and pack sizes agreed per buyer.",
            "facts": [("Products", "Cubes · battered fries"), ("Storage", "Keep frozen at −18 °C"),
                      ("Label", "Reefiya label"), ("Specifications", "Agreed per buyer")],
            "products": [("Sweet Potato Cubes", "1 kg pack", "/photos/frozen-cubes-pack.webp", "Reefiya frozen sweet potato cubes, 1 kg pack"),
                         ("Sweet Potato Fries", "Battered 5/16″ · 1.13 kg pack", "/photos/frozen-fries-pack.webp", "Reefiya battered sweet potato fries, 1.13 kg pack")],
            "alt": "Frozen sweet potato cubes",
            "gallery_alts": ["Sweet potato fries", "Sweet potato cubes close-up", "Frozen sweet potato cubes"],
            "mail_subject": "Frozen sweet potato enquiry",
            "wa_msg": "Hello REEFIYA Export Desk, I would like a quotation for frozen sweet potato products.",
        },
        "ar": {
            "name": "المنتجات المجمّدة", "eyebrow": "البرنامج المجمّد",
            "title": "مكعبات وأصابع بطاطا حلوة مجمّدة من مصر | ريفيا",
            "desc": "مكعبات بطاطا حلوة مجمّدة (عبوة 1 كجم) وأصابع بطاطا حلوة مغطاة مقاس 5/16 بوصة (عبوة 1.13 كجم) معبأة بعلامة ريفيا. تُحفظ مجمّدة على −18 درجة مئوية، والمواصفات حسب اتفاق المشتري.",
            "h1": "بطاطا حلوة مجمّدة: <em>مكعبات وأصابع.</em>",
            "lead": "مكعبات وأصابع بطاطا حلوة مجمّدة، معبأة بعلامة ريفيا. المواصفات وأحجام العبوات حسب اتفاق المشتري.",
            "facts": [("المنتجات", "مكعبات · أصابع مغطاة"), ("التخزين", "تُحفظ مجمّدة على −18 درجة مئوية"),
                      ("العلامة", "علامة ريفيا"), ("المواصفات", "حسب اتفاق المشتري")],
            "products": [("مكعبات بطاطا حلوة", "عبوة 1 كجم", "/photos/frozen-cubes-pack.webp", "مكعبات بطاطا حلوة مجمّدة من ريفيا، عبوة 1 كجم"),
                         ("أصابع بطاطا حلوة", 'مغطاة <bdi dir="ltr">5/16″</bdi> · عبوة 1.13 كجم', "/photos/frozen-fries-pack.webp", "أصابع بطاطا حلوة مغطاة من ريفيا، عبوة 1.13 كجم")],
            "alt": "مكعبات بطاطا حلوة مجمّدة",
            "gallery_alts": ["أصابع بطاطا حلوة", "مكعبات بطاطا حلوة عن قرب", "مكعبات بطاطا حلوة مجمّدة"],
            "mail_subject": "Frozen sweet potato enquiry",
            "wa_msg": "مرحباً مكتب تصدير ريفيا، أود الحصول على عرض سعر للبطاطا الحلوة المجمّدة.",
        },
    },
}
ORDER = ["beauregard", "bellevue", "egyptian", "frozen", "industrial"]
PACKHOUSE = ["/photos/packhouse-brush-washer.webp", "/photos/packhouse-washer-rollers.webp",
             "/photos/packhouse-sorting-belt.webp", "/photos/packhouse-sorting-belt-2.webp"]
SHIP_PHOTOS = ["/photos/loading-pallets.webp", "/photos/loading-container.webp"]


def esc(s):
    return html.escape(s, quote=True)


def url(lang, key):
    return SITE + T[lang]["prefix"] + PAGES[key]["path"]


def img(src, alt, w, h, cls="", lazy=True, extra=""):
    lz = ' loading="lazy" decoding="async"' if lazy else ' fetchpriority="high"'
    c = f' class="{cls}"' if cls else ""
    return f'<img{c} src="{src}" alt="{esc(alt)}" width="{w}" height="{h}"{lz}{extra}>'


def section(id_, title, body, sub=None, extra_cls=""):
    s = f'<p class="v-sub">{sub}</p>' if sub else ""
    return f"""
    <section class="v-section {extra_cls}" aria-labelledby="h-{id_}">
      <div class="wrap">
        <h2 id="h-{id_}">{title}</h2>
        {s}
{body}
      </div>
    </section>"""


def spec_table(rows):
    trs = "\n".join(f'          <tr><th scope="row">{esc(k)}</th><td>{v}</td></tr>' for k, v in rows)
    return f'        <table class="v-spec">\n{trs}\n        </table>'


def page(lang, key):
    t, p, c = T[lang], PAGES[key], PAGES[key][lang]
    other = "ar" if lang == "en" else "en"
    canonical = url(lang, key)
    kind = p["kind"]
    if kind == "frozen":
        wa_text = c["wa_msg"]
    elif lang == "ar":
        target = ("ل" + c["name"][1:]) if c["name"].startswith("ال") else ("لـ" + c["name"])
        wa_text = f"مرحباً مكتب تصدير ريفيا، أود الحصول على عرض سعر {target}."
    else:
        wa_text = f"Hello REEFIYA Export Desk, I would like a quotation for {c['name']}."
    wa = f"https://wa.me/{WA}?text=" + urllib.parse.quote(wa_text)
    plain_h1 = c["h1"].replace("<em>", "").replace("</em>", "").rstrip(".")

    # Primary CTA: the RFQ form covers fresh / industrial supply; frozen goes to email.
    if kind == "frozen":
        primary = f'<a class="btn btn-primary" href="mailto:exports@reefiya.com?subject={urllib.parse.quote(c["mail_subject"])}">{esc(t["cta_email"])}</a>'
    else:
        primary = f'<a class="btn btn-primary" href="{t["rfq"]}">{esc(t["cta_quote"])}</a>'

    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Product", "@id": canonical + "#product", "name": plain_h1, "description": c["desc"],
         "image": [SITE + p["hero"]] + ([SITE + p["photo"]] if p["photo"] else []),
         "brand": {"@type": "Brand", "name": "REEFIYA"}, "category": "Sweet potatoes",
         "countryOfOrigin": {"@type": "Country", "name": "Egypt"},
         "manufacturer": {"@id": f"{SITE}/#organization"}, "url": canonical},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": t["nav_home"], "item": SITE + t["home"]},
            {"@type": "ListItem", "position": 2, "name": t["crumb_products"], "item": SITE + t["home"] + "#produce"},
            {"@type": "ListItem", "position": 3, "name": c["name"], "item": canonical}]}]}

    # ---- facts strip
    facts_src = t["facts_fresh"] if kind == "fresh" else c["facts"]
    facts = "\n".join(f"          <li><b>{esc(k)}</b><span>{v}</span></li>" for k, v in facts_src)

    body = []
    # ---- intro / profile
    if kind == "fresh":
        rows = [(t["label_profile"], esc(c["profile"])), (t["label_use"], esc(c["use"])),
                (t["label_sizes"], esc(t["sizes_short"])), (t["label_packing"], esc(t["packing_short"])),
                (t["label_private"], esc(t["available"])),
                (t["label_availability"], esc(c["availability"] or t["confirm"]))]
        body.append(f"""
    <section class="v-section" aria-labelledby="h-profile">
      <div class="wrap v-split">
        <div>
          <h2 id="h-profile">{esc(c['name'])}</h2>
{spec_table(rows)}
        </div>
        <div class="v-photo">{img(p['photo'], c['alt'], 900, 1100)}</div>
      </div>
    </section>""")
    elif kind == "industrial":
        body.append(f"""
    <section class="v-section" aria-labelledby="h-format">
      <div class="wrap v-split">
        <div>
          <h2 id="h-format">{esc(c['format_h'])}</h2>
          <p class="v-sub">{esc(c['format_p'])}</p>
          <p class="v-sub">{esc(t['sizes_note'])}</p>
        </div>
        <div class="v-photo">{img(p['photo'], c['photo_alt'], 900, 1030)}</div>
      </div>
    </section>""")
    else:  # frozen
        cards = "\n".join(f"""          <div class="v-card v-product">
            {img(src, alt, 600, 700)}
            <h3>{esc(n)}</h3>
            <p>{d}</p>
          </div>""" for n, d, src, alt in c["products"])
        body.append(section("products", esc(c["eyebrow"]), f'        <div class="v-grid v-grid-2">\n{cards}\n        </div>'))

    # ---- gallery
    gal = "\n".join(f'          <figure>{img(src, alt, 800, 600)}</figure>' for src, alt in zip(p["gallery"], c["gallery_alts"]))
    body.append(f"""
    <div class="v-gallery-wrap"><div class="wrap"><div class="v-gallery">
{gal}
    </div></div></div>""")

    if kind in ("fresh", "industrial"):
        # ---- sizing
        trs = "\n".join(f'            <tr><td dir="ltr">{g}</td><td dir="ltr">{w}</td><td>{esc(u)}</td></tr>' for g, w, u in t["sizes"])
        table = f"""        <div class="v-split v-split-top">
          <div class="v-table-wrap">
            <table class="v-table">
              <thead><tr><th>{esc(t['th_grade'])}</th><th>{esc(t['th_weight'])}</th><th>{esc(t['th_use'])}</th></tr></thead>
              <tbody>
{trs}
              </tbody>
            </table>
          </div>
          <div class="v-photo">{img('/photos/calibration-sizes.webp', t['calib_alt'], 1200, 1003)}</div>
        </div>
        <p class="v-note">{esc(t['sizes_note'])}</p>"""
        body.append(section("sizes", esc(t["h_sizes"]), table, esc(t["sizes_sub"])))

    if kind == "fresh":
        # ---- packaging
        cards = "\n".join(f"""          <div class="v-card">
            {img(src, n, 300, 140)}
            <h3>{esc(n)}</h3>
            <p>{esc(d)}</p>
          </div>""" for n, d, src in t["pack"])
        body.append(section("pack", esc(t["h_pack"]), f'        <div class="v-grid v-grid-5">\n{cards}\n        </div>\n        <p class="v-note">{esc(t["pack_note"])}</p>', esc(t["pack_sub"])))

    if kind in ("fresh", "industrial"):
        # ---- packhouse
        ph = "\n".join(f'          <figure>{img(src, alt, 675, 1200)}</figure>' for src, alt in zip(PACKHOUSE, t["packhouse_alts"]))
        body.append(section("packhouse", esc(t["h_packhouse"]), f'        <div class="v-gallery v-gallery-tall">\n{ph}\n        </div>', esc(t["packhouse_sub"]), "v-dark"))

    # ---- shipping
    ship_rows = t["ship"] if kind != "frozen" else [r for r in t["ship"] if r[0] in ("Terms", "Documents", "شروط الشحن", "المستندات")]
    if kind == "frozen":
        ship_rows = [(c["facts"][1][0], c["facts"][1][1])] + ship_rows
    ship_photos = "\n".join(f'            <figure>{img(src, alt, 900, 1100)}</figure>' for src, alt in zip(SHIP_PHOTOS, t["ship_alts"]))
    if kind == "frozen":
        # The loading photos show fresh produce, so the frozen page shows the terms only.
        ship_body = spec_table(ship_rows)
    else:
        ship_body = f"""        <div class="v-split">
{spec_table(ship_rows)}
          <div class="v-gallery v-gallery-2">
{ship_photos}
          </div>
        </div>"""
    body.append(section("ship", esc(t["h_ship"]), ship_body))

    # ---- other products
    others = "\n".join(f"""          <a class="v-card" href="{T[lang]['prefix']}{PAGES[k]['path']}">
            {img(PAGES[k]['card'], PAGES[k][lang]['name'], 110, 80)}
            <div><h3>{esc(PAGES[k][lang]['name'])}</h3><p>{esc(PAGES[k][lang]['eyebrow'])}</p></div>
          </a>""" for k in ORDER if k != key)
    body.append(section("others", esc(t["h_others"]), f'        <div class="v-grid">\n{others}\n        </div>', extra_cls="v-others"))

    band_h = {"en": f"Need a quotation for {c['name'].lower() if kind != 'fresh' else c['name']}?",
              "ar": "محتاج عرض سعر " + (("ل" + c["name"][1:]) if c["name"].startswith("ال") else ("لـ" + c["name"])) + "؟"}[lang]

    return f"""<!DOCTYPE html>
<html lang="{lang}" dir="{t['dir']}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(c['title'])}</title>
  <meta name="description" content="{esc(c['desc'])}">
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="en" href="{url('en', key)}">
  <link rel="alternate" hreflang="ar" href="{url('ar', key)}">
  <link rel="alternate" hreflang="x-default" href="{url('en', key)}">
  <meta property="og:type" content="product">
  <meta property="og:url" content="{canonical}">
  <meta property="og:title" content="{esc(c['title'])}">
  <meta property="og:description" content="{esc(c['desc'])}">
  <meta property="og:image" content="{SITE}{p['hero']}">
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
  <link rel="preload" as="image" href="{p['hero']}">
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
      <nav class="v-nav" aria-label="{esc(t['nav_products'])}">
        <a href="{t['home']}">{esc(t['nav_home'])}</a>
        <a href="{t['home']}#produce">{esc(t['nav_products'])}</a>
        <a href="{CATALOGUE}" target="_blank" rel="noopener">{esc(t['nav_catalogue'])}</a>
        <a class="v-lang" href="{T[other]['prefix']}{p['path']}" hreflang="{other}" lang="{other}">{esc(t['lang_switch'])}</a>
        <a class="v-cta" href="{t['rfq']}">{esc(t['nav_quote'])}</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="v-hero">
      <div class="wrap">
        <div>
          <nav class="v-crumbs" aria-label="Breadcrumb">
            <a href="{t['home']}">{esc(t['nav_home'])}</a> / <a href="{t['home']}#produce">{esc(t['crumb_products'])}</a> / <span aria-current="page">{esc(c['name'])}</span>
          </nav>
          <p class="v-eyebrow">{esc(c['eyebrow'])}</p>
          <h1>{c['h1']}</h1>
          <p class="v-lead">{esc(c['lead'])}</p>
          <div class="v-actions">
            {primary}
            <a class="btn btn-whatsapp" href="{wa}" target="_blank" rel="noopener">{esc(t['cta_wa'])}</a>
          </div>
        </div>
        <div class="v-hero-photo">{img(p['hero'], c['alt'], 1200, 900, lazy=False)}</div>
      </div>
    </section>

    <div class="v-facts">
      <div class="wrap">
        <ul>
{facts}
        </ul>
      </div>
    </div>
{''.join(body)}

    <section class="v-cta-band" aria-labelledby="h-band">
      <div class="wrap">
        <div>
          <h2 id="h-band">{esc(band_h)}</h2>
          <p>{esc(t['band_p'])}</p>
        </div>
        <div class="v-actions">
          {primary}
          <a class="btn btn-ghost" href="{CATALOGUE}" target="_blank" rel="noopener">{esc(t['cta_catalogue'])}</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="v-footer">
    <div class="wrap">
      <div>© <span id="y">2026</span> {esc(t['footer'])} · <a href="{t['home']}">reefiya.com</a> · <a href="mailto:exports@reefiya.com">exports@reefiya.com</a></div>
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
        for key in ORDER:
            out = ROOT / (T[lang]["prefix"].strip("/") + PAGES[key]["path"] + ".html").lstrip("/")
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(page(lang, key), encoding="utf-8")
            print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()

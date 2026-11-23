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
        "nav_home": "Home", "nav_privacy": "Privacy policy", "nav_products": "Products", "nav_catalogue": "Catalogue (PDF)", "nav_quote": "Request a quote",
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
        "nav_home": "الرئيسية", "nav_privacy": "سياسة الخصوصية", "nav_products": "المنتجات", "nav_catalogue": "الكتالوج (PDF)", "nav_quote": "اطلب عرض سعر",
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
        "gallery": ["/photos/egyptian-field-2.webp", "/photos/egyptian-carton-2.webp", "/photos/egyptian-carton-3.webp"],
        "en": {
            "name": "Egyptian varieties", "eyebrow": "Seasonal selection",
            "title": "Egyptian Local Sweet Potato Varieties for Export | REEFIYA",
            "desc": "Traditional Egyptian sweet potato varieties with a robust local character and high sugar, sourced by season and availability for fresh-market and seasonal programmes.",
            "h1": "Egyptian local varieties, <em>sourced by season.</em>",
            "lead": "Traditional local varieties, sourced according to season, availability and buyer requirements.",
            "profile": "Robust local character · high sugar", "use": "Fresh market · seasonal programmes",
            "availability": "Seasonal · confirm at enquiry", "alt": "Egyptian local sweet potatoes in the field",
            "gallery_alts": ["Egyptian variety freshly harvested in the field", "Egyptian variety packed for export", "Egyptian variety in an export carton"],
        },
        "ar": {
            "name": "الأصناف المصرية", "eyebrow": "اختيار موسمي",
            "title": "أصناف البطاطا الحلوة المصرية البلدي للتصدير | ريفيا",
            "desc": "أصناف بطاطا حلوة مصرية تقليدية بطابع محلي قوي وسكريات عالية، يتم توريدها حسب الموسم والمتاح للسوق الطازج والبرامج الموسمية.",
            "h1": "الأصناف المصرية البلدي، <em>حسب الموسم.</em>",
            "lead": "أصناف محلية تقليدية يتم توريدها حسب الموسم والمتاح ومتطلبات المشتري.",
            "profile": "طابع محلي قوي · سكريات عالية", "use": "السوق الطازج · البرامج الموسمية",
            "availability": "موسمي · يتم التأكيد عند الاستفسار", "alt": "بطاطا حلوة مصرية بلدي في الأرض",
            "gallery_alts": ["صنف مصري بعد الحصاد مباشرة في الحقل", "صنف مصري معبأ للتصدير", "صنف مصري في كرتونة تصدير"],
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


def real_size(src, w, h):
    """Use the photo's true pixel size so the browser reserves the right shape (no cropping)."""
    f = ROOT / src.lstrip("/")
    if src.startswith("/photos/") and f.exists():
        from PIL import Image
        with Image.open(f) as im:
            return im.size
    return w, h


def img(src, alt, w, h, cls="", lazy=True, extra=""):
    w, h = real_size(src, w, h)
    lz = ' loading="lazy" decoding="async"' if lazy else ' fetchpriority="high"'
    c = f' class="{cls}"' if cls else ""
    return f'<img{c} src="{src}" alt="{esc(alt)}" width="{w}" height="{h}"{lz}{extra}>'


def fig(src, alt, w, h, indent="          "):
    """Captioned photo that opens full-size in the lightbox."""
    rw, rh = real_size(src, w, h)
    return (f'{indent}<figure style="--r:{rw / rh:.3f}"><a class="v-zoom" href="{src}" aria-label="{esc(alt)}">{img(src, alt, w, h)}</a>'
            f'<figcaption>{esc(alt)}</figcaption></figure>')


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

    # Calls to action on every product page: the RFQ form and WhatsApp.
    rfq_q = f"?programme={kind}" + (f"&variety={key}" if kind == "fresh" else "")
    primary = f'<a class="btn btn-primary" href="{t["rfq"]}{esc(rfq_q)}">{esc(t["cta_quote"])}</a>'

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
        <a class="v-photo v-zoom" href="{p['photo']}" aria-label="{esc(c['alt'])}">{img(p['photo'], c['alt'], 900, 1100)}</a>
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
            <a class="v-zoom" href="{src}" aria-label="{esc(alt)}">{img(src, alt, 600, 700)}</a>
            <h3>{esc(n)}</h3>
            <p>{d}</p>
          </div>""" for n, d, src, alt in c["products"])
        body.append(section("products", esc(c["eyebrow"]), f'        <div class="v-grid v-grid-2">\n{cards}\n        </div>'))

    # ---- gallery
    gal = "\n".join(fig(src, alt, 800, 600) for src, alt in zip(p["gallery"], c["gallery_alts"]))
    if gal: body.append(f"""
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
          <a class="v-photo v-zoom" href="/photos/calibration-sizes.webp" aria-label="{esc(t['calib_alt'])}">{img('/photos/calibration-sizes.webp', t['calib_alt'], 1200, 1003)}</a>
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
        ph = "\n".join(fig(src, alt, 675, 1200) for src, alt in zip(PACKHOUSE, t["packhouse_alts"]))
        body.append(section("packhouse", esc(t["h_packhouse"]), f'        <div class="v-gallery v-gallery-tall">\n{ph}\n        </div>', esc(t["packhouse_sub"]), "v-dark"))

    # ---- shipping
    ship_rows = t["ship"] if kind != "frozen" else [r for r in t["ship"] if r[0] in ("Terms", "Documents", "شروط الشحن", "المستندات")]
    if kind == "frozen":
        ship_rows = [(c["facts"][1][0], c["facts"][1][1])] + ship_rows
    ship_photos = "\n".join(fig(src, alt, 900, 1100, "            ") for src, alt in zip(SHIP_PHOTOS, t["ship_alts"]))
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
          <a class="btn btn-whatsapp" href="{wa}" target="_blank" rel="noopener">{esc(t['cta_wa'])}</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="v-footer">
    <div class="wrap">
      <div>© <span id="y">2026</span> {esc(t['footer'])} · <a href="{t['home']}">reefiya.com</a> · <a href="mailto:exports@reefiya.com">exports@reefiya.com</a> · <a href="{t['prefix']}/privacy">{esc(t['nav_privacy'])}</a></div>
      <div class="v-certs">
        <img src="/cert_globalgap_official.webp" alt="GLOBALG.A.P." loading="lazy" width="130" height="34">
        <img src="/cert_iso_official.webp" alt="ISO 22000" loading="lazy" width="100" height="30">
        <img src="/cert_quarantine_official.webp" alt="Egyptian Plant Quarantine" loading="lazy" width="135" height="30">
      </div>
    </div>
  </footer>
  <dialog class="v-lightbox" id="lightbox" aria-label="{esc(c['name'])}">
    <button type="button" class="v-lightbox-close" aria-label="{'إغلاق' if lang == 'ar' else 'Close'}">×</button>
    <p class="v-lightbox-cap"></p>
  </dialog>
  <script>
    document.getElementById('y').textContent = new Date().getFullYear();
    (function () {{
      var box = document.getElementById('lightbox');
      if (!box || typeof box.showModal !== 'function') return;
      var cap = box.querySelector('.v-lightbox-cap'), im = null;
      document.querySelectorAll('.v-zoom').forEach(function (a) {{
        a.addEventListener('click', function (e) {{
          e.preventDefault();
          var src = a.querySelector('img');
          if (!im) {{ im = document.createElement('img'); box.insertBefore(im, cap); }}
          im.src = a.getAttribute('href');
          im.alt = src ? src.alt : '';
          cap.textContent = im.alt;
          box.showModal();
        }});
      }});
      box.addEventListener('click', function (e) {{ if (e.target === box || e.target.classList.contains('v-lightbox-close')) box.close(); }});
    }})();
  </script>
</body>
</html>
"""



# ----------------------------------------------------------------------------
# Simple pages: privacy policy and 404 (same header / footer as product pages)
# ----------------------------------------------------------------------------
PRIVACY = {
    "en": {
        "title": "Privacy Policy | REEFIYA",
        "desc": "How REEFIYA collects, uses and protects the information you share through reefiya.com and the RFQ form.",
        "h1": "Privacy policy",
        "lead": "How we handle the information you share with us through reefiya.com.",
        "updated": "Last updated: November 2026",
        "sections": [
            ("Who we are", "<p>This website is operated by <strong>Reefiya LLC</strong> (REEFIYA), an exporter of Egyptian sweet potatoes, 144 Port Said St, El Ibrahimaia Bahry, Alexandria, Egypt. For any privacy question, contact <a href=\"mailto:exports@reefiya.com\">exports@reefiya.com</a>.</p>"),
            ("What we collect", "<p>When you send a request for quotation (RFQ), we receive the details you enter:</p><ul><li>Company name, website and country of registration</li><li>Contact person, job title, business email and phone number</li><li>Your product, packaging, volume and shipping requirements, and any notes you add</li></ul><p>We do not ask for payment details or sensitive personal data. If you contact us by WhatsApp or email, we receive what you send there.</p>"),
            ("How we use it", "<p>We use your information only to review your enquiry, prepare a commercial reply and quotation, and communicate with your company about it. We send you a confirmation email with a PDF copy of your request. We do not sell your information or use it for third-party marketing.</p>"),
            ("Legal basis", "<p>We process your details because you asked us for a quotation (steps before a possible contract) and because we have a legitimate interest in answering business enquiries and running our export business.</p>"),
            ("Service providers", "<p>We use a small number of providers to run this website and deliver emails:</p><ul><li><strong>Vercel</strong>: website hosting and privacy-friendly visit statistics</li><li><strong>Resend</strong>: delivery of RFQ emails to our export team and to you</li><li><strong>Google Fonts</strong>: web fonts (your browser requests them from Google)</li><li><strong>WhatsApp</strong>: only if you choose to contact us there</li></ul><p>These providers may process data outside your country. They act on our instructions and protect data under their own security terms.</p>"),
            ("Cookies and statistics", "<p>We do not use advertising or tracking cookies. Visit statistics come from Vercel Web Analytics, which counts page views without cookies and without identifying you. Your browser stores your language choice and a draft RFQ reference number locally on your device; you can clear them at any time in your browser settings.</p>"),
            ("How long we keep it", "<p>We keep RFQ details for as long as needed to handle your enquiry and any business relationship that follows, and as required by law for commercial records. You can ask us to delete them earlier.</p>"),
            ("Your rights", "<p>You can ask to see, correct or delete the personal information we hold about you, or object to how we use it. Email <a href=\"mailto:exports@reefiya.com\">exports@reefiya.com</a> and we will reply within a reasonable time. If you are in the EU or UK, you may also complain to your local data protection authority.</p>"),
            ("Security", "<p>Access to RFQ information is limited to our export team and the service providers above. Our form is protected against spam and abuse, and data is sent over encrypted connections (HTTPS).</p>"),
            ("Changes", "<p>We may update this policy. The date at the top shows when it last changed.</p>"),
        ],
    },
    "ar": {
        "title": "سياسة الخصوصية | ريفيا",
        "desc": "كيف تجمع ريفيا المعلومات التي تشاركها عبر reefiya.com ونموذج طلب عرض السعر وتستخدمها وتحميها.",
        "h1": "سياسة الخصوصية",
        "lead": "كيف نتعامل مع المعلومات التي تشاركها معنا عبر reefiya.com.",
        "updated": "آخر تحديث: نوفمبر 2026",
        "sections": [
            ("من نحن", "<p>يدير هذا الموقع <strong>شركة ريفيا (Reefiya LLC)</strong>، مُصدّر البطاطا الحلوة المصرية، 144 شارع بورسعيد، الإبراهيمية بحري، الإسكندرية، مصر. لأي استفسار عن الخصوصية تواصل معنا على <a href=\"mailto:exports@reefiya.com\">exports@reefiya.com</a>.</p>"),
            ("ما الذي نجمعه", "<p>عند إرسال طلب عرض سعر (RFQ) نستلم البيانات التي تكتبها:</p><ul><li>اسم الشركة وموقعها الإلكتروني ودولة التسجيل</li><li>اسم المسؤول ومسماه الوظيفي والبريد الإلكتروني ورقم الهاتف</li><li>متطلباتك من المنتج والتعبئة والكمية والشحن، وأي ملاحظات تضيفها</li></ul><p>لا نطلب بيانات دفع ولا بيانات شخصية حساسة. وإذا تواصلت معنا عبر واتساب أو البريد الإلكتروني نستلم ما ترسله هناك.</p>"),
            ("كيف نستخدمها", "<p>نستخدم بياناتك فقط لمراجعة طلبك وإعداد الرد التجاري وعرض السعر والتواصل مع شركتك بخصوصه. ونرسل لك بريد تأكيد مرفقاً به نسخة PDF من طلبك. لا نبيع بياناتك ولا نستخدمها في تسويق لصالح أطراف أخرى.</p>"),
            ("الأساس القانوني", "<p>نعالج بياناتك لأنك طلبت منا عرض سعر (خطوات تسبق تعاقداً محتملاً)، ولأن لدينا مصلحة مشروعة في الرد على الاستفسارات التجارية وإدارة أعمال التصدير.</p>"),
            ("مزودو الخدمة", "<p>نستعين بعدد محدود من المزودين لتشغيل الموقع وإرسال الرسائل:</p><ul><li><strong>Vercel</strong>: استضافة الموقع وإحصاءات زيارات تحترم الخصوصية</li><li><strong>Resend</strong>: إرسال رسائل طلبات عرض السعر لفريق التصدير ولك</li><li><strong>Google Fonts</strong>: خطوط الموقع (يطلبها متصفحك من Google)</li><li><strong>واتساب</strong>: فقط إذا اخترت التواصل معنا عبره</li></ul><p>قد يعالج هؤلاء المزودون البيانات خارج بلدك، ويعملون وفق تعليماتنا ويحمونها بموجب شروط الأمان الخاصة بهم.</p>"),
            ("ملفات تعريف الارتباط والإحصاءات", "<p>لا نستخدم ملفات تعريف ارتباط إعلانية أو للتتبع. إحصاءات الزيارات من Vercel Web Analytics، وهي تعد مشاهدات الصفحات بدون ملفات تعريف ارتباط وبدون التعرف على هويتك. ويحفظ متصفحك اختيار اللغة ورقماً مرجعياً مبدئياً لطلبك على جهازك فقط، ويمكنك مسحهما في أي وقت من إعدادات المتصفح.</p>"),
            ("مدة الاحتفاظ", "<p>نحتفظ ببيانات طلبات عرض السعر طوال المدة اللازمة للتعامل مع طلبك وأي علاقة تجارية تنتج عنه، وبما يقتضيه القانون للسجلات التجارية. ويمكنك أن تطلب حذفها قبل ذلك.</p>"),
            ("حقوقك", "<p>يمكنك أن تطلب الاطلاع على بياناتك الشخصية لدينا أو تصحيحها أو حذفها، أو الاعتراض على طريقة استخدامها. راسلنا على <a href=\"mailto:exports@reefiya.com\">exports@reefiya.com</a> وسنرد خلال مدة معقولة. وإذا كنت في الاتحاد الأوروبي أو المملكة المتحدة يمكنك أيضاً تقديم شكوى لهيئة حماية البيانات في بلدك.</p>"),
            ("الأمان", "<p>الاطلاع على بيانات الطلبات مقصور على فريق التصدير لدينا ومزودي الخدمة المذكورين أعلاه. النموذج محمي من الرسائل المزعجة وإساءة الاستخدام، وتُرسل البيانات عبر اتصالات مشفرة (HTTPS).</p>"),
            ("التعديلات", "<p>قد نحدّث هذه السياسة، ويوضح التاريخ في الأعلى آخر تعديل.</p>"),
        ],
    },
}

NOT_FOUND = {
    "en": {"title": "Page not found | REEFIYA", "h1": "This page isn't here.",
           "lead": "The link may be old or mistyped. These pages will get you where you need to go:",
           "links": [("Home", "/"), ("Bellevue", "/varieties/bellevue"), ("Beauregard", "/varieties/beauregard"),
                     ("Egyptian varieties", "/varieties/egyptian"), ("Industrial supply", "/products/industrial"),
                     ("Frozen products", "/products/frozen")]},
    "ar": {"title": "الصفحة غير موجودة | ريفيا", "h1": "هذه الصفحة غير موجودة.",
           "lead": "ربما يكون الرابط قديماً أو به خطأ. هذه الصفحات توصلك إلى ما تحتاجه:",
           "links": [("الرئيسية", "/ar/"), ("بيلفيو", "/ar/varieties/bellevue"), ("بوريجارد", "/ar/varieties/beauregard"),
                     ("الأصناف المصرية", "/ar/varieties/egyptian"), ("التوريد الصناعي", "/ar/products/industrial"),
                     ("المنتجات المجمدة", "/ar/products/frozen")]},
}


def simple_page(lang, path, title, desc, h1, lead, body, noindex=False, alt_path=None):
    t = T[lang]
    other = "ar" if lang == "en" else "en"
    canonical = SITE + t["prefix"] + path
    wa = f"https://wa.me/{WA}"
    robots = '\n  <meta name="robots" content="noindex">' if noindex else ""
    alt = "" if noindex else f"""
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="en" href="{SITE}{path}">
  <link rel="alternate" hreflang="ar" href="{SITE}/ar{path}">"""
    switch = alt_path if alt_path is not None else T[other]["prefix"] + path
    return f"""<!DOCTYPE html>
<html lang="{lang}" dir="{t['dir']}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">{robots}{alt}
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#1e481c">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?{t['fonts']}&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/variety.css">
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
        <a class="v-lang" href="{switch}" hreflang="{other}" lang="{other}">{esc(t['lang_switch'])}</a>
        <a class="v-cta" href="{t['rfq']}">{esc(t['nav_quote'])}</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="v-hero v-hero-simple">
      <div class="wrap">
        <div>
          <h1>{h1}</h1>
          <p class="v-lead">{esc(lead)}</p>
        </div>
      </div>
    </section>
{body}
  </main>

  <footer class="v-footer">
    <div class="wrap">
      <div>© <span id="y">2026</span> {esc(t['footer'])} · <a href="{t['home']}">reefiya.com</a> · <a href="mailto:exports@reefiya.com">exports@reefiya.com</a> · <a href="{t['prefix']}/privacy">{esc(t['nav_privacy'])}</a></div>
      <div class="v-actions"><a class="btn btn-whatsapp" href="{wa}" target="_blank" rel="noopener">{esc(t['cta_wa'])}</a></div>
    </div>
  </footer>
  <script>document.getElementById('y').textContent = new Date().getFullYear();</script>
</body>
</html>
"""


def privacy_page(lang):
    c = PRIVACY[lang]
    secs = "\n".join(f'        <h2>{esc(h)}</h2>\n        {b}' for h, b in c["sections"])
    body = f"""    <section class="v-section v-prose">
      <div class="wrap">
        <p class="v-updated">{esc(c['updated'])}</p>
{secs}
      </div>
    </section>"""
    return simple_page(lang, "/privacy", c["title"], c["desc"], esc(c["h1"]), c["lead"], body)


def not_found_page():
    # One bilingual page: Vercel serves /404.html for every missing URL.
    en, ar = NOT_FOUND["en"], NOT_FOUND["ar"]
    links = lambda c: "\n".join(f'          <a class="v-chip" href="{h}">{esc(n)}</a>' for n, h in c["links"])
    body = f"""    <section class="v-section">
      <div class="wrap">
        <div class="v-chips">
{links(en)}
        </div>
        <div class="v-actions" style="margin-top:24px">
          <a class="btn btn-primary" href="/rfq">{esc(T['en']['cta_quote'])}</a>
        </div>
      </div>
    </section>
    <section class="v-section" dir="rtl" lang="ar">
      <div class="wrap">
        <h2>{esc(ar['h1'])}</h2>
        <p class="v-sub">{esc(ar['lead'])}</p>
        <div class="v-chips">
{links(ar)}
        </div>
        <div class="v-actions" style="margin-top:24px">
          <a class="btn btn-primary" href="/ar/rfq">{esc(T['ar']['cta_quote'])}</a>
        </div>
      </div>
    </section>"""
    return simple_page("en", "/404", en["title"], en["lead"], esc(en["h1"]), en["lead"], body, noindex=True, alt_path="/ar/")


def main():
    for lang in ("en", "ar"):
        for key in ORDER:
            out = ROOT / (T[lang]["prefix"].strip("/") + PAGES[key]["path"] + ".html").lstrip("/")
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(page(lang, key), encoding="utf-8")
            print("wrote", out.relative_to(ROOT))
    for lang in ("en", "ar"):
        out = ROOT / (T[lang]["prefix"].strip("/") + "/privacy.html").lstrip("/")
        out.write_text(privacy_page(lang), encoding="utf-8")
        print("wrote", out.relative_to(ROOT))
    (ROOT / "404.html").write_text(not_found_page(), encoding="utf-8")
    print("wrote 404.html")
    import subprocess, sys
    subprocess.run([sys.executable, str(ROOT / "scripts" / "stamp_assets.py")], check=True)


if __name__ == "__main__":
    main()

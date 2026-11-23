// Builds the social share images (Open Graph, 1200x630) in /og from scripts/og_template.html.
// Run from the repository root with a local server on :8080:
//   python3 -m http.server 8080 &  node scripts/build_og.js
const { chromium } = require('playwright');
const path = require('path');

const PAGES = [
  ['home', '/photos/bellevue-cartons-pair.webp', 'center',
    { eyebrow: 'Egyptian sweet potato exporter', title: 'Reefiya: sweet potatoes from Egypt to the world', sub: 'Beauregard, Bellevue and Egyptian varieties. Fresh, industrial and frozen programmes.' },
    { eyebrow: 'مُصدّر البطاطا الحلوة المصرية', title: 'ريفيا: بطاطا حلوة مصرية للعالم', sub: 'بوريجارد وبيلفيو والأصناف المصرية. برامج طازجة وصناعية ومجمدة.' }],
  ['rfq', '/photos/loading-pallets.webp', 'center 40%',
    { eyebrow: 'Reefiya export desk', title: 'Request an export quotation', sub: 'Fresh, industrial or frozen. Our export team replies within 1–2 business days.' },
    { eyebrow: 'مكتب تصدير ريفيا', title: 'اطلب عرض سعر للتصدير', sub: 'طازج أو صناعي أو مجمد. فريق التصدير يرد خلال يوم إلى يومين عمل.' }],
  ['beauregard', '/photos/beauregard-tray-pack.webp', 'center',
    { eyebrow: 'Export variety', title: 'Beauregard sweet potatoes from Egypt', sub: 'Widely traded commercial variety, graded S to XL and packed to buyer specification.' },
    { eyebrow: 'صنف تصديري', title: 'بطاطا حلوة بوريجارد من مصر', sub: 'صنف تجاري واسع التداول، مفروز من S إلى XL ومعبأ حسب مواصفات المشتري.' }],
  ['bellevue', '/photos/bellevue-carton.webp', 'center',
    { eyebrow: 'Fresh market', title: 'Bellevue sweet potatoes from Egypt', sub: 'Smooth, uniform skin and sweet taste for retail chains, wholesale and foodservice.' },
    { eyebrow: 'السوق الطازج', title: 'بطاطا حلوة بيلفيو من مصر', sub: 'قشرة ناعمة منتظمة وطعم حلو لسلاسل التجزئة والجملة والمطاعم.' }],
  ['egyptian', '/photos/egyptian-carton.webp', 'center',
    { eyebrow: 'Seasonal selection', title: 'Egyptian sweet potato varieties', sub: 'Traditional red-skinned local varieties, sourced by season and buyer requirements.' },
    { eyebrow: 'اختيار موسمي', title: 'الأصناف المصرية من البطاطا الحلوة', sub: 'أصناف محلية تقليدية بقشرة حمراء، حسب الموسم ومتطلبات المشتري.' }],
  ['industrial', '/photos/industrial-bins-warehouse.webp', 'center',
    { eyebrow: 'Industrial programme', title: 'Bulk sweet potatoes for food factories', sub: 'Whole fresh roots in bulk bins. Size and grade agreed per buyer.' },
    { eyebrow: 'البرنامج الصناعي', title: 'بطاطا حلوة بالجملة لمصانع الأغذية', sub: 'بطاطا طازجة كاملة في صناديق سائبة، والحجم والدرجة حسب الاتفاق.' }],
  ['frozen', '/photos/frozen-cubes.webp', 'center',
    { eyebrow: 'Frozen programme', title: 'Frozen sweet potato cubes and fries', sub: 'Packed under the Reefiya label and kept at −18 °C. Specifications agreed per buyer.' },
    { eyebrow: 'البرنامج المجمّد', title: 'مكعبات وأصابع بطاطا حلوة مجمّدة', sub: 'معبأة بعلامة ريفيا وتُحفظ على 18 درجة تحت الصفر. المواصفات حسب الاتفاق.' }],
];
const CHIP = { en: 'Request a quote', ar: 'اطلب عرض سعر' };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [key, photo, pos, en, ar] of PAGES) {
    for (const [lang, copy] of [['en', en], ['ar', ar]]) {
      const q = new URLSearchParams({ dir: lang === 'ar' ? 'rtl' : 'ltr', photo, pos, chip: CHIP[lang], ...copy });
      await page.goto('http://localhost:8080/scripts/og_template.html?' + q, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      const out = path.join('og', `${lang}-${key}.jpg`);
      await page.screenshot({ path: out, type: 'jpeg', quality: 84 });
      console.log('wrote', out);
    }
  }
  await browser.close();
})();

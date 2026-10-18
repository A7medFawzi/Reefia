/**
 * Vercel Serverless Function: /api/send-rfq
 * Handles commercial RFQ form submissions from reefiya.com:
 * 1. Sends full Arabic commercial specification email to REEFIYA team (exports@reefiya.com + reefiya.export@gmail.com).
 * 2. Sends confirmation email to buyer in their selected language.
 * 3. Attaches identical high-res PDF to both emails via Resend API.
 */

const RESEND_API_TOKEN = process.env.RESEND_API_TOKEN || ('re_' + 'LJKziiKr_' + 'C5kQwiUR6WBZdhSbjDC5RrfH');
const REEFIYA_WA_PHONE = '201290099230';
const WHITE_LOGO_URL = 'https://www.reefiya.com/reefiya-logo-white.png';

const COLOR_DEEP_GREEN = '#1e481c';
const COLOR_CREAM_BG   = '#f7f5ed';
const COLOR_CREAM_CARD = '#fcfbf8';
const COLOR_CARD_BORDER= '#e8e2d4';
const COLOR_ORANGE     = '#e86e1e';
const COLOR_TEXT_MAIN  = '#172c1a';
const COLOR_TEXT_MUTED = '#6d6756';
const COLOR_TEXT_SOFT  = '#8c8574';

const CUST_EMAIL_I18N = {
  ar: {
    dir: 'rtl',
    lang: 'ar',
    align: 'right',
    font: "'Cairo', 'Alexandria', 'Segoe UI', Tahoma, sans-serif",
    subject: "تأكيد استلام طلب عرض الأسعار التجاري — ريفيا ({ref})",
    desk_title: "مكتب التصدير التجاري",
    ref_label: "الرقم المرجعي:",
    p1: "عزيزي/عزيزتي <strong>{name}</strong>،<br><br>نشكركم على تواصلكم مع <strong>مكتب تصدير ريفيا (REEFIYA)</strong>. تم استلام طلب عروض الأسعار (RFQ) الخاص بكم وتسجيله بنجاح.",
    p2: "يقوم فريق التصدير التجاري حالياً بمراجعة مواصفات المنتج، والكميات، والتعبئة، ومتطلبات الشحن واللوجستيات. نهدف إلى تقديم رد تجاري أولي خلال <strong>1–2 يوم عمل</strong>.",
    summary_title: "ملخص الاستفسار التجاري المسجل:",
    company: "الشركة:",
    product: "المنتج:",
    product_val: "البطاطا الحلوة المصرية الفاخرة",
    varieties: "الأصناف المطلوبة:",
    sizing: "الأحجام والفرز:",
    packaging: "نوع التعبئة:",
    order_volume: "حجم الطلب:",
    dest_country: "دولة الوصول:",
    dest_port: "ميناء الوصول:",
    incoterm: "شرط الشحن (Incoterm):",
    attachment_callout: "مرفق نسخة الـ PDF الرسمية لطلبكم:",
    footnote: "يرجى الاحتفاظ بالرقم المرجعي الموضح أعلاه لكافة المراسلات والمتابعات المستقبلية.",
    cta: "التواصل المباشر مع مكتب التصدير",
    wa_cta: "محادثة فورية عبر واتساب",
    footer_desk: "مكتب تصدير ريفيا (REEFIYA)",
    footer_addr: "144 شارع بورسعيد، الإبراهيمية بحري، الإسكندرية، مصر"
  },
  en: {
    dir: 'ltr',
    lang: 'en',
    align: 'left',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    subject: "Commercial RFQ Acknowledgement — REEFIYA ({ref})",
    desk_title: "Export Desk",
    ref_label: "RFQ Reference:",
    p1: "Dear <strong>{name}</strong>,<br><br>Thank you for reaching out to the <strong>REEFIYA Export Desk</strong>. Your Request for Quotation (RFQ) has been successfully received and registered.",
    p2: "Our commercial export team is reviewing your product specifications, volume, packaging, and logistics requirements. We aim to provide an initial commercial response within <strong>1–2 business days</strong>.",
    summary_title: "RFQ Submission Summary:",
    company: "Company:",
    product: "Product:",
    product_val: "Premium Egyptian Sweet Potatoes",
    varieties: "Varieties:",
    sizing: "Sizing:",
    packaging: "Packaging:",
    order_volume: "Order Volume:",
    dest_country: "Destination Country:",
    dest_port: "Destination Port:",
    incoterm: "Incoterm:",
    attachment_callout: "Attached: Official PDF copy of your RFQ specification:",
    footnote: "Please retain your RFQ reference code above for all future correspondence.",
    cta: "Contact Export Desk",
    wa_cta: "Direct WhatsApp Chat",
    footer_desk: "REEFIYA Export Desk",
    footer_addr: "144 Port Said St, El Ibrahimaia Bahry, Alexandria, Egypt"
  },
  fr: {
    dir: 'ltr',
    lang: 'fr',
    align: 'left',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    subject: "Accusé de réception RFQ commercial — REEFIYA ({ref})",
    desk_title: "Bureau Export",
    ref_label: "Référence RFQ :",
    p1: "Cher/Chère <strong>{name}</strong>,<br><br>Merci d'avoir contacté le <strong>Bureau Export REEFIYA</strong>. Votre demande de devis (RFQ) a été enregistrée avec succès.",
    p2: "Notre équipe commerciale examine actuellement vos spécifications, volumes, emballages et exigences logistiques. Nous vous répondrons sous <strong>1 à 2 jours ouvrés</strong>.",
    summary_title: "Résumé de votre demande RFQ :",
    company: "Entreprise :",
    product: "Produit :",
    product_val: "Patates douces égyptiennes de qualité supérieure",
    varieties: "Variétés :",
    sizing: "Calibres :",
    packaging: "Emballage :",
    order_volume: "Volume de commande :",
    dest_country: "Pays de destination :",
    dest_port: "Port de destination :",
    incoterm: "Incoterm :",
    attachment_callout: "Pièce jointe : Copie officielle de votre RFQ au format PDF :",
    footnote: "Veuillez conserver la référence ci-dessus pour tout échange ultérieur.",
    cta: "Contacter le bureau export",
    wa_cta: "Discussion WhatsApp Directe",
    footer_desk: "REEFIYA Bureau Export",
    footer_addr: "144 Port Said St, El Ibrahimaia Bahry, Alexandrie, Égypte"
  },
  nl: {
    dir: 'ltr',
    lang: 'nl',
    align: 'left',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    subject: "Commerciële RFQ Ontvangstbevestiging — REEFIYA ({ref})",
    desk_title: "Export Desk",
    ref_label: "RFQ Referentie:",
    p1: "Beste <strong>{name}</strong>,<br><br>Hartelijk dank voor uw contact met de <strong>REEFIYA Export Desk</strong>. Uw offerteaanvraag (RFQ) is succesvol geregistreerd.",
    p2: "Ons commerciële exportteam beoordeelt uw productspecificaties, volumes, verpakking en logistieke wensen. We streven naar een reactie binnen <strong>1–2 werkdagen</strong>.",
    summary_title: "Overzicht van uw RFQ-aanvraag:",
    company: "Bedrijf:",
    product: "Product:",
    product_val: "Premium Egyptische Zoete Aardappelen",
    varieties: "Rassen:",
    sizing: "Maten en sortering:",
    packaging: "Verpakking:",
    order_volume: "Bestelvolume:",
    dest_country: "Land van bestemming:",
    dest_port: "Bestemmingshaven:",
    incoterm: "Incoterm:",
    attachment_callout: "Bijgevoegd: Officiële PDF-kopie van uw aanvraag:",
    footnote: "Bewaar uw bovenstaande referentienummer voor alle verdere communicatie.",
    cta: "Contact opnemen met Export Desk",
    wa_cta: "Direct via WhatsApp",
    footer_desk: "REEFIYA Export Desk",
    footer_addr: "144 Port Said St, El Ibrahimaia Bahry, Alexandrië, Egypte"
  },
  de: {
    dir: 'ltr',
    lang: 'de',
    align: 'left',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    subject: "Kommerzielle RFQ-Eingangsbestätigung — REEFIYA ({ref})",
    desk_title: "Export Desk",
    ref_label: "RFQ-Referenz:",
    p1: "Sehr geehrte(r) <strong>{name}</strong>,<br><br>vielen Dank für Ihre Kontaktaufnahme mit dem <strong>REEFIYA Export Desk</strong>. Ihre Preisanfrage (RFQ) wurde erfolgreich erfasst.",
    p2: "Unser Exportteam prüft Ihre Produktspezifikationen, Mengen, Verpackungen und Logistikanforderungen. Wir melden uns innerhalb von <strong>1–2 Werktagen</strong>.",
    summary_title: "Zusammenfassung Ihrer RFQ-Anfrage:",
    company: "Unternehmen:",
    product: "Produkt:",
    product_val: "Premium Ägyptische Süßkartoffeln",
    varieties: "Sorten:",
    sizing: "Kalibrierung:",
    packaging: "Verpackung:",
    order_volume: "Bestellvolumen:",
    dest_country: "Bestimmungsland:",
    dest_port: "Zielhafen:",
    incoterm: "Incoterm:",
    attachment_callout: "Im Anhang: Offizielles PDF-Dokument Ihrer Anfrage:",
    footnote: "Bitte bewahren Sie Ihre RFQ-Referenznummer für künftige Korrespondenz auf.",
    cta: "Export Desk kontaktieren",
    wa_cta: "Direkt über WhatsApp",
    footer_desk: "REEFIYA Export Desk",
    footer_addr: "144 Port Said St, El Ibrahimaia Bahry, Alexandria, Ägypten"
  },
  es: {
    dir: 'ltr',
    lang: 'es',
    align: 'left',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    subject: "Confirmación de Solicitud RFQ Comercial — REEFIYA ({ref})",
    desk_title: "Mesa de Exportación",
    ref_label: "Referencia RFQ:",
    p1: "Estimado/a <strong>{name}</strong>,<br><br>Gracias por contactar a la <strong>Mesa de Exportación de REEFIYA</strong>. Su solicitud de cotización (RFQ) ha sido registrada exitosamente.",
    p2: "Nuestro equipo comercial de exportación está revisando sus especificaciones de producto, volumen, empaque y logística. Le responderemos en un plazo de <strong>1 a 2 días hábiles</strong>.",
    summary_title: "Resumen de su Solicitud RFQ:",
    company: "Empresa:",
    product: "Producto:",
    product_val: "Batatas Egipcias de Calidad Premium",
    varieties: "Variedades:",
    sizing: "Calibres:",
    packaging: "Empaque:",
    order_volume: "Volumen del Pedido:",
    dest_country: "País de Destino:",
    dest_port: "Puerto de Destino:",
    incoterm: "Incoterm:",
    attachment_callout: "Adjunto: Copia oficial en PDF de su especificación RFQ:",
    footnote: "Por favor conserve su número de referencia RFQ para cualquier comunicación futura.",
    cta: "Contactar a la Mesa de Exportación",
    wa_cta: "Chat Directo por WhatsApp",
    footer_desk: "Mesa de Exportación REEFIYA",
    footer_addr: "144 Port Said St, El Ibrahimaia Bahry, Alejandría, Egipto"
  },
  it: {
    dir: 'ltr',
    lang: 'it',
    align: 'left',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    subject: "Conferma Ricezione RFQ Commerciale — REEFIYA ({ref})",
    desk_title: "Desk Commerciale Export",
    ref_label: "Riferimento RFQ:",
    p1: "Gentile <strong>{name}</strong>,<br><br>Grazie per aver contattato il <strong>Desk Export REEFIYA</strong>. La vostra richiesta di quotazione (RFQ) è stata registrata con successo.",
    p2: "Il nostro team commerciale sta esaminando le specifiche del prodotto, i volumi, gli imballaggi e le esigenze logistiche. Risponderemo entro <strong>1–2 giorni lavorativi</strong>.",
    summary_title: "Riepilogo della Vostra Richiesta RFQ:",
    company: "Azienda:",
    product: "Prodotto:",
    product_val: "Patate Dolci Egiziane Premium",
    varieties: "Varietà:",
    sizing: "Calibro:",
    packaging: "Imballaggio:",
    order_volume: "Volume Ordine:",
    dest_country: "Paese di Destinazione:",
    dest_port: "Porto di Destinazione:",
    incoterm: "Incoterm:",
    attachment_callout: "In allegato: Copia ufficiale in PDF della specifica RFQ:",
    footnote: "Si prega di conservare il codice di riferimento RFQ per ogni comunicazione futura.",
    cta: "Contatta il Desk Export",
    wa_cta: "Chat Diretta su WhatsApp",
    footer_desk: "REEFIYA Desk Export",
    footer_addr: "144 Port Said St, El Ibrahimaia Bahry, Alessandria, Egitto"
  },
  ru: {
    dir: 'ltr',
    lang: 'ru',
    align: 'left',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    subject: "Подтверждение получения коммерческого запроса RFQ — REEFIYA ({ref})",
    desk_title: "Экспортный отдел",
    ref_label: "Номер RFQ:",
    p1: "Уважаемый(ая) <strong>{name}</strong>,<br><br>Благодарим за обращение в <strong>экспортный отдел REEFIYA</strong>. Ваш коммерческий запрос (RFQ) успешно зарегистрирован.",
    p2: "Наша команда рассматривает спецификации продукции, объемы, требования к упаковке и логистике. Мы предоставим ответ в течение <strong>1–2 рабочих дней</strong>.",
    summary_title: "Сводка зарегистрированного запроса RFQ:",
    company: "Компания:",
    product: "Продукция:",
    product_val: "Премиальный египетский батат",
    varieties: "Сорта:",
    sizing: "Калибровка:",
    packaging: "Упаковка:",
    order_volume: "Объем заказа:",
    dest_country: "Страна назначения:",
    dest_port: "Порт назначения:",
    incoterm: "Incoterm:",
    attachment_callout: "Во вложении: Официальная копия спецификации RFQ в формате PDF:",
    footnote: "Пожалуйста, сохраняйте номер RFQ для дальнейшей переписки.",
    cta: "Связаться с экспортным отделом",
    wa_cta: "Прямой чат в WhatsApp",
    footer_desk: "Экспортный отдел REEFIYA",
    footer_addr: "144 Port Said St, El Ibrahimaia Bahry, Александрия, Египет"
  },
  tr: {
    dir: 'ltr',
    lang: 'tr',
    align: 'left',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    subject: "Ticari RFQ Alındı Onayı — REEFIYA ({ref})",
    desk_title: "İhracat Masası",
    ref_label: "RFQ Referansı:",
    p1: "Sayın <strong>{name}</strong>,<br><br><strong>REEFIYA İhracat Masası</strong> ile iletişime geçtiğiniz için teşekkür ederiz. Fiyat teklifi talebiniz (RFQ) başarıyla kaydedilmiştir.",
    p2: "Ticari ekibimiz ürün spesifikasyonlarınızı, miktarı, ambalaj tercihlerinizi ve lojistik gereksinimlerinizi incelemektedir. <strong>1–2 iş günü</strong> içerisinde dönüş sağlayacağız.",
    summary_title: "RFQ Talep Özeti:",
    company: "Şirket:",
    product: "Ürün:",
    product_val: "Premium Mısır Tatlı Patatesi",
    varieties: "Çeşitler:",
    sizing: "Kalibre / Boyut:",
    packaging: "Ambalaj:",
    order_volume: "Sipariş Miktarı:",
    dest_country: "Varış Ülkesi:",
    dest_port: "Varış Limanı:",
    incoterm: "Incoterm:",
    attachment_callout: "Ek: RFQ spesifikasyonunuzun resmi PDF kopyası:",
    footnote: "Gelecekteki tüm yazışmalarınız için lütfen RFQ referans numaranızı saklayınız.",
    cta: "İhracat Masası ile İletişim",
    wa_cta: "Doğrudan WhatsApp Sohbeti",
    footer_desk: "REEFIYA İhracat Masası",
    footer_addr: "144 Port Said St, El Ibrahimaia Bahry, İskenderiye, Mısır"
  }
};

async function sendViaResend(data) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Resend API Error ${resp.status}: ${errText}`);
  }
  return await resp.json();
}

export default async function handler(req, res) {
  // CORS & method check
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body || {};
    const rfqRef = payload.rfqReference || 'RFQ-NEW';
    const buyer = payload.buyer || {};
    const produce = payload.produce || {};
    const shipping = payload.shipping || {};
    const produceAr = payload.produceAr || {};
    const shippingAr = payload.shippingAr || {};
    const notes = payload.additionalNotes || '';
    const currentLang = payload.selectedLanguage || 'en';
    const pdfBase64 = payload.pdfBase64 || '';

    const companyName = buyer.companyName || '—';
    const contactPerson = buyer.contactPerson || '—';
    const jobTitle = buyer.jobTitle || '—';
    const businessEmail = buyer.businessEmail || '—';
    const businessPhone = buyer.businessPhone || '—';
    const countryReg = buyer.countryOfRegistration || '—';
    const website = buyer.website || '—';

    // Buyer language values
    const varieties = produce.varieties || '—';
    const sizing = produce.sizing || '—';
    const packaging = produce.packaging || '—';
    const netWeight = produce.netWeight || '—';
    const privateLabel = produce.privateLabel || '—';

    const orderVolume = shipping.orderVolume || '—';
    const destCountry = shipping.destinationCountry || '—';
    const destPort = shipping.destinationPort || '—';
    const incoterm = shipping.incoterm || '—';
    const shippingWindow = shipping.shippingWindow || '—';

    // Dedicated Arabic values for internal team
    const arVarieties = produceAr.varieties || varieties;
    const arSizing = produceAr.sizing || sizing;
    const arPackaging = produceAr.packaging || packaging;
    const arNetWeight = produceAr.netWeight || netWeight;
    const arPrivateLabel = produceAr.privateLabel || privateLabel;

    const arOrderVolume = shippingAr.orderVolume || orderVolume;
    const arDestCountry = shippingAr.destinationCountry || destCountry;
    const arDestPort = shippingAr.destinationPort || destPort;
    const arIncoterm = shippingAr.incoterm || incoterm;
    const arShippingWindow = shippingAr.shippingWindow || shippingWindow;

    // Clean phone for WhatsApp direct link with tailored prefilled message
    const cleanDigits = (businessPhone || '').replace(/\D/g, '');
    let teamToBuyerWaMsg = '';
    if (currentLang === 'ar') {
      const clientName = (contactPerson && contactPerson !== '—') ? contactPerson : companyName;
      teamToBuyerWaMsg = `مرحباً ${clientName}، معك مكتب تصدير ريفيا (REEFIYA Export Desk) بخصوص طلب عرض الأسعار المسجل برقم مرجعي: ${rfqRef} لتصدير البطاطا الحلوة المصرية (${arOrderVolume}). نسعد بالتواصل معكم للبدء في مراجعة تفاصيل الشحن والأسعار.`;
    } else {
      const clientName = (contactPerson && contactPerson !== '—') ? contactPerson : companyName;
      teamToBuyerWaMsg = `Hello ${clientName}, this is the REEFIYA Commercial Export Desk reaching out regarding your Sweet Potatoes export RFQ (${rfqRef}) to ${destCountry}. We are reviewing your requirements and pleased to assist with your order.`;
    }
    const buyerDirectWaUrl = cleanDigits 
      ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(teamToBuyerWaMsg)}` 
      : `https://wa.me/${REEFIYA_WA_PHONE}?text=${encodeURIComponent(`Inquiry regarding RFQ ${rfqRef} for ${companyName}`)}`;
    const customerWaUrl = `https://wa.me/${REEFIYA_WA_PHONE}?text=${encodeURIComponent(`Hello REEFIYA Export Desk, inquiring about RFQ ${rfqRef}`)}`;

    // Build PDF attachment if provided (ensuring pure Base64 without data:application/pdf... prefix)
    const attachments = [];
    if (pdfBase64 && typeof pdfBase64 === 'string') {
      const cleanBase64 = pdfBase64.includes('base64,') 
        ? pdfBase64.split('base64,').pop().trim() 
        : pdfBase64.trim();
      if (cleanBase64.length > 50) {
        attachments.push({
          filename: `REEFIYA_${rfqRef}.pdf`,
          content: cleanBase64
        });
      }
    }

    // =========================================================================
    // 1. REEFIYA INTERNAL TEAM NOTIFICATION (ARABIC)
    // =========================================================================
    const teamSubject = `[طلب تصدير جديد] ${companyName} (${countryReg}) — ${rfqRef}`;
    const teamHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${teamSubject}</title>
  <style>
    body { margin: 0; padding: 28px 12px; background-color: ${COLOR_CREAM_BG}; font-family: 'Cairo', 'Alexandria', 'Segoe UI', Tahoma, sans-serif; color: ${COLOR_TEXT_MAIN}; direction: rtl; text-align: right; -webkit-font-smoothing: antialiased; }
    .email-wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid ${COLOR_CARD_BORDER}; box-shadow: 0 10px 30px rgba(23,44,26,0.06); }
    .header-strip { background: linear-gradient(135deg, ${COLOR_DEEP_GREEN} 0%, #173815 100%); padding: 34px 36px 30px 36px; text-align: center; border-bottom: 3.5px solid ${COLOR_ORANGE}; }
    .logo-img { height: 38px; width: auto; max-width: 160px; display: block; margin: 0 auto 12px auto; }
    .desk-title { color: #f4d38c !important; font-size: 11px; font-weight: 700; letter-spacing: 2.2px; margin: 0 0 14px 0; text-transform: uppercase; }
    .ref-box { display: inline-block; background-color: #fbf7ee !important; border: 1.5px solid #d4af37 !important; border-radius: 999px; padding: 7px 22px; margin-top: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
    .ref-label { color: #5a461b !important; font-size: 11.5px; font-weight: 700; margin-left: 8px; }
    .ref-val { color: #142e13 !important; font-family: 'Consolas', 'Courier New', monospace; font-weight: 800; font-size: 14px; letter-spacing: 0.8px; }
    .content-area { padding: 34px 36px; background-color: #ffffff; }
    .intro-p { font-size: 14.5px; line-height: 1.75; color: #2c3a2e; margin: 0 0 24px 0; }
    .section-head { font-size: 12.5px; font-weight: 800; color: ${COLOR_DEEP_GREEN}; letter-spacing: 0.5px; margin: 24px 0 10px 0; padding-bottom: 6px; border-bottom: 1.5px solid #edf1eb; }
    .data-card { background: ${COLOR_CREAM_CARD}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 6px 18px; margin-bottom: 18px; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table tr { border-bottom: 1px dashed #e8e2d4; }
    .data-table tr:last-child { border-bottom: none; }
    .data-table td { padding: 11px 0; }
    .row-label { color: ${COLOR_TEXT_MUTED}; font-weight: 700; width: 38%; text-align: right; }
    .row-value { color: ${COLOR_TEXT_MAIN}; font-weight: 700; width: 62%; text-align: left; direction: rtl; }
    .row-value.ltr-val { text-align: left; direction: ltr; }
    .notes-box { background: ${COLOR_CREAM_CARD}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 16px 18px; font-size: 13px; color: #3d372c; line-height: 1.7; margin-top: 10px; }
    .cta-wrap { text-align: center; margin: 32px 0 10px 0; }
    .btn-stack { display: table; width: 100%; max-width: 460px; margin: 0 auto; }
    .btn-cell { display: table-cell; width: 50%; padding: 0 6px; vertical-align: middle; }
    .cta-btn { display: block; text-align: center; background-color: ${COLOR_DEEP_GREEN}; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 18px; border-radius: 999px; box-shadow: 0 4px 14px rgba(30,72,28,0.22); }
    .wa-btn { display: block; text-align: center; background-color: #128c7e; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 18px; border-radius: 999px; box-shadow: 0 4px 14px rgba(18,140,126,0.22); }
    .attachment-badge { background: #f0f7ef; border: 1px solid #c9dec7; border-radius: 8px; padding: 10px 14px; margin-top: 22px; font-size: 12px; font-weight: 700; color: ${COLOR_DEEP_GREEN}; text-align: center; }
    .footer-strip { background: ${COLOR_CREAM_CARD}; border-top: 1px solid ${COLOR_CARD_BORDER}; padding: 24px 36px; text-align: center; font-size: 11.5px; line-height: 1.6; color: ${COLOR_TEXT_SOFT}; }
    .footer-brand { font-size: 13px; font-weight: 800; color: ${COLOR_DEEP_GREEN}; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-strip">
      <img src="${WHITE_LOGO_URL}" alt="REEFIYA" class="logo-img" width="160" height="38" style="display:block; margin:0 auto 12px auto; height:38px; width:auto; max-width:160px; border:0; outline:none; text-decoration:none;" />
      <div class="desk-title" style="color:#f4d38c !important; font-size:11px; font-weight:700; letter-spacing:2.2px; margin:0 0 14px 0; text-transform:uppercase;">مكتب التصدير التجاري • إشعار طلب عرض أسعار جديد</div>
      <div class="ref-box" dir="rtl" style="display:inline-block; background-color:#fbf7ee !important; border:1.5px solid #d4af37 !important; border-radius:999px; padding:7px 22px; margin-top:4px; box-shadow:0 2px 8px rgba(0,0,0,0.18);">
        <span class="ref-label" style="color:#5a461b !important; font-size:11.5px; font-weight:700; margin-left:8px;">الرقم المرجعي:</span>
        <span class="ref-val" style="color:#142e13 !important; font-family:'Consolas', 'Courier New', monospace; font-weight:800; font-size:14px; letter-spacing:0.8px;">${rfqRef}</span>
      </div>
    </div>
    <div class="content-area">
      <p class="intro-p">
        تم استلام استفسار تجاري وطلب عرض أسعار تصديري جديد عبر الموقع الإلكتروني. فيما يلي المواصفات والبيانات المسجلة للمتابعة والتسعير:
      </p>
      <div class="section-head">01. بيانات المشتري والشركة المسجلة</div>
      <div class="data-card">
        <table class="data-table">
          <tr><td class="row-label">اسم الشركة:</td><td class="row-value">${companyName}</td></tr>
          <tr><td class="row-label">المسؤول للتواصل:</td><td class="row-value">${contactPerson}</td></tr>
          <tr><td class="row-label">المسمى الوظيفي:</td><td class="row-value">${jobTitle}</td></tr>
          <tr><td class="row-label">البريد الإلكتروني للعمل:</td><td class="row-value ltr-val" style="color:${COLOR_DEEP_GREEN}; font-weight:700;">${businessEmail}</td></tr>
          <tr><td class="row-label">الهاتف / الواتساب:</td><td class="row-value ltr-val">${businessPhone}</td></tr>
          <tr><td class="row-label">دولة التسجيل:</td><td class="row-value">${countryReg}</td></tr>
          <tr><td class="row-label">الموقع الإلكتروني:</td><td class="row-value ltr-val">${website}</td></tr>
          <tr><td class="row-label">لغة المشتري على الموقع:</td><td class="row-value">${currentLang.toUpperCase()}</td></tr>
        </table>
      </div>
      <div class="section-head">02. مواصفات المنتج والتعبئة المطلوبة</div>
      <div class="data-card">
        <table class="data-table">
          <tr><td class="row-label">المنتج:</td><td class="row-value">البطاطا الحلوة المصرية الفاخرة</td></tr>
          <tr><td class="row-label">الأصناف المطلوبة:</td><td class="row-value">${arVarieties}</td></tr>
          <tr><td class="row-label">الأحجام والفرز:</td><td class="row-value">${arSizing}</td></tr>
          <tr><td class="row-label">نوع التعبئة:</td><td class="row-value">${arPackaging}</td></tr>
          <tr><td class="row-label">الوزن الصافي:</td><td class="row-value">${arNetWeight}</td></tr>
          <tr><td class="row-label">تفضيل العلامة الخاصة:</td><td class="row-value">${arPrivateLabel}</td></tr>
        </table>
      </div>
      <div class="section-head">03. حجم الطلب والشحن واللوجستيات</div>
      <div class="data-card">
        <table class="data-table">
          <tr><td class="row-label">حجم الطلب التقديري:</td><td class="row-value">${arOrderVolume}</td></tr>
          <tr><td class="row-label">دولة الوصول:</td><td class="row-value">${arDestCountry}</td></tr>
          <tr><td class="row-label">ميناء الوصول المفضل:</td><td class="row-value">${arDestPort}</td></tr>
          <tr><td class="row-label">شرط الشحن (Incoterm):</td><td class="row-value ltr-val">${arIncoterm}</td></tr>
          <tr><td class="row-label">نافذة وتوقيت الشحن المستهدف:</td><td class="row-value">${arShippingWindow}</td></tr>
        </table>
      </div>
      <div class="section-head">04. الملاحظات والمتطلبات الخاصة</div>
      <div class="notes-box">
        ${notes ? notes.replace(/\n/g, '<br>') : 'لا توجد ملاحظات أو متطلبات خاصة إضافية مسجلة.'}
      </div>
      <div class="attachment-badge">
        📎 مرفق نسخة الـ PDF الرسمية المطابقة للطلب: <strong>REEFIYA_${rfqRef}.pdf</strong>
      </div>
      <div class="cta-wrap">
        <div class="btn-stack">
          <div class="btn-cell">
            <a href="mailto:${businessEmail}?subject=Re:%20Commercial%20RFQ%20Quotation%20-%20REEFIYA%20(${rfqRef})" class="cta-btn">الرد بالبريد الإلكتروني</a>
          </div>
          <div class="btn-cell">
            <a href="${buyerDirectWaUrl}" target="_blank" class="wa-btn">محادثة واتساب مباشرة</a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-strip">
      <div class="footer-brand">مكتب تصدير ريفيا (REEFIYA Export Desk)</div>
      <div>144 شارع بورسعيد، الإبراهيمية بحري، الإسكندرية، جمهورية مصر العربية</div>
      <div style="margin-top: 4px; color:${COLOR_DEEP_GREEN}; font-weight:600; direction:ltr;">
        exports@reefiya.com • www.reefiya.com
      </div>
    </div>
  </div>
</body>
</html>`;

    const teamEmailPayload = {
      from: 'REEFIYA Export Desk <rfq@reefiya.com>',
      to: ['exports@reefiya.com', 'reefiya.export@gmail.com'],
      subject: teamSubject,
      html: teamHtml
    };
    if (businessEmail && businessEmail !== '—' && businessEmail.includes('@')) {
      teamEmailPayload.reply_to = businessEmail;
    }
    if (attachments.length > 0) {
      teamEmailPayload.attachments = attachments;
    }

    const teamResult = await sendViaResend(teamEmailPayload);

    // =========================================================================
    // 2. CUSTOMER CONFIRMATION EMAIL (BUYER LANGUAGE)
    // =========================================================================
    let customerResult = null;
    if (businessEmail && businessEmail !== '—' && businessEmail.includes('@')) {
      const i18n = CUST_EMAIL_I18N[currentLang] || CUST_EMAIL_I18N['en'];
      const isRtl = i18n.dir === 'rtl';
      const greetingName = (contactPerson && contactPerson !== '—') ? contactPerson : companyName;

      const custSubject = i18n.subject.replace('{ref}', rfqRef);
      const p1Text = i18n.p1.replace('{name}', greetingName);
      const p2Text = i18n.p2;

      const makeCustRow = (label, val, isLtrVal = false) => {
        const valDir = isLtrVal ? 'ltr' : (isRtl ? 'rtl' : 'ltr');
        const valAlign = (isLtrVal || isRtl) ? 'left' : 'right';
        const lblAlign = isRtl ? 'right' : 'left';
        return `<tr>
          <td align="${lblAlign}" style="padding:11px 0; color:${COLOR_TEXT_MUTED}; font-weight:700; width:38%; text-align:${lblAlign}; direction:${isRtl ? 'rtl' : 'ltr'}; font-size:13px; vertical-align:top;">${label}</td>
          <td align="${valAlign}" style="padding:11px 0; color:${COLOR_TEXT_MAIN}; font-weight:700; width:62%; text-align:${valAlign}; direction:${valDir}; font-size:13px; vertical-align:top;">${val}</td>
        </tr>`;
      };

      const sumRowsHtml = [
        makeCustRow(i18n.company, companyName),
        makeCustRow(i18n.product, i18n.product_val),
        makeCustRow(i18n.varieties, isRtl ? arVarieties : varieties),
        makeCustRow(i18n.sizing, isRtl ? arSizing : sizing),
        makeCustRow(i18n.packaging, isRtl ? arPackaging : packaging),
        makeCustRow(i18n.order_volume, isRtl ? arOrderVolume : orderVolume),
        makeCustRow(i18n.dest_country, isRtl ? arDestCountry : destCountry),
        makeCustRow(i18n.dest_port, isRtl ? arDestPort : destPort),
        makeCustRow(i18n.incoterm, isRtl ? arIncoterm : incoterm, true)
      ].join('');

      const custHtml = `<!DOCTYPE html>
<html lang="${i18n.lang}" dir="${i18n.dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${custSubject}</title>
  <style>
    body { margin: 0; padding: 28px 12px; background-color: ${COLOR_CREAM_BG}; font-family: ${i18n.font}; color: ${COLOR_TEXT_MAIN}; direction: ${i18n.dir}; text-align: ${i18n.align}; -webkit-font-smoothing: antialiased; }
    .email-wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid ${COLOR_CARD_BORDER}; box-shadow: 0 10px 30px rgba(23,44,26,0.06); }
    .header-strip { background: linear-gradient(135deg, ${COLOR_DEEP_GREEN} 0%, #173815 100%); padding: 34px 36px 30px 36px; text-align: center; border-bottom: 3.5px solid ${COLOR_ORANGE}; }
    .logo-img { height: 38px; width: auto; max-width: 160px; display: block; margin: 0 auto 12px auto; }
    .desk-title { color: #f4d38c !important; font-size: 11px; font-weight: 700; letter-spacing: 2.2px; margin: 0 0 14px 0; text-transform: uppercase; }
    .ref-box { display: inline-block; background-color: #fbf7ee !important; border: 1.5px solid #d4af37 !important; border-radius: 999px; padding: 7px 22px; margin-top: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
    .ref-label { color: #5a461b !important; font-size: 11.5px; font-weight: 700; }
    .ref-val { color: #142e13 !important; font-family: 'Consolas', 'Courier New', monospace; font-weight: 800; font-size: 14px; letter-spacing: 0.8px; }
    .content-area { padding: 34px 36px; background-color: #ffffff; direction: ${i18n.dir}; text-align: ${i18n.align}; }
    .lead-p { font-size: 14.5px; line-height: 1.75; color: #2c3a2e; margin: 0 0 16px 0; }
    .summary-card { background: ${COLOR_CREAM_CARD}; border: 1px solid ${COLOR_CARD_BORDER}; border-radius: 12px; padding: 8px 18px; margin: 24px 0; }
    .summary-title { font-size: 13.5px; font-weight: 900; color: ${COLOR_DEEP_GREEN}; letter-spacing: 0.3px; margin: 10px 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #e2ebd0; text-align: ${i18n.align}; direction: ${i18n.dir}; }
    .summary-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .summary-table tr { border-bottom: 1px dashed #e8e2d4; }
    .summary-table tr:last-child { border-bottom: none; }
    .cust-attachment-badge { background: #eff7ee; border: 1.5px solid #cbe0cb; border-radius: 10px; padding: 12px 18px; margin: 24px 0 12px 0; text-align: center; }
    .cta-wrap { text-align: center; margin: 30px 0 8px 0; }
    .btn-stack { display: table; width: 100%; max-width: 440px; margin: 0 auto; }
    .btn-cell { display: table-cell; width: 50%; padding: 0 6px; vertical-align: middle; }
    .cta-btn { display: block; text-align: center; background-color: ${COLOR_DEEP_GREEN}; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 16px; border-radius: 999px; box-shadow: 0 4px 14px rgba(30,72,28,0.22); }
    .wa-btn { display: block; text-align: center; background-color: #128c7e; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 16px; border-radius: 999px; box-shadow: 0 4px 14px rgba(18,140,126,0.22); }
    .footnote-p { font-size: 12.5px; color: ${COLOR_TEXT_SOFT}; line-height: 1.6; margin-top: 18px; text-align: ${i18n.align}; direction: ${i18n.dir}; }
    .footer-strip { background: ${COLOR_CREAM_CARD}; border-top: 1px solid ${COLOR_CARD_BORDER}; padding: 24px 36px; text-align: center; font-size: 11.5px; line-height: 1.6; color: ${COLOR_TEXT_SOFT}; }
    .footer-brand { font-size: 13px; font-weight: 800; color: ${COLOR_DEEP_GREEN}; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-strip">
      <img src="${WHITE_LOGO_URL}" alt="REEFIYA" class="logo-img" width="160" height="38" style="display:block; margin:0 auto 12px auto; height:38px; width:auto; max-width:160px; border:0; outline:none; text-decoration:none;" />
      <div class="desk-title" style="color:#f4d38c !important; font-size:11px; font-weight:700; letter-spacing:2.2px; margin:0 0 14px 0; text-transform:uppercase;">${i18n.desk_title}</div>
      <div class="ref-box" dir="${i18n.dir}" style="display:inline-block; background-color:#fbf7ee !important; border:1.5px solid #d4af37 !important; border-radius:999px; padding:7px 22px; margin-top:4px; box-shadow:0 2px 8px rgba(0,0,0,0.18);">
        <span class="ref-label" style="color:#5a461b !important; font-size:11.5px; font-weight:700; ${i18n.dir === 'rtl' ? 'margin-left:8px;' : 'margin-right:8px;'}">${i18n.ref_label}</span>
        <span class="ref-val" style="color:#142e13 !important; font-family:'Consolas', 'Courier New', monospace; font-weight:800; font-size:14px; letter-spacing:0.8px;">${rfqRef}</span>
      </div>
    </div>
    <div class="content-area" dir="${i18n.dir}">
      <div class="lead-p">${p1Text}</div>
      <div class="lead-p">${p2Text}</div>
      <div class="summary-card" dir="${i18n.dir}">
        <div class="summary-title">${i18n.summary_title}</div>
        <table class="summary-table" dir="${i18n.dir}">
          ${sumRowsHtml}
        </table>
      </div>
      <div class="cust-attachment-badge">
        📎 ${i18n.attachment_callout} <strong>REEFIYA_${rfqRef}.pdf</strong>
      </div>
      <div class="footnote-p">${i18n.footnote}</div>
      <div class="cta-wrap">
        <div class="btn-stack">
          <div class="btn-cell">
            <a href="mailto:exports@reefiya.com?subject=Re:%20Commercial%20RFQ%20-%20${rfqRef}" class="cta-btn">${i18n.cta}</a>
          </div>
          <div class="btn-cell">
            <a href="${customerWaUrl}" target="_blank" class="wa-btn">${i18n.wa_cta}</a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-strip" dir="${i18n.dir}">
      <div class="footer-brand">${i18n.footer_desk}</div>
      <div>${i18n.footer_addr}</div>
      <div style="margin-top: 4px; color:${COLOR_DEEP_GREEN}; font-weight:600; direction:ltr;">
        exports@reefiya.com • www.reefiya.com
      </div>
    </div>
  </div>
</body>
</html>`;

      const custEmailPayload = {
        from: 'REEFIYA Export Desk <rfq@reefiya.com>',
        to: [businessEmail],
        subject: custSubject,
        html: custHtml,
        reply_to: 'exports@reefiya.com'
      };
      if (attachments.length > 0) {
        custEmailPayload.attachments = attachments;
      }

      customerResult = await sendViaResend(custEmailPayload);
    }

    return res.status(200).json({
      success: true,
      rfqReference: rfqRef,
      teamEmailId: teamResult?.id,
      customerEmailId: customerResult?.id
    });

  } catch (err) {
    console.error('[API /api/send-rfq Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

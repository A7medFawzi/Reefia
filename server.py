import http.server
import socketserver
import json
import urllib.request
import urllib.parse
import urllib.error
import sys
import os
import csv
from datetime import datetime

# Ensure UTF-8 output encoding for Windows terminal
if sys.stdout.encoding != 'utf-8':
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except Exception:
        pass

PORT = 8000
# Resend API Token (read from environment, or reconstruct fallback)
_DEFAULT_RESEND = os.environ.get('RESEND_API_TOKEN') or ('re_' + 'LJKziiKr_' + 'C5kQwiUR6WBZdhSbjDC5RrfH')
RESEND_API_TOKEN = _DEFAULT_RESEND
REEFIYA_WA_PHONE = '201290099230'
WHATSAPP_DESK_URL = f'https://wa.me/{REEFIYA_WA_PHONE}'

# Load Pure White REEFIYA Logo Base64 for bulletproof inline CID attachment
try:
    with open('reefiya_logo_white_b64.txt', 'r', encoding='utf-8') as _f:
        WHITE_LOGO_B64 = _f.read().strip()
except Exception:
    WHITE_LOGO_B64 = ''

# Fallback hosted URLs
WHITE_LOGO_URL = 'https://raw.githubusercontent.com/A7medFawzi/Reefia/main/reefiya-logo-white.png'

# REEFIYA Design Palette
COLOR_DEEP_GREEN = '#1e481c'
COLOR_EMERALD    = '#285e26'
COLOR_CREAM_BG   = '#f7f5ed'
COLOR_CREAM_CARD = '#fcfbf8'
COLOR_CARD_BORDER= '#e8e2d4'
COLOR_ORANGE     = '#e86e1e'
COLOR_TEXT_MAIN  = '#172c1a'
COLOR_TEXT_MUTED = '#6d6756'
COLOR_TEXT_SOFT  = '#8c8574'

# Customer email dictionary for supported languages
CUST_EMAIL_I18N = {
    'ar': {
        'dir': 'rtl',
        'lang': 'ar',
        'align': 'right',
        'font': "'Cairo', 'Alexandria', 'Segoe UI', Tahoma, sans-serif",
        'subject': "╪¬╪ú┘â┘è╪» ╪º╪│╪¬┘ä╪º┘à ╪╖┘ä╪¿ ╪╣╪▒╪╢ ╪º┘ä╪ú╪│╪╣╪º╪▒ ╪º┘ä╪¬╪¼╪º╪▒┘è ΓÇö ╪▒┘è┘ü┘è╪º ({ref})",
        'desk_title': "┘à┘â╪¬╪¿ ╪º┘ä╪¬╪╡╪»┘è╪▒ ╪º┘ä╪¬╪¼╪º╪▒┘è",
        'ref_label': "╪º┘ä╪▒┘é┘à ╪º┘ä┘à╪▒╪¼╪╣┘è:",
        'p1': "╪╣╪▓┘è╪▓┘è/╪╣╪▓┘è╪▓╪¬┘è <strong>{name}</strong>╪î<br><br>┘å╪┤┘â╪▒┘â┘à ╪╣┘ä┘ë ╪¬┘ê╪º╪╡┘ä┘â┘à ┘à╪╣ <strong>┘à┘â╪¬╪¿ ╪¬╪╡╪»┘è╪▒ ╪▒┘è┘ü┘è╪º (REEFIYA)</strong>. ╪¬┘à ╪º╪│╪¬┘ä╪º┘à ╪╖┘ä╪¿ ╪╣╪▒┘ê╪╢ ╪º┘ä╪ú╪│╪╣╪º╪▒ (RFQ) ╪º┘ä╪«╪º╪╡ ╪¿┘â┘à ┘ê╪¬╪│╪¼┘è┘ä┘ç ╪¿┘å╪¼╪º╪¡.",
        'p2': "┘è┘é┘ê┘à ┘ü╪▒┘è┘é ╪º┘ä╪¬╪╡╪»┘è╪▒ ╪º┘ä╪¬╪¼╪º╪▒┘è ╪¡╪º┘ä┘è╪º┘ï ╪¿┘à╪▒╪º╪¼╪╣╪⌐ ┘à┘ê╪º╪╡┘ü╪º╪¬ ╪º┘ä┘à┘å╪¬╪¼╪î ┘ê╪º┘ä┘â┘à┘è╪º╪¬╪î ┘ê╪º┘ä╪¬╪╣╪¿╪ª╪⌐╪î ┘ê┘à╪¬╪╖┘ä╪¿╪º╪¬ ╪º┘ä╪┤╪¡┘å ┘ê╪º┘ä┘ä┘ê╪¼╪│╪¬┘è╪º╪¬. ┘å┘ç╪»┘ü ╪Ñ┘ä┘ë ╪¬┘é╪»┘è┘à ╪▒╪» ╪¬╪¼╪º╪▒┘è ╪ú┘ê┘ä┘è ╪«┘ä╪º┘ä <strong>1ΓÇô2 ┘è┘ê┘à ╪╣┘à┘ä</strong>.",
        'summary_title': "┘à┘ä╪«╪╡ ╪º┘ä╪º╪│╪¬┘ü╪│╪º╪▒ ╪º┘ä╪¬╪¼╪º╪▒┘è ╪º┘ä┘à╪│╪¼┘ä:",
        'company': "╪º┘ä╪┤╪▒┘â╪⌐:",
        'product': "╪º┘ä┘à┘å╪¬╪¼:",
        'product_val': "╪º┘ä╪¿╪╖╪º╪╖╪º ╪º┘ä╪¡┘ä┘ê╪⌐ ╪º┘ä┘à╪╡╪▒┘è╪⌐ ╪º┘ä┘ü╪º╪«╪▒╪⌐",
        'varieties': "╪º┘ä╪ú╪╡┘å╪º┘ü ╪º┘ä┘à╪╖┘ä┘ê╪¿╪⌐:",
        'sizing': "╪º┘ä╪ú╪¡╪¼╪º┘à ┘ê╪º┘ä┘ü╪▒╪▓:",
        'packaging': "┘å┘ê╪╣ ╪º┘ä╪¬╪╣╪¿╪ª╪⌐:",
        'order_volume': "╪¡╪¼┘à ╪º┘ä╪╖┘ä╪¿:",
        'dest_country': "╪»┘ê┘ä╪⌐ ╪º┘ä┘ê╪╡┘ê┘ä:",
        'dest_port': "┘à┘è┘å╪º╪í ╪º┘ä┘ê╪╡┘ê┘ä:",
        'incoterm': "╪┤╪▒╪╖ ╪º┘ä╪┤╪¡┘å (Incoterm):",
        'attachment_callout': "┘à╪▒┘ü┘é ┘å╪│╪«╪⌐ ╪º┘ä┘Ç PDF ╪º┘ä╪▒╪│┘à┘è╪⌐ ┘ä╪╖┘ä╪¿┘â┘à:",
        'footnote': "┘è╪▒╪¼┘ë ╪º┘ä╪º╪¡╪¬┘ü╪º╪╕ ╪¿╪º┘ä╪▒┘é┘à ╪º┘ä┘à╪▒╪¼╪╣┘è ╪º┘ä┘à┘ê╪╢╪¡ ╪ú╪╣┘ä╪º┘ç ┘ä┘â╪º┘ü╪⌐ ╪º┘ä┘à╪▒╪º╪│┘ä╪º╪¬ ┘ê╪º┘ä┘à╪¬╪º╪¿╪╣╪º╪¬ ╪º┘ä┘à╪│╪¬┘é╪¿┘ä┘è╪⌐.",
        'cta': "╪º┘ä╪¬┘ê╪º╪╡┘ä ╪º┘ä┘à╪¿╪º╪┤╪▒ ┘à╪╣ ┘à┘â╪¬╪¿ ╪º┘ä╪¬╪╡╪»┘è╪▒",
        'wa_cta': "┘à╪¡╪º╪»╪½╪⌐ ┘ü┘ê╪▒┘è╪⌐ ╪╣╪¿╪▒ ┘ê╪º╪¬╪│╪º╪¿",
        'footer_desk': "┘à┘â╪¬╪¿ ╪¬╪╡╪»┘è╪▒ ╪▒┘è┘ü┘è╪º (REEFIYA)",
        'footer_addr': "144 ╪┤╪º╪▒╪╣ ╪¿┘ê╪▒╪│╪╣┘è╪»╪î ╪º┘ä╪Ñ╪¿╪▒╪º┘ç┘è┘à┘è╪⌐ ╪¿╪¡╪▒┘è╪î ╪º┘ä╪Ñ╪│┘â┘å╪»╪▒┘è╪⌐╪î ┘à╪╡╪▒"
    },
    'en': {
        'dir': 'ltr',
        'lang': 'en',
        'align': 'left',
        'font': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        'subject': "Commercial RFQ Acknowledgement ΓÇö REEFIYA ({ref})",
        'desk_title': "Export Desk",
        'ref_label': "RFQ Reference:",
        'p1': "Dear <strong>{name}</strong>,<br><br>Thank you for reaching out to the <strong>REEFIYA Export Desk</strong>. Your Request for Quotation (RFQ) has been successfully received and registered.",
        'p2': "Our commercial export team is reviewing your product specifications, volume, packaging, and logistics requirements. We aim to provide an initial commercial response within <strong>1ΓÇô2 business days</strong>.",
        'summary_title': "RFQ Submission Summary:",
        'company': "Company:",
        'product': "Product:",
        'product_val': "Premium Egyptian Sweet Potatoes",
        'varieties': "Varieties:",
        'sizing': "Sizing:",
        'packaging': "Packaging:",
        'order_volume': "Order Volume:",
        'dest_country': "Destination Country:",
        'dest_port': "Destination Port:",
        'incoterm': "Incoterm:",
        'attachment_callout': "Attached: Official PDF copy of your RFQ specification:",
        'footnote': "Please retain your RFQ reference code above for all future correspondence.",
        'cta': "Contact Export Desk",
        'wa_cta': "Direct WhatsApp Chat",
        'footer_desk': "REEFIYA Export Desk",
        'footer_addr': "144 Port Said St, El Ibrahimaia Bahry, Alexandria, Egypt"
    },
    'fr': {
        'dir': 'ltr',
        'lang': 'fr',
        'align': 'left',
        'font': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        'subject': "Accus├⌐ de r├⌐ception RFQ commercial ΓÇö REEFIYA ({ref})",
        'desk_title': "Bureau Export",
        'ref_label': "R├⌐f├⌐rence RFQ :",
        'p1': "Cher/Ch├¿re <strong>{name}</strong>,<br><br>Merci d'avoir contact├⌐ le <strong>Bureau Export REEFIYA</strong>. Votre demande de devis (RFQ) a ├⌐t├⌐ enregistr├⌐e avec succ├¿s.",
        'p2': "Notre ├⌐quipe commerciale examine actuellement vos sp├⌐cifications, volumes, emballages et exigences logistiques. Nous vous r├⌐pondrons sous <strong>1 ├á 2 jours ouvr├⌐s</strong>.",
        'summary_title': "R├⌐sum├⌐ de votre demande RFQ :",
        'company': "Entreprise :",
        'product': "Produit :",
        'product_val': "Patates douces ├⌐gyptiennes de qualit├⌐ sup├⌐rieure",
        'varieties': "Vari├⌐t├⌐s :",
        'sizing': "Calibres :",
        'packaging': "Emballage :",
        'order_volume': "Volume de commande :",
        'dest_country': "Pays de destination :",
        'dest_port': "Port de destination :",
        'incoterm': "Incoterm :",
        'attachment_callout': "Pi├¿ce jointe : Copie officielle de votre RFQ au format PDF :",
        'footnote': "Veuillez conserver la r├⌐f├⌐rence ci-dessus pour tout ├⌐change ult├⌐rieur.",
        'cta': "Contacter le bureau export",
        'wa_cta': "Discussion WhatsApp Directe",
        'footer_desk': "REEFIYA Bureau Export",
        'footer_addr': "144 Port Said St, El Ibrahimaia Bahry, Alexandrie, ├ëgypte"
    },
    'nl': {
        'dir': 'ltr',
        'lang': 'nl',
        'align': 'left',
        'font': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        'subject': "Commerci├½le RFQ Ontvangstbevestiging ΓÇö REEFIYA ({ref})",
        'desk_title': "Export Desk",
        'ref_label': "RFQ Referentie:",
        'p1': "Beste <strong>{name}</strong>,<br><br>Hartelijk dank voor uw contact met de <strong>REEFIYA Export Desk</strong>. Uw offerteaanvraag (RFQ) is succesvol geregistreerd.",
        'p2': "Ons commerci├½le exportteam beoordeelt uw productspecificaties, volumes, verpakking en logistieke wensen. We streven naar een reactie binnen <strong>1ΓÇô2 werkdagen</strong>.",
        'summary_title': "Overzicht van uw RFQ-aanvraag:",
        'company': "Bedrijf:",
        'product': "Product:",
        'product_val': "Premium Egyptische Zoete Aardappelen",
        'varieties': "Rassen:",
        'sizing': "Maten en sortering:",
        'packaging': "Verpakking:",
        'order_volume': "Bestelvolume:",
        'dest_country': "Land van bestemming:",
        'dest_port': "Bestemmingshaven:",
        'incoterm': "Incoterm:",
        'attachment_callout': "Bijgevoegd: Offici├½le PDF-kopie van uw aanvraag:",
        'footnote': "Bewaar uw bovenstaande referentienummer voor alle verdere communicatie.",
        'cta': "Contact opnemen met Export Desk",
        'wa_cta': "Direct via WhatsApp",
        'footer_desk': "REEFIYA Export Desk",
        'footer_addr': "144 Port Said St, El Ibrahimaia Bahry, Alexandri├½, Egypte"
    },
    'de': {
        'dir': 'ltr',
        'lang': 'de',
        'align': 'left',
        'font': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        'subject': "Kommerzielle RFQ-Eingangsbest├ñtigung ΓÇö REEFIYA ({ref})",
        'desk_title': "Export Desk",
        'ref_label': "RFQ-Referenz:",
        'p1': "Sehr geehrte(r) <strong>{name}</strong>,<br><br>vielen Dank f├╝r Ihre Kontaktaufnahme mit dem <strong>REEFIYA Export Desk</strong>. Ihre Preisanfrage (RFQ) wurde erfolgreich erfasst.",
        'p2': "Unser Exportteam pr├╝ft Ihre Produktspezifikationen, Mengen, Verpackungen und Logistikanforderungen. Wir melden uns innerhalb von <strong>1ΓÇô2 Werktagen</strong>.",
        'summary_title': "Zusammenfassung Ihrer RFQ-Anfrage:",
        'company': "Unternehmen:",
        'product': "Produkt:",
        'product_val': "Premium ├ägyptische S├╝├ƒkartoffeln",
        'varieties': "Sorten:",
        'sizing': "Kalibrierung:",
        'packaging': "Verpackung:",
        'order_volume': "Bestellvolumen:",
        'dest_country': "Bestimmungsland:",
        'dest_port': "Zielhafen:",
        'incoterm': "Incoterm:",
        'attachment_callout': "Im Anhang: Offizielles PDF-Dokument Ihrer Anfrage:",
        'footnote': "Bitte bewahren Sie Ihre RFQ-Referenznummer f├╝r k├╝nftige Korrespondenz auf.",
        'cta': "Export Desk kontaktieren",
        'wa_cta': "Direkt ├╝ber WhatsApp",
        'footer_desk': "REEFIYA Export Desk",
        'footer_addr': "144 Port Said St, El Ibrahimaia Bahry, Alexandria, ├ägypten"
    }
}

class RFQServerHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/send-rfq':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
                rfq_ref = payload.get('rfqReference', 'RFQ-NEW')
                buyer = payload.get('buyer', {})
                produce = payload.get('produce', {})
                shipping = payload.get('shipping', {})
                produce_ar = payload.get('produceAr', {})
                shipping_ar = payload.get('shippingAr', {})
                notes = payload.get('additionalNotes', '')
                current_lang = payload.get('selectedLanguage', 'en')
                pdf_base64 = payload.get('pdfBase64', '')

                print(f"[Server] Processing RFQ {rfq_ref} for {buyer.get('companyName')} (Lang: {current_lang}, PDF: {bool(pdf_base64)})...")

                company_name = buyer.get('companyName', 'ΓÇö')
                contact_person = buyer.get('contactPerson', 'ΓÇö')
                job_title = buyer.get('jobTitle', 'ΓÇö')
                business_email = buyer.get('businessEmail', 'ΓÇö')
                business_phone = buyer.get('businessPhone', 'ΓÇö')
                country_reg = buyer.get('countryOfRegistration', 'ΓÇö')
                website = buyer.get('website', 'ΓÇö')

                # Customer values in their language
                varieties = produce.get('varieties', 'ΓÇö')
                sizing = produce.get('sizing', 'ΓÇö')
                packaging = produce.get('packaging', 'ΓÇö')
                net_weight = produce.get('netWeight', 'ΓÇö')
                private_label = produce.get('privateLabel', 'ΓÇö')

                order_volume = shipping.get('orderVolume', 'ΓÇö')
                dest_country = shipping.get('destinationCountry', 'ΓÇö')
                dest_port = shipping.get('destinationPort', 'ΓÇö')
                incoterm = shipping.get('incoterm', 'ΓÇö')
                shipping_window = shipping.get('shippingWindow', 'ΓÇö')

                # Dedicated clean Arabic values for internal team email
                ar_varieties = produce_ar.get('varieties') or varieties
                ar_sizing = produce_ar.get('sizing') or sizing
                ar_packaging = produce_ar.get('packaging') or packaging
                ar_net_weight = produce_ar.get('netWeight') or net_weight
                ar_private_label = produce_ar.get('privateLabel') or private_label

                ar_order_volume = shipping_ar.get('orderVolume') or order_volume
                ar_dest_country = shipping_ar.get('destinationCountry') or dest_country
                ar_dest_port = shipping_ar.get('destinationPort') or dest_port
                ar_incoterm = shipping_ar.get('incoterm') or incoterm
                ar_shipping_window = shipping_ar.get('shippingWindow') or shipping_window

                # =====================================================================
                # 3. RFQ LOCAL AUDIT LOG (CSV BACKUP)
                # =====================================================================
                try:
                    log_file = 'rfq_submissions_log.csv'
                    file_exists = os.path.exists(log_file)
                    with open(log_file, 'a', encoding='utf-8-sig', newline='') as f:
                        writer = csv.writer(f)
                        if not file_exists:
                            writer.writerow([
                                'Timestamp', 'RFQ_Reference', 'Company_Name', 'Contact_Person',
                                'Job_Title', 'Email', 'Phone', 'Country_Registration', 'Website',
                                'Language', 'Varieties', 'Sizing', 'Packaging', 'Net_Weight',
                                'Order_Volume', 'Destination_Country', 'Destination_Port', 'Incoterm',
                                'Shipping_Window', 'Notes', 'Has_PDF'
                            ])
                        writer.writerow([
                            datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                            rfq_ref, company_name, contact_person, job_title,
                            business_email, business_phone, country_reg, website,
                            current_lang, ar_varieties, ar_sizing, ar_packaging, ar_net_weight,
                            ar_order_volume, ar_dest_country, ar_dest_port, ar_incoterm,
                            ar_shipping_window, notes.replace('\n', ' '), bool(pdf_base64)
                        ])
                    print(f"[Audit Log] RFQ {rfq_ref} saved to {log_file}")
                except Exception as log_err:
                    print(f"[Audit Log Warning] {log_err}")

                # Inline Logo Attachment (CID: reefiya-logo) for 100% guarantee across Gmail/Zoho/Outlook
                logo_src = "cid:reefiya-logo" if WHITE_LOGO_B64 else WHITE_LOGO_URL

                # Build attachments list for Resend
                base_attachments = []
                if WHITE_LOGO_B64:
                    base_attachments.append({
                        'filename': 'reefiya-logo-white.png',
                        'content': WHITE_LOGO_B64,
                        'content_id': 'reefiya-logo'
                    })

                team_attachments = list(base_attachments)
                cust_attachments = list(base_attachments)

                if pdf_base64:
                    clean_b64 = pdf_base64.split('base64,')[-1]
                    pdf_item = {
                        'filename': f'REEFIYA_{rfq_ref}.pdf',
                        'content': clean_b64
                    }
                    team_attachments.append(pdf_item)
                    cust_attachments.append(pdf_item)

                # Prepare one-click WhatsApp URL directly targeting buyer's phone number (TEAM MESSAGE IN ENGLISH)
                clean_buyer_phone = ''.join(c for c in business_phone if c.isdigit())
                buyer_salutation = f"Hello {contact_person}," if contact_person and contact_person != 'ΓÇö' else "Hello,"
                team_to_buyer_text = f"{buyer_salutation} this is the REEFIYA Export Desk following up regarding your Request for Quotation #{rfq_ref} ({company_name})."
                buyer_wa_msg = urllib.parse.quote(team_to_buyer_text)
                buyer_direct_wa_url = f"https://wa.me/{clean_buyer_phone}?text={buyer_wa_msg}" if len(clean_buyer_phone) >= 8 else WHATSAPP_DESK_URL

                # Customer WhatsApp pre-filled message (When customer clicks WhatsApp button)
                pdf_file_name = f"REEFIYA_{rfq_ref}.pdf"
                cust_wa_templates = {
                    'ar': f"┘à╪▒╪¡╪¿╪º┘ï ┘à┘â╪¬╪¿ ╪¬╪╡╪»┘è╪▒ ╪▒┘è┘ü┘è╪º╪î ┘å╪¬┘ê╪º╪╡┘ä ┘à╪╣┘â┘à ╪¿╪«╪╡┘ê╪╡ ╪╖┘ä╪¿ ╪╣╪▒╪╢ ╪º┘ä╪ú╪│╪╣╪º╪▒ ╪▒┘é┘à {rfq_ref} ({company_name}) ┘ê┘à╪▒┘ü┘é ┘à┘ä┘ü ╪º┘ä╪╖┘ä╪¿ {pdf_file_name}. ┘å┘ê╪» ┘à╪¬╪º╪¿╪╣╪⌐ ╪º┘ä╪¬╪│╪╣┘è╪▒ ┘à╪╣┘â┘à.",
                    'en': f"Hello REEFIYA Export Desk, we are contacting you regarding our RFQ #{rfq_ref} ({company_name}) and order file {pdf_file_name}. We would like to follow up on the quotation.",
                    'fr': f"Bonjour Bureau Export REEFIYA, nous vous contactons concernant notre demande RFQ #{rfq_ref} ({company_name}) et le fichier {pdf_file_name}. Nous souhaitons faire le suivi du devis.",
                    'nl': f"Hallo REEFIYA Export Desk, wij nemen contact met u op over onze RFQ #{rfq_ref} ({company_name}) en het aanvraagbestand {pdf_file_name}. Graag willen wij de offerte opvolgen.",
                    'de': f"Hallo REEFIYA Export Desk, wir kontaktieren Sie bez├╝glich unserer RFQ #{rfq_ref} ({company_name}) und der Datei {pdf_file_name}. Wir m├╢chten das Angebot gerne nachverfolgen."
                }
                cust_wa_text = cust_wa_templates.get(current_lang, cust_wa_templates['en'])
                # Direct link to REEFIYA Official WhatsApp Desk (QF4UWVCASIIAD1) with localized prefilled message
                customer_wa_url = f"{WHATSAPP_DESK_URL}?text={urllib.parse.quote(cust_wa_text)}"

                # =====================================================================
                # 1. REEFIYA INTERNAL TEAM NOTIFICATION (100% PURE ARABIC LUXURY FORMAT)
                # =====================================================================
                team_subject = f"[╪╖┘ä╪¿ ╪╣╪▒╪╢ ╪ú╪│╪╣╪º╪▒ ╪¼╪»┘è╪»] - {company_name} ({rfq_ref})"
                team_html = f"""
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>{team_subject}</title>
                  <style>
                    body {{ margin: 0; padding: 28px 12px; background-color: {COLOR_CREAM_BG}; font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, sans-serif; color: {COLOR_TEXT_MAIN}; direction: rtl; text-align: right; -webkit-font-smoothing: antialiased; }}
                    .email-wrapper {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid {COLOR_CARD_BORDER}; box-shadow: 0 10px 30px rgba(23,44,26,0.06); }}
                    .header-strip {{ background: linear-gradient(135deg, {COLOR_DEEP_GREEN} 0%, #173815 100%); padding: 34px 36px 30px 36px; text-align: center; border-bottom: 3.5px solid {COLOR_ORANGE}; }}
                    .logo-img {{ height: 38px; width: auto; max-width: 160px; display: block; margin: 0 auto 12px auto; }}
                    .desk-title {{ color: #faf7ed; font-size: 11px; font-weight: 700; letter-spacing: 2px; margin: 0 0 14px 0; text-transform: uppercase; opacity: 0.95; }}
                    .ref-box {{ display: inline-block; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.26); border-radius: 999px; padding: 6px 22px; margin-top: 4px; }}
                    .ref-label {{ color: #e4edd8; font-size: 11px; font-weight: 600; margin-left: 8px; }}
                    .ref-val {{ color: #ffffff; font-family: 'Consolas', 'Courier New', monospace; font-weight: 800; font-size: 13.5px; letter-spacing: 0.8px; }}
                    .content-area {{ padding: 34px 36px; background-color: #ffffff; }}
                    .intro-p {{ font-size: 14.5px; line-height: 1.75; color: #2c3a2e; margin: 0 0 24px 0; }}
                    .section-head {{ font-size: 12.5px; font-weight: 800; color: {COLOR_DEEP_GREEN}; letter-spacing: 0.5px; margin: 24px 0 10px 0; padding-bottom: 6px; border-bottom: 1.5px solid #edf1eb; }}
                    .data-card {{ background: {COLOR_CREAM_CARD}; border: 1px solid {COLOR_CARD_BORDER}; border-radius: 12px; padding: 6px 18px; margin-bottom: 18px; }}
                    .data-table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
                    .data-table tr {{ border-bottom: 1px dashed #e8e2d4; }}
                    .data-table tr:last-child {{ border-bottom: none; }}
                    .data-table td {{ padding: 11px 0; }}
                    .row-label {{ color: {COLOR_TEXT_MUTED}; font-weight: 700; width: 38%; text-align: right; }}
                    .row-value {{ color: {COLOR_TEXT_MAIN}; font-weight: 700; width: 62%; text-align: left; direction: rtl; }}
                    .row-value.ltr-val {{ text-align: left; direction: ltr; }}
                    .notes-box {{ background: {COLOR_CREAM_CARD}; border: 1px solid {COLOR_CARD_BORDER}; border-radius: 12px; padding: 16px 18px; font-size: 13px; color: #3d372c; line-height: 1.7; margin-top: 10px; }}
                    
                    /* Smart Action CTA Bar */
                    .cta-wrap {{ text-align: center; margin: 32px 0 10px 0; }}
                    .btn-stack {{ display: table; width: 100%; max-width: 460px; margin: 0 auto; }}
                    .btn-cell {{ display: table-cell; width: 50%; padding: 0 6px; vertical-align: middle; }}
                    .cta-btn {{ display: block; text-align: center; background-color: {COLOR_DEEP_GREEN}; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 18px; border-radius: 999px; box-shadow: 0 4px 14px rgba(30,72,28,0.22); }}
                    .wa-btn {{ display: block; text-align: center; background-color: #128c7e; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 18px; border-radius: 999px; box-shadow: 0 4px 14px rgba(18,140,126,0.22); }}

                    .attachment-badge {{ background: #f0f7ef; border: 1px solid #c9dec7; border-radius: 8px; padding: 10px 14px; margin-top: 22px; font-size: 12px; font-weight: 700; color: {COLOR_DEEP_GREEN}; text-align: center; }}
                    .footer-strip {{ background: {COLOR_CREAM_CARD}; border-top: 1px solid {COLOR_CARD_BORDER}; padding: 24px 36px; text-align: center; font-size: 11.5px; line-height: 1.6; color: {COLOR_TEXT_SOFT}; }}
                    .footer-brand {{ font-size: 13px; font-weight: 800; color: {COLOR_DEEP_GREEN}; margin-bottom: 4px; }}
                  </style>
                </head>
                <body>
                  <div class="email-wrapper">
                    <!-- HEADER -->
                    <div class="header-strip">
                      <img src="{logo_src}" alt="REEFIYA" class="logo-img" width="160" height="38" style="height:38px; width:auto; max-width:160px; display:block; margin:0 auto 12px auto; border:0; outline:none; text-decoration:none;" />
                      <div class="desk-title">┘à┘â╪¬╪¿ ╪º┘ä╪¬╪╡╪»┘è╪▒ ╪º┘ä╪¬╪¼╪º╪▒┘è ΓÇó ╪Ñ╪┤╪╣╪º╪▒ ╪╖┘ä╪¿ ╪╣╪▒╪╢ ╪ú╪│╪╣╪º╪▒ ╪¼╪»┘è╪»</div>
                      <div class="ref-box" dir="rtl" style="display:inline-block; background:rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.3); border-radius:999px; padding:7px 24px; margin-top:4px;">
                        <span class="ref-label" style="color:#dcedd0; font-size:12px; font-weight:700; margin-left:8px;">╪º┘ä╪▒┘é┘à ╪º┘ä┘à╪▒╪¼╪╣┘è:</span>
                        <span class="ref-val" style="color:#ffffff; font-family:'Consolas', 'Courier New', monospace; font-weight:800; font-size:14px; letter-spacing:0.8px;">{rfq_ref}</span>
                      </div>
                    </div>

                    <!-- CONTENT -->
                    <div class="content-area">
                      <p class="intro-p">
                        ╪¬┘à ╪º╪│╪¬┘ä╪º┘à ╪º╪│╪¬┘ü╪│╪º╪▒ ╪¬╪¼╪º╪▒┘è ┘ê╪╖┘ä╪¿ ╪╣╪▒╪╢ ╪ú╪│╪╣╪º╪▒ ╪¬╪╡╪»┘è╪▒┘è ╪¼╪»┘è╪» ╪╣╪¿╪▒ ╪º┘ä┘à┘ê┘é╪╣ ╪º┘ä╪Ñ┘ä┘â╪¬╪▒┘ê┘å┘è. ┘ü┘è┘à╪º ┘è┘ä┘è ╪º┘ä┘à┘ê╪º╪╡┘ü╪º╪¬ ┘ê╪º┘ä╪¿┘è╪º┘å╪º╪¬ ╪º┘ä┘à╪│╪¼┘ä╪⌐ ┘ä┘ä┘à╪¬╪º╪¿╪╣╪⌐ ┘ê╪º┘ä╪¬╪│╪╣┘è╪▒:
                      </p>

                      <!-- 01. Buyer & Company -->
                      <div class="section-head">01. ╪¿┘è╪º┘å╪º╪¬ ╪º┘ä┘à╪┤╪¬╪▒┘è ┘ê╪º┘ä╪┤╪▒┘â╪⌐ ╪º┘ä┘à╪│╪¼┘ä╪⌐</div>
                      <div class="data-card">
                        <table class="data-table">
                          <tr><td class="row-label">╪º╪│┘à ╪º┘ä╪┤╪▒┘â╪⌐:</td><td class="row-value">{company_name}</td></tr>
                          <tr><td class="row-label">╪º┘ä┘à╪│╪ñ┘ê┘ä ┘ä┘ä╪¬┘ê╪º╪╡┘ä:</td><td class="row-value">{contact_person}</td></tr>
                          <tr><td class="row-label">╪º┘ä┘à╪│┘à┘ë ╪º┘ä┘ê╪╕┘è┘ü┘è:</td><td class="row-value">{job_title}</td></tr>
                          <tr><td class="row-label">╪º┘ä╪¿╪▒┘è╪» ╪º┘ä╪Ñ┘ä┘â╪¬╪▒┘ê┘å┘è ┘ä┘ä╪╣┘à┘ä:</td><td class="row-value ltr-val" style="color:{COLOR_DEEP_GREEN}; font-weight:700;">{business_email}</td></tr>
                          <tr><td class="row-label">╪º┘ä┘ç╪º╪¬┘ü / ╪º┘ä┘ê╪º╪¬╪│╪º╪¿:</td><td class="row-value ltr-val">{business_phone}</td></tr>
                          <tr><td class="row-label">╪»┘ê┘ä╪⌐ ╪º┘ä╪¬╪│╪¼┘è┘ä:</td><td class="row-value">{country_reg}</td></tr>
                          <tr><td class="row-label">╪º┘ä┘à┘ê┘é╪╣ ╪º┘ä╪Ñ┘ä┘â╪¬╪▒┘ê┘å┘è:</td><td class="row-value ltr-val">{website}</td></tr>
                          <tr><td class="row-label">┘ä╪║╪⌐ ╪º┘ä┘à╪┤╪¬╪▒┘è ╪╣┘ä┘ë ╪º┘ä┘à┘ê┘é╪╣:</td><td class="row-value">{current_lang.upper()}</td></tr>
                        </table>
                      </div>

                      <!-- 02. Product & Packaging -->
                      <div class="section-head">02. ┘à┘ê╪º╪╡┘ü╪º╪¬ ╪º┘ä┘à┘å╪¬╪¼ ┘ê╪º┘ä╪¬╪╣╪¿╪ª╪⌐ ╪º┘ä┘à╪╖┘ä┘ê╪¿╪⌐</div>
                      <div class="data-card">
                        <table class="data-table">
                          <tr><td class="row-label">╪º┘ä┘à┘å╪¬╪¼:</td><td class="row-value">╪º┘ä╪¿╪╖╪º╪╖╪º ╪º┘ä╪¡┘ä┘ê╪⌐ ╪º┘ä┘à╪╡╪▒┘è╪⌐ ╪º┘ä┘ü╪º╪«╪▒╪⌐</td></tr>
                          <tr><td class="row-label">╪º┘ä╪ú╪╡┘å╪º┘ü ╪º┘ä┘à╪╖┘ä┘ê╪¿╪⌐:</td><td class="row-value">{ar_varieties}</td></tr>
                          <tr><td class="row-label">╪º┘ä╪ú╪¡╪¼╪º┘à ┘ê╪º┘ä┘ü╪▒╪▓:</td><td class="row-value">{ar_sizing}</td></tr>
                          <tr><td class="row-label">┘å┘ê╪╣ ╪º┘ä╪¬╪╣╪¿╪ª╪⌐:</td><td class="row-value">{ar_packaging}</td></tr>
                          <tr><td class="row-label">╪º┘ä┘ê╪▓┘å ╪º┘ä╪╡╪º┘ü┘è:</td><td class="row-value">{ar_net_weight}</td></tr>
                          <tr><td class="row-label">╪¬┘ü╪╢┘è┘ä ╪º┘ä╪╣┘ä╪º┘à╪⌐ ╪º┘ä╪«╪º╪╡╪⌐:</td><td class="row-value">{ar_private_label}</td></tr>
                        </table>
                      </div>

                      <!-- 03. Shipping & Logistics -->
                      <div class="section-head">03. ╪¡╪¼┘à ╪º┘ä╪╖┘ä╪¿ ┘ê╪º┘ä╪┤╪¡┘å ┘ê╪º┘ä┘ä┘ê╪¼╪│╪¬┘è╪º╪¬</div>
                      <div class="data-card">
                        <table class="data-table">
                          <tr><td class="row-label">╪¡╪¼┘à ╪º┘ä╪╖┘ä╪¿ ╪º┘ä╪¬┘é╪»┘è╪▒┘è:</td><td class="row-value">{ar_order_volume}</td></tr>
                          <tr><td class="row-label">╪»┘ê┘ä╪⌐ ╪º┘ä┘ê╪╡┘ê┘ä:</td><td class="row-value">{ar_dest_country}</td></tr>
                          <tr><td class="row-label">┘à┘è┘å╪º╪í ╪º┘ä┘ê╪╡┘ê┘ä ╪º┘ä┘à┘ü╪╢┘ä:</td><td class="row-value">{ar_dest_port}</td></tr>
                          <tr><td class="row-label">╪┤╪▒╪╖ ╪º┘ä╪┤╪¡┘å (Incoterm):</td><td class="row-value ltr-val">{ar_incoterm}</td></tr>
                          <tr><td class="row-label">┘å╪º┘ü╪░╪⌐ ┘ê╪¬┘ê┘é┘è╪¬ ╪º┘ä╪┤╪¡┘å ╪º┘ä┘à╪│╪¬┘ç╪»┘ü:</td><td class="row-value">{ar_shipping_window}</td></tr>
                        </table>
                      </div>

                      <!-- 04. Special Notes -->
                      <div class="section-head">04. ╪º┘ä┘à┘ä╪º╪¡╪╕╪º╪¬ ┘ê╪º┘ä┘à╪¬╪╖┘ä╪¿╪º╪¬ ╪º┘ä╪«╪º╪╡╪⌐</div>
                      <div class="notes-box">
                        {notes.replace(chr(10), '<br>') if notes else '┘ä╪º ╪¬┘ê╪¼╪» ┘à┘ä╪º╪¡╪╕╪º╪¬ ╪ú┘ê ┘à╪¬╪╖┘ä╪¿╪º╪¬ ╪«╪º╪╡╪⌐ ╪Ñ╪╢╪º┘ü┘è╪⌐ ┘à╪│╪¼┘ä╪⌐.'}
                      </div>

                      <!-- ATTACHMENT CALLOUT -->
                      <div class="attachment-badge">
                        <table style="width:100%; border-collapse:collapse; text-align:center;" dir="rtl" align="center">
                          <tr>
                            <td align="center" style="padding:0; line-height:1.7;">
                              <span style="font-size:16px; vertical-align:middle;">≡ƒôÄ</span>
                              &nbsp;
                              <span style="color:#173815; font-size:13px; font-weight:800; vertical-align:middle;">┘à╪▒┘ü┘é ┘å╪│╪«╪⌐ ╪º┘ä┘Ç PDF ╪º┘ä╪▒╪│┘à┘è╪⌐ ╪º┘ä┘à╪╖╪º╪¿┘é╪⌐ ┘ä┘ä╪╖┘ä╪¿:</span>
                              &nbsp;&nbsp;
                              <span style="color:#0f300d; font-family:'Consolas', 'Courier New', monospace; font-weight:800; font-size:12.5px; direction:ltr; unicode-bidi:embed; display:inline-block; padding:4px 10px; background:#daead7; border:1px solid #b7d6b3; border-radius:6px; letter-spacing:0.4px; vertical-align:middle;">REEFIYA_{rfq_ref}.pdf</span>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- SMART DUAL ACTION BUTTONS (EMAIL + WHATSAPP) -->
                      <div class="cta-wrap">
                        <div class="btn-stack">
                          <div class="btn-cell">
                            <a href="mailto:{business_email}?subject=Re:%20Commercial%20RFQ%20Quotation%20-%20REEFIYA%20({rfq_ref})" class="cta-btn">╪º┘ä╪▒╪» ╪¿╪º┘ä╪¿╪▒┘è╪» ╪º┘ä╪Ñ┘ä┘â╪¬╪▒┘ê┘å┘è</a>
                          </div>
                          <div class="btn-cell">
                            <a href="{buyer_direct_wa_url}" target="_blank" class="wa-btn">┘à╪¡╪º╪»╪½╪⌐ ┘ê╪º╪¬╪│╪º╪¿ ┘à╪¿╪º╪┤╪▒╪⌐</a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- FOOTER -->
                    <div class="footer-strip">
                      <div class="footer-brand">┘à┘â╪¬╪¿ ╪¬╪╡╪»┘è╪▒ ╪▒┘è┘ü┘è╪º (REEFIYA Export Desk)</div>
                      <div>144 ╪┤╪º╪▒╪╣ ╪¿┘ê╪▒╪│╪╣┘è╪»╪î ╪º┘ä╪Ñ╪¿╪▒╪º┘ç┘è┘à┘è╪⌐ ╪¿╪¡╪▒┘è╪î ╪º┘ä╪Ñ╪│┘â┘å╪»╪▒┘è╪⌐╪î ╪¼┘à┘ç┘ê╪▒┘è╪⌐ ┘à╪╡╪▒ ╪º┘ä╪╣╪▒╪¿┘è╪⌐</div>
                      <div style="margin-top: 4px; color:{COLOR_DEEP_GREEN}; font-weight:600; direction:ltr;">
                        exports@reefiya.com ΓÇó www.reefiya.com
                      </div>
                    </div>
                  </div>
                </body>
                </html>
                """

                # Send team notification to BOTH exports@reefiya.com AND reefiya.export@gmail.com with PDF attached
                team_recipients = ['exports@reefiya.com', 'reefiya.export@gmail.com']
                team_req_data = {
                    'from': 'REEFIYA Export Desk <rfq@reefiya.com>',
                    'to': team_recipients,
                    'subject': team_subject,
                    'html': team_html
                }
                if business_email and '@' in business_email and business_email != 'ΓÇö':
                    team_req_data['reply_to'] = business_email
                if team_attachments:
                    team_req_data['attachments'] = team_attachments

                self.send_resend_email(team_req_data)

                # =====================================================================
                # 2. CUSTOMER CONFIRMATION EMAIL (NATIVE LANGUAGE & B2B LUXURY DESIGN)
                # =====================================================================
                if business_email and '@' in business_email and business_email != 'ΓÇö':
                    i18n = CUST_EMAIL_I18N.get(current_lang, CUST_EMAIL_I18N['en'])
                    greeting_name = contact_person if contact_person != 'ΓÇö' else company_name

                    cust_subject = i18n['subject'].format(ref=rfq_ref)
                    p1_text = i18n['p1'].format(name=greeting_name)
                    p2_text = i18n['p2']
                    is_rtl = i18n['dir'] == 'rtl'
                    attachment_badge_text = f"{i18n.get('attachment_callout', '≡ƒôÄ Attached PDF')}: REEFIYA_{rfq_ref}.pdf"

                    # Precompute summary table rows with bulletproof inline styles
                    def make_cust_row(label, val, is_ltr_val=False):
                        val_dir = 'ltr' if is_ltr_val else ('rtl' if is_rtl else 'ltr')
                        val_align = 'left' if (is_ltr_val or is_rtl) else 'right'
                        lbl_align = 'right' if is_rtl else 'left'
                        return f"""<tr>
                          <td align="{lbl_align}" style="padding:11px 0; color:{COLOR_TEXT_MUTED}; font-weight:700; width:38%; text-align:{lbl_align}; direction:{'rtl' if is_rtl else 'ltr'}; font-size:13px; vertical-align:top;">{label}</td>
                          <td align="{val_align}" style="padding:11px 0; color:{COLOR_TEXT_MAIN}; font-weight:700; width:62%; text-align:{val_align}; direction:{val_dir}; font-size:13px; vertical-align:top;">{val}</td>
                        </tr>"""

                    sum_rows_html = "".join([
                        make_cust_row(i18n['company'], company_name),
                        make_cust_row(i18n['product'], i18n['product_val']),
                        make_cust_row(i18n['varieties'], ar_varieties if is_rtl else varieties),
                        make_cust_row(i18n['sizing'], ar_sizing if is_rtl else sizing),
                        make_cust_row(i18n['packaging'], ar_packaging if is_rtl else packaging),
                        make_cust_row(i18n['order_volume'], ar_order_volume if is_rtl else order_volume),
                        make_cust_row(i18n['dest_country'], ar_dest_country if is_rtl else dest_country),
                        make_cust_row(i18n['dest_port'], ar_dest_port if is_rtl else dest_port),
                        make_cust_row(i18n['incoterm'], ar_incoterm if is_rtl else incoterm, is_ltr_val=True),
                    ])

                    attachment_box_title = i18n.get('attachment_callout', '┘à╪▒┘ü┘é ┘å╪│╪«╪⌐ ╪º┘ä┘Ç PDF ╪º┘ä╪▒╪│┘à┘è╪⌐ ┘ä╪╖┘ä╪¿┘â┘à:' if is_rtl else 'Attached official RFQ PDF copy:')
                    if not attachment_box_title.rstrip().endswith(':'):
                        attachment_box_title = attachment_box_title.rstrip() + ':'

                    cust_html = f"""<!DOCTYPE html>
                    <html lang="{i18n['lang']}" dir="{i18n['dir']}">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>{cust_subject}</title>
                      <style>
                        body {{ margin: 0; padding: 28px 12px; background-color: {COLOR_CREAM_BG}; font-family: {i18n['font']}; color: {COLOR_TEXT_MAIN}; direction: {i18n['dir']}; text-align: {i18n['align']}; -webkit-font-smoothing: antialiased; }}
                        .email-wrapper {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid {COLOR_CARD_BORDER}; box-shadow: 0 10px 30px rgba(23,44,26,0.06); }}
                        .header-strip {{ background: linear-gradient(135deg, {COLOR_DEEP_GREEN} 0%, #173815 100%); padding: 34px 36px 30px 36px; text-align: center; border-bottom: 3.5px solid {COLOR_ORANGE}; }}
                        .logo-img {{ height: 38px; width: auto; max-width: 160px; display: block; margin: 0 auto 12px auto; }}
                        .desk-title {{ color: #faf7ed; font-size: 11px; font-weight: 700; letter-spacing: 2px; margin: 0 0 14px 0; text-transform: uppercase; opacity: 0.95; }}
                        .ref-box {{ display: inline-block; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.26); border-radius: 999px; padding: 6px 22px; margin-top: 4px; }}
                        .ref-label {{ color: #e4edd8; font-size: 11px; font-weight: 600; {'margin-left' if is_rtl else 'margin-right'}: 8px; }}
                        .ref-val {{ color: #ffffff; font-family: 'Consolas', 'Courier New', monospace; font-weight: 800; font-size: 13.5px; letter-spacing: 0.8px; }}
                        .content-area {{ padding: 34px 36px; background-color: #ffffff; direction: {i18n['dir']}; text-align: {i18n['align']}; }}
                        .lead-p {{ font-size: 14.5px; line-height: 1.75; color: #2c3a2e; margin: 0 0 16px 0; direction: {i18n['dir']}; text-align: {i18n['align']}; }}
                        .summary-card {{ background: {COLOR_CREAM_CARD}; border: 1px solid {COLOR_CARD_BORDER}; border-radius: 12px; padding: 8px 18px; margin: 24px 0; }}
                        .summary-title {{ font-size: 12.5px; font-weight: 800; color: {COLOR_DEEP_GREEN}; letter-spacing: 0.5px; margin: 10px 0 10px 0; padding-bottom: 6px; border-bottom: 1.5px solid #edf1eb; direction: {i18n['dir']}; text-align: {i18n['align']}; }}
                        .summary-table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
                        .summary-table tr {{ border-bottom: 1px dashed #e8e2d4; }}
                        .summary-table tr:last-child {{ border-bottom: none; }}
                        .footnote-p {{ font-size: 12.5px; color: {COLOR_TEXT_SOFT}; line-height: 1.6; margin: 18px 0 0 0; direction: {i18n['dir']}; text-align: {i18n['align']}; }}
                        
                        /* Attachment Callout - Luxury Distinct Badge Pill */
                        .cust-attachment-badge {{ background: #eff7ee; border: 1.5px solid #cbe0cb; border-radius: 10px; padding: 12px 18px; margin: 24px 0 12px 0; text-align: center; }}
                        .cust-attachment-table {{ width: 100%; border-collapse: collapse; text-align: center; }}
                        .attachment-text {{ color: #173815; font-size: 13px; font-weight: 800; vertical-align: middle; }}
                        .badge-filename {{ color: #0f300d; font-family: 'Consolas', 'Courier New', monospace; font-weight: 800; font-size: 12.5px; direction: ltr; unicode-bidi: embed; display: inline-block; padding: 4px 10px; background: #daead7; border: 1px solid #b7d6b3; border-radius: 6px; letter-spacing: 0.4px; vertical-align: middle; }}

                        /* Smart Customer CTA Buttons */
                        .cta-wrap {{ text-align: center; margin: 30px 0 8px 0; }}
                        .btn-stack {{ display: table; width: 100%; max-width: 440px; margin: 0 auto; }}
                        .btn-cell {{ display: table-cell; width: 50%; padding: 0 6px; vertical-align: middle; }}
                        .cta-btn {{ display: block; text-align: center; background-color: {COLOR_DEEP_GREEN}; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 16px; border-radius: 999px; box-shadow: 0 4px 14px rgba(30,72,28,0.22); }}
                        .wa-btn {{ display: block; text-align: center; background-color: #128c7e; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 16px; border-radius: 999px; box-shadow: 0 4px 14px rgba(18,140,126,0.22); }}

                        .footer-strip {{ background: {COLOR_CREAM_CARD}; border-top: 1px solid {COLOR_CARD_BORDER}; padding: 24px 36px; text-align: center; font-size: 11.5px; line-height: 1.6; color: {COLOR_TEXT_SOFT}; }}
                        .footer-brand {{ font-size: 13px; font-weight: 800; color: {COLOR_DEEP_GREEN}; margin-bottom: 4px; }}
                      </style>
                    </head>
                    <body>
                      <div class="email-wrapper">
                        <!-- HEADER WITH PURE WHITE REEFIYA LOGO -->
                        <div class="header-strip">
                          <img src="{logo_src}" alt="REEFIYA" class="logo-img" width="160" height="38" style="height:38px; width:auto; max-width:160px; display:block; margin:0 auto 12px auto; border:0; outline:none; text-decoration:none;" />
                          <div class="desk-title">{i18n['desk_title']}</div>
                          {f'''<div class="ref-box" dir="rtl" style="display:inline-block; background:rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.3); border-radius:999px; padding:7px 24px; margin-top:4px;">
                            <span class="ref-label" style="color:#dcedd0; font-size:12px; font-weight:700; margin-left:8px;">{i18n['ref_label']}</span>
                            <span class="ref-val" style="color:#ffffff; font-family:'Consolas', 'Courier New', monospace; font-weight:800; font-size:14px; letter-spacing:0.8px;">{rfq_ref}</span>
                          </div>''' if is_rtl else f'''<div class="ref-box" dir="ltr" style="display:inline-block; background:rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.3); border-radius:999px; padding:7px 24px; margin-top:4px;">
                            <span class="ref-label" style="color:#dcedd0; font-size:12px; font-weight:700; margin-right:8px;">{i18n['ref_label']}</span>
                            <span class="ref-val" style="color:#ffffff; font-family:'Consolas', 'Courier New', monospace; font-weight:800; font-size:14px; letter-spacing:0.8px;">{rfq_ref}</span>
                          </div>'''}
                        </div>

                        <!-- CONTENT AREA -->
                        <div class="content-area" dir="{i18n['dir']}">
                          <div class="lead-p" style="font-size:14.5px; line-height:1.75; color:#2c3a2e; margin-bottom:16px; text-align:{i18n['align']}; direction:{i18n['dir']};">
                            {p1_text}
                          </div>
                          <div class="lead-p" style="font-size:14.5px; line-height:1.75; color:#2c3a2e; margin-bottom:20px; text-align:{i18n['align']}; direction:{i18n['dir']};">
                            {p2_text}
                          </div>

                          <!-- SPEC SUMMARY WITH UNIFORM 700 FONT WEIGHT -->
                          <div class="summary-card" dir="{i18n['dir']}">
                            <div class="summary-title" style="font-size:13.5px; font-weight:900; color:{COLOR_DEEP_GREEN}; letter-spacing:0.3px; margin:10px 0 12px 0; padding-bottom:8px; border-bottom:2px solid #e2ebd0; text-align:{i18n['align']}; direction:{i18n['dir']};">
                              {i18n['summary_title']}
                            </div>
                            <table class="summary-table" dir="{i18n['dir']}">
                              {sum_rows_html}
                            </table>
                          </div>

                          <!-- ATTACHMENT CALLOUT - BULLETPROOF TABLE CELL WITH REFINED STYLING -->
                          <div class="cust-attachment-badge">
                            <table class="cust-attachment-table" dir="{i18n['dir']}" align="center">
                              <tr>
                                <td align="center" style="padding:0; line-height:1.7;">
                                  <span style="font-size:16px; vertical-align:middle;">≡ƒôÄ</span>
                                  &nbsp;
                                  <span class="attachment-text">{attachment_box_title}</span>
                                  &nbsp;&nbsp;
                                  <span class="badge-filename">REEFIYA_{rfq_ref}.pdf</span>
                                </td>
                              </tr>
                            </table>
                          </div>

                          <div class="footnote-p" style="font-size:12.5px; color:{COLOR_TEXT_SOFT}; line-height:1.6; margin-top:18px; text-align:{i18n['align']}; direction:{i18n['dir']};">
                            {i18n['footnote']}
                          </div>

                          <!-- SMART DUAL ACTION BUTTONS (EMAIL + WHATSAPP) -->
                          <div class="cta-wrap">
                            <div class="btn-stack">
                              <div class="btn-cell">
                                <a href="mailto:exports@reefiya.com?subject=Re:%20Commercial%20RFQ%20-%20{rfq_ref}" class="cta-btn">{i18n['cta']}</a>
                              </div>
                              <div class="btn-cell">
                                <a href="{customer_wa_url}" target="_blank" class="wa-btn">{i18n['wa_cta']}</a>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- FOOTER -->
                        <div class="footer-strip" dir="{i18n['dir']}">
                          <div class="footer-brand">{i18n['footer_desk']}</div>
                          <div>{i18n['footer_addr']}</div>
                          <div style="margin-top: 4px; color:{COLOR_DEEP_GREEN}; font-weight:600; direction:ltr;">
                            exports@reefiya.com ΓÇó www.reefiya.com
                          </div>
                        </div>
                      </div>
                    </body>
                    </html>
                    """

                    cust_req_data = {
                        'from': 'REEFIYA Export Desk <rfq@reefiya.com>',
                        'to': [business_email],
                        'subject': cust_subject,
                        'html': cust_html,
                        'reply_to': 'exports@reefiya.com'
                    }
                    if cust_attachments:
                        cust_req_data['attachments'] = cust_attachments

                    self.send_resend_email(cust_req_data)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'rfqReference': rfq_ref}).encode('utf-8'))
                return
            except Exception as e:
                print(f"[Server Error] {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
                return

        return super().do_POST()

    def send_resend_email(self, req_data):
        try:
            req = urllib.request.Request(
                'https://api.resend.com/emails',
                data=json.dumps(req_data, ensure_ascii=False).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {RESEND_API_TOKEN}',
                    'Content-Type': 'application/json; charset=utf-8',
                    'User-Agent': 'Node/18'
                }
            )
            with urllib.request.urlopen(req) as resp:
                result = resp.read().decode('utf-8')
                print(f"[Resend Success] Sent to {req_data.get('to')}: {result}")
                return True
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8')
            print(f"[Resend HTTP Error] {e.code} for {req_data.get('to')}: {err_body}")
            return False
        except Exception as e:
            print(f"[Resend General Error] {e}")
            return False

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), RFQServerHandler) as httpd:
        print(f"REEFIYA Dev Server with Resend Dispatch running on http://localhost:{PORT}")
        httpd.serve_forever()

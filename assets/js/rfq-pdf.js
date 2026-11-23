/* RFQ PDF builder — loaded on demand by rfq.js (ensurePdfModule) together with html2canvas + html2pdf. */
    function buildRfqPdfContainer(refNumberOverride) {
      const refEl = document.getElementById('confReferenceDisplay');
      const refNumber = refNumberOverride || (refEl ? refEl.textContent.trim() : 'RFQ-COMMERCIAL');
      const isArabic = currentLang === 'ar';
      const logoData = 'data:image/png;base64,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';

      // 1. Refresh live summary using current active language to guarantee no leftover labels from other languages
      if (typeof updateLiveSummary === 'function') {
        updateLiveSummary();
      }

      // Comprehensive i18n dictionary for all 9 supported languages in PDF export
      const pdfI18n = {
        en: {
          deskTitle: 'Export Desk',
          rfqTitle: 'RFQ Submission Acknowledgement',
          statusLabel: 'Status:',
          statusVal: 'Received',
          refLabel: 'RFQ Reference:',
          dateLabel: 'Submission Date:',
          noticeTitle: 'Commercial Notice:',
          noticeText: 'This document confirms receipt of your Request for Quotation by REEFIYA. It does not constitute a commercial quotation, purchase order, or shipment confirmation. All requirements remain subject to commercial review and agreement.',
          sec1: '01. Product & Packaging',
          lblProduce: 'Product:',
          valProduce: 'Egyptian Sweet Potatoes',
          lblVarieties: 'Preferred Varieties:',
          lblSizing: 'Preferred Sizes:',
          lblPackaging: 'Packaging Solutions:',
          lblNetWeight: 'Packaging Net Weights:',
          lblPrivateLabel: 'Private Label Preference:',
          sec2: '02. Volume & Shipping',
          lblOrderVolume: 'Estimated Order Volume:',
          lblContainerCount: 'Quantity / Container Count:',
          lblSupplyFreq: 'Supply Frequency:',
          lblDestCountry: 'Destination Country:',
          lblDestPort: 'Preferred Destination Port:',
          lblIncoterm: 'Preferred Incoterm:',
          lblShippingWindow: 'Target Shipping Window:',
          techLoadingNote: '21,600 kg is a reference loading quantity per 40ft reefer. Actual loading depends on packaging, container payload limits, and shipping arrangements.',
          sec3: '03. Company & Contact',
          lblCompanyName: 'Registered Company Name:',
          lblContactPerson: 'Contact Person:',
          lblJobTitle: 'Job Title:',
          lblBusinessEmail: 'Business Email:',
          lblBusinessPhone: 'Business Phone / WhatsApp:',
          lblCompanyWebsite: 'Company Website:',
          lblCountryReg: 'Country of Registration:',
          lblAdditionalNotes: 'Additional Requirements:',
          notProvided: 'Not Provided',
          footerOrg: 'REEFIYA Export Desk • Alexandria, Egypt',
          footerContact: 'exports@reefiya.com • www.reefiya.com',
          footerAddress: '144 Port Said St, El Ibrahimaia Bahry, Alexandria, Egypt',
          footerDisclaimer: 'RFQ receipt acknowledgement only. Not a binding quotation or order confirmation.',
          pageStr: 'Page 1 of 1',
          dateLocale: 'en-GB'
        },
        fr: {
          deskTitle: 'Bureau Export',
          rfqTitle: 'Accusé de Réception de RFQ',
          statusLabel: 'Statut :',
          statusVal: 'Reçu',
          refLabel: 'Référence RFQ :',
          dateLabel: 'Date de Soumission :',
          noticeTitle: 'Avis Commercial :',
          noticeText: 'Ce document confirme la réception de votre demande de devis par REEFIYA. Il ne constitue pas un devis commercial, un bon de commande ou une confirmation d’expédition. Toutes les exigences restent soumises à examen et accord commercial.',
          sec1: '01. Produit & Emballage',
          lblProduce: 'Produit :',
          valProduce: 'Patates Douces Égyptiennes',
          lblVarieties: 'Variétés Préférées :',
          lblSizing: 'Calibres Souhaités :',
          lblPackaging: 'Solutions d’Emballage :',
          lblNetWeight: 'Poids Nets d’Emballage :',
          lblPrivateLabel: 'Préférence Marque Privée :',
          sec2: '02. Volume & Expédition',
          lblOrderVolume: 'Volume Estimé de la Commande :',
          lblContainerCount: 'Quantité / Nombre de Conteneurs :',
          lblSupplyFreq: 'Fréquence d’Approvisionnement :',
          lblDestCountry: 'Pays de Destination :',
          lblDestPort: 'Port de Destination Préféré :',
          lblIncoterm: 'Incoterm Préféré :',
          lblShippingWindow: 'Période d’Expédition Cible :',
          techLoadingNote: '21 600 kg est une quantité indicative par conteneur 40ft. Le chargement réel dépend de l’emballage et des accords maritimes.',
          sec3: '03. Entreprise & Contact',
          lblCompanyName: 'Raison Sociale Enregistrée :',
          lblContactPerson: 'Personne de Contact :',
          lblJobTitle: 'Fonction / Titre :',
          lblBusinessEmail: 'E-mail Professionnel :',
          lblBusinessPhone: 'Téléphone Pro / WhatsApp :',
          lblCompanyWebsite: 'Site Internet :',
          lblCountryReg: 'Pays d’Enregistrement :',
          lblAdditionalNotes: 'Exigences Additionnelles :',
          notProvided: 'Non Fourni',
          footerOrg: 'REEFIYA Bureau Export • Alexandrie, Égypte',
          footerContact: 'exports@reefiya.com • www.reefiya.com',
          footerAddress: '144 Port Said St, El Ibrahimaia Bahry, Alexandrie, Égypte',
          footerDisclaimer: 'Accusé de réception de RFQ uniquement. Ne constitue pas un devis ferme.',
          pageStr: 'Page 1 sur 1',
          dateLocale: 'fr-FR'
        },
        nl: {
          deskTitle: 'Exportdesk',
          rfqTitle: 'Bevestiging van Ontvangst RFQ',
          statusLabel: 'Status:',
          statusVal: 'Ontvangen',
          refLabel: 'RFQ-Referentie:',
          dateLabel: 'Indieningsdatum:',
          noticeTitle: 'Commerciële Kennisgeving:',
          noticeText: 'Dit document bevestigt de ontvangst van uw offerteaanvraag door REEFIYA. Het vormt geen commerciële offerte, inkooporder of verzendbevestiging. Alle voorwaarden blijven onderhevig aan commerciële beoordeling en overeenstemming.',
          sec1: '01. Product & Verpakking',
          lblProduce: 'Product:',
          valProduce: 'Egyptische Zoete Aardappelen',
          lblVarieties: 'Voorkeursvariëteiten:',
          lblSizing: 'Voorkeursmaten:',
          lblPackaging: 'Verpakkingsoplossingen:',
          lblNetWeight: 'Nettogewichten Verpakking:',
          lblPrivateLabel: 'Voorkeur Private Label:',
          sec2: '02. Volume & Verzending',
          lblOrderVolume: 'Geschat Bestelvolume:',
          lblContainerCount: 'Hoeveelheid / Aantal Containers:',
          lblSupplyFreq: 'Leveringsfrequentie:',
          lblDestCountry: 'Bestemmingsland:',
          lblDestPort: 'Gewenste Bestemmingshaven:',
          lblIncoterm: 'Gewenste Incoterm:',
          lblShippingWindow: 'Gewenste Verzendperiode:',
          techLoadingNote: '21.600 kg is een referentielading per 40ft reefer. Werkelijke belading hangt af van verpakking en scheepvaartafspraken.',
          sec3: '03. Bedrijf & Contact',
          lblCompanyName: 'Geregistreerde Bedrijfsnaam:',
          lblContactPerson: 'Contactpersoon:',
          lblJobTitle: 'Functietitel:',
          lblBusinessEmail: 'Zakelijk E-mailadres:',
          lblBusinessPhone: 'Telefoon / WhatsApp:',
          lblCompanyWebsite: 'Bedrijfswebsite:',
          lblCountryReg: 'Land van Registratie:',
          lblAdditionalNotes: 'Aanvullende Specificaties:',
          notProvided: 'Niet Opgegeven',
          footerOrg: 'REEFIYA Exportdesk • Alexandrië, Egypte',
          footerContact: 'exports@reefiya.com • www.reefiya.com',
          footerAddress: '144 Port Said St, El Ibrahimaia Bahry, Alexandrië, Egypte',
          footerDisclaimer: 'Uitsluitend ontvangstbevestiging van RFQ. Geen bindende offerte of orderbevestiging.',
          pageStr: 'Pagina 1 van 1',
          dateLocale: 'nl-NL'
        },
        de: {
          deskTitle: 'Export-Desk',
          rfqTitle: 'Eingangsbestätigung der RFQ',
          statusLabel: 'Status:',
          statusVal: 'Eingegangen',
          refLabel: 'RFQ-Referenz:',
          dateLabel: 'Einreichungsdatum:',
          noticeTitle: 'Geschäftlicher Hinweis:',
          noticeText: 'Dieses Dokument bestätigt den Eingang Ihrer Preisanfrage bei REEFIYA. Es stellt kein verbindliches Angebot, keine Bestellung und keine Versandbestätigung dar. Alle Spezifikationen unterliegen der kaufmännischen Prüfung und Vereinbarung.',
          sec1: '01. Produkt & Verpackung',
          lblProduce: 'Produkt:',
          valProduce: 'Ägyptische Süßkartoffeln',
          lblVarieties: 'Bevorzugte Sorten:',
          lblSizing: 'Bevorzugte Größen:',
          lblPackaging: 'Verpackungslösungen:',
          lblNetWeight: 'Verpackungs-Nettogewichte:',
          lblPrivateLabel: 'Präferenz Eigenmarke:',
          sec2: '02. Volumen & Versand',
          lblOrderVolume: 'Geschätztes Bestellvolumen:',
          lblContainerCount: 'Menge / Anzahl Container:',
          lblSupplyFreq: 'Lieferfrequenz:',
          lblDestCountry: 'Bestimmungsland:',
          lblDestPort: 'Bevorzugter Bestimmungshafen:',
          lblIncoterm: 'Bevorzugter Incoterm:',
          lblShippingWindow: 'Ziel-Versandzeitraum:',
          techLoadingNote: '21.600 kg ist eine Richtlademenge pro 40ft-Kühlcontainer. Die tatsächliche Beladung hängt von Verpackung und Transportvereinbarungen ab.',
          sec3: '03. Unternehmen & Kontakt',
          lblCompanyName: 'Registrierter Firmenname:',
          lblContactPerson: 'Ansprechpartner:',
          lblJobTitle: 'Berufsbezeichnung:',
          lblBusinessEmail: 'Geschäftliche E-Mail:',
          lblBusinessPhone: 'Telefon / WhatsApp:',
          lblCompanyWebsite: 'Unternehmens-Website:',
          lblCountryReg: 'Registrierungsland:',
          lblAdditionalNotes: 'Zusätzliche Anforderungen:',
          notProvided: 'Nicht Angegeben',
          footerOrg: 'REEFIYA Export-Desk • Alexandria, Ägypten',
          footerContact: 'exports@reefiya.com • www.reefiya.com',
          footerAddress: '144 Port Said St, El Ibrahimaia Bahry, Alexandria, Ägypten',
          footerDisclaimer: 'Nur Eingangsbestätigung der RFQ. Kein verbindliches Angebot oder Auftragsbestätigung.',
          pageStr: 'Seite 1 von 1',
          dateLocale: 'de-DE'
        },
        es: {
          deskTitle: 'Mesa de Exportación',
          rfqTitle: 'Acuse de Recibo de RFQ',
          statusLabel: 'Estado:',
          statusVal: 'Recibido',
          refLabel: 'Referencia RFQ:',
          dateLabel: 'Fecha de Envío:',
          noticeTitle: 'Aviso Comercial:',
          noticeText: 'Este documento confirma la recepción de su Solicitud de Cotización por parte de REEFIYA. No constituye una cotización comercial, orden de compra ni confirmación de embarque. Todos los requerimientos quedan sujetos a revisión y acuerdo comercial.',
          sec1: '01. Producto & Empaque',
          lblProduce: 'Producto:',
          valProduce: 'Batatas Dulces Egipcias',
          lblVarieties: 'Variedades Preferidas:',
          lblSizing: 'Calibres Preferidos:',
          lblPackaging: 'Soluciones de Empaque:',
          lblNetWeight: 'Pesos Netos de Empaque:',
          lblPrivateLabel: 'Preferencia de Marca Privada:',
          sec2: '02. Volumen & Embarque',
          lblOrderVolume: 'Volumen Estimado del Pedido:',
          lblContainerCount: 'Cantidad / Número de Contenedores:',
          lblSupplyFreq: 'Frecuencia de Suministro:',
          lblDestCountry: 'País de Destino:',
          lblDestPort: 'Puerto de Destino Preferido:',
          lblIncoterm: 'Incoterm Preferido:',
          lblShippingWindow: 'Plazo Estimado de Embarque:',
          techLoadingNote: '21,600 kg es una carga de referencia por contenedor de 40 pies. La carga real depende del empaque y los acuerdos marítimos.',
          sec3: '03. Empresa & Contacto',
          lblCompanyName: 'Razón Social Registrada:',
          lblContactPerson: 'Persona de Contacto:',
          lblJobTitle: 'Cargo / Puesto:',
          lblBusinessEmail: 'Correo Comercial:',
          lblBusinessPhone: 'Teléfono / WhatsApp:',
          lblCompanyWebsite: 'Sitio Web:',
          lblCountryReg: 'País de Registro:',
          lblAdditionalNotes: 'Requerimientos Adicionales:',
          notProvided: 'No Proporcionado',
          footerOrg: 'REEFIYA Mesa de Exportación • Alejandría, Egipto',
          footerContact: 'exports@reefiya.com • www.reefiya.com',
          footerAddress: '144 Port Said St, El Ibrahimaia Bahry, Alejandría, Egipto',
          footerDisclaimer: 'Acuse de recibo de RFQ únicamente. No constituye una cotización vinculante.',
          pageStr: 'Página 1 de 1',
          dateLocale: 'es-ES'
        },
        it: {
          deskTitle: 'Desk Export',
          rfqTitle: 'Conferma di Ricezione RFQ',
          statusLabel: 'Stato:',
          statusVal: 'Ricevuto',
          refLabel: 'Riferimento RFQ:',
          dateLabel: 'Data di Invio:',
          noticeTitle: 'Avviso Commerciale:',
          noticeText: 'Questo documento conferma la ricezione della richiesta di preventivo da parte di REEFIYA. Non costituisce un preventivo commerciale, un ordine di acquisto o una conferma di spedizione. Tutti i requisiti rimangono soggetti a revisione e accordo commerciale.',
          sec1: '01. Prodotto & Imballaggio',
          lblProduce: 'Prodotto:',
          valProduce: 'Patate Dolci Egiziane',
          lblVarieties: 'Varietà Preferite:',
          lblSizing: 'Calibri Preferiti:',
          lblPackaging: 'Soluzioni di Imballaggio:',
          lblNetWeight: 'Pesi Netti dell’Imballaggio:',
          lblPrivateLabel: 'Preferenza Marchio Privato:',
          sec2: '02. Volume & Spedizione',
          lblOrderVolume: 'Volume Stimato dell’Ordine:',
          lblContainerCount: 'Quantità / Numero di Container:',
          lblSupplyFreq: 'Frequenza di Fornitura:',
          lblDestCountry: 'Paese di Destinazione:',
          lblDestPort: 'Porto di Destinazione Preferito:',
          lblIncoterm: 'Incoterm Preferito:',
          lblShippingWindow: 'Finestra di Spedizione Desiderata:',
          techLoadingNote: '21.600 kg è un carico di riferimento per reefer da 40 piedi. Il carico effettivo dipende dall’imballaggio e dagli accordi di trasporto.',
          sec3: '03. Azienda & Contatto',
          lblCompanyName: 'Ragione Sociale Registrata:',
          lblContactPerson: 'Referente Commerciale:',
          lblJobTitle: 'Ruolo / Titolo:',
          lblBusinessEmail: 'Email Aziendale:',
          lblBusinessPhone: 'Telefono / WhatsApp:',
          lblCompanyWebsite: 'Sito Web Aziendale:',
          lblCountryReg: 'Paese di Registrazione:',
          lblAdditionalNotes: 'Requisiti Aggiuntivi:',
          notProvided: 'Non Fornito',
          footerOrg: 'REEFIYA Desk Export • Alessandria, Egitto',
          footerContact: 'exports@reefiya.com • www.reefiya.com',
          footerAddress: '144 Port Said St, El Ibrahimaia Bahry, Alessandria, Egitto',
          footerDisclaimer: 'Solo conferma di ricezione RFQ. Non costituisce un preventivo vincolante né una conferma d’ordine.',
          pageStr: 'Pagina 1 di 1',
          dateLocale: 'it-IT'
        },
        ru: {
          deskTitle: 'Экспортный Отдел',
          rfqTitle: 'Подтверждение Получения RFQ',
          statusLabel: 'Статус:',
          statusVal: 'Получено',
          refLabel: 'Номер RFQ:',
          dateLabel: 'Дата Подачи:',
          noticeTitle: 'Коммерческое Уведомление:',
          noticeText: 'Настоящий документ подтверждает получение вашего запроса котировки компанией REEFIYA. Он не является коммерческим предложением, заказом на закупку или подтверждением отправки. Все условия подлежат согласованию.',
          sec1: '01. Продукция & Упаковка',
          lblProduce: 'Продукт:',
          valProduce: 'Египетский Батат',
          lblVarieties: 'Выбранные Сорта:',
          lblSizing: 'Предпочтительные Размеры:',
          lblPackaging: 'Решения по Упаковке:',
          lblNetWeight: 'Вес Нетто Упаковки:',
          lblPrivateLabel: 'Собственная Торговая Марка:',
          sec2: '02. Объем & Доставка',
          lblOrderVolume: 'Расчетный Объем Заказа:',
          lblContainerCount: 'Количество / Число Контейнеров:',
          lblSupplyFreq: 'Частота Поставок:',
          lblDestCountry: 'Страна Назначения:',
          lblDestPort: 'Предпочтительный Порт Назначения:',
          lblIncoterm: 'Базис Поставки (Incoterm):',
          lblShippingWindow: 'Сроки Отгрузки:',
          techLoadingNote: '21 600 кг — ориентировочная загрузка 40ft рефрижератора. Фактическая загрузка зависит от упаковки и договоренностей.',
          sec3: '03. Компания & Контакт',
          lblCompanyName: 'Официальное Название Компании:',
          lblContactPerson: 'Контактное Лицо:',
          lblJobTitle: 'Должность:',
          lblBusinessEmail: 'Корпоративный E-mail:',
          lblBusinessPhone: 'Телефон / WhatsApp:',
          lblCompanyWebsite: 'Веб-сайт Компании:',
          lblCountryReg: 'Страна Регистрации:',
          lblAdditionalNotes: 'Дополнительные Требования:',
          notProvided: 'Не указано',
          footerOrg: 'REEFIYA Экспортный Отдел • Александрия, Египет',
          footerContact: 'exports@reefiya.com • www.reefiya.com',
          footerAddress: '144 Port Said St, El Ibrahimaia Bahry, Александрия, Египет',
          footerDisclaimer: 'Исключительно подтверждение получения RFQ. Не является обязывающим предложением.',
          pageStr: 'Стр. 1 из 1',
          dateLocale: 'ru-RU'
        },
        tr: {
          deskTitle: 'İhracat Masası',
          rfqTitle: 'RFQ Alındı Onayı',
          statusLabel: 'Durum:',
          statusVal: 'Alındı',
          refLabel: 'RFQ Referansı:',
          dateLabel: 'Gönderim Tarihi:',
          noticeTitle: 'Ticari Bildirim:',
          noticeText: 'Bu belge, Fiyat Teklifi Talebinizin (RFQ) REEFIYA tarafından alındığını onaylar. Bağlayıcı bir ticari teklif, satın alma siparişi veya sevkiyat onayı niteliği taşımaz. Tüm gereksinimler inceleme ve mutabakata tabidir.',
          sec1: '01. Ürün & Paketleme',
          lblProduce: 'Ürün:',
          valProduce: 'Mısır Tatlı Patatesi',
          lblVarieties: 'Tercih Edilen Çeşitler:',
          lblSizing: 'Tercih Edilen Boyutlar:',
          lblPackaging: 'Paketleme Çözümleri:',
          lblNetWeight: 'Paketleme Net Ağırlıkları:',
          lblPrivateLabel: 'Özel Marka Tercihi:',
          sec2: '02. Hacim & Sevkiyat',
          lblOrderVolume: 'Tahmini Sipariş Hacmi:',
          lblContainerCount: 'Miktar / Konteyner Sayısı:',
          lblSupplyFreq: 'Tedarik Sıklığı:',
          lblDestCountry: 'Varış Ülkesi:',
          lblDestPort: 'Tercih Edilen Varış Limanı:',
          lblIncoterm: 'Tercih Edilen Incoterm:',
          lblShippingWindow: 'Hedef Sevkiyat Dönemi:',
          techLoadingNote: '40ft reefer başına 21.600 kg referans yükleme miktarıdır. Gerçek yükleme ambalaja ve nakliye koşullarına bağlıdır.',
          sec3: '03. Şirket & İletişim',
          lblCompanyName: 'Kayıtlı Şirket Unvanı:',
          lblContactPerson: 'Yetkili Kişi:',
          lblJobTitle: 'Görevi / Unvanı:',
          lblBusinessEmail: 'Kurumsal E-posta:',
          lblBusinessPhone: 'Telefon / WhatsApp:',
          lblCompanyWebsite: 'Şirket Web Sitesi:',
          lblCountryReg: 'Kayıtlı Ülke:',
          lblAdditionalNotes: 'Ek İstek ve Gereksinimler:',
          notProvided: 'Belirtilmedi',
          footerOrg: 'REEFIYA İhracat Masası • İskenderiye, Mısır',
          footerContact: 'exports@reefiya.com • www.reefiya.com',
          footerAddress: '144 Port Said St, El Ibrahimaia Bahry, İskenderiye, Mısır',
          footerDisclaimer: 'Yalnızca RFQ alındı onayıdır. Bağlayıcı bir teklif veya sipariş onayı niteliği taşımaz.',
          pageStr: 'Sayfa 1 / 1',
          dateLocale: 'tr-TR'
        },
        ar: {
          deskTitle: 'مكتب التصدير',
          rfqTitle: 'إشعار استلام طلب عروض أسعار (RFQ)',
          statusLabel: 'الحالة:',
          statusVal: 'تم الاستلام',
          refLabel: 'الرقم المرجعي للطلب:',
          dateLabel: 'تاريخ التقديم:',
          noticeTitle: 'إشعار تجاري:',
          noticeText: 'تؤكد هذه الوثيقة استلام طلب عروض الأسعار الخاص بكم لدى ريفيا (REEFIYA). لا تشكل هذه الوثيقة عرض أسعار تجارياً ملزماً أو أمر شراء أو تأكيد شحن. تظل جميع المتطلبات خاضعة للمراجعة والاتفاق التجاري.',
          sec1: '01. المنتج والتعبئة والتغليف',
          lblProduce: 'المنتج:',
          valProduce: 'البطاطا الحلوة المصرية',
          lblVarieties: 'الأصناف المفضلة:',
          lblSizing: 'الأحجام المطلوبة:',
          lblPackaging: 'حلول التعبئة والتغليف:',
          lblNetWeight: 'أوزان التعبئة الصافية:',
          lblPrivateLabel: 'تفضيل العلامة الخاصة:',
          sec2: '02. الكميات والشحن واللوجستيات',
          lblOrderVolume: 'حجم الطلب التقديري:',
          lblContainerCount: 'الكمية / عدد الحاويات:',
          lblSupplyFreq: 'دورية التوريد:',
          lblDestCountry: 'دولة الوصول:',
          lblDestPort: 'ميناء الوصول المفضل:',
          lblIncoterm: 'شرط الشحن (Incoterm):',
          lblShippingWindow: 'نافذة وتوقيت الشحن المستهدفة:',
          techLoadingNote: '21,600 كجم هي كمية تحميل استرشادية لكل حاوية مبردة 40 قدم. يعتمد التحميل الفعلي على نوع التعبئة وحدود حمولة الحاوية وترتيبات الشحن.',
          sec3: '03. بيانات الشركة والتواصل',
          lblCompanyName: 'اسم الشركة المسجل:',
          lblContactPerson: 'الشخص المسؤول:',
          lblJobTitle: 'المسمى الوظيفي:',
          lblBusinessEmail: 'البريد الإلكتروني للعمل:',
          lblBusinessPhone: 'الهاتف / الواتساب:',
          lblCompanyWebsite: 'الموقع الإلكتروني:',
          lblCountryReg: 'دولة التسجيل:',
          lblAdditionalNotes: 'المتطلبات والملاحظات الإضافية:',
          notProvided: 'غير محدد',
          footerOrg: 'شركة ريفيا للتنمية الزراعية والتصدير • الإسكندرية، مصر',
          footerContact: 'exports@reefiya.com • www.reefiya.com',
          footerAddress: '144 شارع بورسعيد، الإبراهيمية بحري، الإسكندرية، مصر',
          footerDisclaimer: 'إشعار استلام طلب عروض أسعار فقط. لا يشكل عرض أسعار ملزماً أو تأكيداً للطلب.',
          pageStr: 'صفحة 1 من 1',
          dateLocale: 'ar-EG'
        }
      };

      const t = pdfI18n[currentLang] || pdfI18n['en'];
      const d = (typeof langDict !== 'undefined' && langDict[currentLang]) ? langDict[currentLang] : (typeof langDict !== 'undefined' ? langDict['en'] : null);

      // Helpers to retrieve values safely from inputs/summary
      const getVal = (id, fallback) => {
        const el = document.getElementById(id);
        return el ? (el.value.trim() || fallback) : fallback;
      };
      const getText = (id, fallback) => {
        const el = document.getElementById(id);
        return el ? (el.textContent.trim() || fallback) : fallback;
      };
      const sanitizeAr = (str) => {
        if (!str) return '—';
        return str
          .replace(/\(Private Label\)/gi, '')
          .replace(/\(Pallet Bins\)/gi, '')
          .replace(/\(Carton Boxes\)/gi, '')
          .replace(/\(Mesh Bags\)/gi, '')
          .replace(/\(REEFIYA Standard\)/gi, '')
          .replace(/\(REEFIYA Export Brand\)/gi, '')
          .replace(/\(Fresh Market Variety\)/gi, '')
          .replace(/\(Commercial Export Variety\)/gi, '')
          .replace(/\(Incoterm\)/gi, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
      };

      const companyName = getVal('inputCompanyName', '—');
      const contactPerson = getVal('inputContactName', '—');
      const jobTitle = getVal('inputJobTitle', '');
      const businessEmail = getVal('inputBusinessEmail', '—');
      const dialCodeEl = document.getElementById('hiddenSelectedDialCode');
      const dialCodeTxt = document.getElementById('selectedPhoneCodeText');
      let phoneDialCode = (dialCodeEl && dialCodeEl.value) ? dialCodeEl.value.trim() : ((dialCodeTxt && dialCodeTxt.textContent) ? dialCodeTxt.textContent.trim() : '');
      if (phoneDialCode && !phoneDialCode.startsWith('+')) phoneDialCode = '+' + phoneDialCode;
      
      let rawPhone = getVal('inputBusinessPhone', '').trim();
      let cleanPhone = rawPhone.replace(/^[\s+]+/, '');
      if (phoneDialCode && cleanPhone.startsWith(phoneDialCode.replace('+', ''))) {
        cleanPhone = cleanPhone.substring(phoneDialCode.replace('+', '').length).trim();
      }
      const fullPhone = cleanPhone ? `${phoneDialCode} ${cleanPhone}`.trim() : (isArabic ? 'غير محدد' : (t.notProvided || 'Not Provided'));
      const companyWebsite = getVal('inputCompanyWebsite', '');
      const countryReg = getVal('hiddenCountryOfRegistration', '—');
      const otherCountryReg = getVal('inputOtherCountryReg', '');
      const displayCountryReg = (countryReg === 'Other' && otherCountryReg) ? otherCountryReg : countryReg;
      const additionalNotes = getVal('inputAdditionalRequirements', '');

      // Programme-aware product line and first row label (fresh / industrial / frozen)
      const isFrozenProg = typeof getProgramme === 'function' && getProgramme() === 'Frozen';
      const produceName = getText('sumProductVal', '') || t.valProduce || (isArabic ? 'البطاطا الحلوة المصرية' : 'Egyptian Sweet Potatoes');
      const itemsLabel = isFrozenProg ? (getText('lblSumVarieties', '') || t.lblVarieties) : t.lblVarieties;
      const sizingLabel = isFrozenProg ? (getText('lblSumSizing', '') || t.lblSizing) : t.lblSizing;
      const varieties = isArabic ? sanitizeAr(getText('sumVarietiesVal', '—')) : getText('sumVarietiesVal', '—');
      const sizing = getText('sumSizingVal', '—');

      // Packaging Net Weight resolution: strictly 2 choices (REEFIYA Standard Weights OR Custom Weight entered by buyer)
      const checkedWeight = document.querySelector('input[name="netWeight"]:checked');
      const customWeightSpec = getVal('inputCustomWeightSpec', '');
      let packagingWeightsDisplay = '';

      if (isFrozenProg) {
        packagingWeightsDisplay = getText('sumNetWeightVal', '—');
      } else if (checkedWeight && checkedWeight.value === 'Custom Weight Requirements') {
        packagingWeightsDisplay = customWeightSpec || (d && (d.sumCustomWeight || d.wtNotSpecTitle)) || (isArabic ? 'متطلبات وزن مخصصة' : 'Custom Weight Requirements');
      } else {
        packagingWeightsDisplay = (d && (d.sumStandardWeight || d.wtStandardTitle)) || (isArabic ? 'أوزان ريفيا القياسية (REEFIYA Standard)' : 'REEFIYA Standard Weights');
      }

      const packaging = isArabic ? sanitizeAr(getText('sumPackagingVal', '—')) : getText('sumPackagingVal', '—');
      const privateLabel = isArabic ? sanitizeAr(getText('sumPrivateLabelVal', '—')) : getText('sumPrivateLabelVal', '—');

      // Volume & Shipping resolution
      const volSelect = document.getElementById('selectOrderVolume');
      const volVal = volSelect ? volSelect.value : '';
      let displayOrderVolume = volVal || getText('sumOrderVolumeVal', '—');
      let displayContainerCount = '';
      let displaySupplyFreq = '';

      if (volVal === 'Trial Order') {
        const qty = getVal('inputTrialQty', '');
        displayOrderVolume = (d && d.optVolTrial) ? d.optVolTrial : (isArabic ? 'طلب تجريبي (حمولة جزئية / تقييم)' : 'Trial Order — Partial Load / Evaluation');
        displayContainerCount = qty || (isArabic ? 'حمولة تقييم أولية' : (d && d.txtPartialLoad ? d.txtPartialLoad : 'Partial Load'));
      } else if (volVal.includes('1 x 40ft Reefer')) {
        displayOrderVolume = (d && d.optVol1Reefer) ? d.optVol1Reefer.split('—')[0].trim() : (isArabic ? '1 × حاوية مبردة 40 قدم' : '1 × 40ft Reefer');
        displayContainerCount = isArabic ? '1 حاوية مبردة (40ft Reefer)' : (currentLang === 'nl' ? '1 Container (40ft Reefer)' : '1 Container (40ft Reefer)');
      } else if (volVal.includes('2–5') || volVal.includes('2-5')) {
        displayOrderVolume = (d && d.optVol2to5) ? d.optVol2to5 : (isArabic ? '2–5 حاويات مبردة 40 قدم' : '2–5 × 40ft Reefers');
        displayContainerCount = getVal('select2to5Containers', isArabic ? '2–5 حاويات' : '2–5 Containers');
      } else if (volVal.includes('6+')) {
        displayOrderVolume = (d && d.optVol6plus) ? d.optVol6plus : (isArabic ? '6+ حاويات مبردة 40 قدم (برنامج توريد)' : '6+ × 40ft Reefers — Seasonal Supply Program');
        const cnt = getVal('input6plusCount', '');
        displayContainerCount = cnt ? (isArabic ? (cnt + ' حاويات مبردة') : (cnt + ' Containers')) : (isArabic ? '6+ حاويات' : '6+ Containers');
        const freq = getVal('selectSupplyFrequency', '');
        if (freq) {
          if (freq === 'Single Shipment') displaySupplyFreq = (d && d.optFreqSingle) ? d.optFreqSingle : (isArabic ? 'شحنة واحدة' : 'Single Shipment');
          else if (freq === 'Monthly Supply') displaySupplyFreq = (d && d.optFreqMonthly) ? d.optFreqMonthly : (isArabic ? 'توريد شهري' : 'Monthly Supply');
          else if (freq === 'Seasonal Supply') displaySupplyFreq = (d && d.optFreqSeasonal) ? d.optFreqSeasonal : (isArabic ? 'توريد موسمي' : 'Seasonal Supply');
          else if (freq === 'To Be Discussed') displaySupplyFreq = (d && d.optFreqDiscuss) ? d.optFreqDiscuss : (isArabic ? 'يتم الاتفاق عليه' : 'To Be Discussed');
          else displaySupplyFreq = freq;
        }
      } else if (volVal === 'Industrial Bulk Order') {
        displayOrderVolume = (d && d.optVolIndustrial) ? d.optVolIndustrial : (isArabic ? 'طلب صناعي بالجملة للتصنيع' : 'Industrial Bulk Order — Processing Requirements');
        displayContainerCount = getVal('inputIndustrialQty', isArabic ? 'كميات جملة صناعية' : 'Industrial Bulk Quantity');
      } else if (volVal === 'Custom Volume') {
        displayOrderVolume = (d && d.optVolCustom) ? d.optVolCustom : (isArabic ? 'حجم مخصص' : 'Custom Volume');
        displayContainerCount = getVal('inputCustomVolumeQty', isArabic ? 'متطلبات محددة' : 'Custom Requirements');
      }

      const destCountry = getText('sumDestinationCountryVal', '—');
      const isPortAssisted = document.getElementById('chkPortAssistance') ? document.getElementById('chkPortAssistance').checked : false;
      const portRaw = getVal('inputDestPort', '');
      const portAssistanceText = (d && d.txtPortAssistanceTag) ? d.txtPortAssistanceTag : (isArabic ? 'طلب استشارة الميناء' : 'Assistance Requested');
      let displayDestPort = '';
      if (isPortAssisted) {
        displayDestPort = isArabic ? 'طلب مساعدة في اختيار الميناء' : portAssistanceText;
      } else {
        displayDestPort = portRaw || portAssistanceText;
      }

      const incoterm = getText('sumIncotermVal', '—');
      const shippingWindow = getText('sumShippingWindowVal', '—');

      // Create container attached in DOM for high-fidelity vector/canvas capture
      const container = document.createElement('div');
      container.id = 'reefiya-rfq-pdf-render';
      container.style.width = '740px';
      container.style.padding = '22px 30px 18px 30px';
      container.style.boxSizing = 'border-box';
      container.style.background = '#ffffff';
      container.style.color = '#1f2421';
      container.style.lineHeight = '1.38';
      container.style.fontSize = '11px';

      const showLoadingNote = volVal.includes('Reefer') || volVal.includes('2–5') || volVal.includes('2-5') || volVal.includes('6+');

      if (isArabic) {
        container.style.fontFamily = "'Cairo', 'Alexandria', 'Tahoma', sans-serif";
        container.style.direction = 'rtl';
        container.style.textAlign = 'right';

        container.innerHTML = `
          <!-- HEADER -->
          <table style="width:100%; border-collapse:collapse; border-bottom:2px solid #234f20; padding-bottom:20px; margin-bottom:11px;">
            <tr>
              <td style="vertical-align:middle; text-align:right; width:50%;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <img src="${logoData}" alt="REEFIYA Logo" style="height:42px; width:auto; object-fit:contain; display:block;" />
                  <div style="width:1px; height:26px; background:#d4ccb8;"></div>
                  <div style="font-size:13px; font-weight:800; color:#234f20; letter-spacing:normal;">${t.deskTitle}</div>
                </div>
              </td>
              <td style="vertical-align:middle; text-align:left; width:50%; direction:ltr;">
                <div style="font-size:13.5px; font-weight:800; color:#1c2720; text-align:left; direction:rtl; letter-spacing:normal;">
                  ${t.rfqTitle}
                </div>
                <div style="font-size:16px; font-weight:800; color:#234f20; margin-top:3px; margin-bottom:5px; font-family:monospace; letter-spacing:0.8px; text-align:left;">
                  ${refNumber}
                </div>
                <div style="display:flex; align-items:center; justify-content:flex-start; gap:8px; margin-bottom:6px;">
                  <span style="font-size:9.5px; font-weight:700; background:#e8f0e7; color:#234f20; padding:2px 8px; border-radius:10px; border:1px solid #c9dec7; display:inline-block;">${t.statusVal}</span>
                  <span style="font-size:9.5px; font-weight:600; color:#4a4537; direction:rtl;">${t.dateLabel} ${new Date().toLocaleDateString(t.dateLocale || 'ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </td>
            </tr>
          </table>

          <!-- COMMERCIAL NOTICE -->
          <div style="background:#faf8f3; border:1px solid #e7e1d2; border-radius:6px; padding:7px 11px; margin-bottom:10px; font-size:10px; color:#524c3e; line-height:1.45;">
            <strong style="color:#234f20;">${t.noticeTitle}</strong> ${t.noticeText}
          </div>

          <!-- SECTION 01: PRODUCT & PACKAGING -->
          <div style="margin-bottom:9px;">
            <div style="background:#234f20; color:#ffffff; padding:4px 9px; font-size:10.5px; font-weight:700; border-radius:4px; margin-bottom:3px;">
              ${t.sec1}
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:10.5px; border:1px solid #eee8db;">
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; width:32%; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblProduce}</td>
                <td style="padding:4.5px 8px; color:#172c1a; font-weight:700; text-align:right; border-bottom:1px solid #eee8db;">${produceName}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${itemsLabel}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;">${varieties}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${sizingLabel}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;"><span style="direction:ltr; display:inline-block;">${sizing}</span></td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblPackaging}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;">${packaging}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblNetWeight}</td>
                <td style="padding:4.5px 8px; color:#172c1a; font-weight:600; text-align:right; border-bottom:1px solid #eee8db;">${packagingWeightsDisplay}</td>
              </tr>
              <tr>
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db;">${t.lblPrivateLabel}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right;">${privateLabel}</td>
              </tr>
            </table>
          </div>

          <!-- SECTION 02: VOLUME & SHIPPING -->
          <div style="margin-bottom:9px;">
            <div style="background:#234f20; color:#ffffff; padding:4px 9px; font-size:10.5px; font-weight:700; border-radius:4px; margin-bottom:3px;">
              ${t.sec2}
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:10.5px; border:1px solid #eee8db;">
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; width:32%; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblOrderVolume}</td>
                <td style="padding:4.5px 8px; color:#172c1a; font-weight:700; text-align:right; border-bottom:1px solid #eee8db;">${displayOrderVolume}</td>
              </tr>
              ${displayContainerCount ? `
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblContainerCount}</td>
                <td style="padding:4.5px 8px; color:#172c1a; font-weight:600; text-align:right; border-bottom:1px solid #eee8db;">${displayContainerCount}</td>
              </tr>` : ''}
              ${displaySupplyFreq ? `
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblSupplyFreq}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;">${displaySupplyFreq}</td>
              </tr>` : ''}
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblDestCountry}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;">${destCountry}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblDestPort}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;">${displayDestPort}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblIncoterm}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;"><span style="direction:ltr; display:inline-block;">${incoterm}</span></td>
              </tr>
              <tr>
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db;">${t.lblShippingWindow}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right;">${shippingWindow}</td>
              </tr>
            </table>
            ${showLoadingNote ? `
            <div style="font-size:9px; color:#777; margin-top:3px; padding-right:6px; line-height:1.35; font-style:italic;">
              * ${t.techLoadingNote}
            </div>` : ''}
          </div>

          <!-- SECTION 03: COMPANY & CONTACT -->
          <div style="margin-bottom:10px;">
            <div style="background:#234f20; color:#ffffff; padding:4px 9px; font-size:10.5px; font-weight:700; border-radius:4px; margin-bottom:3px;">
              ${t.sec3}
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:10.5px; border:1px solid #eee8db;">
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; width:32%; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblCompanyName}</td>
                <td style="padding:4.5px 8px; color:#172c1a; font-weight:700; text-align:right; border-bottom:1px solid #eee8db;">${companyName}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblContactPerson}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;">${contactPerson}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblJobTitle}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;">${jobTitle || t.notProvided}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblBusinessEmail}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;"><span style="direction:ltr; display:inline-block; font-family:monospace;">${businessEmail}</span></td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblBusinessPhone}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;"><span style="direction:ltr; display:inline-block; font-family:monospace;">${fullPhone}</span></td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblCompanyWebsite}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;"><span style="direction:ltr; display:inline-block;">${companyWebsite || t.notProvided}</span></td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblCountryReg}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; border-bottom:1px solid #eee8db;">${displayCountryReg || t.notProvided}</td>
              </tr>
              ${additionalNotes ? `
              <tr>
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; text-align:right; background:#f9f7f2; border-left:1px solid #eee8db;">${t.lblAdditionalNotes}</td>
                <td style="padding:4.5px 8px; color:#172c1a; text-align:right; white-space:pre-wrap;">${additionalNotes}</td>
              </tr>` : ''}
            </table>
          </div>

          <!-- EXACT USER MATCH FOOTER -->
          <div style="border-top:1px solid #e5dfd0; padding-top:8px; margin-top:12px; font-size:9px; color:#6b6454;">
            <table style="width:100%; border-collapse:collapse; margin-bottom:7px;" dir="rtl">
              <tr>
                <td style="vertical-align:top; text-align:right; width:50%; line-height:1.45; direction:rtl;">
                  <div style="font-weight:800; color:#234f20; font-size:10.5px; text-align:right; letter-spacing:normal;">مكتب تصدير ريفيا (REEFIYA)</div>
                  <div style="color:#666; font-size:8.5px; margin-top:1px; text-align:right;">144 شارع بورسعيد، الإبراهيمية بحري، الإسكندرية، مصر</div>
                  <div style="color:#234f20; font-size:8.5px; font-weight:600; margin-top:1px; text-align:right; direction:ltr; unicode-bidi:embed;">
                    exports@reefiya.com &bull; www.reefiya.com
                  </div>
                </td>
                <td style="vertical-align:top; text-align:left; width:50%; line-height:1.45; direction:ltr;">
                  <div style="font-family:monospace; font-weight:800; color:#234f20; font-size:11px; letter-spacing:0.5px; text-align:left;">
                    ${refNumber}
                  </div>
                  <div style="color:#726b5c; font-size:9px; margin-top:1px; text-align:left; direction:rtl;">
                    ${t.pageStr}
                  </div>
                </td>
              </tr>
            </table>
            <div style="border-top:1px solid #f2eee4; padding-top:5px; font-size:8px; color:#8c8577; text-align:center; font-style:italic;">
              ${t.footerDisclaimer}
            </div>
          </div>
        `;
      } else {
        container.style.fontFamily = "'Plus Jakarta Sans', system-ui, sans-serif";
        container.style.direction = 'ltr';
        container.style.textAlign = 'left';

        container.innerHTML = `
          <!-- HEADER -->
          <table style="width:100%; border-collapse:collapse; border-bottom:2px solid #234f20; padding-bottom:20px; margin-bottom:11px;">
            <tr>
              <td style="vertical-align:middle; text-align:left; width:50%;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <img src="${logoData}" alt="REEFIYA Logo" style="height:42px; width:auto; object-fit:contain; display:block;" />
                  <div style="width:1px; height:26px; background:#d4ccb8;"></div>
                  <div style="font-size:13px; font-weight:800; color:#234f20; letter-spacing:0.3px;">${t.deskTitle}</div>
                </div>
              </td>
              <td style="vertical-align:middle; text-align:right; width:50%;">
                <div style="font-size:13.5px; font-weight:800; color:#1c2720; letter-spacing:-0.2px;">
                  ${t.rfqTitle}
                </div>
                <div style="font-size:16px; font-weight:800; color:#234f20; margin-top:3px; margin-bottom:5px; font-family:monospace; letter-spacing:0.8px;">
                  ${refNumber}
                </div>
                <div style="display:flex; align-items:center; justify-content:flex-end; gap:8px; margin-bottom:6px;">
                  <span style="font-size:9.5px; font-weight:600; color:#4a4537;">${t.dateLabel} ${new Date().toLocaleDateString(t.dateLocale || 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span style="font-size:9.5px; font-weight:700; background:#e8f0e7; color:#234f20; padding:2px 8px; border-radius:10px; border:1px solid #c9dec7; display:inline-block;">${t.statusVal}</span>
                </div>
              </td>
            </tr>
          </table>

          <!-- COMMERCIAL NOTICE -->
          <div style="background:#faf8f3; border:1px solid #e7e1d2; border-radius:6px; padding:7px 11px; margin-bottom:10px; font-size:10px; color:#524c3e; line-height:1.45;">
            <strong style="color:#234f20;">${t.noticeTitle}</strong> ${t.noticeText}
          </div>

          <!-- SECTION 01: PRODUCT & PACKAGING -->
          <div style="margin-bottom:9px;">
            <div style="background:#234f20; color:#ffffff; padding:4px 9px; font-size:10.5px; font-weight:700; border-radius:4px; margin-bottom:3px;">
              ${t.sec1}
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:10.5px; border:1px solid #eee8db;">
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; width:32%; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblProduce}</td>
                <td style="padding:4.5px 8px; color:#172c1a; font-weight:700; border-bottom:1px solid #eee8db;">${produceName}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${itemsLabel}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${varieties}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${sizingLabel}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${sizing}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblPackaging}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${packaging}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblNetWeight}</td>
                <td style="padding:4.5px 8px; color:#172c1a; font-weight:600; border-bottom:1px solid #eee8db;">${packagingWeightsDisplay}</td>
              </tr>
              <tr>
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db;">${t.lblPrivateLabel}</td>
                <td style="padding:4.5px 8px; color:#172c1a;">${privateLabel}</td>
              </tr>
            </table>
          </div>

          <!-- SECTION 02: VOLUME & SHIPPING -->
          <div style="margin-bottom:9px;">
            <div style="background:#234f20; color:#ffffff; padding:4px 9px; font-size:10.5px; font-weight:700; border-radius:4px; margin-bottom:3px;">
              ${t.sec2}
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:10.5px; border:1px solid #eee8db;">
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; width:32%; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblOrderVolume}</td>
                <td style="padding:4.5px 8px; color:#172c1a; font-weight:700; border-bottom:1px solid #eee8db;">${displayOrderVolume}</td>
              </tr>
              ${displayContainerCount ? `
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblContainerCount}</td>
                <td style="padding:4.5px 8px; color:#172c1a; font-weight:600; border-bottom:1px solid #eee8db;">${displayContainerCount}</td>
              </tr>` : ''}
              ${displaySupplyFreq ? `
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblSupplyFreq}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${displaySupplyFreq}</td>
              </tr>` : ''}
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblDestCountry}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${destCountry}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblDestPort}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${displayDestPort}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblIncoterm}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${incoterm}</td>
              </tr>
              <tr>
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db;">${t.lblShippingWindow}</td>
                <td style="padding:4.5px 8px; color:#172c1a;">${shippingWindow}</td>
              </tr>
            </table>
            ${showLoadingNote ? `
            <div style="font-size:9px; color:#777; margin-top:3px; padding-left:6px; line-height:1.35; font-style:italic;">
              * ${t.techLoadingNote}
            </div>` : ''}
          </div>

          <!-- SECTION 03: COMPANY & CONTACT -->
          <div style="margin-bottom:10px;">
            <div style="background:#234f20; color:#ffffff; padding:4px 9px; font-size:10.5px; font-weight:700; border-radius:4px; margin-bottom:3px;">
              ${t.sec3}
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:10.5px; border:1px solid #eee8db;">
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; width:32%; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblCompanyName}</td>
                <td style="padding:4.5px 8px; color:#172c1a; font-weight:700; border-bottom:1px solid #eee8db;">${companyName}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblContactPerson}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${contactPerson}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblJobTitle}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${jobTitle || t.notProvided}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblBusinessEmail}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;"><span style="font-family:monospace;">${businessEmail}</span></td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblBusinessPhone}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;"><span style="font-family:monospace;">${fullPhone}</span></td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblCompanyWebsite}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${companyWebsite || t.notProvided}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee8db;">
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db; border-bottom:1px solid #eee8db;">${t.lblCountryReg}</td>
                <td style="padding:4.5px 8px; color:#172c1a; border-bottom:1px solid #eee8db;">${displayCountryReg || t.notProvided}</td>
              </tr>
              ${additionalNotes ? `
              <tr>
                <td style="padding:4.5px 8px; font-weight:700; color:#4a4537; background:#f9f7f2; border-right:1px solid #eee8db;">${t.lblAdditionalNotes}</td>
                <td style="padding:4.5px 8px; color:#172c1a; white-space:pre-wrap;">${additionalNotes}</td>
              </tr>` : ''}
            </table>
          </div>

          <!-- EXACT USER MATCH FOOTER -->
          <div style="border-top:1px solid #e5dfd0; padding-top:8px; margin-top:12px; font-size:9px; color:#6b6454;">
            <table style="width:100%; border-collapse:collapse; margin-bottom:7px;">
              <tr>
                <td style="vertical-align:top; text-align:left; width:50%; line-height:1.45;">
                  <div style="font-weight:800; color:#234f20; font-size:10.5px;">REEFIYA Export Desk</div>
                  <div style="color:#666; font-size:8.5px; margin-top:1px;">144 Port Said St, El Ibrahimaia Bahry, Alexandria, Egypt</div>
                  <div style="color:#234f20; font-size:8.5px; font-weight:600; margin-top:1px;">
                    exports@reefiya.com &bull; www.reefiya.com
                  </div>
                </td>
                <td style="vertical-align:top; text-align:right; width:50%; line-height:1.45;">
                  <div style="font-family:monospace; font-weight:800; color:#234f20; font-size:11px; letter-spacing:0.5px;">
                    ${refNumber}
                  </div>
                  <div style="color:#726b5c; font-size:9px; margin-top:1px;">
                    ${t.pageStr}
                  </div>
                </td>
              </tr>
            </table>
            <div style="border-top:1px solid #f2eee4; padding-top:5px; font-size:8px; color:#8c8577; text-align:center; font-style:italic;">
              ${t.footerDisclaimer}
            </div>
          </div>
        `;
      }
      return { container, refNumber, isArabic };
    }

    /* ==========================================================================
       UNIFIED COMMERCIAL RFQ PDF GENERATOR (100% IDENTICAL FOR DOWNLOAD & EMAIL)
       ========================================================================== */
    function generateRfqPdfDocument(refNumberOverride) {
      return new Promise((resolve, reject) => {
        try {
          const built = buildRfqPdfContainer(refNumberOverride);
          if (!built || !built.container) {
            return reject(new Error('Could not build PDF container'));
          }
          const { container, refNumber, isArabic } = built;

          document.body.appendChild(container);

          // Save user current scroll position to avoid html2canvas offset bug
          const prevScrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
          const prevScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
          window.scrollTo(0, 0);

          const proceedWithRender = () => {
            if (typeof window.html2canvas !== 'undefined' && typeof html2pdf !== 'undefined') {
              window.html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0
              }).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                if (container.parentNode) document.body.removeChild(container);
                window.scrollTo(prevScrollX, prevScrollY);

                const dummy = document.createElement('div');
                document.body.appendChild(dummy);
                const w = html2pdf().from(dummy).set({
                  margin: 0,
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                }).toPdf();

                w.get('pdf').then(pdf => {
                  if (dummy.parentNode) document.body.removeChild(dummy);
                  const pageWidth = 210;
                  const margin = 8;
                  const usableWidth = pageWidth - (margin * 2);
                  const imgHeight = (canvas.height * usableWidth) / canvas.width;

                  pdf.addImage(imgData, 'JPEG', margin, margin, usableWidth, imgHeight);
                  const fullDataUri = pdf.output('datauristring');
                  const pureBase64 = fullDataUri.includes('base64,') ? fullDataUri.split('base64,').pop().trim() : fullDataUri.trim();

                  const result = {
                    pdf,
                    refNumber,
                    isArabic,
                    filename: `REEFIYA_${refNumber}.pdf`,
                    dataUri: fullDataUri,
                    base64: pureBase64
                  };
                  window._cachedGeneratedPdf = result;
                  resolve(result);
                }).catch(err => {
                  if (dummy.parentNode) document.body.removeChild(dummy);
                  if (container.parentNode) document.body.removeChild(container);
                  window.scrollTo(prevScrollX, prevScrollY);
                  reject(err);
                });
              }).catch(err => {
                if (container.parentNode) document.body.removeChild(container);
                window.scrollTo(prevScrollX, prevScrollY);
                reject(err);
              });
            } else {
              if (container.parentNode) document.body.removeChild(container);
              window.scrollTo(prevScrollX, prevScrollY);
              reject(new Error('html2canvas or html2pdf not available'));
            }
          };

          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
              setTimeout(proceedWithRender, 150);
            });
          } else {
            setTimeout(proceedWithRender, 200);
          }
        } catch (e) {
          reject(e);
        }
      });
    }
    window.generateRfqPdfDocument = generateRfqPdfDocument;

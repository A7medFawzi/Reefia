/* 1. UNIQUE REFERENCE CODE GENERATOR */
    function getUniqueReference() {
      const stored = sessionStorage.getItem('reefiya_opt3_ref');
      if (stored) return stored;

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const timeHex = now.getTime().toString(36).toUpperCase().slice(-5);

      const cryptoBuf = new Uint16Array(2);
      window.crypto.getRandomValues(cryptoBuf);
      const r1 = cryptoBuf[0].toString(36).toUpperCase().padStart(3, '0').slice(-3);
      const r2 = cryptoBuf[1].toString(36).toUpperCase().padStart(3, '0').slice(-3);

      const code = `RFQ-${year}${month}-${timeHex}-${r1}${r2}`;
      sessionStorage.setItem('reefiya_opt3_ref', code);
      return code;
    }

    const currentRef = getUniqueReference();
    const liveRefEl = document.getElementById('liveReferenceCode');
    if (liveRefEl) liveRefEl.textContent = currentRef;

/* 2. REALTIME LIVE SUMMARY SYNC */
    function updateLiveSummary() {
      const d = langDict[currentLang] || langDict['en'];
      const emptyPlaceholder = d.sumNotSelected || 'Not selected yet';
      const notSpecPlaceholder = d.sumNotSpecified || 'Not specified';

      // 0. Programme (fresh / industrial / frozen) drives the product rows
      const prog = getProgramme();
      const isFrozen = prog === 'Frozen';
      const isInd = prog === 'Industrial';
      const progTitle = { Fresh: d.progFreshTitle, Industrial: d.progIndTitle, Frozen: d.progFrozenTitle }[prog] || prog;
      const prodValEl = document.getElementById('sumProductVal');
      if (prodValEl) prodValEl.textContent = `${d.valProduce || 'Egyptian Sweet Potatoes'} · ${progTitle}`;
      const lblVarEl = document.getElementById('lblSumVarieties');
      if (lblVarEl) lblVarEl.textContent = isFrozen ? (d.sumProducts || 'Products:') : (d.sumVarieties || 'Preferred Varieties:');
      const lblSizeEl = document.getElementById('lblSumSizing');
      if (lblSizeEl) lblSizeEl.textContent = isFrozen ? (d.sumSpec || 'Specification:') : d.sumSizing;
      const reqSizeEl = document.getElementById('reqSizingStar');
      if (reqSizeEl) reqSizeEl.textContent = isInd ? (d.reqSizingInd || d.reqSizing) : d.reqSizing;
      renumberStep1();

      // 1. Varieties mapping
      const varietyMap = {
        'Beauregard': d.vNameBeau || 'Beauregard',
        'Bellevue': d.vNameBellevue || 'Bellevue',
        'Other Egyptian Varieties (Seasonal)': d.vNameEgy || 'Other Egyptian Varieties (Seasonal)'
      };
      const selectedVarieties = Array.from(document.querySelectorAll('.chk-variety:checked')).map(el => {
        return varietyMap[el.value] || el.value;
      });
      const vEl = document.getElementById('sumVarietiesVal');
      if (vEl) {
        if (selectedVarieties.length === 0) {
          vEl.textContent = emptyPlaceholder;
          vEl.style.color = '#736b5b';
        } else {
          vEl.textContent = selectedVarieties.join(currentLang === 'ar' ? '، ' : ', ');
          vEl.style.color = '#172c1a';
        }
      }

      // 2. Sizing mapping (e.g. S (100–150g), M (150–300g), etc.)
      const selectedSizing = Array.from(document.querySelectorAll('.chk-size:checked')).map(el => {
        let val = el.value;
        if (currentLang === 'ar') {
          val = val.replace('150g', '150 جم').replace('300g', '300 جم').replace('450g', '450 جم').replace('600g', '600 جم').replace('600g+', '+600 جم');
        }
        return val;
      });
      const sEl = document.getElementById('sumSizingVal');
      if (sEl) {
        if (selectedSizing.length === 0) {
          sEl.textContent = emptyPlaceholder;
          sEl.style.color = '#736b5b';
        } else {
          sEl.textContent = selectedSizing.join(currentLang === 'ar' ? '، ' : ', ');
          sEl.style.color = '#172c1a';
        }
      }

      // 3. Packaging mapping
      const pkgMap = {
        'Carton Boxes': d.pkgNameCarton || 'Carton Boxes',
        'Wooden Crates': d.pkgNameWood || 'Wooden Crates',
        'Mesh Bags': d.pkgNameMesh || 'Mesh Bags',
        'Plastic Crates': d.pkgNamePlastic || 'Plastic Crates',
        'Bulk Pallet Bins': d.pkgNameBin || 'Bulk Pallet Bins',
        'Need Packaging Recommendation': d.pkgNameRec || (currentLang === 'ar' ? 'نحتاج توصية التعبئة والتغليف' : 'Packaging Recommendation Requested')
      };
      const selectedPkg = Array.from(document.querySelectorAll('.chk-pkg:checked')).map(el => {
        return pkgMap[el.value] || el.value;
      });
      const pEl = document.getElementById('sumPackagingVal');
      if (pEl) {
        if (selectedPkg.length === 0) {
          pEl.textContent = emptyPlaceholder;
          pEl.style.color = '#736b5b';
        } else {
          pEl.textContent = selectedPkg.join(currentLang === 'ar' ? '، ' : ', ');
          pEl.style.color = '#172c1a';
        }
      }

      // 4. Net Weight
      const checkedWeight = document.querySelector('input[name="netWeight"]:checked');
      const wEl = document.getElementById('sumNetWeightVal');
      if (wEl) {
        if (checkedWeight) {
          const customInput = document.getElementById('inputCustomWeightSpec');
          const customVal = customInput ? customInput.value.trim() : '';
          if (checkedWeight.value === 'Custom Weight Requirements') {
            wEl.textContent = customVal ? customVal : (d.sumCustomWeight || d.wtNotSpecTitle || 'Custom Weight Requirements');
          } else {
            wEl.textContent = d.sumStandardWeight || d.wtStandardTitle || 'REEFIYA Standard Weights';
          }
          wEl.style.color = '#172c1a';
        } else {
          wEl.textContent = emptyPlaceholder;
          wEl.style.color = '#736b5b';
        }
      }

      // Programme overrides for the product rows
      const setRow = (el, text, filled) => {
        if (!el) return;
        el.textContent = text;
        el.style.color = filled ? '#172c1a' : '#736b5b';
      };
      if (isFrozen) {
        const frozenNames = getFrozenSelection(d).map(f => f.name);
        setRow(vEl, frozenNames.length ? frozenNames.join(currentLang === 'ar' ? '، ' : ', ') : emptyPlaceholder, frozenNames.length > 0);
        const specInp = document.getElementById('inputFrozenSpec');
        const spec = specInp ? specInp.value.trim() : '';
        setRow(sEl, spec || d.sumPerSpec || 'As per buyer specification', true);
        setRow(pEl, d.sumFrozenPacks || 'Frozen packs · Reefiya label', true);
        const weights = getFrozenSelection(d).map(f => f.weight);
        setRow(wEl, weights.length ? weights.join(' · ') : emptyPlaceholder, weights.length > 0);
      } else if (isInd && selectedSizing.length === 0) {
        setRow(sEl, d.sumPerSpec || 'As per buyer specification', true);
      }

      // 5. Private Label
      const checkedPL = document.querySelector('input[name="privateLabel"]:checked');
      const plEl = document.getElementById('sumPrivateLabelVal');
      if (plEl) {
        if (checkedPL) {
          if (checkedPL.value.startsWith('Yes')) {
            plEl.textContent = d.plYesTitle || 'Yes, buyer branding required';
          } else {
            plEl.textContent = d.plNoTitle || 'No, REEFIYA standard packaging';
          }
          plEl.style.color = '#172c1a';
        } else {
          plEl.textContent = emptyPlaceholder;
          plEl.style.color = '#736b5b';
        }
      }

      // --- STEP 02 LIVE SUMMARY SYNC ---
      // 6. Order Volume
      const volSelect = document.getElementById('selectOrderVolume');
      const sumVolEl = document.getElementById('sumOrderVolumeVal');
      if (volSelect && sumVolEl) {
        const val = volSelect.value;
        if (!val) {
          sumVolEl.textContent = notSpecPlaceholder;
          sumVolEl.style.color = '#736b5b';
        } else {
          let displayVol = val;
          if (val === 'Trial Order') {
            const qty = document.getElementById('inputTrialQty') ? document.getElementById('inputTrialQty').value.trim() : '';
            const trialLabel = currentLang === 'ar' ? 'طلب تجريبي' : (d.optVolTrial ? d.optVolTrial.split('—')[0].trim() : 'Trial Order');
            displayVol = qty ? `${trialLabel} (${qty})` : trialLabel;
          } else if (val.includes('1 x 40ft Reefer') || val === '1 x 40ft Reefer') {
            displayVol = d.optVol1Reefer ? d.optVol1Reefer.split('—')[0].trim() : (currentLang === 'ar' ? '1 × حاوية مبردة 40 قدم' : '1 x 40ft Reefer');
          } else if (val.includes('2–5') || val.includes('2-5')) {
            const cnt = document.getElementById('select2to5Containers') ? document.getElementById('select2to5Containers').value : '';
            const base25 = currentLang === 'ar' ? '2–5 حاويات مبردة' : '2–5 Reefers';
            displayVol = cnt ? `${base25} (${cnt})` : base25;
          } else if (val.includes('6+')) {
            const cnt = document.getElementById('input6plusCount') ? document.getElementById('input6plusCount').value.trim() : '';
            const freq = document.getElementById('selectSupplyFrequency') ? document.getElementById('selectSupplyFrequency').value : '';
            const base6 = currentLang === 'ar' ? (cnt ? `${cnt} حاويات مبردة` : '6+ حاويات مبردة') : (cnt ? `${cnt} Reefers` : '6+ Reefers');
            let freqLabel = '';
            if (freq && freq !== 'Single Shipment') {
              if (freq === 'Monthly Supply') freqLabel = d.optFreqMonthly || (currentLang === 'ar' ? 'توريد شهري' : 'Monthly Supply');
              else if (freq === 'Seasonal Supply Program') freqLabel = currentLang === 'ar' ? 'برنامج توريد موسمي' : 'Seasonal Supply';
              else if (freq === 'To Be Discussed') freqLabel = currentLang === 'ar' ? 'يتم الاتفاق عليه' : 'To Be Discussed';
              else freqLabel = freq;
            }
            displayVol = freqLabel ? `${base6} • ${freqLabel}` : base6;
          } else if (val === 'Industrial Bulk Order') {
            const qty = document.getElementById('inputIndustrialQty') ? document.getElementById('inputIndustrialQty').value.trim() : '';
            const indLabel = currentLang === 'ar' ? 'طلب صناعي بالجملة' : 'Industrial Bulk';
            displayVol = qty ? `${indLabel} (${qty})` : indLabel;
          } else if (val === 'Custom Volume') {
            const qty = document.getElementById('inputCustomVolumeQty') ? document.getElementById('inputCustomVolumeQty').value.trim() : '';
            const custLabel = currentLang === 'ar' ? 'حجم مخصص' : 'Custom Volume';
            displayVol = qty ? `${custLabel} (${qty})` : custLabel;
          }
          sumVolEl.textContent = displayVol;
          sumVolEl.style.color = '#172c1a';
        }
      }

      // 7. Destination Country
      const hiddenCountry = document.getElementById('hiddenDestinationCountry');
      const sumCountryEl = document.getElementById('sumDestinationCountryVal');
      if (hiddenCountry && sumCountryEl) {
        const cVal = hiddenCountry.value;
        if (!cVal) {
          sumCountryEl.textContent = notSpecPlaceholder;
          sumCountryEl.style.color = '#736b5b';
        } else if (cVal === 'Other') {
          const customCountry = document.getElementById('inputOtherCountry') ? document.getElementById('inputOtherCountry').value.trim() : '';
          sumCountryEl.textContent = customCountry ? customCountry : (currentLang === 'ar' ? 'دولة أخرى' : 'Other Country');
          sumCountryEl.style.color = '#172c1a';
        } else {
          // If in country translation list or already localized
          sumCountryEl.textContent = cVal;
          sumCountryEl.style.color = '#172c1a';
        }
      }

      // 8. Destination Port
      const isPortAssisted = document.getElementById('chkPortAssistance') ? document.getElementById('chkPortAssistance').checked : false;
      const portInput = document.getElementById('inputDestPort');
      const sumPortEl = document.getElementById('sumDestinationPortVal');
      if (sumPortEl) {
        if (isPortAssisted) {
          sumPortEl.textContent = d.txtPortAssistanceTag || (currentLang === 'ar' ? 'طلب استشارة الميناء' : 'Port Assistance Requested');
          sumPortEl.style.color = '#234f20';
        } else if (portInput && portInput.value.trim()) {
          sumPortEl.textContent = portInput.value.trim();
          sumPortEl.style.color = '#172c1a';
        } else {
          sumPortEl.textContent = notSpecPlaceholder;
          sumPortEl.style.color = '#736b5b';
        }
      }

      // 9. Incoterm
      const incoSelect = document.getElementById('selectIncoterm');
      const sumIncoEl = document.getElementById('sumIncotermVal');
      if (incoSelect && sumIncoEl) {
        const iVal = incoSelect.value;
        if (!iVal) {
          sumIncoEl.textContent = notSpecPlaceholder;
          sumIncoEl.style.color = '#736b5b';
        } else {
          if (iVal.startsWith('Not Sure')) {
            sumIncoEl.textContent = currentLang === 'ar' ? 'طلب استشارة شحن' : (d.optIncoNotSure || 'Advice Requested');
          } else {
            sumIncoEl.textContent = iVal;
          }
          sumIncoEl.style.color = '#172c1a';
        }
      }

      // 10. Target Shipping Window
      const winSelect = document.getElementById('selectShippingWindow');
      const sumWinEl = document.getElementById('sumShippingWindowVal');
      if (winSelect && sumWinEl) {
        const wVal = winSelect.value;
        if (!wVal) {
          sumWinEl.textContent = notSpecPlaceholder;
          sumWinEl.style.color = '#736b5b';
        } else if (wVal === 'Within 30 Days') {
          sumWinEl.textContent = d.optShipWin30 || (currentLang === 'ar' ? 'خلال 30 يوماً' : 'Within 30 Days');
          sumWinEl.style.color = '#172c1a';
        } else if (wVal === 'Flexible / To Be Discussed') {
          sumWinEl.textContent = d.optShipWinFlexible || (currentLang === 'ar' ? 'مرن / يتم مناقشته' : 'Flexible / To Be Discussed');
          sumWinEl.style.color = '#172c1a';
        } else if (wVal === 'Specific Month') {
          const mVal = document.getElementById('selectShipMonth') ? document.getElementById('selectShipMonth').value : '';
          const yVal = document.getElementById('selectShipYear') ? document.getElementById('selectShipYear').value : '';
          const displayMonth = getLocalizedMonthName(mVal);
          sumWinEl.textContent = (displayMonth && yVal) ? `${displayMonth} ${yVal}` : (d.optShipWinSpecific || 'Specific Month');
          sumWinEl.style.color = '#172c1a';
        } else {
          sumWinEl.textContent = wVal;
          sumWinEl.style.color = '#172c1a';
        }
      }

      // 11. Registered Company Name
      const compInp = document.getElementById('inputCompanyName');
      const sumCompEl = document.getElementById('sumCompanyVal');
      if (compInp && sumCompEl) {
        const cName = compInp.value.trim();
        if (cName) {
          sumCompEl.textContent = cName;
          sumCompEl.style.color = '#172c1a';
        } else {
          sumCompEl.textContent = notSpecPlaceholder;
          sumCompEl.style.color = '#736b5b';
        }
      }

      // 12. Contact Person
      const contactInp = document.getElementById('inputContactName');
      const jobInp = document.getElementById('inputJobTitle');
      const sumContactEl = document.getElementById('sumContactPersonVal');
      if (contactInp && sumContactEl) {
        const cPerson = contactInp.value.trim();
        const jTitle = jobInp ? jobInp.value.trim() : '';
        if (cPerson) {
          sumContactEl.textContent = jTitle ? `${cPerson} (${jTitle})` : cPerson;
          sumContactEl.style.color = '#172c1a';
        } else {
          sumContactEl.textContent = notSpecPlaceholder;
          sumContactEl.style.color = '#736b5b';
        }
      }

      // 13. Business Email
      const emailInp = document.getElementById('inputBusinessEmail');
      const sumEmailEl = document.getElementById('sumBusinessEmailVal');
      if (emailInp && sumEmailEl) {
        const eMail = emailInp.value.trim();
        if (eMail) {
          sumEmailEl.textContent = eMail;
          sumEmailEl.style.color = '#172c1a';
        } else {
          sumEmailEl.textContent = notSpecPlaceholder;
          sumEmailEl.style.color = '#736b5b';
        }
      }

      // 14. Dynamic Step Progress Completion Indicator
      const stepCounterEl = document.getElementById('txtStepCountLabel');
      if (stepCounterEl) {
        const isStep1Complete = step1MissingMessage() === null;
        if (isStep1Complete) {
          stepCounterEl.innerHTML = currentLang === 'ar' 
            ? '<span style="color:#234f20; font-weight:800;">✓ تم استيفاء:</span> <strong>الخطوة 01 من 03</strong>'
            : '<span style="color:#234f20; font-weight:800;">✓ Completed:</span> <strong>Step 01 of 03</strong>';
        } else {
          stepCounterEl.innerHTML = currentLang === 'ar' 
            ? '<span>الخطوة 01 من 03</span>'
            : '<span>Step 01 of 03</span>';
        }
      }
    }

    /* PROGRAMME: fresh export, industrial supply or frozen products */
    function getProgramme() {
      const r = document.querySelector('input[name="programme"]:checked');
      return r ? r.value : 'Fresh';
    }

    function getFrozenSelection(d) {
      const items = {
        'Frozen sweet potato cubes (1 kg pack)': { name: `${d.frzCubesTitle || 'Frozen sweet potato cubes'} (1 kg)`, nameAr: 'مكعبات بطاطا حلوة مجمدة (1 كجم)', weight: '1 kg' },
        'Battered sweet potato fries 5/16 in (1.13 kg pack)': { name: `${d.frzFriesTitle || 'Battered sweet potato fries'} 5/16″ (1.13 kg)`, nameAr: 'أصابع بطاطا حلوة مغلفة 5/16″ (1.13 كجم)', weight: '1.13 kg' }
      };
      return Array.from(document.querySelectorAll('.chk-frozen:checked')).map(el => items[el.value] || { name: el.value, nameAr: el.value, weight: '' });
    }

    // Number the visible step-1 questions 1, 2, 3… (the set changes with the programme)
    function renumberStep1() {
      const form = document.getElementById('step1Form');
      if (!form) return;
      let n = 0;
      form.querySelectorAll('.form-group-item').forEach(item => {
        if (item.hidden) return;
        n += 1;
        const num = item.querySelector('.label-title > span:first-child');
        if (num) num.textContent = `${n}.`;
      });
    }

    function handleProgrammeChange() {
      const prog = getProgramme();
      const isFrozen = prog === 'Frozen';
      ['grpVariety', 'grpSizing', 'grpPackaging', 'grpNetWeight'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = isFrozen;
      });
      const frozenGrp = document.getElementById('grpFrozen');
      if (frozenGrp) frozenGrp.hidden = !isFrozen;

      // "Industrial bulk order" makes no sense for frozen products
      const indOpt = document.getElementById('optVolIndustrial');
      const volSel = document.getElementById('selectOrderVolume');
      if (indOpt) { indOpt.hidden = isFrozen; indOpt.disabled = isFrozen; }
      if (isFrozen && volSel && volSel.value === 'Industrial Bulk Order') {
        volSel.value = '';
        if (typeof handleVolumeChange === 'function') handleVolumeChange();
      }

      if (prog === 'Industrial') {
        // Sensible defaults for factory supply; the buyer can still change them.
        if (!document.querySelectorAll('.chk-pkg:checked').length) {
          const bins = document.querySelector('.chk-pkg[value="Bulk Pallet Bins"]');
          if (bins) bins.checked = true;
        }
        const vol = document.getElementById('selectOrderVolume');
        if (vol && !vol.value) {
          vol.value = 'Industrial Bulk Order';
          if (typeof handleVolumeChange === 'function') handleVolumeChange();
        }
      }
      updateLiveSummary();
    }

    /* 3. CONDITIONAL DRAWERS */
    function handleWeightModeToggle(isCustom) {
      const drawer = document.getElementById('drawerCustomWeightSpec');
      if (drawer) {
        drawer.style.display = isCustom ? 'block' : 'none';
      }
    }

    function handlePrivateLabelToggle(isYes) {
      const drawer = document.getElementById('drawerPrivateLabel');
      if (isYes) drawer.classList.add('visible');
      else drawer.classList.remove('visible');
    }

    /* 4. VALIDATION */
    let toastHideTimeout = null;
    function displayToastAlert(msg, isSuccess = false) {
      const box = document.getElementById('toastAlert');
      const text = document.getElementById('toastAlertMessage');
      if (!box || !text) return;

      const iconSpan = box.querySelector('span:first-child');
      if (iconSpan) {
        iconSpan.textContent = isSuccess ? '✓' : '⚠️';
      }

      if (isSuccess) {
        box.classList.remove('toast-error');
      } else {
        box.classList.add('toast-error');
      }

      text.textContent = msg;
      box.style.display = 'flex';

      if (toastHideTimeout) clearTimeout(toastHideTimeout);
      toastHideTimeout = setTimeout(() => {
        box.style.display = 'none';
      }, 3500);
    }

    // Returns the first missing-field message for step 1, or null when step 1 is complete.
    function step1MissingMessage() {
      const d = langDict[currentLang] || langDict['en'];
      const ar = currentLang === 'ar';
      const prog = getProgramme();
      if (prog === 'Frozen') {
        return document.querySelectorAll('.chk-frozen:checked').length ? null
          : (d.toastFrozen || 'Please select at least one frozen product.');
      }
      if (!document.querySelectorAll('.chk-variety:checked').length) {
        return ar ? 'يرجى اختيار صنف واحد على الأقل من أصناف البطاطا.' : 'Please select at least one sweet potato variety.';
      }
      // Industrial buyers agree size and grade with us, so sizing is optional for them.
      if (prog !== 'Industrial' && !document.querySelectorAll('.chk-size:checked').length) {
        return ar ? 'يرجى اختيار حجم / كاليبر واحد على الأقل.' : 'Please select at least one sizing calibration.';
      }
      if (!document.querySelectorAll('.chk-pkg:checked').length) {
        return ar ? 'يرجى اختيار حل تعبئة واحد على الأقل.' : 'Please select at least one packaging solution.';
      }
      return null;
    }

    function validateStep1() {
      const msg = step1MissingMessage();
      if (msg) {
        displayToastAlert(msg);
        return;
      }
      goToStep(2);
    }

    /* WIZARD STEP NAVIGATION */
    let currentStep = 1;

    function goToStep(stepNum) {
      currentStep = stepNum;
      if (stepNum === 3) ensurePdfModule().catch(() => {});
      const s1 = document.getElementById('step1Container');
      const s2 = document.getElementById('step2Container');
      const s3 = document.getElementById('step3Container');
      const tab1 = document.getElementById('tabStep1');
      const tab2 = document.getElementById('tabStep2');
      const tab3 = document.getElementById('tabStep3');

      if (stepNum === 1) {
        if (s1) s1.classList.remove('hidden');
        if (s2) s2.classList.add('hidden');
        if (s3) s3.classList.add('hidden');
        if (tab1) tab1.classList.add('active');
        if (tab2) tab2.classList.remove('active');
        if (tab3) tab3.classList.remove('active');
      } else if (stepNum === 2) {
        if (s1) s1.classList.add('hidden');
        if (s2) s2.classList.remove('hidden');
        if (s3) s3.classList.add('hidden');
        if (tab1) tab1.classList.remove('active');
        if (tab2) tab2.classList.add('active');
        if (tab3) tab3.classList.remove('active');
      } else if (stepNum === 3) {
        if (s1) s1.classList.add('hidden');
        if (s2) s2.classList.add('hidden');
        if (s3) s3.classList.remove('hidden');
        if (tab1) tab1.classList.remove('active');
        if (tab2) tab2.classList.remove('active');
        if (tab3) tab3.classList.add('active');
      }
      window.scrollTo({ top: 320, behavior: 'smooth' });
      updateLiveSummary();
    }

    /* STEP 2 HANDLERS */
    function handleVolumeChange() {
      const vol = document.getElementById('selectOrderVolume').value;
      const dTrial = document.getElementById('drawerTrialQty');
      const d2to5 = document.getElementById('drawer2to5Qty');
      const d6plus = document.getElementById('drawer6plusQty');
      const dInd = document.getElementById('drawerIndustrialQty');
      const dCust = document.getElementById('drawerCustomVolumeQty');

      if (dTrial) dTrial.style.display = (vol === 'Trial Order') ? 'block' : 'none';
      if (d2to5) d2to5.style.display = (vol === '2–5 x 40ft Reefers') ? 'block' : 'none';
      if (d6plus) d6plus.style.display = (vol === '6+ x 40ft Reefers') ? 'block' : 'none';
      if (dInd) dInd.style.display = (vol === 'Industrial Bulk Order') ? 'block' : 'none';
      if (dCust) dCust.style.display = (vol === 'Custom Volume') ? 'block' : 'none';
    }

    function handlePortAssistanceToggle(isAssisted) {
      const portInput = document.getElementById('inputDestPort');
      if (portInput) {
        if (isAssisted) {
          portInput.value = '';
          portInput.disabled = true;
          portInput.style.backgroundColor = '#f7f5ee';
          portInput.placeholder = (langDict[currentLang] && langDict[currentLang].txtPortAssistancePlaceholder)
            ? langDict[currentLang].txtPortAssistancePlaceholder
            : 'Assistance Requested — Our export team will advise';
        } else {
          portInput.disabled = false;
          portInput.style.backgroundColor = '#ffffff';
          portInput.placeholder = 'e.g., Rotterdam, Felixstowe, Jeddah Islamic Port';
        }
      }
    }

    /* DYNAMIC FUTURE SHIPPING MONTHS & YEARS (STRICTLY FUTURE DATES ONLY) */
    const monthNamesI18n = {
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      nl: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
      fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
      ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    };

    const standardMonthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    function getLocalizedMonthName(monthVal, lang = currentLang) {
      if (!monthVal) return '';
      const idx = standardMonthNamesEn.indexOf(monthVal);
      if (idx !== -1) {
        const langList = monthNamesI18n[lang] || monthNamesI18n['en'];
        return langList[idx] || monthVal;
      }
      return monthVal;
    }

    function updateFutureShippingDates() {
      const yearSelect = document.getElementById('selectShipYear');
      const monthSelect = document.getElementById('selectShipMonth');
      if (!yearSelect || !monthSelect) return;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthIndex = now.getMonth(); // 0 to 11

      // 1. Populate Years if empty or outdated
      const prevSelectedYear = yearSelect.value;
      const expectedYears = [currentYear, currentYear + 1, currentYear + 2];
      const existingOptions = Array.from(yearSelect.options).map(o => parseInt(o.value, 10));
      const yearsMatch = existingOptions.length === expectedYears.length && existingOptions.every((v, i) => v === expectedYears[i]);

      if (!yearsMatch) {
        yearSelect.innerHTML = '';
        expectedYears.forEach(yr => {
          const opt = document.createElement('option');
          opt.value = String(yr);
          opt.textContent = String(yr);
          yearSelect.appendChild(opt);
        });
        if (prevSelectedYear && expectedYears.includes(parseInt(prevSelectedYear, 10))) {
          yearSelect.value = prevSelectedYear;
        } else {
          yearSelect.value = String(currentYear);
        }
      }

      const selectedYear = parseInt(yearSelect.value, 10) || currentYear;
      const prevSelectedMonth = monthSelect.value;

      // 2. Populate Months strictly filtering out past months
      const d = (typeof langDict !== 'undefined' && langDict[currentLang]) ? langDict[currentLang] : {};
      const monthPlaceholders = {
        en: 'Month',
        ar: 'الشهر',
        nl: 'Maand',
        fr: 'Mois',
        de: 'Monat',
        es: 'Mes',
        it: 'Mese',
        ru: 'Месяц',
        tr: 'Ay'
      };
      const placeholderText = (d && d.optMonthPlaceholder) || monthPlaceholders[currentLang] || 'Month';

      monthSelect.innerHTML = `<option value="" disabled selected id="optMonthPlaceholder">${placeholderText}</option>`;

      const localizedNames = monthNamesI18n[currentLang] || monthNamesI18n['en'];
      let prevMonthStillValid = false;

      for (let i = 0; i < 12; i++) {
        // If selected year is the current year, past months are strictly disallowed (client requested only future dates)
        if (selectedYear === currentYear && i < currentMonthIndex) {
          continue; // Omit past months completely so customer cannot select a past month
        }
        const opt = document.createElement('option');
        opt.value = standardMonthNamesEn[i];
        opt.textContent = localizedNames[i] || standardMonthNamesEn[i];
        if (standardMonthNamesEn[i] === prevSelectedMonth) {
          opt.selected = true;
          prevMonthStillValid = true;
        }
        monthSelect.appendChild(opt);
      }

      if (!prevMonthStillValid) {
        monthSelect.value = '';
      }
    }

    function handleShippingYearChange() {
      updateFutureShippingDates();
      updateLiveSummary();
    }

    function handleShippingWindowChange() {
      const win = document.getElementById('selectShippingWindow').value;
      const dMonth = document.getElementById('drawerSpecificMonth');
      if (dMonth) {
        dMonth.style.display = (win === 'Specific Month') ? 'block' : 'none';
      }
      if (win === 'Specific Month') {
        updateFutureShippingDates();
      } else {
        const m = document.getElementById('selectShipMonth');
        if (m) m.value = '';
      }
    }

    /* SEARCHABLE COUNTRY DROPDOWN LOGIC - ORDERED BY USER REQUIREMENTS */
    const countryGroups = [
      {
        groupId: 'europe',
        groupLabelEn: 'European Countries',
        groupLabelAr: 'الدول الأوروبية',
        countries: [
          { name: 'Netherlands', flag: '/flags/nl.svg', code: 'NL' },
          { name: 'United Kingdom', flag: '/flags/gb.svg', code: 'GB' },
          { name: 'Germany', flag: '/flags/de.svg', code: 'DE' },
          { name: 'France', flag: '/flags/fr.svg', code: 'FR' },
          { name: 'Spain', flag: '/flags/es.svg', code: 'ES' },
          { name: 'Italy', flag: '/flags/it.svg', code: 'IT' },
          { name: 'Belgium', flag: '/flags/be.svg', code: 'BE' },
          { name: 'Poland', flag: '/flags/pl.svg', code: 'PL' },
          { name: 'Greece', flag: '/flags/gr.svg', code: 'GR' },
          { name: 'Portugal', flag: '/flags/pt.svg', code: 'PT' },
          { name: 'Ireland', flag: '/flags/ie.svg', code: 'IE' },
          { name: 'Sweden', flag: '/flags/se.svg', code: 'SE' },
          { name: 'Norway', flag: '/flags/no.svg', code: 'NO' },
          { name: 'Denmark', flag: '/flags/dk.svg', code: 'DK' },
          { name: 'Finland', flag: '/flags/fi.svg', code: 'FI' },
          { name: 'Switzerland', flag: '/flags/ch.svg', code: 'CH' },
          { name: 'Austria', flag: '/flags/at.svg', code: 'AT' },
          { name: 'Czech Republic', flag: '/flags/cz.svg', code: 'CZ' },
          { name: 'Romania', flag: '/flags/ro.svg', code: 'RO' },
          { name: 'Turkey', flag: '/flags/tr.svg', code: 'TR' },
          { name: 'Russia', flag: '/flags/ru.svg', code: 'RU' }
        ]
      },
      {
        groupId: 'americas',
        groupLabelEn: 'North America',
        groupLabelAr: 'أمريكا الشمالية',
        countries: [
          { name: 'United States', flag: '/flags/us.svg', code: 'US' },
          { name: 'Canada', flag: '/flags/ca.svg', code: 'CA' }
        ]
      },
      {
        groupId: 'arab',
        groupLabelEn: 'Arab Countries & GCC',
        groupLabelAr: 'الدول العربية ودول الخليج',
        countries: [
          { name: 'Saudi Arabia', flag: '/flags/sa.svg', code: 'SA' },
          { name: 'United Arab Emirates', flag: '/flags/ae.svg', code: 'AE' },
          { name: 'Kuwait', flag: '/flags/kw.svg', code: 'KW' },
          { name: 'Qatar', flag: '/flags/qa.svg', code: 'QA' },
          { name: 'Oman', flag: '/flags/om.svg', code: 'OM' },
          { name: 'Bahrain', flag: '/flags/bh.svg', code: 'BH' },
          { name: 'Jordan', flag: '/flags/jo.svg', code: 'JO' },
          { name: 'Egypt', flag: '/flags/eg.svg', code: 'EG' }
        ]
      },
      {
        groupId: 'other',
        groupLabelEn: 'Other Destinations',
        groupLabelAr: 'وجهات أخرى',
        countries: [
          { name: 'Malaysia', flag: '/flags/my.svg', code: 'MY' },
          { name: 'Singapore', flag: '/flags/sg.svg', code: 'SG' },
          { name: 'Other', flag: 'globe', code: 'OTHER' }
        ]
      }
    ];

    function renderCountries(filter = '') {
      const container = document.getElementById('countryOptionsContainer');
      if (!container) return;
      container.innerHTML = '';
      const norm = filter.trim().toLowerCase();

      countryGroups.forEach(grp => {
        const matchingCountries = grp.countries.filter(c => c.name.toLowerCase().includes(norm));
        if (matchingCountries.length > 0) {
          // Group Header
          const header = document.createElement('div');
          header.className = 'country-group-header';
          header.textContent = currentLang === 'ar' ? grp.groupLabelAr : grp.groupLabelEn;
          container.appendChild(header);

          // Group items
          matchingCountries.forEach(c => {
            const item = document.createElement('div');
            item.className = 'country-option-item';
            item.setAttribute('data-country', c.name);

            const flagMarkup = (c.flag === 'globe') 
              ? `<span style="font-size:1.15rem; line-height:1;">🌐</span>` 
              : `<img src="${c.flag}" alt="${c.name}" class="country-flag-icon">`;

            item.innerHTML = `${flagMarkup} <span>${c.name}</span>`;
            item.onclick = () => selectCountry(c.name, c.flag);
            container.appendChild(item);
          });
        }
      });
    }

    function toggleCountryDropdown() {
      const menu = document.getElementById('countryDropdownMenu');
      const btn = document.getElementById('countryDisplayBtn');
      if (!menu) return;
      const isOpen = menu.classList.contains('show');
      if (isOpen) {
        menu.classList.remove('show');
        if (btn) btn.classList.remove('open');
      } else {
        renderCountries('');
        menu.classList.add('show');
        if (btn) btn.classList.add('open');
        const inp = document.getElementById('countryFilterInput');
        if (inp) {
          inp.value = '';
          setTimeout(() => inp.focus(), 50);
        }
      }
    }

    function filterCountriesList(val) {
      renderCountries(val);
    }

    function selectCountry(name, flag) {
      const hidden = document.getElementById('hiddenDestinationCountry');
      const txt = document.getElementById('selectedCountryNameText');
      const flgWrap = document.getElementById('selectedCountryFlagWrap');
      const drawerOther = document.getElementById('drawerOtherCountry');
      const inpOther = document.getElementById('inputOtherCountry');

      if (hidden) hidden.value = name;
      if (txt) {
        txt.textContent = name;
        txt.style.color = '#172c1a';
      }
      if (flgWrap) {
        flgWrap.innerHTML = (flag === 'globe') 
          ? `<span style="font-size:1.15rem; line-height:1;">🌐</span>` 
          : `<img src="${flag}" alt="${name}" class="country-flag-icon">`;
      }

      if (name === 'Other') {
        if (drawerOther) drawerOther.style.display = 'block';
      } else {
        if (drawerOther) drawerOther.style.display = 'none';
        if (inpOther) inpOther.value = '';
      }

      const menu = document.getElementById('countryDropdownMenu');
      const btn = document.getElementById('countryDisplayBtn');
      if (menu) menu.classList.remove('show');
      if (btn) btn.classList.remove('open');

      updateLiveSummary();
    }

    // Close country dropdown on click outside
    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('countrySearchWrapper');
      if (wrap && !wrap.contains(e.target)) {
        const menu = document.getElementById('countryDropdownMenu');
        const btn = document.getElementById('countryDisplayBtn');
        if (menu) menu.classList.remove('show');
        if (btn) btn.classList.remove('open');
      }
    });

    /* STEP 2 VALIDATION */
    function validateStep2() {
      // 1. Order Volume
      const vol = document.getElementById('selectOrderVolume').value;
      if (!vol) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى اختيار حجم الطلب التقديري.' : 'Please select estimated order volume.');
        return;
      }
      if (vol === '2–5 x 40ft Reefers') {
        const c25 = document.getElementById('select2to5Containers').value;
        if (!c25) {
          displayToastAlert(currentLang === 'ar' ? 'يرجى تحديد عدد الحاويات (2-5).' : 'Please specify number of containers (2-5).');
          return;
        }
      } else if (vol === '6+ x 40ft Reefers') {
        const c6 = document.getElementById('input6plusCount').value;
        if (!c6 || parseInt(c6) < 6) {
          displayToastAlert(currentLang === 'ar' ? 'يرجى إدخال عدد الحاويات التقديري (6 فأكثر).' : 'Please enter estimated number of containers (6 or more).');
          return;
        }
      }

      // 2. Destination Country
      const country = document.getElementById('hiddenDestinationCountry').value;
      if (!country) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى اختيار دولة الوصول.' : 'Please select a destination country.');
        return;
      }
      if (country === 'Other') {
        const otherVal = document.getElementById('inputOtherCountry').value.trim();
        if (!otherVal) {
          displayToastAlert(currentLang === 'ar' ? 'يرجى كتابة اسم دولة الوصول.' : 'Please specify the destination country name.');
          return;
        }
      }

      // 3. Destination Port
      const isAssisted = document.getElementById('chkPortAssistance').checked;
      const portVal = document.getElementById('inputDestPort').value.trim();
      if (!isAssisted && !portVal) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى إدخال ميناء الوصول أو اختيار طلب المساعدة.' : 'Please enter preferred destination port or select assistance.');
        return;
      }

      // 4. Incoterm
      const inco = document.getElementById('selectIncoterm').value;
      if (!inco) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى اختيار شرط الشحن الدولي (Incoterm).' : 'Please select a preferred Incoterm.');
        return;
      }

      // 5. Shipping Window
      const shipWin = document.getElementById('selectShippingWindow').value;
      if (!shipWin) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى تحديد الإطار الزمني للشحن.' : 'Please select target shipping window.');
        return;
      }
      if (shipWin === 'Specific Month') {
        const m = document.getElementById('selectShipMonth').value;
        if (!m) {
          displayToastAlert(currentLang === 'ar' ? 'يرجى اختيار شهر الشحن المفضل.' : 'Please select preferred shipping month.');
          return;
        }
      }

      goToStep(3);
    }

    /* =========================================================
       STEP 03 LOGIC: PHONE CODE & COUNTRY REG DROPDOWNS
       ========================================================= */
    const phoneCodesList = [
      { name: 'Netherlands', dial: '+31', flag: '/flags/nl.svg', code: 'NL' },
      { name: 'United Kingdom', dial: '+44', flag: '/flags/gb.svg', code: 'GB' },
      { name: 'Germany', dial: '+49', flag: '/flags/de.svg', code: 'DE' },
      { name: 'France', dial: '+33', flag: '/flags/fr.svg', code: 'FR' },
      { name: 'Spain', dial: '+34', flag: '/flags/es.svg', code: 'ES' },
      { name: 'Italy', dial: '+39', flag: '/flags/it.svg', code: 'IT' },
      { name: 'Belgium', dial: '+32', flag: '/flags/be.svg', code: 'BE' },
      { name: 'Poland', dial: '+48', flag: '/flags/pl.svg', code: 'PL' },
      { name: 'Greece', dial: '+30', flag: '/flags/gr.svg', code: 'GR' },
      { name: 'Portugal', dial: '+351', flag: '/flags/pt.svg', code: 'PT' },
      { name: 'Ireland', dial: '+353', flag: '/flags/ie.svg', code: 'IE' },
      { name: 'Sweden', dial: '+46', flag: '/flags/se.svg', code: 'SE' },
      { name: 'Norway', dial: '+47', flag: '/flags/no.svg', code: 'NO' },
      { name: 'Denmark', dial: '+45', flag: '/flags/dk.svg', code: 'DK' },
      { name: 'Finland', dial: '+358', flag: '/flags/fi.svg', code: 'FI' },
      { name: 'Switzerland', dial: '+41', flag: '/flags/ch.svg', code: 'CH' },
      { name: 'Austria', dial: '+43', flag: '/flags/at.svg', code: 'AT' },
      { name: 'Czech Republic', dial: '+420', flag: '/flags/cz.svg', code: 'CZ' },
      { name: 'Romania', dial: '+40', flag: '/flags/ro.svg', code: 'RO' },
      { name: 'Turkey', dial: '+90', flag: '/flags/tr.svg', code: 'TR' },
      { name: 'Russia', dial: '+7', flag: '/flags/ru.svg', code: 'RU' },
      { name: 'United States', dial: '+1', flag: '/flags/us.svg', code: 'US' },
      { name: 'Canada', dial: '+1', flag: '/flags/ca.svg', code: 'CA' },
      { name: 'Saudi Arabia', dial: '+966', flag: '/flags/sa.svg', code: 'SA' },
      { name: 'United Arab Emirates', dial: '+971', flag: '/flags/ae.svg', code: 'AE' },
      { name: 'Kuwait', dial: '+965', flag: '/flags/kw.svg', code: 'KW' },
      { name: 'Qatar', dial: '+974', flag: '/flags/qa.svg', code: 'QA' },
      { name: 'Oman', dial: '+968', flag: '/flags/om.svg', code: 'OM' },
      { name: 'Bahrain', dial: '+973', flag: '/flags/bh.svg', code: 'BH' },
      { name: 'Jordan', dial: '+962', flag: '/flags/jo.svg', code: 'JO' },
      { name: 'Egypt', dial: '+20', flag: '/flags/eg.svg', code: 'EG' },
      { name: 'Malaysia', dial: '+60', flag: '/flags/my.svg', code: 'MY' },
      { name: 'Singapore', dial: '+65', flag: '/flags/sg.svg', code: 'SG' },
      { name: 'India', dial: '+91', flag: '/flags/in.svg', code: 'IN' },
      { name: 'China', dial: '+86', flag: '/flags/cn.svg', code: 'CN' },
      { name: 'Japan', dial: '+81', flag: '/flags/jp.svg', code: 'JP' },
      { name: 'Australia', dial: '+61', flag: '/flags/au.svg', code: 'AU' },
      { name: 'Brazil', dial: '+55', flag: '/flags/br.svg', code: 'BR' }
    ];

    function renderPhoneCodes(filter = '') {
      const container = document.getElementById('phoneOptionsContainer');
      if (!container) return;
      container.innerHTML = '';
      const norm = filter.trim().toLowerCase();
      const filtered = phoneCodesList.filter(c => c.name.toLowerCase().includes(norm) || c.dial.includes(norm));

      filtered.forEach(c => {
        const item = document.createElement('div');
        item.className = 'country-option-item';
        item.innerHTML = `<img src="${c.flag}" alt="${c.name}" class="country-flag-icon"> <span style="font-weight:700; min-width:48px;">${c.dial}</span> <span style="color:#555;">${c.name}</span>`;
        item.onclick = () => selectPhoneCode(c.dial, c.flag);
        container.appendChild(item);
      });
    }

    function togglePhoneDropdown() {
      const menu = document.getElementById('phoneCodeDropdownMenu');
      const btn = document.getElementById('phoneCodeBtn');
      if (!menu) return;
      const isOpen = menu.classList.contains('show');
      if (isOpen) {
        menu.classList.remove('show');
        if (btn) btn.classList.remove('open');
      } else {
        renderPhoneCodes('');
        menu.classList.add('show');
        if (btn) btn.classList.add('open');
        const inp = document.getElementById('phoneFilterInput');
        if (inp) {
          inp.value = '';
          setTimeout(() => inp.focus(), 50);
        }
      }
    }

    function filterPhoneCodesList(val) {
      renderPhoneCodes(val);
    }

    function selectPhoneCode(dial, flag) {
      const hidden = document.getElementById('hiddenSelectedDialCode');
      const txt = document.getElementById('selectedPhoneCodeText');
      const flg = document.getElementById('selectedPhoneFlag');

      if (hidden) hidden.value = dial;
      if (txt) txt.textContent = dial;
      if (flg) flg.src = flag;

      const menu = document.getElementById('phoneCodeDropdownMenu');
      const btn = document.getElementById('phoneCodeBtn');
      if (menu) menu.classList.remove('show');
      if (btn) btn.classList.remove('open');
    }

    /* COUNTRY OF REGISTRATION LOGIC */
    function renderCountryReg(filter = '') {
      const container = document.getElementById('countryRegOptionsContainer');
      if (!container) return;
      container.innerHTML = '';
      const norm = filter.trim().toLowerCase();

      countryGroups.forEach(grp => {
        const matching = grp.countries.filter(c => c.name.toLowerCase().includes(norm));
        if (matching.length > 0) {
          const header = document.createElement('div');
          header.className = 'country-group-header';
          header.textContent = currentLang === 'ar' ? grp.groupLabelAr : grp.groupLabelEn;
          container.appendChild(header);

          matching.forEach(c => {
            const item = document.createElement('div');
            item.className = 'country-option-item';
            item.setAttribute('data-country', c.name);
            const flagMarkup = (c.flag === 'globe') 
              ? `<span style="font-size:1.15rem; line-height:1;">🌐</span>` 
              : `<img src="${c.flag}" alt="${c.name}" class="country-flag-icon">`;
            item.innerHTML = `${flagMarkup} <span>${c.name}</span>`;
            item.onclick = () => selectCountryReg(c.name, c.flag);
            container.appendChild(item);
          });
        }
      });
    }

    function toggleCountryRegDropdown() {
      const menu = document.getElementById('countryRegDropdownMenu');
      const btn = document.getElementById('countryRegDisplayBtn');
      if (!menu) return;
      const isOpen = menu.classList.contains('show');
      if (isOpen) {
        menu.classList.remove('show');
        if (btn) btn.classList.remove('open');
      } else {
        renderCountryReg('');
        menu.classList.add('show');
        if (btn) btn.classList.add('open');
        const inp = document.getElementById('countryRegFilterInput');
        if (inp) {
          inp.value = '';
          setTimeout(() => inp.focus(), 50);
        }
      }
    }

    function filterCountryRegList(val) {
      renderCountryReg(val);
    }

    function selectCountryReg(name, flag) {
      const hidden = document.getElementById('hiddenCountryOfRegistration');
      const txt = document.getElementById('selectedCountryRegNameText');
      const flgWrap = document.getElementById('selectedCountryRegFlagWrap');
      const drawerOther = document.getElementById('drawerOtherCountryReg');
      const inpOther = document.getElementById('inputOtherCountryReg');

      if (hidden) hidden.value = name;
      if (txt) {
        txt.textContent = name;
        txt.style.color = '#172c1a';
      }
      if (flgWrap) {
        flgWrap.innerHTML = (flag === 'globe') 
          ? `<span style="font-size:1.15rem; line-height:1;">🌐</span>` 
          : `<img src="${flag}" alt="${name}" class="country-flag-icon">`;
      }

      if (name === 'Other') {
        if (drawerOther) drawerOther.style.display = 'block';
      } else {
        if (drawerOther) drawerOther.style.display = 'none';
        if (inpOther) inpOther.value = '';
      }

      const menu = document.getElementById('countryRegDropdownMenu');
      const btn = document.getElementById('countryRegDisplayBtn');
      if (menu) menu.classList.remove('show');
      if (btn) btn.classList.remove('open');
    }

    // Close Step 3 dropdowns on outside click
    document.addEventListener('click', (e) => {
      const phoneWrap = document.getElementById('phoneInputWrapper');
      if (phoneWrap && !phoneWrap.contains(e.target)) {
        const m = document.getElementById('phoneCodeDropdownMenu');
        const b = document.getElementById('phoneCodeBtn');
        if (m) m.classList.remove('show');
        if (b) b.classList.remove('open');
      }

      const regWrap = document.getElementById('countryRegSearchWrapper');
      if (regWrap && !regWrap.contains(e.target)) {
        const m = document.getElementById('countryRegDropdownMenu');
        const b = document.getElementById('countryRegDisplayBtn');
        if (m) m.classList.remove('show');
        if (b) b.classList.remove('open');
      }
    });

    /* PRIVACY MODAL CONTROLLERS */
    function openPrivacyModal(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Re-synchronize modal content with currentLang immediately on open
      const d = (typeof langDict !== 'undefined' && langDict[currentLang]) ? langDict[currentLang] : (typeof langDict !== 'undefined' ? langDict['en'] : null);
      if (d) {
        const titleEl = document.getElementById('modalPrivacyTitle');
        const subEl = document.getElementById('modalPrivacySub');
        const footEl = document.getElementById('modalPrivacyFooterNote');
        const containerEl = document.getElementById('modalPrivacyContentContainer');

        if (titleEl && d.modalPrivacyTitle) titleEl.textContent = d.modalPrivacyTitle;
        if (subEl && d.modalPrivacySub) subEl.textContent = d.modalPrivacySub;
        if (footEl && d.modalPrivacyFooterNote) footEl.innerHTML = d.modalPrivacyFooterNote;
        if (containerEl && d.modalPrivacyBody) containerEl.innerHTML = d.modalPrivacyBody;
      }

      const m = document.getElementById('privacyModal');
      if (m) {
        m.classList.add('show');
        m.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    }
    window.openPrivacyModal = openPrivacyModal;

    function closePrivacyModal() {
      const m = document.getElementById('privacyModal');
      if (m) {
        m.classList.remove('show');
        m.style.display = 'none';
        document.body.style.overflow = '';
      }
    }
    window.closePrivacyModal = closePrivacyModal;

    // Close Privacy Modal on Escape key press
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        const m = document.getElementById('privacyModal');
        if (m && (m.classList.contains('show') || m.style.display === 'flex')) {
          closePrivacyModal();
        }
      }
    });

    /* STEP 3 FINAL SUBMISSION */
    let isSubmittingRfq = false;

    function submitFinalRfq() {
      if (isSubmittingRfq) return;

      // 1. Company Name
      const compName = document.getElementById('inputCompanyName').value.trim();
      if (!compName) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى إدخال اسم الشركة المسجل.' : 'Please enter registered company name.');
        document.getElementById('inputCompanyName').focus();
        return;
      }

      // 2. Contact Person & Job Title
      const contactPerson = document.getElementById('inputContactName').value.trim();
      if (!contactPerson) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى إدخال اسم الشخص المسؤول للتواصل.' : 'Please enter contact person name.');
        document.getElementById('inputContactName').focus();
        return;
      }

      // 3. Business Email
      const email = document.getElementById('inputBusinessEmail').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى إدخال بريد إلكتروني تجاري صالح.' : 'Please enter a valid business email address.');
        document.getElementById('inputBusinessEmail').focus();
        return;
      }

      // 4. Business Phone
      const phone = document.getElementById('inputBusinessPhone').value.trim();
      if (!phone || phone.length < 5) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى إدخال رقم الهاتف أو الواتساب بشكل صحيح.' : 'Please enter a valid phone / WhatsApp number.');
        document.getElementById('inputBusinessPhone').focus();
        return;
      }

      // 5. Website URL validation (if provided)
      const website = document.getElementById('inputCompanyWebsite').value.trim();
      if (website && !/^https?:\/\//i.test(website) && !website.includes('.')) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى إدخال رابط موقع صالح (مثال: https://www.company.com).' : 'Please enter a valid company website URL.');
        document.getElementById('inputCompanyWebsite').focus();
        return;
      }

      // 6. Country of Registration
      const countryReg = document.getElementById('hiddenCountryOfRegistration').value;
      if (!countryReg) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى اختيار دولة تسجيل الشركة.' : 'Please select country of registration.');
        return;
      }
      if (countryReg === 'Other') {
        const otherReg = document.getElementById('inputOtherCountryReg').value.trim();
        if (!otherReg) {
          displayToastAlert(currentLang === 'ar' ? 'يرجى كتابة اسم دولة تسجيل الشركة.' : 'Please specify country of registration.');
          document.getElementById('inputOtherCountryReg').focus();
          return;
        }
      }

      // 7. Privacy Acknowledgement
      const privacyChecked = document.getElementById('chkPrivacyAcknowledgement').checked;
      if (!privacyChecked) {
        displayToastAlert(currentLang === 'ar' ? 'يرجى قراءة إشعار الخصوصية والموافقة عليه للمتابعة.' : 'Please read and agree to the Privacy Notice to submit.');
        return;
      }

      // Start submission with loading state
      isSubmittingRfq = true;
      const submitBtn = document.getElementById('btnSubmitFinalRfq');
      const origBtnContent = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        <span>${(langDict[currentLang] && langDict[currentLang].txtSubmitting) ? langDict[currentLang].txtSubmitting : (currentLang === 'ar' ? 'جارٍ إرسال طلب عرض الأسعار...' : 'Submitting Commercial RFQ...')}</span>
      `;

      // Generate Compact Unique Commercial RFQ Reference: RFQ-YYMMDD-CC-XX (e.g., RFQ-261013-NL-8K)
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');

      // Destination country code resolution (2-3 uppercase letters)
      const destCountryVal = document.getElementById('hiddenDestinationCountry') ? document.getElementById('hiddenDestinationCountry').value : '';
      let countryCode = 'GL';
      if (destCountryVal) {
        if (destCountryVal === 'Other') {
          const otherInp = document.getElementById('inputOtherCountry');
          const customName = otherInp ? otherInp.value.trim().toUpperCase() : '';
          countryCode = customName ? customName.replace(/[^A-Z]/g, '').slice(0, 2) || 'OT' : 'OT';
        } else if (typeof countryGroups !== 'undefined') {
          for (const grp of countryGroups) {
            const found = grp.countries.find(c => c.name.toLowerCase() === destCountryVal.toLowerCase());
            if (found && found.code && found.code !== 'OTHER') {
              countryCode = found.code;
              break;
            }
          }
        }
      }

      // 3 Alphanumeric Cryptographically Secure Random Characters (e.g., 8K4 - 32,768 unique possibilities per country per day)
      let randSuffix = '';
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      if (window.crypto && window.crypto.getRandomValues) {
        const randBytes = new Uint8Array(3);
        window.crypto.getRandomValues(randBytes);
        randSuffix = chars[randBytes[0] % chars.length] + chars[randBytes[1] % chars.length] + chars[randBytes[2] % chars.length];
      } else {
        randSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      }

      const generatedRef = `RFQ-${yy}${mm}${dd}-${countryCode}-${randSuffix}`;

      // Remove any earlier "could not deliver" box before trying again
      const oldFallback = document.getElementById('rfqDeliveryFallback');
      if (oldFallback) oldFallback.remove();

      // Send first, and only confirm to the buyer once the RFQ has really been delivered
      const delivery = (typeof triggerRfqEmailDispatch === 'function')
        ? Promise.resolve(triggerRfqEmailDispatch(generatedRef)).catch(() => false)
        : Promise.resolve(false);

      delivery.then(delivered => {
        isSubmittingRfq = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnContent;
        // On failure the contact box (WhatsApp / email) is already shown; the form stays filled so the buyer can retry
        if (!delivered) return;

        // Ensure all modal texts are strictly rendered in current selected language
        if (typeof applyLang === 'function') {
          applyLang(currentLang);
        }

        // Display Confirmation Modal
        const refDisp = document.getElementById('confReferenceDisplay');
        if (refDisp) refDisp.textContent = generatedRef;

        const liveDraft = document.getElementById('liveReferenceCode');
        if (liveDraft) liveDraft.textContent = generatedRef;

        const confModal = document.getElementById('confirmationModal');
        if (confModal) confModal.classList.add('show');
      });
    }

    /* ==========================================================================
       COMMERCIAL RFQ CONFIRMATION MODAL & UTILITIES (COPY & PDF)
       ========================================================================== */
    let inlineToastTimer = null;
    function copyRfqReferenceNumber() {
      const refEl = document.getElementById('confReferenceDisplay');
      const refVal = refEl ? refEl.textContent.trim() : '';
      if (!refVal) return;

      const d = (typeof langDict !== 'undefined' && langDict[currentLang]) ? langDict[currentLang] : (typeof langDict !== 'undefined' ? langDict['en'] : null);
      const toastMsg = (d && d.confCopiedToast) ? d.confCopiedToast : (currentLang === 'ar' ? 'تم نسخ الرقم المرجعي بنجاح!' : 'Reference number copied to clipboard!');

      // Visual feedback on button and prominent inline badge inside the card
      const copyBtn = document.getElementById('confCopyBtn');
      const copyTextEl = document.getElementById('confCopyBtnText');
      const inlineToast = document.getElementById('confInlineCopyToast');
      const inlineToastText = document.getElementById('confInlineCopyToastText');
      const origText = copyTextEl ? copyTextEl.textContent : '';

      const triggerSuccessUI = () => {
        // 1. Change copy button text & highlight
        if (copyBtn) {
          copyBtn.style.background = '#234f20';
          copyBtn.style.color = '#ffffff';
          copyBtn.style.borderColor = '#234f20';
        }
        if (copyTextEl) {
          copyTextEl.textContent = currentLang === 'ar' ? 'تم نسخ الرقم المرجعي ✓' : 'Reference Copied ✓';
        }

        // 2. Floating prominent toast
        displayToastAlert(toastMsg, true);

        setTimeout(() => {
          if (copyTextEl) copyTextEl.textContent = origText;
          if (copyBtn) {
            copyBtn.style.background = '';
            copyBtn.style.color = '';
            copyBtn.style.borderColor = '';
          }
        }, 2800);
      };

      triggerSuccessUI();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(refVal).catch(() => {
          fallbackCopyText(refVal, toastMsg);
        });
      } else {
        fallbackCopyText(refVal, toastMsg);
      }
    }
    window.copyRfqReferenceNumber = copyRfqReferenceNumber;

    function fallbackCopyText(text, toastMsg, callback) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        if (typeof callback === 'function') callback();
        else displayToastAlert(toastMsg, true);
      } catch (err) {
        console.error('Fallback copy error:', err);
      }
      document.body.removeChild(textArea);
    }

    /* PDF support is loaded on demand: html2canvas + html2pdf (~hundreds of KB) and the
       PDF layout code are only fetched when the buyer reaches step 3 or asks for the PDF. */
    let pdfModulePromise = null;
    function loadScriptOnce(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-src="${src}"]`)) return resolve();
        const el = document.createElement('script');
        el.src = src;
        el.dataset.src = src;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(el);
      });
    }
    function ensurePdfModule() {
      if (!pdfModulePromise) {
        pdfModulePromise = loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
          .then(() => loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'))
          .then(() => loadScriptOnce('/assets/js/rfq-pdf.js'))
          .catch(err => { pdfModulePromise = null; throw err; });
      }
      return pdfModulePromise;
    }
    window.ensurePdfModule = ensurePdfModule;

    function downloadRfqPdf() {
      if (window._cachedGeneratedPdf && window._cachedGeneratedPdf.pdf) {
        const cached = window._cachedGeneratedPdf;
        cached.pdf.save(cached.filename || 'REEFIYA_RFQ.pdf');
        const isAr = (typeof currentLang !== 'undefined' && currentLang === 'ar') || cached.isArabic;
        if (typeof displayToastAlert === 'function') {
          displayToastAlert(isAr ? 'تم تحميل ملف الـ PDF بنجاح!' : 'RFQ PDF downloaded successfully!', true);
        }
        return;
      }

      ensurePdfModule().then(() => generateRfqPdfDocument()).then(res => {
        res.pdf.save(res.filename);
        if (typeof displayToastAlert === 'function') {
          displayToastAlert(res.isArabic ? 'تم تحميل ملف الـ PDF بنجاح!' : 'RFQ PDF downloaded successfully!', true);
        }
      }).catch(err => {
        console.error('PDF generation error:', err);
        window.print();
      });
    }
    window.downloadRfqPdf = downloadRfqPdf;

    /* ==========================================================================
       RESEND EMAIL NOTIFICATIONS DISPATCHER (ATTACHING THE IDENTICAL USER PDF)
       ========================================================================== */
    function triggerRfqEmailDispatch(rfqRef) {
      try {
        const getVal = (id, fallback) => {
          const el = document.getElementById(id);
          return el ? (el.value.trim() || fallback) : fallback;
        };
        const getText = (id, fallback) => {
          const el = document.getElementById(id);
          return el ? (el.textContent.trim() || fallback) : fallback;
        };

        const dialCodeEl = document.getElementById('hiddenSelectedDialCode');
        const dialCodeTxt = document.getElementById('selectedPhoneCodeText');
        let phoneDialCode = (dialCodeEl && dialCodeEl.value) ? dialCodeEl.value.trim() : ((dialCodeTxt && dialCodeTxt.textContent) ? dialCodeTxt.textContent.trim() : '');
        if (phoneDialCode && !phoneDialCode.startsWith('+')) phoneDialCode = '+' + phoneDialCode;

        const rawPhone = getVal('inputBusinessPhone', '').trim();
        let cleanPhone = rawPhone.replace(/^[\s+]+/, '');
        if (phoneDialCode && cleanPhone.startsWith(phoneDialCode.replace('+', ''))) {
          cleanPhone = cleanPhone.substring(phoneDialCode.replace('+', '').length).trim();
        }
        const fullPhoneFormatted = cleanPhone ? `${phoneDialCode} ${cleanPhone}`.trim() : '—';

        const countryReg = getVal('hiddenCountryOfRegistration', '—');
        const otherCountryReg = getVal('inputOtherCountryReg', '');
        const displayCountry = (countryReg === 'Other' && otherCountryReg) ? otherCountryReg : countryReg;

        // 1. Resolve Arabic produce & shipping values for team notification
        const arDict = (typeof langDict !== 'undefined' && langDict['ar']) ? langDict['ar'] : {};
        const sanitizeArText = (str) => {
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

        const prog = getProgramme();
        const dCur = langDict[currentLang] || langDict['en'];
        const arVarMap = {
          'Beauregard': 'بوريجارد (Beauregard)',
          'Bellevue': 'بيلفيو (Bellevue)',
          'Other Egyptian Varieties (Seasonal)': 'أصناف مصرية أخرى (موسمية)'
        };
        const arVarieties = Array.from(document.querySelectorAll('.chk-variety:checked')).map(el => {
          return arVarMap[el.value] || el.value;
        }).join('، ') || '—';

        const arSizing = Array.from(document.querySelectorAll('.chk-size:checked')).map(el => {
          let val = el.value;
          return val.replace('150g', '150 جم').replace('300g', '300 جم').replace('450g', '450 جم').replace('600g', '600 جم').replace('600g+', '+600 جم');
        }).join('، ') || '—';

        const arPkgMap = {
          'Carton Boxes': 'كراتين تصدير فاخرة (Carton Boxes)',
          'Wooden Crates': 'أقفاص خشبية طبيعية (Wooden Crates)',
          'Mesh Bags': 'أكياس شبكية (Mesh Bags)',
          'Plastic Crates': 'صناديق بلاستيكية مهواة (Plastic Crates)',
          'Bulk Pallet Bins': 'حاويات خشبية ضخمة (Pallet Bins)',
          'Need Packaging Recommendation': 'طلب استشارة وتوصية التعبئة والتغليف'
        };
        const arPackaging = Array.from(document.querySelectorAll('.chk-pkg:checked')).map(el => {
          return arPkgMap[el.value] || el.value;
        }).join('، ') || '—';

        const checkedWeight = document.querySelector('input[name="netWeight"]:checked');
        const customWeightSpec = getVal('inputCustomWeightSpec', '');
        let arNetWeight = 'أوزان ريفيا القياسية (REEFIYA Standard)';
        if (checkedWeight && checkedWeight.value === 'Custom Weight Requirements') {
          arNetWeight = customWeightSpec ? `أوزان مخصصة: ${customWeightSpec}` : 'متطلبات وزن مخصصة';
        }

        const checkedPL = document.querySelector('input[name="privateLabel"]:checked');
        let arPrivateLabel = 'لا، استخدام علامة وتغليف ريفيا القياسي';
        if (checkedPL && checkedPL.value.startsWith('Yes')) {
          arPrivateLabel = 'نعم، طباعة العلامة التجارية الخاصة بالمشتري (Private Label)';
        }

        const volSelect = document.getElementById('selectOrderVolume');
        const volVal = volSelect ? volSelect.value : '';
        let arOrderVolume = volVal || '—';
        if (volVal === 'Trial Order') {
          const qty = getVal('inputTrialQty', '');
          arOrderVolume = qty ? `طلب تجريبي (${qty})` : 'طلب تجريبي (حمولة جزئية)';
        } else if (volVal.includes('1 x 40ft Reefer') || volVal === '1 x 40ft Reefer') {
          arOrderVolume = '1 × حاوية مبردة 40 قدم (حوالي 21,600 كجم)';
        } else if (volVal.includes('2–5') || volVal.includes('2-5')) {
          const cnt = getVal('select2to5Containers', '2–5 حاويات');
          arOrderVolume = `2–5 حاويات مبردة 40 قدم (${cnt})`;
        } else if (volVal.includes('6+')) {
          const cnt = getVal('input6plusCount', '');
          const freq = getVal('selectSupplyFrequency', '');
          let freqAr = '';
          if (freq === 'Single Shipment') freqAr = 'شحنة واحدة';
          else if (freq === 'Monthly Supply') freqAr = 'توريد شهري منتظم';
          else if (freq === 'Seasonal Supply Program' || freq === 'Seasonal Supply') freqAr = 'برنامج توريد موسمي';
          else if (freq === 'To Be Discussed') freqAr = 'للنقاش والاتفاق';
          arOrderVolume = cnt ? `6+ حاويات مبردة (${cnt} حاوية)` : '6+ حاويات مبردة (برنامج توريد)';
          if (freqAr) arOrderVolume += ` • ${freqAr}`;
        } else if (volVal === 'Industrial Bulk Order') {
          const qty = getVal('inputIndustrialQty', '');
          arOrderVolume = qty ? `طلب صناعي بالجملة (${qty})` : 'طلب صناعي بالجملة';
        } else if (volVal === 'Custom Volume') {
          const qty = getVal('inputCustomVolumeQty', '');
          arOrderVolume = qty ? `حجم مخصص (${qty})` : 'حجم مخصص';
        }

        // Programme-specific Arabic values for the export team
        let arVarietiesOut = arVarieties, arSizingOut = arSizing, arPackagingOut = arPackaging, arNetWeightOut = arNetWeight;
        if (prog === 'Frozen') {
          const frozenSel = getFrozenSelection(dCur);
          arVarietiesOut = frozenSel.map(f => f.nameAr).join('، ') || '—';
          const spec = getVal('inputFrozenSpec', '');
          arSizingOut = spec || 'حسب مواصفات المشتري';
          arPackagingOut = 'عبوات مجمدة تحت علامة ريفيا (−18 °C)';
          arNetWeightOut = frozenSel.map(f => f.weight).join(' · ') || '—';
        } else if (prog === 'Industrial' && arSizing === '—') {
          arSizingOut = 'حسب الاتفاق مع المشتري';
        }

        const hiddenCountry = document.getElementById('hiddenDestinationCountry');
        const destCountryText = getText('sumDestinationCountryVal', '—');
        const isPortAssisted = document.getElementById('chkPortAssistance') ? document.getElementById('chkPortAssistance').checked : false;
        const portRaw = getVal('inputDestPort', '');
        let arDestPort = isPortAssisted ? 'طلب مساعدة واستشارة في اختيار الميناء' : (portRaw || 'غير محدد');

        const incoSelect = document.getElementById('selectIncoterm');
        let arIncoterm = incoSelect ? incoSelect.value : '—';
        if (arIncoterm && arIncoterm.startsWith('Not Sure')) {
          arIncoterm = 'طلب استشارة لاختيار شرط الشحن المناسب (Incoterm Consultation)';
        }

        const winSelect = document.getElementById('selectShippingWindow');
        let arShippingWindow = winSelect ? winSelect.value : '—';
        if (arShippingWindow === 'Within 30 Days') {
          arShippingWindow = 'خلال 30 يوماً من التعاقد';
        } else if (arShippingWindow === 'Flexible / To Be Discussed') {
          arShippingWindow = 'مرن / يتم مناقشته والاتفاق عليه';
        } else if (arShippingWindow === 'Specific Month') {
          const mVal = document.getElementById('selectShipMonth') ? document.getElementById('selectShipMonth').value : '';
          const yVal = document.getElementById('selectShipYear') ? document.getElementById('selectShipYear').value : '';
          const mNamesAr = { '01':'يناير','02':'فبراير','03':'مارس','04':'أبريل','05':'مايو','06':'يونيو','07':'يوليو','08':'أغسطس','09':'سبتمبر','10':'أكتوبر','11':'نوفمبر','12':'ديسمبر' };
          arShippingWindow = (mVal && yVal) ? `${mNamesAr[mVal] || mVal} ${yVal}` : 'شهر محدد';
        }

        const payload = {
          rfqReference: rfqRef,
          selectedLanguage: currentLang,
          programme: prog,
          buyer: {
            companyName: getVal('inputCompanyName', '—'),
            contactPerson: getVal('inputContactName', '—'),
            jobTitle: getVal('inputJobTitle', '—'),
            businessEmail: getVal('inputBusinessEmail', '—'),
            businessPhone: fullPhoneFormatted,
            countryOfRegistration: displayCountry,
            website: getVal('inputCompanyWebsite', '—')
          },
          produce: {
            product: getText('sumProductVal', ''),
            itemsLabel: getText('lblSumVarieties', ''),
            sizingLabel: getText('lblSumSizing', ''),
            varieties: getText('sumVarietiesVal', '—'),
            sizing: getText('sumSizingVal', '—'),
            packaging: getText('sumPackagingVal', '—'),
            netWeight: getText('sumNetWeightVal', '—'),
            privateLabel: getText('sumPrivateLabelVal', '—')
          },
          shipping: {
            orderVolume: getText('sumOrderVolumeVal', '—'),
            destinationCountry: destCountryText,
            destinationPort: getText('sumDestinationPortVal', '—'),
            incoterm: getText('sumIncotermVal', '—'),
            shippingWindow: getText('sumShippingWindowVal', '—')
          },
          produceAr: {
            varieties: arVarietiesOut,
            sizing: arSizingOut,
            packaging: arPackagingOut,
            netWeight: arNetWeightOut,
            privateLabel: arPrivateLabel
          },
          shippingAr: {
            orderVolume: arOrderVolume,
            destinationCountry: destCountryText,
            destinationPort: arDestPort,
            incoterm: arIncoterm,
            shippingWindow: arShippingWindow
          },
          additionalNotes: getVal('inputAdditionalRequirements', ''),
          hp_field: (document.getElementById('inputHpField') || {}).value || '',
          pdfBase64: ''
        };

        // Shown only if the RFQ could not be delivered, so the lead is never silently lost.
        const showDeliveryFallback = (err) => {
          if (document.getElementById('rfqDeliveryFallback')) return;
          const isAr = currentLang === 'ar';
          const waText = encodeURIComponent(`Hello REEFIYA Export Desk, I submitted RFQ ${rfqRef} on your website but it may not have been delivered.`);
          const mailSubject = encodeURIComponent(`RFQ ${rfqRef}`);
          const box = document.createElement('div');
          box.id = 'rfqDeliveryFallback';
          box.setAttribute('role', 'alert');
          box.dir = isAr ? 'rtl' : 'ltr';
          box.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:100000;max-width:min(560px,calc(100vw - 32px));background:#fff8ef;color:#3d2a12;border:1.5px solid #e86e1e;border-radius:14px;padding:16px 18px;box-shadow:0 12px 40px rgba(0,0,0,.18);font:600 14px/1.6 inherit;';
          const msg = document.createElement('div');
          msg.textContent = isAr
            ? `تعذّر إرسال طلبكم (${rfqRef}) تلقائياً. برجاء التواصل معنا مباشرة حتى لا يضيع طلبكم:`
            : `We couldn't deliver your RFQ (${rfqRef}) automatically. Please contact us directly so it isn't lost:`;
          const links = document.createElement('div');
          links.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;';
          const mk = (href, label, bg) => {
            const a = document.createElement('a');
            a.href = href; a.target = '_blank'; a.rel = 'noopener';
            a.textContent = label;
            a.style.cssText = `background:${bg};color:#fff;text-decoration:none;padding:8px 16px;border-radius:999px;font-weight:700;`;
            return a;
          };
          links.appendChild(mk(`https://wa.me/201290099230?text=${waText}`, isAr ? 'واتساب' : 'WhatsApp', '#128c7e'));
          links.appendChild(mk(`mailto:exports@reefiya.com?subject=${mailSubject}`, 'exports@reefiya.com', '#1e481c'));
          const close = document.createElement('button');
          close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', 'Close');
          close.style.cssText = 'position:absolute;top:6px;' + (isAr ? 'left' : 'right') + ':10px;background:none;border:0;font-size:20px;cursor:pointer;color:inherit;';
          close.onclick = () => box.remove();
          // Small technical code so the team can tell why delivery failed
          const code = document.createElement('div');
          code.style.cssText = 'margin-top:8px;font:500 11px/1.4 monospace;opacity:.6;direction:ltr;text-align:left;';
          code.textContent = `Code: ${err && err.status ? err.status : 'network'}${err && err.message ? ' · ' + String(err.message).slice(0, 80) : ''}`;
          box.append(close, msg, links, code);
          document.body.appendChild(box);
        };

        const postRfq = (body) => fetch('/api/send-rfq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).then(r => r.json().catch(() => ({})).then(data => {
          if (!r.ok || !data.success) throw Object.assign(new Error(data.error || `HTTP ${r.status}`), { status: r.status });
          return data;
        }));

        // Resolves true once the RFQ is delivered, false (after showing the contact box) if it is not
        const dispatchToServer = (finalPayload) => {
          return postRfq(finalPayload).catch(err => {
            console.warn('[RFQ Dispatcher] First attempt failed, retrying without PDF:', err);
            // Retry once without the attachment (covers oversized payloads and transient errors)
            return new Promise(res => setTimeout(res, 1500))
              .then(() => postRfq(Object.assign({}, finalPayload, { pdfBase64: '' })));
          }).then(() => true).catch(err => {
            console.error('[RFQ Dispatcher] RFQ delivery failed:', err);
            showDeliveryFallback(err);
            return false;
          });
        };

        // Render the identical high-fidelity PDF (loading the PDF module on demand).
        // Never let a slow or stuck PDF render block the RFQ itself: give up on the attachment after 15 s.
        const pdfTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('PDF render timed out')), 15000));
        return Promise.race([ensurePdfModule().then(() => generateRfqPdfDocument(rfqRef)), pdfTimeout]).then(res => {
          payload.pdfBase64 = res.base64; // Guaranteed clean pure Base64
          return dispatchToServer(payload);
        }, err => {
          console.error('[RFQ Dispatcher] PDF render error, sending RFQ payload without attachment:', err);
          return dispatchToServer(payload);
        });
      } catch (e) {
        console.error('[RFQ Dispatcher] Error preparing payload:', e);
        return Promise.resolve(false);
      }
    }
    window.triggerRfqEmailDispatch = triggerRfqEmailDispatch;

    /* 5. MULTI-LANGUAGE DICTIONARY (9 LANGUAGES) */
    let currentLang = 'en';

    // English and Arabic ship inline; the other languages load on demand from /assets/js/i18n/.
    const LAZY_RFQ_LANGS = ['nl', 'fr', 'de', 'es', 'it', 'ru', 'tr'];
    const langDict = {
      en: {
        dir: 'ltr',
        code: 'EN',
        liveDesk: 'Commercial Export Desk • RFQ',
        homeBtn: 'Back to Home',
        breadHome: 'Home',
        breadRfq: 'Commercial RFQ',
        heroHeading: 'Request an Export Quotation',
        heroSub: 'Share your product specifications, packaging preferences, and shipping requirements. Our export team will review your enquiry and follow up with a tailored quotation.',
        refHeading: 'DRAFT REFERENCE:',
        titleStep1: 'Product & Packaging',
        titleStep2: 'Volume & Shipping',
        titleStep3: 'Company & Contact',
        lblProduce: 'Product',
        valProduce: 'Egyptian Sweet Potatoes',
        progFreshTitle: "Fresh export",
        progFreshDesc: "Retail chains, wholesale markets and foodservice",
        progIndTitle: "Industrial supply",
        progIndDesc: "Whole roots for food factories, in bulk bins",
        progFrozenTitle: "Frozen products",
        progFrozenDesc: "Cubes and battered fries, kept at −18 °C",
        lblFrozen: "Frozen Products",
        reqFrozen: "* Required (Select one or more products)",
        frzCubesTitle: "Frozen sweet potato cubes",
        frzCubesDesc: "1 kg pack · Reefiya label",
        frzFriesTitle: "Battered sweet potato fries",
        frzFriesDesc: "5/16″ cut · 1.13 kg pack · Reefiya label",
        lblFrozenSpec: "Specification or pack-size notes (optional)",
        phFrozenSpec: "e.g., 10 × 1 kg per carton, other cut sizes",
        sumProducts: "Products:",
        sumPerSpec: "As per buyer specification",
        sumFrozenPacks: "Frozen packs · Reefiya label",
        reqSizingInd: "Optional (size and grade agreed per buyer)",
        toastFrozen: "Please select at least one frozen product.",
        lblVariety: 'Preferred Varieties',
        reqVariety: '* Required (Select one or more varieties)',
        vNameBellevue: 'Bellevue',
        vDescBellevue: 'Fresh Market Variety',
        vNameBeau: 'Beauregard',
        vDescBeau: 'Commercial Export Variety',
        vNameEgy: 'Other Egyptian Varieties (Seasonal)',
        vDescEgy: 'Subject to Seasonal Availability',
        lblSizing: 'Target Calibration & Sizing',
        reqSizing: '* Required (At least one)',
        lblPackaging: 'Packaging Solutions',
        reqPackaging: 'Select one or more packaging options',
        pkgNameCarton: 'Carton Boxes',
        pkgDescCarton: 'Telescopic / Open-top — Premium Egyptian export finish',
        pkgNameWood: 'Wooden Crates',
        pkgDescWood: 'Sturdy natural wooden crate packing for wholesale markets',
        pkgNameMesh: 'Mesh Bags',
        pkgDescMesh: 'Breathable mesh netting with branded band label',
        pkgNamePlastic: 'Plastic Crates',
        pkgDescPlastic: 'Heavy-duty reusable ventilated crates for cold chain transport',
        pkgNameBin: 'Bulk Pallet Bins',
        pkgDescBin: 'Reinforced jumbo industrial pallet bins for processing buyers',
        pkgNameRec: 'Need Packaging Recommendation',
        pkgDescRec: 'Advise the most cost-effective packaging for our shipping route',
        lblWeight: 'Packaging Weight Requirements',
        hintWeight: 'Based on selected packaging',
        descWeight: 'Choose our standard packaging weights or specify your preferred weight for each packaging type.',
        wtStandardTitle: 'REEFIYA Standard Weights',
        wtStandardSub: 'Use the standard net weight for each selected packaging type',
        wtNotSpecTitle: 'Custom Weight Requirements',
        wtNotSpecSub: 'Specify your preferred net weight for each packaging type',
        lblCustomWeightSpec: 'Specify preferred target net weight per package (e.g. 5kg carton, 10kg crate, 2.5kg mesh bag)',
        tagLiveDesk: 'PORTAL',
        lblPrivateLabel: 'Private Label Requirements',
        reqPrivateLabel: '* Required',
        plYesTitle: 'Yes, buyer branding required',
        plYesSub: 'Print customer artwork & buyer labels',
        plNoTitle: 'No, REEFIYA standard packaging',
        plNoSub: 'Use REEFIYA standard export packaging',
        lblPrivateLabelReq: 'Private Label Requirements (Optional)',
        txtStepCountLabel: 'Step 01 of 03',
        txtContinueBtn: 'Continue to Volume & Shipping',
        summaryTitle: 'Order Specification',
        summarySub: 'Commercial Export Summary',
        liveSync: 'Live Sync',
        sumProduct: 'Product:',
        sumVarieties: 'Preferred Varieties:',
        sumSizing: 'Size / Caliber:',
        sumSpec: "Specification:",
        sumPackaging: 'Packaging:',
        sumNetWeight: 'Net Weight:',
        sumPrivateLabel: 'Private Label:',
        sumNotSelected: 'Not selected yet',
        sumFooterNotice: 'Your selections will be reviewed by our export team before a commercial quotation is issued.'
      ,
        lblVolumeHeading: 'Estimated Order Volume',
        reqVolumeStar: '* Required',
        hintVolumeSection: 'Select the option that best matches your requirements.',
        optVolPlaceholder: 'Select estimated order volume',
        optVolTrial: 'Trial Order — Partial Load / Evaluation',
        optVol1Reefer: '1 × 40ft Reefer — Approx. 21,600 kg',
        optVol2to5: '2–5 × 40ft Reefers',
        optVol6plus: '6+ × 40ft Reefers — Seasonal Supply Program',
        optVolIndustrial: 'Industrial Bulk Order — Processing Requirements',
        optVolCustom: 'Custom Volume — Specify Requirements',
        lblTrialQty: 'Estimated Quantity',
        lbl2to5Containers: 'Number of Containers *',
        optSelectContainers: 'Select number of containers',
        lbl6plusCount: 'Estimated Number of Containers',
        lblSupplyFrequency: 'Supply Frequency (Optional)',
        optFreqSingle: 'Single Shipment',
        optFreqMonthly: 'Monthly Supply',
        optFreqSeasonal: 'Seasonal Supply',
        optFreqDiscuss: 'To Be Discussed',
        lblIndustrialQty: 'Estimated Quantity',
        lblCustomVolumeQty: 'Estimated Quantity / Requirements',
        txtTechLoadingNote: '21,600 kg is a reference loading quantity per 40ft reefer. Actual loading depends on packaging, container payload limits, and shipping arrangements.',
        lblDestCountryHeading: 'Destination Country',
        reqDestCountryStar: '* Required',
        txtCountryPlaceholder: 'Select destination country',
        lblOtherCountry: 'Specify Destination Country *',
        lblDestPortHeading: 'Preferred Destination Port',
        reqDestPortStar: '* Required (or request assistance)',
        hintDestPortSection: 'Enter your preferred seaport or let our export team assist you.',
        lblPortAssistance: 'I need help choosing a destination port',
        txtPortAssistanceTag: 'Assistance Requested',
        txtPortAssistancePlaceholder: 'Assistance Requested — Our export team will advise',
        lblIncotermHeading: 'Preferred Incoterm',
        reqIncotermStar: '* Required',
        optIncotermPlaceholder: 'Select preferred shipping term',
        optIncoFob: 'FOB — Free On Board',
        optIncoCfr: 'CFR — Cost and Freight',
        optIncoCif: 'CIF — Cost, Insurance and Freight',
        optIncoNotSure: 'Not Sure — Request Shipping Advice',
        hintIncotermPolicy: 'Final shipping terms, freight, and insurance arrangements are subject to quotation and agreement.',
        lblShippingWindowHeading: 'Target Shipping Window',
        reqShippingWindowStar: '* Required',
        hintShippingWindow: 'When would you prefer your order to ship?',
        optShipWinPlaceholder: 'Select preferred shipping window',
        optShipWin30: 'Within 30 Days',
        optShipWinSpecific: 'Specific Month',
        optShipWinFlexible: 'Flexible / To Be Discussed',
        lblSpecificMonth: 'Preferred Shipping Month *',
        txtBackToStep1: 'Back to Product & Packaging',
        txtStep2ProgressLabel: 'Step 02 of 03',
        txtContinueToStep3: 'Continue to Company & Contact',
        lblSumOrderVolume: 'Order Volume:',
        lblSumDestinationCountry: 'Destination Country:',
        lblSumDestinationPort: 'Destination Port:',
        lblSumIncoterm: 'Preferred Incoterm:',
        lblSumShippingWindow: 'Shipping Window:',
        lblCompanyNameHeading: 'Registered Company Name',
        reqCompanyNameStar: '* Required',
        lblContactPersonHeading: 'Contact Person & Job Title',
        reqContactPersonStar: '* Required',
        lblBusinessEmailHeading: 'Business Email',
        reqBusinessEmailStar: '* Required',
        lblBusinessPhoneHeading: 'Business Phone / WhatsApp',
        reqBusinessPhoneStar: '* Required',
        lblCompanyWebsiteHeading: 'Company Website',
        optCompanyWebsiteHelp: '(Optional)',
        lblCountryRegHeading: 'Country of Registration',
        reqCountryRegStar: '* Required',
        lblOtherCountryReg: 'Specify Country of Registration *',
        lblAdditionalReqHeading: 'Additional Requirements',
        optAdditionalReqHelp: '(Optional)',
        txtPrivacyNoticeHeading: 'Privacy Notice',
        txtPrivacyNoticeBody: 'Your information will be used to review and respond to your commercial inquiry. Please see our <a href="javascript:void(0)" class="privacy-policy-link" onclick="openPrivacyModal()">Privacy Policy</a> for details about how we handle your information.',
        lblPrivacyAcknowledgement: 'I have read and agree to the Privacy Notice *',
        txtBackToStep2: 'Back to Volume & Shipping',
        txtSubmitCommercialRfq: 'Submit Commercial RFQ',
        txtStep3ProgressLabel: 'Step 03 of 03',
        txtSubmissionSupportingNote: 'Submitting this form is a request for quotation, not a confirmed order or shipment booking.',
        lblSumCompany: 'Company:',
        lblSumContactPerson: 'Contact:',
        lblSumBusinessEmail: 'Email:',
                modalPrivacyTitle: "Commercial RFQ Privacy Notice",
                lnkFullPrivacy: "Read the full privacy policy ↗",
        modalPrivacySub: "How We Handle Your Business Information",
        modalPrivacyFooterNote: "Your Privacy Matters — For more information, please review our <a href=\"/#about\" target=\"_blank\" class=\"privacy-footer-full-link\"><span>Full Privacy Policy</span><svg class=\"privacy-external-arrow\" width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 17L17 7\"/><path d=\"M7 7h10v10\"/></svg></a>",
        modalPrivacyBody: "<p class=\"privacy-intro-text\">At <strong>REEFIYA</strong>, we respect the confidentiality of your business information and commercial requirements. Information submitted through our RFQ form is used to review your inquiry, assess export and shipping requirements, prepare commercial responses, and communicate with your company.</p><div class=\"privacy-pillars-grid\"><div class=\"privacy-pillar-card\"><h5><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#234f20\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/></svg> Data Protection</h5><p>We take appropriate measures to safeguard your business contact details and commercial information against unauthorized access.</p></div><div class=\"privacy-pillar-card\"><h5><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#234f20\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"7\" width=\"20\" height=\"14\" rx=\"2\" ry=\"2\"/><path d=\"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"/></svg> Commercial Use</h5><p>Your information is used to process your RFQ, evaluate your requirements, and provide relevant commercial correspondence.</p></div><div class=\"privacy-pillar-card\"><h5><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#234f20\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"4.93\" y1=\"4.93\" x2=\"19.07\" y2=\"19.07\"/></svg> No Data Sales</h5><p>We do not sell your business contact information to third-party marketers.</p></div><div class=\"privacy-pillar-card\"><h5><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#234f20\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg> Secure Handling</h5><p>Access to your information is limited to authorized personnel and service providers involved in handling your inquiry.</p></div></div>",
                                        confHeading: "Commercial RFQ Received",
        confSubText: "Thank you for contacting REEFIYA. Your commercial inquiry has been received successfully.\n\nOur export team will review your product specifications, order volume, and shipping requirements. We aim to provide an initial commercial response within 1–2 business days. A quotation may be included where sufficient information and availability have been confirmed.",
        confRefLabel: "Your RFQ Reference",
        confRefSupport: "Please keep your reference number for future correspondence.",
        confCopyBtn: "Copy Reference Number",
        confCopiedToast: "Reference number copied to clipboard!",
        confEmailNotice: "A confirmation email with your RFQ details will be sent to your business email address.",
        confBtnDownloadPdf: "Download RFQ PDF",
        confBtnReturnHome: "Return to Home",
        confLinkContactExport: "Contact Export Desk",
        sumNotSpecified: 'Not specified',
      },
      ar: {
        dir: 'rtl',
        code: 'AR',
        liveDesk: 'مكتب التصدير التجاري • طلب عرض سعر',
        homeBtn: 'العودة للرئيسية',
        breadHome: 'الرئيسية',
        breadRfq: 'طلب عرض سعر تجاري',
        heroHeading: 'طلب عرض سعر للتصدير',
        heroSub: 'شاركنا مواصفات منتجك، وتفضيلات التعبئة، ومتطلبات الشحن. سيراجع فريق التصدير استفسارك ويتواصل معك بعرض سعر مخصص.',
        refHeading: 'الرقم المرجعي المبدئي:',
        titleStep1: 'المنتج والتعبئة',
        titleStep2: 'الكميات والشحن',
        titleStep3: 'بيانات الشركة والتواصل',
        lblProduce: 'المنتج',
        valProduce: 'البطاطا الحلوة المصرية',
        progFreshTitle: "تصدير طازج",
        progFreshDesc: "سلاسل التجزئة وأسواق الجملة والمطاعم",
        progIndTitle: "توريد صناعي",
        progIndDesc: "بطاطا كاملة لمصانع الأغذية في صناديق سائبة",
        progFrozenTitle: "منتجات مجمدة",
        progFrozenDesc: "مكعبات وأصابع مغلفة، تُحفظ على ⁦−18 °C⁩",
        lblFrozen: "المنتجات المجمدة",
        reqFrozen: "* إجباري (اختر منتجاً واحداً أو أكثر)",
        frzCubesTitle: "مكعبات بطاطا حلوة مجمدة",
        frzCubesDesc: "عبوة 1 كجم · علامة ريفيا",
        frzFriesTitle: "أصابع بطاطا حلوة مغلفة",
        frzFriesDesc: "قطع 5/16″ · عبوة 1.13 كجم · علامة ريفيا",
        lblFrozenSpec: "المواصفات أو أحجام العبوات (اختياري)",
        phFrozenSpec: "مثال: 10 × 1 كجم في الكرتونة، أحجام تقطيع أخرى",
        sumProducts: "المنتجات:",
        sumPerSpec: "حسب مواصفات المشتري",
        sumFrozenPacks: "عبوات مجمدة · علامة ريفيا",
        reqSizingInd: "اختياري (الحجم والدرجة حسب الاتفاق مع المشتري)",
        toastFrozen: "يرجى اختيار منتج مجمد واحد على الأقل.",
        lblVariety: 'الأصناف المفضلة',
        reqVariety: '* إجباري (اختر صنفاً أو أكثر)',
        vNameBellevue: 'بيلفيو (Bellevue)',
        vDescBellevue: 'صنف مخصص للأسواق الطازجة (Fresh Market Variety)',
        vNameBeau: 'بوريجارد (Beauregard)',
        vDescBeau: 'الصنف التصديري التجاري القياسي (Commercial Export Variety)',
        vNameEgy: 'أصناف مصرية أخرى (موسمية)',
        vDescEgy: 'متوفر حسب الموسم والإنتاج الزراعي',
        lblSizing: 'الأحجام ومعايير الكاليبر (Sizing)',
        reqSizing: '* إجباري (اختيار واحد على الأقل)',
        lblPackaging: 'حلول التعبئة والتغليف',
        reqPackaging: 'اختر حل تعبئة واحد أو أكثر',
        pkgNameCarton: 'كراتين تصدير فاخرة',
        pkgDescCarton: 'كرتون تيليسكوبي / مفتوح من الأعلى — جودة تصدير مصرية فاخرة',
        pkgNameWood: 'أقفاص خشبية طبيعية',
        pkgDescWood: 'صناديق خشبية متينة ومثالية لأسواق الجملة والتفريغ السريع',
        pkgNameMesh: 'أكياس شبكية (Mesh Bags)',
        pkgDescMesh: 'أكياس شبكية جيدة التهوية مع شريط ورقي مطبوع بالبراند',
        pkgNamePlastic: 'صناديق بلاستيكية مهواة',
        pkgDescPlastic: 'صناديق متينة قابلة لإعادة الاستخدام مخصصة للنقل والتبريد الممتد',
        pkgNameBin: 'حاويات خشبية ضخمة (Pallet Bins)',
        pkgDescBin: 'حاويات جامبو صناعية معززة للمصانع وخطوط التصنيع والتوزيع الضخم',
        pkgNameRec: 'نحتاج توصية التعبئة',
        pkgDescRec: 'تقديم اقتراح التعبئة الأكثر كفاءة واقتصادية لمسار الشحن المتبع',
        lblWeight: 'متطلبات وزن التعبئة (Packaging Weight)',
        hintWeight: 'مرتبط بنوع التعبئة المختار',
        descWeight: 'اختر أوزان التعبئة القياسية الخاصة بنا أو حدد الوزن المفضل لكل عبوة.',
        wtStandardTitle: 'أوزان ريفيا القياسية (REEFIYA Standard)',
        wtStandardSub: 'استخدام الوزن الصافي القياسي المعتمد لكل نوع تعبئة مختار',
        wtNotSpecTitle: 'متطلبات وزن مخصصة (Custom Weights)',
        wtNotSpecSub: 'تحديد الوزن الصافي المفضل لشركتكم لكل نوع تعبئة',
        lblCustomWeightSpec: 'حدد الوزن الصافي المستهدف لكل عبوة (مثال: كرتون 5 كجم، قفص 10 كجم، شبك 2.5 كجم)',
        tagLiveDesk: 'بوابة التصدير',
        lblPrivateLabel: 'متطلبات العلامة التجارية الخاصة',
        reqPrivateLabel: '* إجباري',
        plYesTitle: 'نعم، مطلوب علامة تجارية وبيانات المشتري',
        plYesSub: 'طباعة تصميم العميل وملصقات باركود مخصصة',
        plNoTitle: 'لا، التعبئة بتصميم ريفيا القياسي',
        plNoSub: 'استخدام تصاميم وكراتين REEFIYA القياسية',
        lblPrivateLabelReq: 'متطلبات العلامة الخاصة (اختياري)',
        txtStepCountLabel: 'الخطوة 01 من 03',
        txtContinueBtn: 'المتابعة إلى خطوة الكميات والشحن',
        summaryTitle: 'مواصفات الطلب',
        summarySub: 'ملخص التصدير التجاري',
        liveSync: 'محدّث تلقائياً',
        sumProduct: 'المنتج:',
        sumVarieties: 'الأصناف المفضلة:',
        sumSizing: 'الحجم / الكاليبر:',
        sumSpec: "المواصفات:",
        sumPackaging: 'التعبئة:',
        sumNetWeight: 'الوزن الصافي:',
        sumPrivateLabel: 'العلامة الخاصة:',
        sumNotSelected: 'لم يتم الاختيار بعد',
        sumFooterNotice: 'ستتم مراجعة اختياراتك من قِبل فريق التصدير لدينا قبل إصدار عرض السعر التجاري.'
      ,
        lblVolumeHeading: 'حجم الطلب التقديري',
        reqVolumeStar: '* إجباري',
        hintVolumeSection: 'اختر الخيار الأنسب لمتطلبات برنامج الشحن والتوريد لديك.',
        optVolPlaceholder: 'اختر حجم الطلب التقديري',
        optVolTrial: 'طلب تجريبي — شحنة جزئية / تقييم الجودة',
        optVol1Reefer: '1 × حاوية مبردة 40 قدم — حوالي 21,600 كجم',
        optVol2to5: '2–5 × حاويات مبردة 40 قدم',
        optVol6plus: '6+ × حاويات مبردة — برنامج توريد موسمي',
        optVolIndustrial: 'طلب صناعي ضخم — متطلبات خطوط التصنيع',
        optVolCustom: 'حجم مخصص — تحديد المتطلبات الخاصة',
        lblTrialQty: 'الكمية التقديرية المطلوبة',
        lbl2to5Containers: 'عدد الحاويات المبردة *',
        optSelectContainers: 'اختر عدد الحاويات',
        lbl6plusCount: 'العدد التقديري للحاويات',
        lblSupplyFrequency: 'وتيرة الشحن والتوريد (اختياري)',
        optFreqSingle: 'شحنة واحدة',
        optFreqMonthly: 'توريد شهري منتظم',
        optFreqSeasonal: 'برنامج توريد موسمي كامل',
        optFreqDiscuss: 'للنقاش والاتفاق',
        lblIndustrialQty: 'الكمية التقديرية (طن أو شهرياً)',
        lblCustomVolumeQty: 'الكمية / المتطلبات التقديرية',
        txtTechLoadingNote: '21,600 كجم هي سعة الشحن المرجعية لحاوية التبريد 40 قدم. يعتمد التحميل الفعلي على نوع التعبئة والوزن المسموح وترتيبات الملاحة.',
        lblDestCountryHeading: 'دولة الوصول (الوجهة)',
        reqDestCountryStar: '* إجباري',
        txtCountryPlaceholder: 'اختر دولة الوصول',
        lblOtherCountry: 'يرجى كتابة اسم الدولة *',
        lblDestPortHeading: 'ميناء الوصول المفضل',
        reqDestPortStar: '* إجباري (أو طلب مساعدة)',
        hintDestPortSection: 'أدخل الميناء البحري المفضل أو دع فريق التصدير يرشدك للأنسب.',
        lblPortAssistance: 'أحتاج مساعدة في اختيار أفضل ميناء لوجستي',
        txtPortAssistanceTag: 'طلب استشارة الميناء',
        txtPortAssistancePlaceholder: 'تم طلب المساعدة — سيرشدك فريق التصدير',
        lblIncotermHeading: 'شرط الشحن التجاري (Incoterm)',
        reqIncotermStar: '* إجباري',
        optIncotermPlaceholder: 'اختر شرط الشحن المفضل',
        optIncoFob: 'FOB — تسليم على ظهر السفينة (Free On Board)',
        optIncoCfr: 'CFR — التكلفة وأجرة الشحن حتى ميناء الوصول',
        optIncoCif: 'CIF — التكلفة والتأمين وأجرة الشحن',
        optIncoNotSure: 'غير متأكد — أطلب استشارة لوجستية',
        hintIncotermPolicy: 'شروط الشحن النهائية والنولون والتأمين تخضع لعرض الأسعار والاتفاق التجاري.',
        lblShippingWindowHeading: 'الإطار الزمني المستهدف للشحن',
        reqShippingWindowStar: '* إجباري',
        hintShippingWindow: 'ما هو التوقيت المفضل لبدء شحن طلبك؟',
        optShipWinPlaceholder: 'اختر الإطار الزمني المفضل',
        optShipWin30: 'خلال 30 يوماً',
        optShipWinSpecific: 'شهر محدد',
        optShipWinFlexible: 'مرن / للمناقشة مع فريق التصدير',
        lblSpecificMonth: 'شهر الشحن المفضل *',
        txtBackToStep1: 'الرجوع للمنتج والتعبئة',
        txtStep2ProgressLabel: 'الخطوة 02 من 03',
        txtContinueToStep3: 'المتابعة لبيانات الشركة والتواصل',
        lblSumOrderVolume: 'حجم الطلب:',
        lblSumDestinationCountry: 'دولة الوصول:',
        lblSumDestinationPort: 'ميناء الوصول:',
        lblSumIncoterm: 'شرط الشحن (Incoterm):',
        lblSumShippingWindow: 'موعد الشحن:',
        lblCompanyNameHeading: 'اسم الشركة المسجل',
        reqCompanyNameStar: '* إجباري',
        lblContactPersonHeading: 'الشخص المسؤول والمسمى الوظيفي',
        reqContactPersonStar: '* إجباري',
        lblBusinessEmailHeading: 'البريد الإلكتروني للعمل',
        reqBusinessEmailStar: '* إجباري',
        lblBusinessPhoneHeading: 'الهاتف التجاري / واتساب',
        reqBusinessPhoneStar: '* إجباري',
        lblCompanyWebsiteHeading: 'موقع الشركة الإلكتروني',
        optCompanyWebsiteHelp: '(اختياري)',
        lblCountryRegHeading: 'دولة تسجيل الشركة',
        reqCountryRegStar: '* إجباري',
        lblOtherCountryReg: 'حدد دولة تسجيل الشركة *',
        lblAdditionalReqHeading: 'متطلبات ومواصفات إضافية',
        optAdditionalReqHelp: '(اختياري)',
        txtPrivacyNoticeHeading: 'إشعار الخصوصية',
        txtPrivacyNoticeBody: 'سيتم استخدام بياناتك فقط لمراجعة طلب عرض الأسعار والرد التجاري. يرجى مراجعة <a href="javascript:void(0)" class="privacy-policy-link" onclick="openPrivacyModal()">سياسة الخصوصية</a> لمعرفة كيفية التعامل مع البيانات.',
        lblPrivacyAcknowledgement: 'لقد قرأت إشعار الخصوصية وأوافق عليه *',
        txtBackToStep2: 'الرجوع للكميات والشحن',
        txtSubmitCommercialRfq: 'إرسال طلب عرض الأسعار',
        txtStep3ProgressLabel: 'الخطوة 03 من 03',
        txtSubmissionSupportingNote: 'إرسال هذا النموذج هو طلب استفسار وعرض أسعار تجاري، وليس طلباً مؤكداً أو حجز شحنة نهائي.',
        lblSumCompany: 'الشركة:',
        lblSumContactPerson: 'المسؤول:',
        lblSumBusinessEmail: 'البريد:',
                modalPrivacyTitle: "إشعار خصوصية طلب عروض الأسعار التجارية (RFQ)",
                lnkFullPrivacy: "اقرأ سياسة الخصوصية كاملة ↗",
        modalPrivacySub: "كيفية التعامل مع معلوماتكم التجارية وحمايتها",
        modalPrivacyFooterNote: "خصوصيتكم تهمنا — لمزيد من التفاصيل، يرجى الاطلاع على <a href=\"/#about\" target=\"_blank\" class=\"privacy-footer-full-link\"><span>سياسة الخصوصية الكاملة</span><svg class=\"privacy-external-arrow\" width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 17L7 7\"/><path d=\"M17 7H7v10\"/></svg></a>",
        modalPrivacyBody: "<p class=\"privacy-intro-text\">في <strong>ريفيا (REEFIYA)</strong>، نحترم خصوصية وسرية معلوماتكم التجارية ومتطلباتكم المؤسسية. تُستخدم المعلومات المقدمة عبر نموذج طلب عرض الأسعار لمراجعة استفساركم، وتقييم متطلبات التصدير والشحن، وإعداد الردود والعروض التجارية، والتواصل المباشر مع شركتكم.</p><div class=\"privacy-pillars-grid\"><div class=\"privacy-pillar-card\"><h5><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#234f20\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/></svg> حماية البيانات</h5><p>نتخذ التدابير المناسبة لحماية بيانات الاتصال المؤسسية ومعلوماتكم التجارية من أي وصول غير مصرح به.</p></div><div class=\"privacy-pillar-card\"><h5><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#234f20\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"7\" width=\"20\" height=\"14\" rx=\"2\" ry=\"2\"/><path d=\"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"/></svg> الاستخدام التجاري</h5><p>تُستخدم بياناتكم حصرياً لمعالجة طلب عرض الأسعار، وتقييم المتطلبات الفنية، وتقديم المراسلات التجارية الملائمة.</p></div><div class=\"privacy-pillar-card\"><h5><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#234f20\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"4.93\" y1=\"4.93\" x2=\"19.07\" y2=\"19.07\"/></svg> عدم بيع البيانات</h5><p>نحن لا نبيع بيانات الاتصال الخاصة بشركتكم لأي جهات أو وسطاء تسويق خارجيين إطلاقاً.</p></div><div class=\"privacy-pillar-card\"><h5><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#234f20\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg> معالجة آمنة وموثوقة</h5><p>يقتصر الوصول إلى معلوماتكم على الكوادر المصرح لها ومقدمي الخدمات المعنيين بمتابعة طلبكم فقط.</p></div></div>",
                                        confHeading: "تم استلام طلب عرض الأسعار التجاري",
        confSubText: "شكراً لتواصلكم مع ريفيا. تم استلام استفساركم التجاري بنجاح.\n\nسيقوم فريق التصدير بمراجعة مواصفات المنتجات المطلوبة، حجم الطلب، ومتطلبات الشحن بدقة. نهدف لتقديم رد تجاري مبدئي خلال 1–2 يوم عمل. كما سيتم إرفاق عرض الأسعار متى ما تأكدت وفرة الكميات واكتمال البيانات الفنية.",
        confRefLabel: "رقم المرجع الخاص بطلبكم",
        confRefSupport: "يرجى الاحتفاظ بالرقم المرجعي لكافة المراسلات والمتابعات المستقبلية.",
        confCopyBtn: "نسخ الرقم المرجعي",
        confCopiedToast: "تم نسخ الرقم المرجعي بنجاح!",
        confEmailNotice: "سيتم إرسال بريد إلكتروني تأكيدي يحتوي على كامل تفاصيل الـ RFQ إلى بريدكم المؤسسي.",
        confBtnDownloadPdf: "تحميل وثيقة الـ RFQ (PDF)",
        confBtnReturnHome: "العودة للرئيسية",
        confLinkContactExport: "التواصل المباشر مع مكتب التصدير",
        sumNotSpecified: 'لم يحدد بعد',
      },
    };

    function loadLangDict(lang) {
      if (langDict[lang]) return Promise.resolve(true);
      if (!LAZY_RFQ_LANGS.includes(lang)) return Promise.resolve(false);
      return loadScriptOnce(`/assets/js/i18n/rfq-${lang}.js`).then(() => {
        const dict = window.__rfqLangs && window.__rfqLangs[lang];
        if (dict) langDict[lang] = dict;
        return !!dict;
      }).catch(() => false);
    }

    function applyLang(lang) {
      if (!langDict[lang] && LAZY_RFQ_LANGS.includes(lang)) {
        loadLangDict(lang).then(ok => applyLangNow(ok ? lang : 'en'));
        return;
      }
      applyLangNow(lang);
    }

    function applyLangNow(lang) {
      if (!langDict[lang]) lang = 'en';
      currentLang = lang;
      const d = langDict[lang];

      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', d.dir);

      // Update current flag and code in button
      const currentFlagEl = document.getElementById('currentFlag');
      const currentCodeEl = document.getElementById('currentLangCode');
      const matchingMenuItem = document.querySelector(`.lang-menu-item[data-lang="${lang}"]`);

      if (currentCodeEl) currentCodeEl.textContent = d.code;
      if (matchingMenuItem && currentFlagEl) {
        document.querySelectorAll('.lang-menu-item').forEach(el => el.classList.remove('selected'));
        matchingMenuItem.classList.add('selected');
        const flagCircle = matchingMenuItem.querySelector('.lang-flag-circle');
        if (flagCircle) currentFlagEl.innerHTML = flagCircle.innerHTML;
      }

      // Safe element text assignment helper
      const setSafeText = (id, text) => {
        const el = document.getElementById(id);
        if (el && text !== undefined) el.textContent = text;
      };

      setSafeText('txtLiveDesk', d.liveDesk);
      setSafeText('txtBackHome', d.homeBtn);
      setSafeText('txtBreadHome', d.breadHome);
      setSafeText('txtBreadRfq', d.breadRfq);
      setSafeText('txtHeroHeading', d.heroHeading);
      setSafeText('txtHeroSub', d.heroSub);
      setSafeText('txtRefHeading', d.refHeading);

      setSafeText('titleStep1', d.titleStep1);
      setSafeText('titleStep2', d.titleStep2);
      setSafeText('titleStep3', d.titleStep3);

      setSafeText('lblProduceHeading', d.lblProduce);
      ['progFreshTitle', 'progFreshDesc', 'progIndTitle', 'progIndDesc', 'progFrozenTitle', 'progFrozenDesc',
       'frzCubesTitle', 'frzCubesDesc', 'frzFriesTitle', 'frzFriesDesc', 'lblFrozenSpec'].forEach(k => setSafeText(k, d[k]));
      setSafeText('lblFrozenHeading', d.lblFrozen);
      setSafeText('lnkFullPrivacy', d.lnkFullPrivacy);
      setSafeText('reqFrozenStar', d.reqFrozen);
      const frozenSpecInp = document.getElementById('inputFrozenSpec');
      if (frozenSpecInp && d.phFrozenSpec) frozenSpecInp.placeholder = d.phFrozenSpec;

      setSafeText('lblVarietyHeading', d.lblVariety);
      setSafeText('reqVarietyStar', d.reqVariety);
      setSafeText('vNameBellevue', d.vNameBellevue);
      setSafeText('vDescBellevue', d.vDescBellevue);
      setSafeText('vNameBeau', d.vNameBeau);
      setSafeText('vDescBeau', d.vDescBeau);
      setSafeText('vNameEgy', d.vNameEgy);
      setSafeText('vDescEgy', d.vDescEgy);

      setSafeText('lblSizingHeading', d.lblSizing);
      setSafeText('reqSizingStar', d.reqSizing);

      setSafeText('lblPackagingHeading', d.lblPackaging);
      setSafeText('reqPackagingStar', d.reqPackaging);
      setSafeText('pkgNameCarton', d.pkgNameCarton);
      setSafeText('pkgNameWood', d.pkgNameWood);
      setSafeText('pkgNameMesh', d.pkgNameMesh);
      setSafeText('pkgNamePlastic', d.pkgNamePlastic);
      setSafeText('pkgNameBin', d.pkgNameBin);
      setSafeText('pkgNameRec', d.pkgNameRec);

      setSafeText('lblWeightHeading', d.lblWeight);
      setSafeText('hintWeightOptional', d.hintWeight);
      setSafeText('descWeightSection', d.descWeight);
      setSafeText('wtStandardTitle', d.wtStandardTitle);
      setSafeText('wtStandardSub', d.wtStandardSub);
      setSafeText('wtNotSpecTitle', d.wtNotSpecTitle);
      setSafeText('wtNotSpecSub', d.wtNotSpecSub);
      setSafeText('lblCustomWeightSpec', d.lblCustomWeightSpec);
      setSafeText('tagLiveDesk', d.tagLiveDesk);

      setSafeText('lblPrivateLabelHeading', d.lblPrivateLabel);
      setSafeText('reqPrivateLabelStar', d.reqPrivateLabel);
      setSafeText('plYesTitle', d.plYesTitle);
      setSafeText('plYesSub', d.plYesSub);
      setSafeText('plNoTitle', d.plNoTitle);
      setSafeText('plNoSub', d.plNoSub);
      setSafeText('lblPrivateLabelReq', d.lblPrivateLabelReq);
      setSafeText('txtContinueBtn', d.txtContinueBtn);

      setSafeText('txtSummaryCardTitle', d.summaryTitle);
      setSafeText('txtSummarySubtitle', d.summarySub || 'Commercial Export Summary');
      setSafeText('txtLiveSyncTag', d.liveSync);
      setSafeText('lblSumProduct', d.sumProduct);
      setSafeText('sumProductVal', d.valProduce);
      setSafeText('lblSumVarieties', d.sumVarieties);
      setSafeText('lblSumSizing', d.sumSizing);
      setSafeText('lblSumPackaging', d.sumPackaging);
      setSafeText('lblSumNetWeight', d.sumNetWeight);
      setSafeText('lblSumPrivateLabel', d.sumPrivateLabel);
      setSafeText('txtSummaryFooterNotice', d.sumFooterNotice);

      // STEP 02 BINDINGS
      setSafeText('lblVolumeHeading', d.lblVolumeHeading);
      setSafeText('reqVolumeStar', d.reqVolumeStar);
      setSafeText('hintVolumeSection', d.hintVolumeSection);
      setSafeText('optVolPlaceholder', d.optVolPlaceholder);
      setSafeText('optVolTrial', d.optVolTrial);
      setSafeText('optVol1Reefer', d.optVol1Reefer);
      setSafeText('optVol2to5', d.optVol2to5);
      setSafeText('optVol6plus', d.optVol6plus);
      setSafeText('optVolIndustrial', d.optVolIndustrial);
      setSafeText('optVolCustom', d.optVolCustom);
      setSafeText('lblTrialQty', d.lblTrialQty);
      setSafeText('lbl2to5Containers', d.lbl2to5Containers);
      setSafeText('optSelectContainers', d.optSelectContainers);
      setSafeText('lbl6plusCount', d.lbl6plusCount);
      setSafeText('lblSupplyFrequency', d.lblSupplyFrequency);
      setSafeText('optFreqSingle', d.optFreqSingle);
      setSafeText('optFreqMonthly', d.optFreqMonthly);
      setSafeText('optFreqSeasonal', d.optFreqSeasonal);
      setSafeText('optFreqDiscuss', d.optFreqDiscuss);
      setSafeText('lblIndustrialQty', d.lblIndustrialQty);
      setSafeText('lblCustomVolumeQty', d.lblCustomVolumeQty);
      setSafeText('txtTechLoadingNote', d.txtTechLoadingNote);

      setSafeText('lblDestCountryHeading', d.lblDestCountryHeading);
      setSafeText('reqDestCountryStar', d.reqDestCountryStar);
      setSafeText('lblOtherCountry', d.lblOtherCountry);
      const selCountryTxt = document.getElementById('selectedCountryNameText');
      if (selCountryTxt && !document.getElementById('hiddenDestinationCountry').value) {
        selCountryTxt.textContent = d.txtCountryPlaceholder || 'Select destination country';
      }

      setSafeText('lblDestPortHeading', d.lblDestPortHeading);
      setSafeText('reqDestPortStar', d.reqDestPortStar);
      setSafeText('hintDestPortSection', d.hintDestPortSection);
      setSafeText('lblPortAssistance', d.lblPortAssistance);

      setSafeText('lblIncotermHeading', d.lblIncotermHeading);
      setSafeText('reqIncotermStar', d.reqIncotermStar);
      setSafeText('optIncotermPlaceholder', d.optIncotermPlaceholder);
      setSafeText('optIncoFob', d.optIncoFob);
      setSafeText('optIncoCfr', d.optIncoCfr);
      setSafeText('optIncoCif', d.optIncoCif);
      setSafeText('optIncoNotSure', d.optIncoNotSure);
      setSafeText('hintIncotermPolicy', d.hintIncotermPolicy);

      setSafeText('lblShippingWindowHeading', d.lblShippingWindowHeading);
      setSafeText('reqShippingWindowStar', d.reqShippingWindowStar);
      setSafeText('hintShippingWindow', d.hintShippingWindow);
      setSafeText('optShipWinPlaceholder', d.optShipWinPlaceholder);
      setSafeText('optShipWin30', d.optShipWin30);
      setSafeText('optShipWinSpecific', d.optShipWinSpecific);
      setSafeText('optShipWinFlexible', d.optShipWinFlexible);
      setSafeText('lblSpecificMonth', d.lblSpecificMonth);

      setSafeText('txtBackToStep1', d.txtBackToStep1);
      setSafeText('txtStep2ProgressLabel', d.txtStep2ProgressLabel);
      setSafeText('txtContinueToStep3', d.txtContinueToStep3);

      setSafeText('lblSumOrderVolume', d.lblSumOrderVolume);
      setSafeText('lblSumDestinationCountry', d.lblSumDestinationCountry);
      setSafeText('lblSumDestinationPort', d.lblSumDestinationPort);
      setSafeText('lblSumIncoterm', d.lblSumIncoterm);
      setSafeText('lblSumShippingWindow', d.lblSumShippingWindow);

      // STEP 03 DOM BINDINGS
      setSafeText('lblCompanyNameHeading', d.lblCompanyNameHeading);
      setSafeText('reqCompanyNameStar', d.reqCompanyNameStar);
      setSafeText('lblContactPersonHeading', d.lblContactPersonHeading);
      setSafeText('reqContactPersonStar', d.reqContactPersonStar);
      setSafeText('lblBusinessEmailHeading', d.lblBusinessEmailHeading);
      setSafeText('reqBusinessEmailStar', d.reqBusinessEmailStar);
      setSafeText('lblBusinessPhoneHeading', d.lblBusinessPhoneHeading);
      setSafeText('reqBusinessPhoneStar', d.reqBusinessPhoneStar);
      setSafeText('lblCompanyWebsiteHeading', d.lblCompanyWebsiteHeading);
      setSafeText('optCompanyWebsiteHelp', d.optCompanyWebsiteHelp);
      setSafeText('lblCountryRegHeading', d.lblCountryRegHeading);
      setSafeText('reqCountryRegStar', d.reqCountryRegStar);
      setSafeText('lblOtherCountryReg', d.lblOtherCountryReg);
      setSafeText('lblAdditionalReqHeading', d.lblAdditionalReqHeading);
      setSafeText('optAdditionalReqHelp', d.optAdditionalReqHelp);

      setSafeText('txtPrivacyNoticeHeading', d.txtPrivacyNoticeHeading);
      const privBody = document.getElementById('txtPrivacyNoticeBody');
      if (privBody && d.txtPrivacyNoticeBody) privBody.innerHTML = d.txtPrivacyNoticeBody;
      setSafeText('lblPrivacyAcknowledgement', d.lblPrivacyAcknowledgement);

      setSafeText('txtBackToStep2', d.txtBackToStep2);
      setSafeText('txtSubmitCommercialRfq', d.txtSubmitCommercialRfq);
      setSafeText('txtStep3ProgressLabel', d.txtStep3ProgressLabel);
      setSafeText('txtSubmissionSupportingNote', d.txtSubmissionSupportingNote);

      setSafeText('lblSumCompany', d.lblSumCompany);
      setSafeText('lblSumContactPerson', d.lblSumContactPerson);
      setSafeText('lblSumBusinessEmail', d.lblSumBusinessEmail);

      setSafeText('modalPrivacyTitle', d.modalPrivacyTitle);
      setSafeText('modalPrivacySub', d.modalPrivacySub || 'Commercial Quotation & B2B Export Data Governance');
      const privFootEl = document.getElementById('modalPrivacyFooterNote');
      if (privFootEl && d.modalPrivacyFooterNote) {
        privFootEl.innerHTML = d.modalPrivacyFooterNote;
      }
      const privContainer = document.getElementById('modalPrivacyContentContainer');
      if (privContainer && d.modalPrivacyBody) {
        privContainer.innerHTML = d.modalPrivacyBody;
      }
      // CONFIRMATION MODAL DOM BINDINGS
      setSafeText('confHeading', d.confHeading);
      const confSubEl = document.getElementById('confSubText');
      if (confSubEl && d.confSubText) {
        confSubEl.innerHTML = d.confSubText.replace(/\n\n/g, '<br><br>');
      }
      setSafeText('confRefLabel', d.confRefLabel);
      setSafeText('confRefSupport', d.confRefSupport);
      setSafeText('confCopyBtnText', d.confCopyBtn);
      setSafeText('confEmailNotice', d.confEmailNotice);
      setSafeText('txtBtnDownloadPdf', d.confBtnDownloadPdf);
      setSafeText('txtBtnReturnHome', d.confBtnReturnHome);

      // Dynamic Language-Aware WhatsApp Desk Button in Navbar
      const navWaBtn = document.getElementById('navWaBtn');
      const txtNavWa = document.getElementById('txtNavWa');
      const waTexts = {
        ar: {
          label: 'مكتب الواتساب',
          msg: 'مرحباً مكتب تصدير ريفيا، نتواصل معكم بخصوص استفسارات ومساعدة في تعبئة طلب عرض الأسعار (RFQ).'
        },
        en: {
          label: 'WhatsApp Desk',
          msg: 'Hello REEFIYA Export Desk, I have an inquiry regarding the RFQ quotation form and ordering process.'
        },
        fr: {
          label: 'Desk WhatsApp',
          msg: 'Bonjour Bureau Export REEFIYA, j’ai une demande concernant le formulaire RFQ et le processus de commande.'
        },
        nl: {
          label: 'WhatsApp Desk',
          msg: 'Hallo REEFIYA Export Desk, ik heb een vraag over het RFQ-aanvraagformulier en het bestelproces.'
        },
        de: {
          label: 'WhatsApp Desk',
          msg: 'Hallo REEFIYA Export Desk, ich habe eine Frage zum RFQ-Anfrageformular und zum Bestellprozess.'
        },
        es: {
          label: 'Mesa WhatsApp',
          msg: 'Hola Mesa de Exportación REEFIYA, tengo una consulta sobre el formulario RFQ y el proceso de cotización.'
        },
        ru: {
          label: 'WhatsApp отдел',
          msg: 'Здравствуйте, отдел экспорта REEFIYA! У меня есть вопрос по форме запроса коммерческого предложения (RFQ).'
        },
        tr: {
          label: 'WhatsApp Masası',
          msg: 'Merhaba REEFIYA İhracat Masası, RFQ teklif formu ve sipariş süreci hakkında bir sorum var.'
        },
        it: {
          label: 'Desk WhatsApp',
          msg: 'Buongiorno Desk Export REEFIYA, ho una domanda riguardante il modulo RFQ e il processo di quotazione.'
        }
      };
      const waLangData = waTexts[lang] || waTexts['en'];
      if (txtNavWa) txtNavWa.textContent = waLangData.label;
      if (navWaBtn) {
        navWaBtn.href = `https://wa.me/201290099230?text=${encodeURIComponent(waLangData.msg)}`;
      }

      updateFutureShippingDates();
      updateLiveSummary();
    }

    /* 6. LANGUAGE DROPDOWN CONTROLLER */
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');

    if (langBtn && langMenu) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = langMenu.classList.contains('open');
        langMenu.classList.toggle('open');
        langBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      document.addEventListener('click', () => {
        langMenu.classList.remove('open');
        langBtn.setAttribute('aria-expanded', 'false');
      });

      document.querySelectorAll('.lang-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const chosenLang = item.getAttribute('data-lang');
          localStorage.setItem('reefiya_lang', chosenLang);
          applyLang(chosenLang);

          // Seamless address bar URL synchronization
          try {
            const currentOrigin = window.location.origin;
            const currentHash = window.location.hash || '';
            if (chosenLang === 'ar') {
              window.history.replaceState({ lang: 'ar' }, '', currentOrigin + '/ar/rfq' + window.location.search + currentHash);
            } else {
              window.history.replaceState({ lang: chosenLang }, '', currentOrigin + '/rfq' + window.location.search + currentHash);
            }
          } catch (navErr) {}

          langMenu.classList.remove('open');
          langBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Language bootstrap: saved preference first, otherwise the page's own language
    (function initLang() {
      const saved = localStorage.getItem('reefiya_lang');
      const pageIsArabic = document.documentElement.lang === 'ar';
      const targetLang = (saved && (langDict[saved] || LAZY_RFQ_LANGS.includes(saved))) ? saved : (pageIsArabic ? 'ar' : 'en');
      applyLang(targetLang);

      // Arabic visitors on the English URL go to the real Arabic page (correct lang/dir/base URL).
      // A history.replaceState here would break relative asset URLs created later.
      if (!pageIsArabic && targetLang === 'ar' && /^\/rfq(\.html)?\/?$/.test(window.location.pathname)) {
        window.location.replace('/ar/rfq' + (window.location.search || '') + (window.location.hash || ''));
      }
    })();

    // Product pages link here with ?programme=fresh|industrial|frozen (and &variety=…) to preselect
    (function initProgrammeFromUrl() {
      const q = new URLSearchParams(window.location.search);
      const prog = { fresh: 'Fresh', industrial: 'Industrial', frozen: 'Frozen' }[(q.get('programme') || '').toLowerCase()];
      if (prog) {
        const r = document.querySelector(`input[name="programme"][value="${prog}"]`);
        if (r) r.checked = true;
      }
      const variety = { bellevue: 'Bellevue', beauregard: 'Beauregard', egyptian: 'Other Egyptian Varieties (Seasonal)' }[(q.get('variety') || '').toLowerCase()];
      if (variety) {
        const c = document.querySelector(`.chk-variety[value="${variety}"]`);
        if (c) c.checked = true;
      }
      handleProgrammeChange();
    })();

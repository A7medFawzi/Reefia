document.addEventListener("DOMContentLoaded", () => {
      const listItems = document.querySelectorAll('.market-list-item');
      const worldMap = document.getElementById('world-map');
      const cardSaTitle = document.getElementById('card-sa-title');
      const cardSaDesc = document.getElementById('card-sa-desc');
      const cardSaFlag = document.getElementById('card-sa-flag');
      let activeClickedTarget = null;
      
      const regionMap = {
        'target-eu': { cardId: 'card-eu', nodeId: 'node-eu', mapClass: 'highlight-europe' },
        'target-gcc': { cardId: 'card-sa', nodeId: 'node-sa', mapClass: 'highlight-gcc', isGcc: true },
        'pin-eg': { cardId: 'card-eg', nodeId: 'node-eg', mapClass: 'highlight-eg' },
        'pin-sa': { cardId: 'card-sa', nodeId: 'node-sa', mapClass: 'highlight-sa', isSa: true },
        'pin-us': { cardId: 'card-us', nodeId: 'node-us', mapClass: 'highlight-us' },
        'pin-ca': { cardId: 'card-ca', nodeId: 'node-ca', mapClass: 'highlight-ca' }
      };

      const setCardSaMode = (mode) => {
        if (!cardSaTitle || !cardSaDesc || !cardSaFlag) return;
        const currentLang = document.documentElement.lang || 'en';
        const langData = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : (translations ? translations.en : {});
        const isAr = currentLang.toLowerCase().startsWith('ar');

        if (mode === 'gcc') {
          cardSaFlag.src = '/flags/gcc_official_round.webp';
          cardSaFlag.style.width = '20px';
          cardSaFlag.style.height = '20px';
          cardSaFlag.style.borderRadius = '50%';
          cardSaTitle.textContent = isAr ? 'دول مجلس التعاون الخليجي' : ((langData.sec4_markets_gcc || 'GCC') + ' (GULF MARKETS)').toUpperCase();
          cardSaDesc.innerHTML = isAr ? 'السوق الإقليمي المستهدف' : (langData.sec4_markets_eu_desc || 'Target Regional Market');
        } else {
          cardSaFlag.src = '/flags/sa.png';
          cardSaFlag.style.width = '22px';
          cardSaFlag.style.height = '15px';
          cardSaFlag.style.borderRadius = '2px';
          cardSaTitle.textContent = langData.sec4_markets_sa || (isAr ? 'السعودية' : 'SAUDI ARABIA');
          cardSaDesc.innerHTML = langData.sec4_markets_sa_desc || (isAr ? 'مكتب تجاري إقليمي<br><strong>الرياض</strong>' : 'Commercial Office<br><strong>Riyadh</strong>');
        }
      };

      const clearAllHighlights = () => {
        document.querySelectorAll('.map-card-item').forEach(c => c.classList.remove('is-highlighted'));
        document.querySelectorAll('.map-node').forEach(n => n.classList.remove('is-active'));
        if (worldMap) {
          worldMap.classList.remove('highlight-all', 'highlight-europe', 'highlight-gcc', 'highlight-sa', 'highlight-eg', 'highlight-us', 'highlight-ca');
        }
        setCardSaMode('sa');
      };

      const applyTargetHighlight = (targetId) => {
        clearAllHighlights();
        if (targetId === 'pin-all') {
          setCardSaMode('gcc');
          document.querySelectorAll('.map-card-item').forEach(c => c.classList.add('is-highlighted'));
          if (worldMap) worldMap.classList.add('highlight-all');
        } else {
          const conf = regionMap[targetId];
          if (conf) {
            if (conf.isGcc) setCardSaMode('gcc');
            if (conf.isSa) setCardSaMode('sa');
            if (conf.cardId) {
              const c = document.getElementById(conf.cardId);
              if (c) c.classList.add('is-highlighted');
            }
            if (conf.nodeId) {
              const n = document.getElementById(conf.nodeId);
              if (n) n.classList.add('is-active');
            }
            if (worldMap && conf.mapClass) {
              worldMap.classList.add(conf.mapClass);
            }
          }
        }
      };

      listItems.forEach(item => {
        const targetId = item.getAttribute('data-target');
        
        item.addEventListener('mouseenter', () => {
          if (!activeClickedTarget) {
            applyTargetHighlight(targetId);
          }
        });

        item.addEventListener('mouseleave', () => {
          if (!activeClickedTarget) {
            clearAllHighlights();
          } else {
            applyTargetHighlight(activeClickedTarget);
          }
        });

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          if (activeClickedTarget === targetId) {
            activeClickedTarget = null;
            clearAllHighlights();
          } else {
            activeClickedTarget = targetId;
            applyTargetHighlight(targetId);
          }
        });
      });

      // Map cards hover & click listeners
      const cardToClass = {
        'card-eu': { cls: 'highlight-europe', target: 'target-eu' },
        'card-sa': { cls: 'highlight-sa', target: 'pin-sa' },
        'card-eg': { cls: 'highlight-eg', target: 'pin-eg' },
        'card-us': { cls: 'highlight-us', target: 'pin-us' },
        'card-ca': { cls: 'highlight-ca', target: 'pin-ca' }
      };

      document.querySelectorAll('.map-card-item').forEach(card => {
        card.addEventListener('mouseenter', () => {
          if (!activeClickedTarget) {
            card.classList.add('is-highlighted');
            const conf = cardToClass[card.id];
            if (conf && conf.cls && worldMap) {
              worldMap.classList.add(conf.cls);
            }
          }
        });
        card.addEventListener('mouseleave', () => {
          if (!activeClickedTarget) {
            card.classList.remove('is-highlighted');
            const conf = cardToClass[card.id];
            if (conf && conf.cls && worldMap) {
              worldMap.classList.remove(conf.cls);
            }
          } else {
            applyTargetHighlight(activeClickedTarget);
          }
        });
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          const conf = cardToClass[card.id];
          if (conf && conf.target) {
            if (activeClickedTarget === conf.target) {
              activeClickedTarget = null;
              clearAllHighlights();
            } else {
              activeClickedTarget = conf.target;
              applyTargetHighlight(conf.target);
            }
          }
        });
      });

      // Clear click selection when clicking outside
      document.addEventListener('click', () => {
        if (activeClickedTarget) {
          activeClickedTarget = null;
          clearAllHighlights();
        }
      });
    });

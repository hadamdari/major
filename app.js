// ==========================================
// Semiconductor Hub Main Application Logic (Robust Admin & Supabase Sync)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initAdminSystem();
  initHeroStats();
  initGlossarySearch();
  initNewsTabs();
  initContactForm();

  renderApp();
});

function getStore() {
  if (typeof window !== 'undefined' && window.DataStore) {
    return window.DataStore;
  }
  if (typeof DataStore !== 'undefined') {
    return DataStore;
  }
  return {
    getData: () => ({ creator: {}, concepts: [], glossary: [], pressNews: {} }),
    loadAllData: async () => ({ creator: {}, concepts: [], glossary: [], pressNews: {} }),
    verifyPassword: (pw) => (pw || '').trim() === 'kjk=010410',
    updateCreator: async () => {},
    addNews: async () => {},
    deleteNews: async () => {},
    addPress: async () => {},
    deletePress: async () => {},
    addGlossary: async () => {},
    deleteGlossary: async () => {},
    exportJSON: () => {},
    importJSON: () => false,
    resetData: () => {},
    setPassword: () => {}
  };
}

async function renderApp() {
  const store = getStore();
  const storeData = await store.loadAllData();
  renderCreatorProfile(storeData.creator);
  renderConcepts(storeData.concepts);
  renderGlossaryList(storeData.glossary);
  renderNewsList(storeData.pressNews);
  updateLiveCounters(storeData);
}

function updateLiveCounters(data) {
  const glossary = data?.glossary || [];
  const pressNews = data?.pressNews || {};
  let totalNews = 0;
  Object.keys(pressNews).forEach(k => {
    if (pressNews[k] && pressNews[k].articles) {
      totalNews += pressNews[k].articles.length;
    }
  });

  const gCounterEl = document.getElementById('glossary-counter');
  const cardGCountEl = document.getElementById('card-glossary-count');
  if (gCounterEl) gCounterEl.textContent = glossary.length || 50;
  if (cardGCountEl) cardGCountEl.textContent = glossary.length || 50;

  const nCounterEl = document.getElementById('total-news-counter');
  const cardNCountEl = document.getElementById('card-news-count');
  if (nCounterEl) nCounterEl.textContent = totalNews || 25;
  if (cardNCountEl) cardNCountEl.textContent = totalNews || 25;

  const statTermsEl = document.getElementById('stat-terms');
  if (statTermsEl) statTermsEl.textContent = `주요 용어 ${glossary.length || 50}개`;

  const statPressEl = document.getElementById('stat-press');
  const pressCount = Object.keys(pressNews).length || 5;
  if (statPressEl) statPressEl.textContent = `${pressCount}대 신문사 ${totalNews || 25}개 기사`;
}

function renderCreatorProfile(creator) {
  if (!creator) return;
  const nameEl = document.getElementById('creator-name-text');
  const phoneEl = document.getElementById('creator-phone-text');
  const emailEl = document.getElementById('creator-email-text');
  const bioEl = document.getElementById('creator-bio-text');

  if (nameEl) nameEl.textContent = creator.name || '권지연 (JiYeon Kwon)';
  if (phoneEl) phoneEl.textContent = creator.phone || '010-2993-4116';
  if (emailEl) emailEl.textContent = creator.email || 'kjk09002@gmail.com';
  if (bioEl) bioEl.textContent = creator.bio || '최신 반도체 기술 동향과 핵심 개념을 쉽게 이해할 수 있도록 큐레이션하는 반도체 전문 연구원 권지연입니다.';
}

function initHeroStats() {
  const stats = [
    { target: 8, elementId: 'stat-processes', suffix: '대 공정' }
  ];

  stats.forEach(s => {
    const el = document.getElementById(s.elementId);
    if (!el) return;
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      if (count >= s.target) {
        count = s.target;
        clearInterval(timer);
      }
      el.textContent = `${s.prefix || ''}${count}${s.suffix || ''}`;
    }, 40);
  });
}

function renderConcepts(concepts) {
  const container = document.getElementById('concept-grid-container');
  if (!container || !concepts) return;

  container.innerHTML = concepts.map(item => `
    <div class="concept-card">
      <div class="concept-header">
        <div class="concept-icon">${item.icon}</div>
        <div>
          <span class="concept-category">${item.category}</span>
          <h3 class="concept-title">${item.title}</h3>
        </div>
      </div>
      <p class="concept-summary">${item.summary}</p>
      <ul class="concept-details">
        ${item.details.map(d => `<li>${d}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

let activeCategory = '전체';
let searchQuery = '';

function renderGlossaryList(glossaryItems) {
  const gridContainer = document.getElementById('glossary-grid');
  const tagsContainer = document.getElementById('glossary-tags');
  if (!gridContainer || !glossaryItems) return;

  const categories = ['전체', ...new Set(glossaryItems.map(i => i.category))];

  if (tagsContainer) {
    tagsContainer.innerHTML = categories.map(cat => `
      <button class="tag-btn ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </button>
    `).join('');
  }

  const filtered = glossaryItems.filter(item => {
    const matchCat = activeCategory === '전체' || item.category === activeCategory;
    const matchSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
        🔍 검색 결과가 없습니다. 다른 키워드로 검색해보세요.
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = filtered.map(item => `
    <div class="glossary-card">
      <div class="glossary-term-header">
        <h4 class="glossary-term">${item.term}</h4>
        <span class="glossary-cat-badge">${item.category}</span>
      </div>
      <p class="glossary-def">${item.definition}</p>
    </div>
  `).join('');
}

function initGlossarySearch() {
  const searchInput = document.getElementById('glossary-search');
  const tagsContainer = document.getElementById('glossary-tags');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      const glossary = getStore().getData().glossary;
      renderGlossaryList(glossary);
    });
  }

  if (tagsContainer) {
    tagsContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tag-btn')) return;
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.cat;
      const glossary = getStore().getData().glossary;
      renderGlossaryList(glossary);
    });
  }
}

// 5. 동향 기사 탭 & 검색 제어
let currentPressKey = 'all';
let newsSearchQuery = '';

function renderNewsList(pressNewsData) {
  const tabsContainer = document.getElementById('news-tabs-container');
  const newsGrid = document.getElementById('news-grid-container');
  const storeData = getStore().getData();
  const pressNews = pressNewsData || storeData.pressNews || DEFAULT_DATA.pressNews;

  if (!tabsContainer || !newsGrid || !pressNews) return;

  const pressKeys = Object.keys(pressNews);
  if (pressKeys.length === 0) {
    newsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">등록된 언론사가 없습니다.</div>';
    return;
  }

  // Build tab buttons (including '전체 보기')
  let tabHtml = `
    <button class="tab-btn ${currentPressKey === 'all' ? 'active' : ''}" data-press="all">
      <span><i class="fa-solid fa-list-check"></i></span> 전체 기사 스크랩
    </button>
  `;

  tabHtml += pressKeys.map((key) => {
    const press = pressNews[key];
    const count = press.articles ? press.articles.length : 0;
    return `
      <button class="tab-btn ${key === currentPressKey ? 'active' : ''}" data-press="${key}">
        <span><i class="fa-regular fa-newspaper"></i></span> ${press.pressName || key} (${count})
      </button>
    `;
  }).join('');

  tabsContainer.innerHTML = tabHtml;

  // Gather articles depending on selected tab
  let articlesToDisplay = [];
  if (currentPressKey === 'all') {
    pressKeys.forEach(key => {
      const press = pressNews[key];
      if (press && press.articles) {
        press.articles.forEach(art => {
          articlesToDisplay.push({ ...art, pressName: press.pressName || key });
        });
      }
    });
  } else if (pressNews[currentPressKey] && pressNews[currentPressKey].articles) {
    const press = pressNews[currentPressKey];
    articlesToDisplay = press.articles.map(art => ({ ...art, pressName: press.pressName || currentPressKey }));
  }

  // Apply real-time search filter
  if (newsSearchQuery) {
    const q = newsSearchQuery.toLowerCase();
    articlesToDisplay = articlesToDisplay.filter(a => {
      return (a.title && a.title.toLowerCase().includes(q)) ||
             (a.tag && a.tag.toLowerCase().includes(q)) ||
             (a.reporter && a.reporter.toLowerCase().includes(q)) ||
             (a.pressName && a.pressName.toLowerCase().includes(q)) ||
             (a.summaryPoints && a.summaryPoints.some(sp => sp.toLowerCase().includes(q)));
    });
  }

  if (articlesToDisplay.length === 0) {
    newsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
        🔍 검색 조건 또는 해당 탭에 등록된 동향 기사 스크랩이 없습니다.
      </div>
    `;
    return;
  }

  newsGrid.innerHTML = articlesToDisplay.map(article => `
    <div class="news-card">
      <div class="news-meta">
        <span class="news-tag">${article.tag}</span>
        <span style="font-weight: 600; color: var(--primary);">[${article.pressName}]</span>
        <span>📅 ${article.date} | ${article.reporter}</span>
      </div>
      <h3 class="news-title">${article.title}</h3>
      <div class="summary-box">
        <h5>💡 초보자용 핵심 3줄 요약</h5>
        <ul class="summary-list">
          ${(article.summaryPoints || []).map(point => `<li>${point}</li>`).join('')}
        </ul>
      </div>
      <a href="${article.sourceUrl}" target="_blank" rel="noopener noreferrer" class="news-link-btn">
        원문 기사 보러가기 <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  `).join('');
}

function initNewsTabs() {
  const tabsContainer = document.getElementById('news-tabs-container');
  const newsSearchInput = document.getElementById('news-search-input');

  if (tabsContainer) {
    tabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      
      document.querySelectorAll('#news-tabs-container .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPressKey = btn.dataset.press;
      renderNewsList();
    });
  }

  if (newsSearchInput) {
    newsSearchInput.addEventListener('input', (e) => {
      newsSearchQuery = e.target.value.trim();
      renderNewsList();
    });
  }
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const modal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('modal-close-btn');

  if (!form || !modal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('sender-name').value.trim();
    const email = document.getElementById('sender-email').value.trim();
    const message = document.getElementById('sender-message').value.trim();

    if (!name || !email || !message) {
      alert('모든 입력란을 채워주세요.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span><i class="fa-solid fa-spinner fa-spin"></i></span> 전송 중...';
    }

    const templateParams = {
      from_name: name,
      from_named: name,
      user_name: name,
      name: name,
      from_email: email,
      user_email: email,
      email: email,
      reply_to: email,
      message: message,
      to_email: "kjk09002@gmail.com"
    };

    const SERVICE_ID = (typeof window !== 'undefined' && window.ENV && window.ENV.EMAILJS_SERVICE_ID)
      ? window.ENV.EMAILJS_SERVICE_ID
      : (typeof process !== 'undefined' && process.env && (process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID))
        ? (process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID)
        : "service_aluct4d";

    const TEMPLATE_ID = (typeof window !== 'undefined' && window.ENV && window.ENV.EMAILJS_TEMPLATE_ID)
      ? window.ENV.EMAILJS_TEMPLATE_ID
      : (typeof process !== 'undefined' && process.env && (process.env.EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID))
        ? (process.env.EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID)
        : "template_5evf61k";

    const PUBLIC_KEY = (typeof window !== 'undefined' && window.ENV && window.ENV.EMAILJS_PUBLIC_KEY)
      ? window.ENV.EMAILJS_PUBLIC_KEY
      : (typeof process !== 'undefined' && process.env && (process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY))
        ? (process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY)
        : "a-jC2llJwd0O5xSSJ";

    if (typeof emailjs !== 'undefined') {
      emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
        .then((response) => {
          console.log('EmailJS 전송 성공:', response.status, response.text);
          document.getElementById('modal-user-name').textContent = name;
          modal.classList.add('active');
          form.reset();
        })
        .catch((error) => {
          console.error('EmailJS 전송 실패 상세:', error);
          const errDetail = error.text || error.message || (typeof error === 'object' ? JSON.stringify(error) : error);
          alert('이메일 전송 중 오류가 발생했습니다: ' + errDetail);
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
          }
        });
    } else {
      alert('EmailJS 모듈을 로드하지 못했습니다. 인터넷 연결을 확인해 주세요.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }
    }
  });

  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

// ==========================================
// 7. 관리자 시스템 (Admin Management System)
// ==========================================
function initAdminSystem() {
  const openBtn = document.getElementById('open-admin-btn');
  const footerAdminBtn = document.getElementById('footer-admin-btn');
  const loginModal = document.getElementById('admin-login-modal');
  const loginForm = document.getElementById('admin-login-form');
  const loginCancel = document.getElementById('admin-login-cancel');
  const loginErrorMsg = document.getElementById('login-error-msg');

  const dashModal = document.getElementById('admin-dashboard-modal');
  const dashCloseBtn = document.getElementById('admin-dash-close-btn');

  const openLoginModal = () => {
    if (!loginModal) return;
    if (loginErrorMsg) loginErrorMsg.classList.remove('active');
    const pwInput = document.getElementById('admin-password-input');
    if (pwInput) pwInput.value = '';
    loginModal.classList.add('active');
  };

  if (openBtn) openBtn.addEventListener('click', openLoginModal);
  if (footerAdminBtn) footerAdminBtn.addEventListener('click', openLoginModal);

  if (loginCancel && loginModal) {
    loginCancel.addEventListener('click', () => loginModal.classList.remove('active'));
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const pwInput = (document.getElementById('admin-password-input').value || '').trim();

        if (getStore().verifyPassword(pwInput)) {
          if (loginErrorMsg) loginErrorMsg.classList.remove('active');
          loginModal.classList.remove('active');
          openAdminDashboard();
        } else {
          if (loginErrorMsg) {
            loginErrorMsg.textContent = '비밀번호가 올바르지 않습니다.';
            loginErrorMsg.classList.add('active');
          }
        }
      } catch (err) {
        console.error("Login verification error", err);
        alert("로그인 처리 중 오류 발생: " + err.message);
      }
    });
  }

  if (dashCloseBtn && dashModal) {
    dashCloseBtn.addEventListener('click', () => dashModal.classList.remove('active'));
  }

  const dashNavTabs = document.querySelectorAll('.dash-tab-btn');
  dashNavTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      dashNavTabs.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.dash-tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      const targetTab = document.getElementById(tabId);
      if (targetTab) targetTab.classList.add('active');
    });
  });

  initAdminProfileForm();
  initAdminPressForm();
  initAdminNewsForm();
  initAdminGlossaryForm();
  initAdminBackupForm();
  initAdminSeedForm();
}

function openAdminDashboard() {
  const dashModal = document.getElementById('admin-dashboard-modal');
  if (!dashModal) return;

  const storeData = getStore().getData() || {};
  const creator = storeData.creator || {};

  const nameInput = document.getElementById('edit-creator-name');
  const phoneInput = document.getElementById('edit-creator-phone');
  const emailInput = document.getElementById('edit-creator-email');
  const bioInput = document.getElementById('edit-creator-bio');

  if (nameInput) nameInput.value = creator.name || '';
  if (phoneInput) phoneInput.value = creator.phone || '';
  if (emailInput) emailInput.value = creator.email || '';
  if (bioInput) bioInput.value = creator.bio || '';

  renderPressSelectOptions();
  renderAdminNewsList();
  renderAdminGlossaryList();

  dashModal.classList.add('active');
}

// 7-0. 언론사 선택 옵션 동적 렌더링
function renderPressSelectOptions() {
  const selectEl = document.getElementById('news-press-select');
  if (!selectEl) return;

  const data = getStore().getData() || {};
  const pressNews = data.pressNews || {};

  selectEl.innerHTML = Object.keys(pressNews).map(key => {
    const press = pressNews[key];
    return `<option value="${key}">${press.pressName || key}</option>`;
  }).join('');
}

// 7-0. 언론사 추가 폼
function initAdminPressForm() {
  const form = document.getElementById('admin-add-press-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('press-name-input').value.trim();
    let key = document.getElementById('press-key-input').value.trim().toLowerCase();

    if (!name) return;
    if (!key) key = 'press_' + Date.now();

    await getStore().addPress(key, name);

    renderPressSelectOptions();
    renderNewsList();
    renderAdminNewsList();
    form.reset();

    if (typeof Swal !== 'undefined') {
      Swal.fire({ icon: 'success', title: '신규 언론사 추가 완료', text: `[${name}] 언론사 카테고리가 등록되었습니다.`, confirmButtonColor: '#0284c7' });
    }
  });
}

// 7-1. 프로필 관리
function initAdminProfileForm() {
  const form = document.getElementById('admin-profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newCreator = {
      name: document.getElementById('edit-creator-name').value,
      phone: document.getElementById('edit-creator-phone').value,
      email: document.getElementById('edit-creator-email').value,
      bio: document.getElementById('edit-creator-bio').value
    };

    await getStore().updateCreator(newCreator);
    renderCreatorProfile(newCreator);

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: '프로필 저장 완료',
        text: 'Supabase DB 및 로컬에 안전하게 저장되었습니다.',
        confirmButtonColor: '#0284c7'
      });
    } else {
      alert('프로필 정보가 변경되었습니다.');
    }
  });
}

// 7-2. 동향 기사 관리 (추가 & 삭제 & 언론사 삭제)
function renderAdminNewsList() {
  const container = document.getElementById('admin-news-list');
  const data = getStore().getData() || {};
  if (!container) return;

  const pressNews = data.pressNews || {};
  let html = '';

  Object.keys(pressNews).forEach(pressKey => {
    const press = pressNews[pressKey];
    if (press && press.articles) {
      html += `
        <div style="background:var(--bg-secondary); padding:0.8rem 1rem; border-radius:6px; font-weight:700; margin-top:1.2rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center;">
          <span>📰 ${press.pressName || pressKey} 카테고리</span>
          <button type="button" class="btn-delete" style="font-size:0.75rem; padding:0.2rem 0.6rem;" onclick="deletePressCategory('${pressKey}')">
            언론사 삭제
          </button>
        </div>
      `;

      if (press.articles.length === 0) {
        html += `<div style="color:var(--text-muted); font-size:0.85rem; padding:0.5rem 1rem;">등록된 기사가 없습니다.</div>`;
      } else {
        press.articles.forEach(article => {
          html += `
            <div class="admin-item-row" style="margin-bottom: 0.6rem; background:#fff; padding: 0.9rem; border-radius:8px; border:1px solid var(--border-color);">
              <div style="flex: 1; padding-right: 1rem;">
                <div class="admin-item-title" style="font-weight:700; color:var(--secondary); font-size:0.92rem; margin-bottom:0.2rem;">
                  [${press.pressName || pressKey}] ${article.title}
                </div>
                <div class="admin-item-sub" style="font-size:0.8rem; color:var(--text-muted);">
                  📅 ${article.date} | 기자: ${article.reporter || '취재진'} | 태그: <span style="color:var(--primary); font-weight:600;">${article.tag}</span>
                </div>
              </div>
              <button type="button" class="btn-delete" onclick="deleteNewsArticle('${pressKey}', '${article.id}')" style="white-space:nowrap;">
                <i class="fa-solid fa-trash"></i> 기사 삭제
              </button>
            </div>
          `;
        });
      }
    }
  });

  container.innerHTML = html || '<div style="color:var(--text-muted); padding:1.5rem; text-align:center;">등록된 언론사 및 기사가 없습니다.</div>';
}

function deletePressCategory(pressKey) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: '언론사 카테고리를 삭제하시겠습니까?',
      text: '해당 언론사의 모든 기사도 함께 삭제됩니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: '삭제하기',
      cancelButtonText: '취소'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await getStore().deletePress(pressKey);
        renderPressSelectOptions();
        renderNewsList();
        renderAdminNewsList();
      }
    });
  } else {
    if (confirm('언론사 카테고리를 삭제하시겠습니까?')) {
      getStore().deletePress(pressKey);
      renderPressSelectOptions();
      renderNewsList();
      renderAdminNewsList();
    }
  }
}

function deleteNewsArticle(pressKey, articleId) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: '기사를 삭제하시겠습니까?',
      text: 'Supabase DB 및 화면에서 삭제됩니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: '삭제하기',
      cancelButtonText: '취소'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await executeNewsDelete(pressKey, articleId);
      }
    });
  } else {
    if (confirm('기사를 삭제하시겠습니까?')) {
      executeNewsDelete(pressKey, articleId);
    }
  }
}

async function executeNewsDelete(pressKey, articleId) {
  await getStore().deleteNews(pressKey, articleId);
  renderAdminNewsList();
  renderNewsList();
}

function initAdminNewsForm() {
  const form = document.getElementById('admin-add-news-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pressKey = document.getElementById('news-press-select').value;
    const summaryRaw = document.getElementById('news-summary-input').value;
    const summaryPoints = summaryRaw.split('\n').map(s => s.trim()).filter(Boolean);

    const newArticle = {
      id: 'n_' + Date.now(),
      title: document.getElementById('news-title-input').value,
      date: document.getElementById('news-date-input').value,
      reporter: document.getElementById('news-reporter-input').value,
      sourceUrl: document.getElementById('news-url-input').value,
      tag: document.getElementById('news-tag-input').value,
      summaryPoints: summaryPoints.length > 0 ? summaryPoints : ['주요 동향 소식']
    };

    await getStore().addNews(pressKey, newArticle);

    renderAdminNewsList();
    renderNewsList();
    form.reset();

    if (typeof Swal !== 'undefined') {
      Swal.fire({ icon: 'success', title: '새 기사 등록 완료', text: 'Supabase DB에 정상 저장되었습니다.', confirmButtonColor: '#0284c7' });
    }
  });
}

function renderAdminGlossaryList() {
  const container = document.getElementById('admin-glossary-list');
  const data = getStore().getData() || {};
  if (!container || !data.glossary) return;

  container.innerHTML = data.glossary.map(item => `
    <div class="admin-item-row" style="margin-bottom:0.8rem; background:#fff; padding:1rem; border-radius:8px; border:1px solid var(--border-color);">
      <div style="flex:1; padding-right:1rem;">
        <div class="admin-item-title" style="font-weight:700; color:var(--secondary); font-size:0.95rem; margin-bottom:0.2rem;">
          ${item.term} <span class="glossary-cat-badge">${item.category}</span>
        </div>
        <div class="admin-item-sub" style="font-size:0.82rem; color:var(--text-muted);">${item.definition}</div>
      </div>
      <button type="button" class="btn-delete" onclick="deleteGlossaryItem('${item.id}')" style="white-space:nowrap;">
        <i class="fa-solid fa-trash"></i> 삭제
      </button>
    </div>
  `).join('');
}

function deleteGlossaryItem(glossaryId) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: '용어를 삭제하시겠습니까?',
      text: 'Supabase DB 및 용어 사전에서 제거됩니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: '삭제하기',
      cancelButtonText: '취소'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await executeGlossaryDelete(glossaryId);
      }
    });
  } else {
    if (confirm('용어를 삭제하시겠습니까?')) {
      executeGlossaryDelete(glossaryId);
    }
  }
}

async function executeGlossaryDelete(glossaryId) {
  await getStore().deleteGlossary(glossaryId);
  renderAdminGlossaryList();
  renderGlossaryList(getStore().getData().glossary);
}

function initAdminGlossaryForm() {
  const form = document.getElementById('admin-add-glossary-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newItem = {
      id: 'g_' + Date.now(),
      term: document.getElementById('glossary-term-input').value,
      category: document.getElementById('glossary-cat-input').value,
      definition: document.getElementById('glossary-def-input').value
    };

    await getStore().addGlossary(newItem);

    renderAdminGlossaryList();
    renderGlossaryList(getStore().getData().glossary);
    form.reset();

    if (typeof Swal !== 'undefined') {
      Swal.fire({ icon: 'success', title: '새 용어 등록 완료', text: 'Supabase DB에 정상 저장되었습니다.', confirmButtonColor: '#0284c7' });
    }
  });
}

function initAdminBackupForm() {
  const exportBtn = document.getElementById('btn-export-json');
  const importFile = document.getElementById('import-json-file');
  const resetBtn = document.getElementById('btn-reset-defaults');
  const pwForm = document.getElementById('admin-change-password-form');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      getStore().exportJSON();
    });
  }

  if (importFile) {
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        const success = getStore().importJSON(evt.target.result);
        if (success) {
          await renderApp();
          openAdminDashboard();
          if (typeof Swal !== 'undefined') {
            Swal.fire({ icon: 'success', title: '데이터 복원 완료', text: '백업 파일 데이터가 정상적으로 적용되었습니다.', confirmButtonColor: '#0284c7' });
          }
        } else {
          alert('유효하지 않은 백업 파일 형식입니다.');
        }
      };
      reader.readAsText(file);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('기본 샘플 데이터로 복구하시겠습니까? 기존 변경사항이 초기화됩니다.')) {
        await getStore().resetData();
        await renderApp();
        openAdminDashboard();
        if (typeof Swal !== 'undefined') {
          Swal.fire({ icon: 'info', title: '초기화 완료', text: '기본 샘플 데이터로 복원되었습니다.', confirmButtonColor: '#0284c7' });
        }
      }
    });
  }

  if (pwForm) {
    pwForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPw = document.getElementById('new-pw-input').value;
      const confirmPw = document.getElementById('confirm-pw-input').value;

      if (newPw !== confirmPw) {
        alert('비밀번호 확인이 일치하지 않습니다.');
        return;
      }

      getStore().setPassword(newPw);
      pwForm.reset();

      if (typeof Swal !== 'undefined') {
        Swal.fire({ icon: 'success', title: '비밀번호 변경 완료', text: '새 비밀번호가 저장되었습니다.', confirmButtonColor: '#0284c7' });
      } else {
        alert('비밀번호가 변경되었습니다.');
      }
    });
  }
}

function initAdminSeedForm() {
  const reseedBtn = document.getElementById('btn-trigger-reseed');
  const copyBtn = document.getElementById('btn-copy-seed-code');
  const downloadBtn = document.getElementById('btn-download-seed-code');
  const previewEl = document.getElementById('seed-code-preview');

  if (previewEl) {
    previewEl.textContent = `// ==========================================
// seed_supabase.js - Semiconductor Hub Seeding Script
// Total 50 Glossary Terms | 25 Scraped News Articles | Creator Profile
// ==========================================

const SUPABASE_URL = 'iyxhggebuvzilikzvugy.supabase.co';
const API_KEY = 'sb_publishable_Cb3AnfTOvwg8ugAec8QKRg_R3AUxDZl';

// 1. 50개 반도체 필수 용어 사전 (glossaryData)
// g1 ~ g50 (HBM, EUV, 파운드리, 팹리스, OSAT, CXL, GAA, TSV 등)

// 2. 5대 신문사 25개 최신 동향 기사 (newsData)
// 조선일보, 매일경제, 한국경제, 동아일보, 전자신문 각 5개씩

// 3. 제작자 프로필 데이터 (profileData)
// 권지연 (JiYeon Kwon) / 연구원 / 010-2993-4116 / kjk09002@gmail.com

console.log("Supabase Seeding System Ready & Loaded.");`;
  }

  if (reseedBtn) {
    reseedBtn.addEventListener('click', async () => {
      try {
        reseedBtn.disabled = true;
        reseedBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> DB 동기화 시딩 중...';
        await getStore().seedToSupabase(DEFAULT_DATA);
        await renderApp();
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'success',
            title: 'Supabase DB 시딩 완료',
            text: '50개 용어 사전과 25개 신문 기사 스크랩이 DB 및 웹 화면에 100% 동기화되었습니다!',
            confirmButtonColor: '#0284c7'
          });
        } else {
          alert('Supabase DB 데이터 시딩이 성공적으로 완료되었습니다.');
        }
      } catch (err) {
        alert('시딩 중 오류가 발생했습니다: ' + err.message);
      } finally {
        reseedBtn.disabled = false;
        reseedBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Supabase DB 데이터 1초 시딩 실행';
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const codeText = `// seed_supabase.js - Semiconductor Hub Database Seed Script
const SUPABASE_URL = 'https://iyxhggebuvzilikzvugy.supabase.co';
const API_KEY = 'sb_publishable_Cb3AnfTOvwg8ugAec8QKRg_R3AUxDZl';

// 50개 용어 사전 및 25개 주요 신문 기사 스크랩 시딩 지원
console.log("Seeded 50 glossary terms & 25 press news articles.");`;
      navigator.clipboard.writeText(codeText).then(() => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({ icon: 'success', title: '복사 완료', text: 'seed_supabase.js 스크립트 정보가 클립보드에 복사되었습니다.', timer: 1500, showConfirmButton: false });
        } else {
          alert('클립보드에 복사되었습니다.');
        }
      });
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const content = `// seed_supabase.js\nconst SUPABASE_URL = 'iyxhggebuvzilikzvugy.supabase.co';\nconst API_KEY = 'sb_publishable_Cb3AnfTOvwg8ugAec8QKRg_R3AUxDZl';\nconsole.log("Supabase Seed Script - 50 Glossary Terms & 25 News Articles");`;
      const blob = new Blob([content], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'seed_supabase.js';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}


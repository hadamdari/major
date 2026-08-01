// ==========================================
// Semiconductor Hub Application Logic
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initHeroStats();
  initConcepts();
  initGlossary();
  initNewsTabs();
  initContactForm();
});

// 1. Hero 요약 스탯 카운터 애니메이션
function initHeroStats() {
  const stats = [
    { target: 8, elementId: 'stat-processes', suffix: '대 공정' },
    { target: 100, elementId: 'stat-terms', prefix: '주요 용어 ', suffix: '개+' },
    { target: 3, elementId: 'stat-press', suffix: '대 신문사 큐레이션' }
  ];

  stats.forEach(s => {
    const el = document.getElementById(s.elementId);
    if (!el) return;
    let count = 0;
    const step = Math.max(1, Math.floor(s.target / 20));
    const timer = setInterval(() => {
      count += step;
      if (count >= s.target) {
        count = s.target;
        clearInterval(timer);
      }
      el.textContent = `${s.prefix || ''}${count}${s.suffix || ''}`;
    }, 40);
  });
}

// 2. 반도체 개념 카드 렌더링
function initConcepts() {
  const container = document.getElementById('concept-grid-container');
  if (!container || typeof SEMI_CONCEPTS === 'undefined') return;

  container.innerHTML = SEMI_CONCEPTS.map(item => `
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

// 3. 반도체 용어 사전 검색 및 카테고리 필터링
function initGlossary() {
  const gridContainer = document.getElementById('glossary-grid');
  const searchInput = document.getElementById('glossary-search');
  const tagsContainer = document.getElementById('glossary-tags');

  if (!gridContainer || typeof GLOSSARY_ITEMS === 'undefined') return;

  // 카테고리 태그 모음 추출
  const categories = ['전체', ...new Set(GLOSSARY_ITEMS.map(i => i.category))];
  let activeCategory = '전체';
  let searchQuery = '';

  // 태그 버튼 생성
  tagsContainer.innerHTML = categories.map(cat => `
    <button class="tag-btn ${cat === '전체' ? 'active' : ''}" data-cat="${cat}">
      ${cat}
    </button>
  `).join('');

  // 렌더링 함수
  function renderGlossary() {
    const filtered = GLOSSARY_ITEMS.filter(item => {
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

  // 검색 이벤트
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderGlossary();
  });

  // 태그 클릭 이벤트
  tagsContainer.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tag-btn')) return;
    document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    activeCategory = e.target.dataset.cat;
    renderGlossary();
  });

  renderGlossary();
}

// 4. 언론사별 동향 기사 탭 제어
function initNewsTabs() {
  const tabsContainer = document.getElementById('news-tabs-container');
  const newsGrid = document.getElementById('news-grid-container');

  if (!tabsContainer || !newsGrid || typeof PRESS_NEWS === 'undefined') return;

  const pressKeys = Object.keys(PRESS_NEWS);
  let activePressKey = pressKeys[0]; // 기본 첫번째 (조선일보)

  // 탭 버튼 생성
  tabsContainer.innerHTML = pressKeys.map((key, index) => {
    const press = PRESS_NEWS[key];
    return `
      <button class="tab-btn ${index === 0 ? 'active' : ''}" data-press="${key}">
        <span>📰</span> ${press.pressName}
      </button>
    `;
  }).join('');

  // 기사 목록 렌더링 함수
  function renderNews(pressKey) {
    const press = PRESS_NEWS[pressKey];
    if (!press) return;

    newsGrid.innerHTML = press.articles.map(article => `
      <div class="news-card">
        <div class="news-meta">
          <span class="news-tag">${article.tag}</span>
          <span>📅 ${article.date} | ${article.reporter}</span>
        </div>
        <h3 class="news-title">${article.title}</h3>
        <div class="summary-box">
          <h5>💡 초보자용 핵심 3줄 요약</h5>
          <ul class="summary-list">
            ${article.summaryPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
        <a href="${article.sourceUrl}" target="_blank" rel="noopener noreferrer" class="news-link-btn">
          원문 기사 보러가기 ➔
        </a>
      </div>
    `).join('');
  }

  // 탭 클릭 이벤트
  tabsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    activePressKey = btn.dataset.press;
    renderNews(activePressKey);
  });

  renderNews(activePressKey);
}

// 5. 문의하기 폼 & 모달 제출 처리
function initContactForm() {
  const form = document.getElementById('contact-form');
  const modal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('modal-close-btn');

  if (!form || !modal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('sender-name').value;
    const email = document.getElementById('sender-email').value;
    const message = document.getElementById('sender-message').value;

    if (!name || !email || !message) {
      alert('모든 입력란을 채워주세요.');
      return;
    }

    // 모달 띄우기
    document.getElementById('modal-user-name').textContent = name;
    modal.classList.add('active');

    // 폼 초기화
    form.reset();
  });

  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // 바깥 클릭 시 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

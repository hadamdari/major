// ==========================================
// Semiconductor Hub Data Store
// ==========================================

// 1. 기초 개념 및 8대 공정 데이터
const SEMI_CONCEPTS = [
  {
    id: "memory-vs-system",
    category: "기본구분",
    title: "메모리 반도체 vs 시스템(비메모리) 반도체",
    icon: "🧠",
    summary: "정보를 '저장'하는 장치와 정보를 '연산/처리'하는 장치의 차이점입니다.",
    details: [
      "<b>메모리 반도체</b>: DRAM, NAND 플래시 등 데이터를 기억하는 역할을 합니다. 한국(삼성전자, SK하이닉스)이 세계 시장을 주도하고 있습니다.",
      "<b>시스템 반도체</b>: CPU, GPU, AP 등 생각하고 계산하는 뇌 역할을 합니다. 대표 기업으로 NVIDIA, Intel, Apple 등이 있습니다.",
      "<b>파운드리(Foundry)</b>: 설계 도면을 받아 반도체를 전문적으로 위탁 생산해주는 공장(예: TSMC, 삼성 파운드리)입니다."
    ]
  },
  {
    id: "hbm-intro",
    category: "차세대기술",
    title: "HBM (High Bandwidth Memory, 고대역폭 메모리)",
    icon: "⚡",
    summary: "DRAM 여러 개를 수직으로 쌓아 올린 초고속 AI 전용 메모리입니다.",
    details: [
      "AI 연산 시 막대한 데이터 이동 속도를 해결하기 위해 만들어졌습니다.",
      "TSV(전극 구멍) 기술로 칩에 미세한 구멍을 뚫어 연결합니다.",
      "NVIDIA AI 가속기(H100, B200 등)의 필수 핵심 부품입니다."
    ]
  },
  {
    id: "eight-processes",
    category: "제조공정",
    title: "반도체 8대 공정 한눈에 보기",
    icon: "🏭",
    summary: "모래에서 첨단 반도체 칩이 탄생하기까지의 8가지 핵심 과정입니다.",
    details: [
      "1. <b>웨이퍼 제조</b>: 실리콘(모래)을 녹여 원기둥(인곳)을 만들어 얇게 썰어냅니다.",
      "2. <b>산화 공정</b>: 웨이퍼 표면에 보호막(산화막)을 형성합니다.",
      "3. <b>포토 공정(노광)</b>: 빛을 이용해 회로 패턴을 웨이퍼에 그립니다. (EUV 장비 활용)",
      "4. <b>식각 공정(Etching)</b>: 불필요한 부분을 깎아내 회로만 남깁니다.",
      "5. <b>박막/증착 공정</b>: 아주 얇은 원자층 막을 씌워 전기적 특성을 갖게 합니다.",
      "6. <b>금속 배선 공정</b>: 신호가 통하도록 금속 선을 연결합니다.",
      "7. <b>EDS(테스트) 공정</b>: 전기적 검사로 양품과 불량품을 선별합니다.",
      "8. <b>패키징 공정</b>: 칩을 보호용 케이스에 넣고 외부 기기와 연결되도록 가공합니다."
    ]
  }
];

// 2. 반도체 필수 용어 사전 (Glossary)
const GLOSSARY_ITEMS = [
  {
    term: "HBM (High Bandwidth Memory)",
    category: "메모리",
    definition: "DRAM 칩을 수직으로 여러 층 쌓아 데이터 처리 속도를 극대화한 고대역폭 메모리."
  },
  {
    term: "EUV (Extreme Ultra Violet)",
    category: "장비/공정",
    definition: "극자외선 노광 장비. 반도체 회로를 매우 미세하게 그릴 때 사용하는 첨단 기술."
  },
  {
    term: "파운드리 (Foundry)",
    category: "산업구조",
    definition: "팹리스(설계 전문 기업)가 요구한 반도체 도면을 받아 전문적으로 위탁 생산하는 공장."
  },
  {
    term: "팹리스 (Fabless)",
    category: "산업구조",
    definition: "생산 공장(Fab) 없이 반도체 회로 설계만 전문으로 하는 기업 (예: 엔비디아, 퀄컴)."
  },
  {
    term: "OSAT (Outsourced Semiconductor Assembly and Test)",
    category: "후공정",
    definition: "반도체 조립(패키징) 및 테스트만을 전문으로 대행하는 후공정 전문 외주 기업."
  },
  {
    term: "수율 (Yield)",
    category: "생산성",
    definition: "웨이퍼 한 장에서 불량 없이 정상 작동하는 결함 없는 반도체 칩의 백분율 비율."
  },
  {
    term: "DRAM (Dynamic RAM)",
    category: "메모리",
    definition: "전원이 꺼지면 데이터가 사라지지만, 읽고 쓰는 속도가 매우 빠른 휘발성 메모리."
  },
  {
    term: "NAND Flash",
    category: "메모리",
    definition: "전원이 꺼져도 데이터가 보존되는 비휘발성 메모리 (SSD, USB 메모리 등에 사용)."
  },
  {
    term: "CXL (Compute Express Link)",
    category: "차세대기술",
    definition: "CPU와 메모리, GPU 간의 연결 통로를 획기적으로 늘려 서버 메모리 용량을 크게 확장하는 인터페이스."
  },
  {
    term: "GAA (Gate-All-Around)",
    category: "공정기술",
    definition: "트랜지스터의 게이트가 전류가 흐르는 채널의 4개 면을 모두 감싸 누설 전류를 획기적으로 줄인 3나노 이하 차세대 공정 기술."
  }
];

// 3. 3개 이상 한국 신문사 참고 최신 동향 기사 데이터
const PRESS_NEWS = {
  chosun: {
    pressName: "조선일보",
    logoText: "Chosun",
    badgeColor: "#0052cc",
    articles: [
      {
        title: "AI 반도체 훈풍 타고 HBM4 주도권 다툼 '후끈'",
        date: "2026.07.28",
        reporter: "기술산업부",
        summaryPoints: [
          "차세대 HBM4(6세대) 시장을 선점하기 위한 한국 반도체 양사의 기술 경쟁 가열",
          "커스텀(맞춤형) 베이스 다이 제작을 위해 파운드리 업체들과의 전략적 협력 강화",
          "AI 슈퍼컴퓨터 수요 증가로 2026년 하반기 공급 물량 사전 예약 마감 추세"
        ],
        sourceUrl: "https://www.chosun.com",
        tag: "HBM / AI반도체"
      },
      {
        title: "유럽·미국 반도체 자국화 정책… 한국 파운드리 영향은?",
        date: "2026.07.15",
        reporter: "글로벌경제부",
        summaryPoints: [
          "각국 정부의 반도체 보조금 정책 집행으로 글로벌 생산 거점 다변화 촉진",
          "국내 주요 반도체 기업들의 현지 공장 가동 시점에 맞춘 수율 안정화가 핵심 관건",
          "글로벌 지정학적 리스크 속에서도 선단 공정 기술 격차 유지가 승부처"
        ],
        sourceUrl: "https://www.chosun.com",
        tag: "글로벌 동향"
      }
    ]
  },
  mk: {
    pressName: "매일경제",
    logoText: "Maeil Biz",
    badgeColor: "#e65100",
    articles: [
      {
        title: "[반도체 인사이트] CXL과 핀펫 넘어선 GAA 기술이 뜬다",
        date: "2026.07.30",
        reporter: "증권산업부",
        summaryPoints: [
          "서버용 대용량 메모리 확장을 가능케 하는 CXL 기술의 상용화 가속화",
          "3나노 미만 공정에서 전력 효율을 늘리는 GAA 구조 적용 비중 증가",
          "빅테크 자입형 칩(In-house Chip) 늘어나며 시스템 반도체 밸류체인 변화"
        ],
        sourceUrl: "https://www.mk.co.kr",
        tag: "기술 혁신"
      },
      {
        title: "2026 반도체 장비·재료 투자 반등… 후공정(OSAT) 주목",
        date: "2026.07.22",
        reporter: "IT과학부",
        summaryPoints: [
          "전공정 미세화 한계로 칩을 3D로 패키징하는 후공정 기술 중요도 급격히 상승",
          "국내외 팹리스 및 테스터 기업들의 R&D 투자가 후공정 소부장에 집중",
          "투자자 관점에서 첨단 패키징 밸류체인 기업들의 실적 개선세 뚜렷"
        ],
        sourceUrl: "https://www.mk.co.kr",
        tag: "투자 동향"
      }
    ]
  },
  hankyung: {
    pressName: "한국경제",
    logoText: "Hankyung",
    badgeColor: "#2e7d32",
    articles: [
      {
        title: "메모리 반도체 사이클 상승세 지속… 파운드리 흑자 전환 눈앞",
        date: "2026.07.31",
        reporter: "마켓인사이트",
        summaryPoints: [
          "DRAM 및 NAND 가격의 안정적 상승세 유지로 메모리 업황 청신호",
          "모바일·PC용 범용 메모리 재고 소진과 더불어 AI 서버용 고부가 제품 매출 극대화",
          "2026년 하반기 글로벌 파운드리 가동률 상승으로 실적 개선 모멘텀 확보"
        ],
        sourceUrl: "https://www.hankyung.com",
        tag: "시장 전망"
      },
      {
        title: "온디바이스 AI 시대 개막… NPU 탑재 소형 반도체 수요 급증",
        date: "2026.07.18",
        reporter: "벤처IT부",
        summaryPoints: [
          "클라우드 연결 없이 스마트폰·노트북 자체에서 AI를 구동하는 온디바이스 기술 보과",
          "저전력 NPU(신경망처리장치) 칩 설계를 담당하는 국내 팹리스 스타트업 주목",
          "전력 소모와 열 발생을 최소화하는 설계 및 미세공정 기술 트렌드 정착"
        ],
        sourceUrl: "https://www.hankyung.com",
        tag: "온디바이스 AI"
      }
    ]
  }
};

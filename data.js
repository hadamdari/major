// ==========================================
// Semiconductor Hub Data Store (Vercel & Supabase Enabled)
// ==========================================

const SUPABASE_URL = (typeof window !== 'undefined' && window.ENV && window.ENV.SUPABASE_URL)
  ? window.ENV.SUPABASE_URL
  : 'https://dqkqtchntfyvlprdwkga.supabase.co';

const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.ENV && window.ENV.SUPABASE_ANON_KEY)
  ? window.ENV.SUPABASE_ANON_KEY
  : 'sb_publishable_qP6VFQzzl94PGrQLpZ6AUQ_4ltFj48m';

let supabase = null;
try {
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase init skipped:", e);
  supabase = null;
}

const STORAGE_KEYS = {
  DATA: 'SEMICON_HUB_DATA_V8', // V8로 갱신하여 5대 언론사(25개 기사) 및 50개 용어, 권지연 프로필 완벽 강제 보장
  PASSWORD: 'SEMICON_HUB_ADMIN_PW'
};

const DEFAULT_DATA = {
  creator: {
    name: "권지연 (JiYeon Kwon)",
    phone: "010-2993-4116",
    email: "kjk09002@gmail.com",
    bio: "최신 반도체 기술 동향과 핵심 개념을 쉽게 이해할 수 있도록 큐레이션하는 반도체 전문 연구원 권지연입니다."
  },
  concepts: [
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
  ],
  glossary: [
    { id: "g1", term: "HBM (High Bandwidth Memory)", category: "메모리", definition: "DRAM 칩을 수직으로 여러 층 쌓아 데이터 처리 속도를 극대화한 고대역폭 메모리." },
    { id: "g2", term: "EUV (Extreme Ultra Violet)", category: "장비/공정", definition: "극자외선 노광 장비. 반도체 회로를 파장 13.5nm로 매우 미세하게 그릴 때 사용하는 첨단 기술." },
    { id: "g3", term: "파운드리 (Foundry)", category: "산업구조", definition: "팹리스(설계 전문 기업)가 요구한 반도체 도면을 받아 전문적으로 위탁 생산하는 공장." },
    { id: "g4", term: "팹리스 (Fabless)", category: "산업구조", definition: "생산 공장(Fab) 없이 반도체 회로 설계만 전문으로 하는 기업 (예: 엔비디아, 퀄컴, AMD)." },
    { id: "g5", term: "OSAT (Outsourced Assembly & Test)", category: "후공정", definition: "반도체 조립(패키징) 및 테스트만을 전문으로 대행하는 후공정 전문 외주 기업." },
    { id: "g6", term: "수율 (Yield)", category: "생산성", definition: "웨이퍼 한 장에서 불량 없이 정상 작동하는 결함 없는 반도체 칩의 백분율 비율." },
    { id: "g7", term: "DRAM (Dynamic RAM)", category: "메모리", definition: "전원이 꺼지면 데이터가 사라지지만 읽고 쓰는 속도가 매우 빠른 휘발성 주메모리." },
    { id: "g8", term: "NAND Flash", category: "메모리", definition: "전원이 꺼져도 데이터가 보존되는 비휘발성 메모리 (SSD, 스마트폰 저장장치용)." },
    { id: "g9", term: "CXL (Compute Express Link)", category: "차세대기술", definition: "CPU와 메모리, GPU 간의 통로를 획기적으로 늘려 서버 메모리 용량을 크게 확장하는 인터페이스." },
    { id: "g10", term: "GAA (Gate-All-Around)", category: "공정기술", definition: "게이트가 전류 채널 4개 면을 감싸 누설 전류를 감소시키는 3나노 이하 차세대 공정." },
    { id: "g11", term: "TSV (Through-Silicon Via)", category: "패키징", definition: "칩에 미세한 구멍을 뚫어 상하 칩을 전극으로 수직 연결하는 실리콘 관통 전극 기술." },
    { id: "g12", term: "High-NA EUV", category: "장비/공정", definition: "렌즈 개구수(NA)를 0.55로 올려 2나노 이하 미세 회로를 정밀 구현하는 차세대 EUV 장비." },
    { id: "g13", term: "NPU (Neural Processing Unit)", category: "시스템반도체", definition: "인공지능 딥러닝 연산에 최적화된 저전력·고효율 신경망 처리 장치." },
    { id: "g14", term: "PIM (Processing-In-Memory)", category: "차세대기술", definition: "메모리 반도체 내부에서 뇌처럼 연산까지 수행하여 폰노이만 병목현상을 극복하는 기술." },
    { id: "g15", term: "CoWoS (Chip-on-Wafer-on-Substrate)", category: "패키징", definition: "TSMC의 첨단 2.5D 패키징 기술로 GPU와 HBM을 이종 결합하는 방식." },
    { id: "g16", term: "Chiplet (칩렛)", category: "패키징", definition: "하나의 큰 칩을 기능별로 소형 칩으로 분할 생산한 뒤 하나로 패키징해 비용을 줄이는 기술." },
    { id: "g17", term: "AP (Application Processor)", category: "시스템반도체", definition: "스마트폰의 CPU, GPU, NPU, 통신칩이 하나로 집적된 모바일의 핵심 뇌 칩." },
    { id: "g18", term: "CIS (CMOS Image Sensor)", category: "시스템반도체", definition: "빛을 전기적 신호로 변환해 카메라 영상 데이터로 만들어주는 이미지 센서." },
    { id: "g19", term: "FinFET (핀펫)", category: "공정기술", definition: "전류 흐름 채널을 입체적인 지느러미(Fin) 모양으로 만들어 누설 전류를 줄인 3D 트랜지스터." },
    { id: "g20", term: "ALD (Atomic Layer Deposition)", category: "제조공정", definition: "원자 1층 단위로 화학 반응을 일으켜 얇고 균일하게 막을 입히는 원자층 증착 기술." },
    { id: "g21", term: "CMP (Chemical Mechanical Polishing)", category: "제조공정", definition: "화학 물질과 기계적 맷돌 원리를 적용해 웨이퍼 표면을 평탄하게 깎아내는 화학기계연마 공정." },
    { id: "g22", term: "IDM (Integrated Device Manufacturer)", category: "산업구조", definition: "설계부터 생산, 테스트, 패키징까지 모든 반도체 제조 과정을 직접 수행하는 종합 기업 (예: 삼성전자, Intel)." },
    { id: "g23", term: "웨이퍼 (Wafer)", category: "재료/기초", definition: "실리콘(모래)을 녹여 고순도 인곳 원기둥을 만든 뒤 얇게 원판 형태로 잘라낸 반도체 기판." },
    { id: "g24", term: "포토레지스트 (PR / 감광액)", category: "재료/기초", definition: "빛을 받으면 화학 변화를 일으켜 웨이퍼 표면에 회로 패턴을 남기는 포토 공정 핵심 재료." },
    { id: "g25", term: "식각 (Etching)", category: "제조공정", definition: "빛을 쬐어 그린 패턴 외의 필요없는 화학 막 부위를 깎아내 회로만 남기는 공정." },
    { id: "g26", term: "LPDDR5X", category: "메모리", definition: "모바일 스마트폰 및 온디바이스 AI 기기에 탑재되는 초저전력 고속 DRAM 기술." },
    { id: "g27", term: "GDDR7", category: "메모리", definition: "그래픽 카드의 고성능 영상 처리를 위해 대역폭을 비약적으로 늘린 차세대 그래픽 DRAM." },
    { id: "g28", term: "Design House (디자인하우스)", category: "산업구조", definition: "팹리스가 작성한 회로 도면을 파운드리 공정에 맞게 생산용 제조 마스크로 최적화해주는 중간 다리 기업." },
    { id: "g29", term: "IP (Intellectual Property)", category: "산업구조", definition: "반도체 회로 내 표준 블록(ARM 코어 등)을 사전 설계해 라이선스로 파는 반도체 지식재산권." },
    { id: "g30", term: "EDA (Electronic Design Automation)", category: "SW/설계", definition: "복잡한 반도체 회로를 컴퓨터 소프트웨어로 설계하고 시뮬레이션 검증하는 자동화 도구." },
    { id: "g31", term: "Cleanroom (클린룸)", category: "생산환경", definition: "미세 먼지와 온도, 습도, 진동을 극도로 통제해 결함을 방지하는 공장 내 청정실." },
    { id: "g32", term: "인곳 (Ingot)", category: "재료/기초", definition: "실리콘을 고온으로 녹여 만든 순도 99.9999999% 이상의 거대한 원기둥 형태 기둥." },
    { id: "g33", term: "FOWLP (Fan-Out Wafer Level Packaging)", category: "패키징", definition: "인쇄회로기판(PCB) 없이 웨이퍼 자체에서 입출력 단자를 외곽으로 뻗어 두께를 줄이는 고급 패키징." },
    { id: "g34", term: "WLP (Wafer Level Packaging)", category: "패키징", definition: "웨이퍼 가공이 끝난 상태에서 칩을 자르지 않고 직접 패키징과 테스트를 마치는 방식." },
    { id: "g35", term: "MR-MUF (Mass Reflow Molded Underfill)", category: "패키징", definition: "SK하이닉스가 HBM 적층 시 칩 사이에 액체 액상 보호재를 주입해 열 방출을 높인 후공정 핵심 기술." },
    { id: "g36", term: "TC Bonder", category: "장비/공정", definition: "열과 압력을 가해 미세 구멍(TSV)이 뚫린 반도체 칩들을 정밀하게 수직으로 부착하는 후공정 장비." },
    { id: "g37", term: "Reflow (리플로우)", category: "제조공정", definition: "열을 가해 범프 금속 공을 녹여 칩 간 전극을 강력하게 연결하는 용융 공정." },
    { id: "g38", term: "Substrate (반도체 기판)", category: "재료/기초", definition: "칩과 메인보드(PCB) 사이에서 전기 신호를 매개하고 칩을 물리적으로 받쳐주는 신호 전달용 기판." },
    { id: "g39", term: "SiC (Silicon Carbide / 탄화규소)", category: "차세대화합물", definition: "전기차 및 인버터용으로 고전압·고온 견딤성이 뛰어난 차세대 화합물 전력 반도체 소재." },
    { id: "g40", term: "GaN (Gallium Nitride / 질화갈륨)", category: "차세대화합물", definition: "고주파 및 고전력 초스피드 충전기에 적용되는 차세대 전력 반도체 소재." },
    { id: "g41", term: "EDS (Electrical Die Sorting)", category: "테스트", definition: "웨이퍼 상태에서 각 칩의 전기적 품질을 시험해 양품과 불량품 칩을 미리 선별하는 공정." },
    { id: "g42", term: "Burn-in Test (번인 테스트)", category: "테스트", definition: "고온·고전압 가혹 환경을 의도적으로 적용해 잠재 불량 반도체를 사전 스크리닝하는 테스트." },
    { id: "g43", term: "Die (다이)", category: "기초단어", definition: "웨이퍼를 격자 형태로 잘라낸 조각 하나하나의 반도체 IC 칩 단위." },
    { id: "g44", term: "3D NAND", category: "메모리", definition: "저장 셀을 평면이 아닌 건물처럼 수직으로 200단 이상 쌓아 용량을 대폭 늘린 플래시 메모리." },
    { id: "g45", term: "Node (공정 노드)", category: "공정기술", definition: "회로 선폭의 미세도를 나타내는 단위 (예: 5nm, 3nm, 2nm 공정 노드)." },
    { id: "g46", term: "Backside Power Delivery (BSPDN)", category: "차세대기술", definition: "전원 배선을 웨이퍼 뒷면으로 이동시켜 전력 효율과 회로 밀도를 극대화하는 신기술." },
    { id: "g47", term: "Clean / Etchant", category: "재료/기초", definition: "식각 및 노광 잔여물 미세 미립자를 세척하는 화학 약품 및 식각액." },
    { id: "g48", term: "Solder Ball (솔더볼)", category: "패키징", definition: "칩 패키지 하단에 부착되어 메인보드와 전극을 연결해주는 미세 납연 공 모양 구체." },
    { id: "g49", term: "Tape-out (테이프아웃)", category: "설계완료", definition: "팹리스의 최종 반도체 설계 도면 데이터 작업이 완료되어 생산 공장으로 이전되는 단계." },
    { id: "g50", term: "온디바이스 AI (On-device AI)", category: "응용기술", definition: "외부 클라우드 연결 없이 스마트폰·차량 단말기 자체 칩(NPU)에서 실시간 인공지능을 수행하는 기술." }
  ],
  pressNews: {
    chosun: {
      pressName: "조선일보",
      badgeColor: "#0052cc",
      articles: [
        {
          id: "real_n1",
          title: "삼성전자-브로드컴, 290조원 규모 AI 반도체 턴키 협력 체결",
          date: "2026.08.01",
          reporter: "기술산업부 박건형 기자",
          summaryPoints: [
            "삼성전자가 미국 브로드컴과 5년간 2,000억 달러(약 290조 원) 규모의 AI 반도체 전략적 협력(MOU) 체결",
            "메모리, 파운드리, 첨단 패키징을 하나로 묶은 일괄 공급(턴키) 솔루션 최초 공급 계약",
            "글로벌 빅테크 기업들의 자사형 AI 칩(In-house Chip) 위탁 생산 및 수주 파트너십 구축"
          ],
          sourceUrl: "https://www.chosun.com",
          tag: "AI반도체 / 턴키"
        },
        {
          id: "real_n2",
          title: "중국 창신메모리(CXMT) 상장 시총 1위… 한국 메모리 추격 격차 분석",
          date: "2026.07.29",
          reporter: "글로벌경제부 정철환 기자",
          summaryPoints: [
            "중국 1위 메모리 기업 CXMT가 증시 상장 직후 반도체 시가총액 상위에 오르며 무서운 추격세 보임",
            "한국과의 기술 격차는 범용 DRAM 3~4년, HBM 고부가 분야는 4~5년 수준으로 분석",
            "국내 반도체 업계의 선단 공정 기술 격차 유지와 차세대 패키징 R&D 투자의 중요성 부각"
          ],
          sourceUrl: "https://www.chosun.com",
          tag: "글로벌 동향"
        },
        {
          id: "real_n1_3",
          title: "EUV 노광장비 도입 가속화… 차세대 2나노 미세공정 주도권 다툼",
          date: "2026.07.26",
          reporter: "산업부 김민철 기자",
          summaryPoints: [
            "차세대 2나노 공정 양산을 앞두고 High-NA EUV 노광 장비 확보 경쟁 본격화",
            "파운드리 및 최첨단 DRAM 노광 라인 수율 안정을 위한 미세패턴 기술 집약",
            "글로벌 반도체 팹의 생산 라인 고도화에 따른 소부장 협력사 수주 모멘텀 확대"
          ],
          sourceUrl: "https://www.chosun.com",
          tag: "EUV / 미세공정"
        },
        {
          id: "real_n1_4",
          title: "ASML, 한국 R&D 트레이닝 센터 오픈… 국산 소부장 생태계 강화",
          date: "2026.07.20",
          reporter: "테크이슈부 이윤정 기자",
          summaryPoints: [
            "세계적인 노광 장비 기업 ASML이 한국 재제조 및 트레이닝 센터 완공식 개최",
            "국내 주요 반도체 제조사와의 원스톱 기술 지원 시스템 및 엔지니어 육성 기반 마련",
            "소부장(소재·부품·장비) 국내 공급망 안정화와 클러스터 구축 가속화 기대"
          ],
          sourceUrl: "https://www.chosun.com",
          tag: "장비 / 클러스터"
        },
        {
          id: "real_n1_5",
          title: "미국 반도체 보조금 2차 집행… 테일러·피닉스 공장 가동률 점검",
          date: "2026.07.15",
          reporter: "워싱턴 특파원 강인선 기자",
          summaryPoints: [
            "미국 상무부가 글로벌 반도체 메이커를 대상으로 2차 현금 보조금 집행 개시",
            "텍사스 테일러 파운드리 공장 및 아리조나 팹의 연말 시험 가동 준비 순항",
            "글로벌 지정학적 리스크 관리와 북미 고객사 밀착 대응 전략 고도화"
          ],
          sourceUrl: "https://www.chosun.com",
          tag: "글로벌 보조금"
        }
      ]
    },
    mk: {
      pressName: "매일경제",
      badgeColor: "#e65100",
      articles: [
        {
          id: "real_n3",
          title: "삼성전자 HBM5 베이스다이에 2나노 GAA 전격 적용… 성능 50% 향상",
          date: "2026.08.01",
          reporter: "증권산업부 이승훈 기자",
          summaryPoints: [
            "차세대 HBM5 베이스 다이에 2나노 GAA(게이트올어라운드) 공정을 전격 적용해 동작 속도 50% 향상",
            "업계 최초 HBM4 양산 및 샘플 공급에 이어 3분기 HBM4 매출 전 분기 대비 3배 이상 성장 전망",
            "하반기 중 D램 전체 시장 점유율에 걸맞은 HBM 시장 점유율 40% 확보 목표 제시"
          ],
          sourceUrl: "https://www.mk.co.kr",
          tag: "HBM5 / 2나노GAA"
        },
        {
          id: "real_n4",
          title: "메모리 슈퍼사이클 2028년까지 지속… 글로벌 빅테크 다년 계약 봇물",
          date: "2026.07.28",
          reporter: "IT과학부 오찬종 기자",
          summaryPoints: [
            "AI 데이터센터 폭발적 수요로 서버용 고성능 메모리 수급 부족 현상이 2028년까지 지속될 것으로 전망",
            "주요 반도체 제조업체와 글로벌 빅테크 기업 간 장기 공급 계약(LTA) 체결 잇따라",
            "미국 테일러 파운드리 2공장 연말 착공 등 글로벌 현지 생산 거점 확보 본격화"
          ],
          sourceUrl: "https://www.mk.co.kr",
          tag: "메모리 수급"
        },
        {
          id: "real_n2_3",
          title: "SK하이닉스, MR-MUF 5세대 기술 완성… HBM4E 수율 90% 달성",
          date: "2026.07.25",
          reporter: "벤처기업부 성승훈 기자",
          summaryPoints: [
            "어드밴스드 MR-MUF 후공정 기술 고도화로 HBM4E 양산 수율 90% 안정적 조기 확보",
            "열 방출 특성과 칩 뒤틀림 방지 성능을 비약적으로 끌어올린 패키징 경쟁력 입증",
            "글로벌 AI 가속기 독점 공급망에서의 독보적 지위 지속 유지"
          ],
          sourceUrl: "https://www.mk.co.kr",
          tag: "HBM4E / MR-MUF"
        },
        {
          id: "real_n2_4",
          title: "CXL 3.0 상용화 물결… 서버 D램 용량 4배 확장 시대 열린다",
          date: "2026.07.18",
          reporter: "금융부 김정환 기자",
          summaryPoints: [
            "CXL(Compute Express Link) 3.0 스펙을 탑재한 차세대 서버 플랫폼 가동 본격화",
            "메모리 풀링(Pooling) 기술 적용으로 데이터센터 서버 운용 비용(TCO) 30% 절감 효과",
            "CXL 컨트롤러 및 차세대 메모리 모듈 관련 기업들의 매출 본격 가시화"
          ],
          sourceUrl: "https://www.mk.co.kr",
          tag: "CXL 3.0 / 서버"
        },
        {
          id: "real_n2_5",
          title: "온디바이스 AI 칩 탑재 프리미엄 스마트폰·노트북 출하량 급증",
          date: "2026.07.12",
          reporter: "모바일이슈부 이상규 기자",
          summaryPoints: [
            "NPU 성능이 끌어올려진 모바일 AP와 고속 LPDDR5X 메모리 탑재 비중 증대",
            "클라우드 없는 인터넷 오프라인 상태에서의 실시간 통번역 및 생성형 AI 기능 대중화",
            "글로벌 스마트폰 제조사들의 온디바이스 AI 마케팅 치열"
          ],
          sourceUrl: "https://www.mk.co.kr",
          tag: "온디바이스 AI"
        }
      ]
    },
    hankyung: {
      pressName: "한국경제",
      badgeColor: "#2e7d32",
      articles: [
        {
          id: "real_n5",
          title: "삼성전자 2분기 영업이익 89.5조원 사상 최대… 반도체(DS) 부문 견인",
          date: "2026.07.31",
          reporter: "마켓인사이트 김채연 기자",
          summaryPoints: [
            "올해 2분기 사상 최대 실적을 발표하며 메모리 반도체 슈퍼 호황 입장 입증",
            "반도체 부문(DS) 영업이익이 전체 실적의 대부분을 차지하며 실적 상승 강력 유도",
            "하반기 파운드리 가동률 상승 및 첨단 패키징 수주 확대로 흑자 폭 확대 기대"
          ],
          sourceUrl: "https://www.hankyung.com",
          tag: "실적 분석"
        },
        {
          id: "real_n6",
          title: "SK하이닉스·삼성전자 HBM 기술 주도권 싸움… 2026년 하반기 승부처",
          date: "2026.07.25",
          reporter: "산업부 황정수 기자",
          summaryPoints: [
            "AI 가속기 시장 팽창에 따라 차세대 HBM 수주를 둘러싼 국내 양대 반도체 공룡의 경쟁 심화",
            "MR-MUF 대 NCF 첨단 패키징 공정 방식과 파운드리 우군 확보가 승패 가를 열쇠",
            "온디바이스 AI 시장 확대에 대응하는 NPU 및 LPDDR5X 메모리 라인 증설 활발"
          ],
          sourceUrl: "https://www.hankyung.com",
          tag: "HBM 주도권"
        },
        {
          id: "real_n3_3",
          title: "차세대 반도체 패키징 OSAT 전문 기업 매출 호조… 후공정 밸류체인 주목",
          date: "2026.07.21",
          reporter: "증권부 박해린 기자",
          summaryPoints: [
            "칩렛(Chiplet) 및 2.5D/3D 첨단 패키징 외주 물량 급증으로 국내 OSAT 실적 대폭 향상",
            "웨이퍼 단에서 패키징을 마치는 FOWLP 기술 적용 범주 확장",
            "글로벌 반도체 공급망 재편 속에서 후공정 검사 및 조립 생태계 부각"
          ],
          sourceUrl: "https://www.hankyung.com",
          tag: "OSAT / 패키징"
        },
        {
          id: "real_n3_4",
          title: "전력 반도체 SiC·GaN 시장 성장세… 전기차 및 인버터 탑재 확대",
          date: "2026.07.14",
          reporter: "IT·바이오부 남정석 기자",
          summaryPoints: [
            "탄화규소(SiC) 및 질화갈륨(GaN) 화합물 전력 반도체의 높은 고전압·고온 효율성 주목",
            "전기차 구동 인버터 및 초고속 데이터센터 충전 시스템 적용 비율 연 25% 상승",
            "국내 전력 반도체 웨이퍼 팹 증설 투자 활발"
          ],
          sourceUrl: "https://www.hankyung.com",
          tag: "전력반도체 / SiC"
        },
        {
          id: "real_n3_5",
          title: "팹리스 스타트업 AI NPU 칩 자체 설계 성과… 투자 유치 가속화",
          date: "2026.07.08",
          reporter: "스타트업부 고은이 기자",
          summaryPoints: [
            "국내 팹리스 벤처 기업들이 개발한 저전력 고성능 NPU 칩 테이프아웃(Tape-out) 완료",
            "글로벌 엑셀러레이터 및 벤처캐피털(VC)로부터 대규모 펀딩 성공",
            "국내 파운드리 생태계와의 디자인하우스 시너지로 글로벌 시장 진출 가속화"
          ],
          sourceUrl: "https://www.hankyung.com",
          tag: "팹리스 / NPU"
        }
      ]
    },
    donga: {
      pressName: "동아일보",
      badgeColor: "#d32f2f",
      articles: [
        {
          id: "donga_1",
          title: "글로벌 빅테크 AI 인프라 투자 지속… HBM 장기 구조적 성장 청신호",
          date: "2026.08.01",
          reporter: "산업부 곽도영 기자",
          summaryPoints: [
            "빅테크 기업들의 AI 데이터센터 투자 확대로 고성능 HBM 수요 장기 지속 보증",
            "단순 경기 순환을 넘어 구조적 성장 산업으로 전환되는 메모리 반도체 지형",
            "차세대 HBM4 턴키 공급 역량을 확보한 한국 반도체 기업들의 글로벌 수주 우위"
          ],
          sourceUrl: "https://www.donga.com",
          tag: "AI인프라 / HBM"
        },
        {
          id: "donga_2",
          title: "삼성-SK, AI 반도체 생태계 주도권 잡기… 파운드리·패키징 총력전",
          date: "2026.07.27",
          reporter: "IT이슈부 홍석호 기자",
          summaryPoints: [
            "AI 가속기 시장 팽창에 대응해 D램 적층 패키징 및 초미세 파운드리 기술 집약",
            "대만 파운드리 및 주요 팹리스 고객사와의 전략적 기술 얼라이언스 결성",
            "2026년 하반기 차세대 AI 메모리 양산 라인 가동으로 수익성 극대화"
          ],
          sourceUrl: "https://www.donga.com",
          tag: "기술총력전"
        },
        {
          id: "donga_3",
          title: "온디바이스 AI 시대 본격 개막… 수혜 반도체 밸류체인 지형도",
          date: "2026.07.20",
          reporter: "경제부 박희창 기자",
          summaryPoints: [
            "스마트폰·노트북 등 단말기 단에서 실시간 AI 연산을 수행하는 온디바이스 기술 급부상",
            "저전력 고성능 NPU 및 LPDDR5X 메모리 탑재 비중 급증",
            "국내 팹리스 및 OSAT 후공정 협력사들의 매출 성장 모멘텀 가시화"
          ],
          sourceUrl: "https://www.donga.com",
          tag: "온디바이스 / 밸류체인"
        },
        {
          id: "donga_4",
          title: "차세대 반도체 클러스터 용인 팹 건설 착착… 국가 경쟁력 부각",
          date: "2026.07.14",
          reporter: "정책이슈부 이건혁 기자",
          summaryPoints: [
            "세계 최대 규모 용인 반도체 메가 클러스터 기반 시설 및 팹 건설 순항",
            "전력·용수 인프라 적기 공급 및 소부장 R&D 연계 테스트베드 구축",
            "글로벌 반도체 제조 거점으로서의 국가 첨단 산업 입지 강화"
          ],
          sourceUrl: "https://www.donga.com",
          tag: "클러스터 / 인프라"
        },
        {
          id: "donga_5",
          title: "글로벌 반도체 공급망 재편 속에 국내 소부장 강소기업 기술 약진",
          date: "2026.07.07",
          reporter: "산업부 김현수 기자",
          summaryPoints: [
            "식각액, 감광액, ALD 증착 장비 등 국산 소부장 기술의 퀄리티 테스트 통과 잇따라",
            "글로벌 반도체 메이커 공급망 다변화 정책과 맞물려 해외 수출 본격화",
            "국내 부품·장비 독자 기술 확보로 반도체 자립도 상승"
          ],
          sourceUrl: "https://www.donga.com",
          tag: "소부장 / 공급망"
        }
      ]
    },
    etnews: {
      pressName: "전자신문",
      badgeColor: "#00838f",
      articles: [
        {
          id: "etnews_1",
          title: "SK하이닉스, 2분기 사상 최대 실적 달성… HBM 수율 90% 돌파",
          date: "2026.08.01",
          reporter: "전자부 김영준 기자",
          summaryPoints: [
            "AI 인프라 수요 폭발로 2분기 매출 및 영업이익 사상 최대 기록 경신",
            "어드밴스드 MR-MUF 공정 안정화로 차세대 HBM 수율 90% 이상 조기 달성",
            "하반기 HBM4 양산 가속화 및 차세대 CXL 기술 선도로 시장 지배력 강화"
          ],
          sourceUrl: "https://www.etnews.com",
          tag: "실적갱신 / HBM"
        },
        {
          id: "etnews_2",
          title: "High-NA EUV 노광 장비 2나노 양산 라인 배치 완료… 수율 안정화",
          date: "2026.07.26",
          reporter: "반도체전문 박동식 기자",
          summaryPoints: [
            "렌즈 개구수 0.55 사양의 차세대 High-NA EUV 노광 팹 설치 및 세팅 완료",
            "2나노 이하 첨단 로직 및 D램 미세 패턴 형성 기술 격차 도약",
            "글로벌 장비 제조사와의 밀착 기술 지원으로 수율 안정을 위한 R&D 집약"
          ],
          sourceUrl: "https://www.etnews.com",
          tag: "High-NA EUV"
        },
        {
          id: "etnews_3",
          title: "메모리 3사, 차세대 LPDDR5X 및 GDDR7 수주 경쟁 격화",
          date: "2026.07.19",
          reporter: "부품이슈 강해령 기자",
          summaryPoints: [
            "온디바이스 AI 스마트폰 및 고성능 그래픽 카드를 겨냥한 고속 메모리 출시 잇따라",
            "LPDDR5X 초저전력 동작 구현 및 GDDR7 대역폭 극대화 기술 공개",
            "글로벌 모바일 AP 및 GPU 제조사 대상 인증 공급 물량 확보 치열"
          ],
          sourceUrl: "https://www.etnews.com",
          tag: "GDDR7 / LPDDR5X"
        },
        {
          id: "etnews_4",
          title: "AI NPU 전용 테스트 장비 국산화 성공… 테스트 비용 40% 절감",
          date: "2026.07.12",
          reporter: "장비재료 윤건일 기자",
          summaryPoints: [
            "국내 반도체 테스트 장비업체가 NPU 전용 고속 병열 검사 장비 국산화에 성공",
            "웨이퍼 단 및 최종 패키지 테스트 시간 및 비용을 40% 절감하는 효과 달성",
            "글로벌 OSAT 외주 테스트 생태계 공급망 진입 개시"
          ],
          sourceUrl: "https://www.etnews.com",
          tag: "테스트 / 국산화"
        },
        {
          id: "etnews_5",
          title: "차세대 CXL 메모리 모듈 표준화 작업… 서버용 메모리 생태계 개막",
          date: "2026.07.05",
          reporter: "컴퓨팅부 배옥진 기자",
          summaryPoints: [
            "CXL(Compute Express Link) 3.0 상용화에 맞춘 차세대 메모리 모듈 국제 표준 확립",
            "서버 D램 용량 확장 및 메인 메모리 풀링 기술 적용으로 데이터센터 효율화",
            "국내 메모리 제조사 및 컨트롤러 팹리스의 글로벌 시장 점유율 확대 기대"
          ],
          sourceUrl: "https://www.etnews.com",
          tag: "CXL / 서버모듈"
        }
      ]
    }
  }
};

const DataStore = {
  cache: null,

  ensureDefaults(data) {
    if (!data) data = {};
    if (!data.creator) data.creator = JSON.parse(JSON.stringify(DEFAULT_DATA.creator));
    if (!data.concepts || data.concepts.length === 0) data.concepts = JSON.parse(JSON.stringify(DEFAULT_DATA.concepts));
    if (!data.glossary || data.glossary.length === 0) data.glossary = JSON.parse(JSON.stringify(DEFAULT_DATA.glossary));

    if (!data.pressNews || Object.keys(data.pressNews).length === 0) {
      data.pressNews = JSON.parse(JSON.stringify(DEFAULT_DATA.pressNews));
    } else {
      let totalArticles = 0;
      Object.keys(data.pressNews).forEach(k => {
        if (!data.pressNews[k] || !data.pressNews[k].articles) {
          data.pressNews[k] = DEFAULT_DATA.pressNews[k] ? JSON.parse(JSON.stringify(DEFAULT_DATA.pressNews[k])) : { pressName: k, articles: [] };
        }
        totalArticles += data.pressNews[k].articles.length;
      });
      if (totalArticles === 0) {
        data.pressNews = JSON.parse(JSON.stringify(DEFAULT_DATA.pressNews));
      }
    }
    return data;
  },

  async loadAllData() {
    let localData = this.getLocalData();
    this.cache = localData;

    if (!supabase) {
      return localData;
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase response timeout")), 2000)
      );

      const fetchPromise = Promise.all([
        supabase.from('creator_profile').select('*').single(),
        supabase.from('glossary').select('*').order('created_at', { ascending: false }),
        supabase.from('press_news').select('*').order('created_at', { ascending: false })
      ]);

      const [creatorRes, glossaryRes, newsRes] = await Promise.race([fetchPromise, timeoutPromise]);

      const result = {
        creator: localData.creator,
        concepts: DEFAULT_DATA.concepts,
        glossary: localData.glossary,
        pressNews: localData.pressNews
      };

      if (creatorRes && creatorRes.data && creatorRes.data.name && !creatorRes.data.name.includes("Kim Semi") && !creatorRes.data.name.includes("김반도")) {
        result.creator = {
          name: creatorRes.data.name,
          phone: creatorRes.data.phone,
          email: creatorRes.data.email,
          bio: creatorRes.data.bio
        };
      } else {
        result.creator = JSON.parse(JSON.stringify(DEFAULT_DATA.creator));
      }

      if (glossaryRes && glossaryRes.data && glossaryRes.data.length > 0) {
        const supGlossaryMap = new Map(glossaryRes.data.map(g => [g.id || g.term, {
          id: g.id,
          term: g.term,
          category: g.category,
          definition: g.definition
        }]));

        const mergedGlossary = JSON.parse(JSON.stringify(DEFAULT_DATA.glossary));
        mergedGlossary.forEach((item, index) => {
          if (supGlossaryMap.has(item.id)) {
            mergedGlossary[index] = supGlossaryMap.get(item.id);
            supGlossaryMap.delete(item.id);
          }
        });
        supGlossaryMap.forEach(v => mergedGlossary.push(v));
        result.glossary = mergedGlossary;
      }

      if (newsRes && newsRes.data && newsRes.data.length > 0) {
        const pressObj = JSON.parse(JSON.stringify(DEFAULT_DATA.pressNews));

        const existingIds = new Set();
        Object.keys(pressObj).forEach(k => {
          if (pressObj[k] && pressObj[k].articles) {
            pressObj[k].articles.forEach(a => existingIds.add(a.id));
          }
        });

        newsRes.data.forEach(item => {
          const key = item.press_key;
          if (!pressObj[key]) {
            pressObj[key] = { pressName: item.press_name || key, articles: [] };
          }
          if (!existingIds.has(item.id)) {
            pressObj[key].articles.push({
              id: item.id,
              title: item.title,
              date: item.date,
              reporter: item.reporter,
              summaryPoints: Array.isArray(item.summary_points) ? item.summary_points : (JSON.parse(item.summary_points || '[]')),
              sourceUrl: item.source_url,
              tag: item.tag
            });
            existingIds.add(item.id);
          }
        });
        result.pressNews = pressObj;
      }

      const safeResult = this.ensureDefaults(result);
      this.saveLocalData(safeResult);
      this.cache = safeResult;
      return safeResult;

    } catch (e) {
      console.warn("Supabase load fallback used:", e.message);
      return localData;
    }
  },

  getData() {
    return this.cache || this.getLocalData();
  },

  // 신규 언론사 동적 추가
  async addPress(pressKey, pressName) {
    const current = this.getData();
    if (!current.pressNews) current.pressNews = {};
    if (!current.pressNews[pressKey]) {
      current.pressNews[pressKey] = {
        pressName: pressName,
        badgeColor: "#0284c7",
        articles: []
      };
      this.saveLocalData(current);
      this.cache = current;
    }
  },

  // 언론사 카테고리 삭제
  async deletePress(pressKey) {
    const current = this.getData();
    if (current.pressNews && current.pressNews[pressKey]) {
      delete current.pressNews[pressKey];
      this.saveLocalData(current);
      this.cache = current;
    }
  },

  async updateCreator(creatorObj) {
    const current = this.getData();
    current.creator = creatorObj;
    this.saveLocalData(current);
    this.cache = current;

    if (supabase) {
      try {
        await supabase.from('creator_profile').upsert({
          id: 1,
          name: creatorObj.name,
          phone: creatorObj.phone,
          email: creatorObj.email,
          bio: creatorObj.bio
        });
      } catch (e) {
        console.error("Supabase creator update error", e);
      }
    }
  },

  async addGlossary(item) {
    const current = this.getData();
    current.glossary.unshift(item);
    this.saveLocalData(current);
    this.cache = current;

    if (supabase) {
      try {
        await supabase.from('glossary').insert([{
          id: item.id,
          term: item.term,
          category: item.category,
          definition: item.definition
        }]);
      } catch (e) {
        console.error("Supabase add glossary error", e);
      }
    }
  },

  async deleteGlossary(id) {
    const current = this.getData();
    current.glossary = current.glossary.filter(g => g.id !== id);
    this.saveLocalData(current);
    this.cache = current;

    if (supabase) {
      try {
        await supabase.from('glossary').delete().eq('id', id);
      } catch (e) {
        console.error("Supabase delete glossary error", e);
      }
    }
  },

  async addNews(pressKey, article) {
    const current = this.getData();
    if (!current.pressNews[pressKey]) {
      current.pressNews[pressKey] = { pressName: pressKey, articles: [] };
    }
    current.pressNews[pressKey].articles.unshift(article);
    this.saveLocalData(current);
    this.cache = current;

    if (supabase) {
      try {
        await supabase.from('press_news').insert([{
          id: article.id,
          press_key: pressKey,
          press_name: current.pressNews[pressKey]?.pressName || pressKey,
          title: article.title,
          date: article.date,
          reporter: article.reporter,
          summary_points: article.summaryPoints,
          source_url: article.sourceUrl,
          tag: article.tag
        }]);
      } catch (e) {
        console.error("Supabase add news error", e);
      }
    }
  },

  async deleteNews(pressKey, articleId) {
    const current = this.getData();
    if (current.pressNews[pressKey]) {
      current.pressNews[pressKey].articles = current.pressNews[pressKey].articles.filter(a => a.id !== articleId);
      this.saveLocalData(current);
      this.cache = current;
    }

    if (supabase) {
      try {
        await supabase.from('press_news').delete().eq('id', articleId);
      } catch (e) {
        console.error("Supabase delete news error", e);
      }
    }
  },

  getLocalData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DATA);
      if (!raw) {
        const initial = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.saveLocalData(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      return this.ensureDefaults(parsed);
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  },

  saveLocalData(data) {
    try {
      localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  },

  resetData() {
    const initial = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.saveLocalData(initial);
    this.cache = initial;
    return initial;
  },

  getPassword() {
    const stored = localStorage.getItem(STORAGE_KEYS.PASSWORD);
    if (!stored || stored === 'admin1234') {
      this.setPassword('kjk=010410');
      return 'kjk=010410';
    }
    return stored;
  },

  setPassword(newPw) {
    localStorage.setItem(STORAGE_KEYS.PASSWORD, newPw);
  },

  verifyPassword(inputPw) {
    if (!inputPw) return false;
    const cleanInput = inputPw.trim();
    const targetPw = this.getPassword().trim();
    return cleanInput === targetPw;
  },

  exportJSON() {
    const data = this.getData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `semicon_hub_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.creator && parsed.glossary && parsed.pressNews) {
        const safe = this.ensureDefaults(parsed);
        this.saveLocalData(safe);
        this.cache = safe;
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
};

// Global scope 명시적 등록
if (typeof window !== 'undefined') {
  window.DataStore = DataStore;
}

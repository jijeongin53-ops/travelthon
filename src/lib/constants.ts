// 2026 글로컬 부산관광 트래블톤 공모전 기본 상수 및 텍스트 데이터

// 구글 시트 및 드라이브 링크
export const GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1n3zQcOOFtX8Bfr0XXZH9X4DDe_Be3JdzgGCWlCbfH4I/edit?gid=0#gid=0';
export const GOOGLE_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId?usp=drive_link';
// 구글 드라이브 참가서류 파일 링크
export const GOOGLE_DRIVE_FORM_FILE_URL =
  'https://drive.google.com/file/d/1DNQkdGU3WRyZR6pKKlXhoQwdS_7Tdplr/view?usp=drive_link';
export const GOOGLE_DRIVE_FORM_DOWNLOAD_URL =
  'https://drive.google.com/uc?export=download&id=1DNQkdGU3WRyZR6pKKlXhoQwdS_7Tdplr';
// 구글 프레젠테이션 아이디어 계획서 파일 링크
export const GOOGLE_DRIVE_PROPOSAL_PPTX_URL =
  'https://docs.google.com/presentation/d/1kdyCfTgmWCSy3BiqLauPdB-3e04aqy6y/edit?usp=drive_link&ouid=117352543525640410176&rtpof=true&sd=true';



// 대회 기본 정보
export const COMPETITION_INFO = {
  title: '2026 글로컬 부산관광 트래블톤 공모전',
  subtitle: '글로벌과 로컬을 잇는 새로운 부산 여행의 시작! 2일간의 메이커톤 & 아이디어톤',
  organizer: '부산광역시 · 부산관광공사 · 글로컬 트래블톤 조직위원회',
  targetDate: '2026-10-30T23:59:59+09:00', // 접수 마감일: 2026년 10월 30일
  targetDateDisplay: '2026년 10월 30일(금) 24:00까지',
  eventDate: '2026년 11월 20일(금) ~ 11월 21일(토) [2일간]',
  venue: '부산 벡스코(BEXCO) 제2전시장 & 부산 전역 로컬 거점',
  totalPrize: '총 상금 300만원',
  participants: '전국 대학생, 청년, 관광 스타트업 및 일반인 (2인 이상 4인 이하 팀 참가 필수 / 개인 참가 불가)',
};

// 4대 공모 주제
export const COMPETITION_TRACKS = [
  {
    id: 'ai-innovation',
    title: 'AI 이노베이션',
    subtitle: '기술혁신 DX전환',
    description: '생성형 AI 기반 개인 맞춤형 다국어 여행비서 및 코스 추천 솔루션, 외국인 전용 간편결제·텍스리펀드·환전 핀테크 서비스, 스마트 테크 및 대중교통·짐 없는 관광 연계 시스템',
    tags: ['생성형 AI 여행비서', '핀테크·간편결제', '스마트 테크', '짐 없는 관광 연계'],
    icon: 'Sparkles',
  },
  {
    id: 'local-contents',
    title: '로컬 콘텐츠 관광',
    subtitle: '체류확대 지역분산',
    description: '외래객 체류일수 확대를 위한 야간관광 킬러콘텐츠, 영도·원도심·서부산 등 숨은 로컬 골목 라이프스타일 체험 상품, 부산형 글로벌 워케이션(Workation) 및 롱스테이(한달살기) 특화 상품',
    tags: ['야간관광 킬러콘텐츠', '골목 라이프스타일', '글로벌 워케이션', '롱스테이(한달살기)'],
    icon: 'Compass',
  },
  {
    id: 'marine-leisure',
    title: '해양 레저 콘텐츠',
    subtitle: '체험 혁신 체류형 관광',
    description: '사계절 운영 가능한 해양 레저 프로그램(겨울 서핑, 해변 웰니스) 개발, 초보자·외국인·가족 단위 낮은 진입장벽 체험 콘텐츠, 해양 안전 관리 및 생태계 보호, 주변 상권·숙박·맛집 연계 체류형 동선',
    tags: ['사계절 해양 레저', '해변 웰니스/서핑', '해양 안전·생태 보호', '상권·숙박 체류 동선'],
    icon: 'Waves',
  },
  {
    id: 'tourism-infra',
    title: '관광 인프라',
    subtitle: '인프라 고도화 접근성 강화',
    description: '외국인 관광객의 이동 편의를 높이는 다국어 안내·교통 연계 인프라 개선안, 관광지 혼잡 완화 스마트 관제·예약 시스템, 무장애(배리어프리) 관광 환경 조성(휠체어·유아차·고령자 친화 동선), 비수기 관광 편의 인프라 확충',
    tags: ['다국어 교통·안내', '스마트 관제·예약', '무장애(배리어프리)', '사계절 편의 인프라'],
    icon: 'Leaf',
  },
];

// 시상 내역 (총 상금 300만원)
export const PRIZE_LIST = [
  {
    rank: '대상',
    prizeName: '부산광역시장상',
    count: '1팀',
    reward: '150만원',
    badge: 'Grand Prize',
    perks: ['상장 및 상금 150만원', '부산관광기업지원센터 입주 우선권', '사업화 연계 멘토링'],
  },
  {
    rank: '최우수상',
    prizeName: '부산관광공사 사장상',
    count: '1팀',
    reward: '80만원',
    badge: 'First Prize',
    perks: ['상장 및 상금 80만원', '부산 관광 상품화 실증 지원', '벤처캐피털 IR 기회'],
  },
  {
    rank: '우수상',
    prizeName: '글로컬 트래블톤 조직위원장상',
    count: '1팀',
    reward: '50만원',
    badge: 'Excellence',
    perks: ['상장 및 상금 50만원', '관광 스타트업 엑셀러레이팅 연계'],
  },
  {
    rank: '장려상',
    prizeName: '후원기관장상',
    count: '2팀',
    reward: '각 10만원 (총 20만원)',
    badge: 'Merit Award',
    perks: ['상장 및 상금', '참가 인증서 수여'],
  },
];

// 진행 일정
export const SCHEDULE_STEPS = [
  {
    step: '01',
    phase: '참가 접수 및 서류 제출',
    date: '2026. 09. 01 ~ 10. 30',
    description: '본 웹사이트를 통해 신청서 및 아이디어 기획서 온라인 팀 접수 (개인 불가)',
    status: 'current',
  },
  {
    step: '02',
    phase: '서류 심사 및 본선 진출팀 발표',
    date: '2026. 11. 06',
    description: '전문 심사위원 평가를 통해 본선 진출 팀 선발 및 개별 공지',
    status: 'upcoming',
  },
  {
    step: '03',
    phase: '사전 오리엔테이션 & 멘토링',
    date: '2026. 11. 13',
    description: '관광/기술 분야 전문가와 함께하는 온라인 멘토링 및 팀 빌딩 보완',
    status: 'upcoming',
  },
  {
    step: '04',
    phase: '2일간의 트래블톤 본선',
    date: '2026. 11. 20 ~ 11. 21',
    description: '부산 벡스코에서 펼쳐지는 2일간의 집중 릴레이 기획 & 프로토타입 제작',
    status: 'upcoming',
  },
  {
    step: '05',
    phase: '최종 피칭 & 시상식',
    date: '2026. 11. 21 17:00',
    description: '현장 발표 심사, 평가단 투표 및 총 상금 300만원 시상식',
    status: 'upcoming',
  },
];

// 다운로드 서식 목록
export const DOWNLOAD_DOCUMENTS = [
  {
    id: 'official-form',
    title: '참가서류 공식 양식 [통합본]',
    fileType: 'HWP (한글)',
    size: '48 KB',
    fileName: '참가서류_글로컬_부산관광_트래블톤.hwp',
    downloadPath: '/downloads/참가서류_글로컬_부산관광_트래블톤.hwp',
    driveUrl: GOOGLE_DRIVE_FORM_FILE_URL,
    description: '참가신청서(팀원 인적사항), 아이디어 소개서, 개인정보동의서, 참가자서약서가 모두 포함된 주최측 공식 통합 서식',
    badge: '필수 제출',
  },
  {
    id: 'announcement',
    title: '2026 글로컬 부산관광 트래블톤 공모요강',
    fileType: 'PDF',
    size: '1.2 MB',
    fileName: '2026_부산관광_트래블톤_공모요강.pdf',
    downloadPath: '/downloads/2026_부산관광_트래블톤_공모요강.pdf',
    description: '대회 참가 자격(팀 참가 필수), 심사 기준, 주요일정, 상금(총 300만원) 상세 안내',
    badge: '필독',
  },
  {
    id: 'proposal-form',
    title: '아이디어 계획서 양식 [서식 2호]',
    fileType: 'HWP / DOCX',
    size: '340 KB',
    fileName: '아이디어_기획서_양식_서식2호.docx',
    downloadPath: '/downloads/아이디어_기획서_양식_서식2호.docx',
    description: '배경, 목표, 세부 사업 모델, 실현 가능성 및 기대효과 기술서 (5매 이내)',
    badge: '필수 제출',
  },
  {
    id: 'consent-form',
    title: '개인정보 수집·이용 및 제3자 제공 동의서 [서식 3호]',
    fileType: 'HWP / PDF',
    size: '120 KB',
    fileName: '개인정보_수집이용_및_제3자제공동의서.docx',
    downloadPath: '/downloads/개인정보_수집이용_및_제3자제공동의서.docx',
    description: '팀원 전원의 서명이 포함된 개인정보 수집 및 제3자 제공 동의서',
    badge: '필수 제출',
  },
  {
    id: 'all-bundle',
    title: '공모전 양식 일체 압축파일 (ZIP)',
    fileType: 'ZIP',
    size: '35 KB',
    fileName: '2026_글로컬_부산관광_트래블톤_서식일체.zip',
    downloadPath: '/downloads/2026_글로컬_부산관광_트래블톤_서식일체.zip',
    description: '공식 참가서류(HWP) 및 공모요강(PDF) 전체를 한 번에 다운로드',
    badge: '간편 묶음',
  },
];

// 개인정보 동의 약관 전문
export const PRIVACY_TERMS = {
  collection: `[개인정보 수집 및 이용 동의 전문]
1. 수집하는 개인정보의 항목
- 필수항목: 대표자 및 팀원 전원의 성명, 생년월일, 소속 대학/기관, 졸업 유무(학적 상태), 휴대전화번호, 이메일 주소, 제출 파일(신청서, 계획서 등)
2. 개인정보의 수집 및 이용 목적
- '2026 글로컬 부산관광 트래블톤 공모전' 참가자 본인 확인, 팀 자격 요건 검증(2인 이상), 심사 진행, 결과 통보, 수상자 상금 지급 및 사후 사업화 연계 안내
3. 개인정보의 보유 및 이용 기간
- 접수일로부터 공모전 종료 및 상금 지급 완료 후 1년간 보관(관련 법령에 따른 보존 의무 기간 준수 후 파기)
4. 동의 거부 권리 및 불이익
- 귀하는 개인정보 수집 및 이용에 동의하지 않을 권리가 있으나, 필수 항목 미동의 시 공모전 참가 신청 및 심사 대상에서 제외될 수 있습니다.`,

  thirdParty: `[개인정보 제3자 제공 동의 전문]
1. 개인정보를 제공받는 자
- 부산광역시, 부산관광공사, 심사위원단, 후원기관 및 협력 엑셀러레이터
2. 제공받는 자의 개인정보 이용 목적
- 공모전 서류 및 본선 심사 평가, 수상팀 선정, 시상식 진행, 관광 스타트업 육성 지원 사업 연계
3. 제공하는 개인정보의 항목
- 대표자 및 팀원 성명, 생년월일, 소속 대학/기관, 학적 정보, 연락처, 이메일, 제출 기획서
4. 개인정보를 제공받는 자의 보유 및 이용 기간
- 공모전 심사 및 후속 지원 프로그램 종료 시까지 (최대 1년)
5. 동의 거부 권리 및 불이익
- 귀하는 제3자 제공에 동의하지 않을 권리가 있으나, 미동의 시 심사 참여가 제한될 수 있습니다.`,
};

// 자주 묻는 질문 (FAQ)
export const FAQS = [
  {
    q: '개인 참가도 가능한가요?',
    a: '본 대회는 팀워크 및 다학제간 융합 기획을 위해 개인 참가가 불가하며, 반드시 2인 이상 팀으로만 지원하실 수 있습니다.',
  },
  {
    q: '팀 구성 인원에 제한이 있나요?',
    a: '대표자(팀장)를 포함하여 반드시 2인 이상의 팀으로 구성하셔야 합니다. 팀원들의 소속 대학이나 전공이 서로 달라도 무방합니다.',
  },
  {
    q: '휴학생이나 졸업생도 팀원으로 지원할 수 있나요?',
    a: '네, 가능합니다. 대학(원) 재학생, 휴학생뿐만 아니라 졸업생 및 청년 창업 준비자 모두 지원할 수 있습니다. 신청서 폼에서 현재 상태(재학/휴학/졸업예정/졸업)를 정확히 선택해 주세요.',
  },
  {
    q: '제출한 서류나 기획서를 수정하고 싶을 때는 어떻게 하나요?',
    a: '접수 마감일(2026년 10월 30일 24:00) 전까지는 사이트 상단의 [접수 확인] 메뉴에서 본인 확인 후 수정 접수가 가능합니다.',
  },
];

// 2026 글로컬 부산관광 트래블톤 공모전 타입 정의

// 졸업 유무 옵션 타입
export type GraduationStatus = 'enrolled' | 'leave_of_absence' | 'expected_graduation' | 'graduated';

export const GRADUATION_STATUS_LABELS: Record<GraduationStatus, string> = {
  enrolled: '재학',
  leave_of_absence: '휴학',
  expected_graduation: '졸업예정',
  graduated: '졸업',
};

// 팀원 정보 인터페이스
export interface TeamMember {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  university: string;
  graduationStatus: GraduationStatus;
}

// 대표자(팀장) 및 전체 신청 데이터 인터페이스
export interface ApplicationFormData {
  // 대표자 정보
  name: string;
  birthDate: string; // YYYY-MM-DD
  university: string;
  graduationStatus: GraduationStatus;
  phone: string;
  email: string;

  // 팀 정보 (팀명 및 팀원 목록)
  teamName: string;
  teamMembers: TeamMember[];

  // 약관 동의
  agreePrivacy: boolean; // 개인정보 수집 및 활용 동의 (필수)
  agreeThirdParty: boolean; // 개인정보 제3자 제공 동의 (필수)
  agreeNotice: boolean; // 유의사항 및 공모전 규정 확인 (필수)

  // 파일 정보 (업로드 후 드라이브 URL 등)
  applicationFileName?: string;
  proposalFileName?: string;
  consentFileName?: string;
  applicationFileUrl?: string;
  proposalFileUrl?: string;
  consentFileUrl?: string;
}

// 접수 완료 결과 인터페이스
export interface SubmissionResult {
  success: boolean;
  registrationNumber?: string;
  message: string;
  timestamp?: string;
  details?: {
    teamName: string;
    leaderName: string;
    memberCount: number;
    email: string;
  };
}

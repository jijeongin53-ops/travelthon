'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Users,
  Calendar,
  GraduationCap,
  Phone,
  Mail,
  UploadCloud,
  FileCheck,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
  Info,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { GraduationStatus, GRADUATION_STATUS_LABELS, TeamMember } from '@/lib/types';
import { GOOGLE_SHEET_URL, GOOGLE_DRIVE_FOLDER_URL, GOOGLE_DRIVE_FORM_FILE_URL } from '@/lib/constants';

interface ApplicationFormProps {
  onOpenPrivacyModal: (type: 'collection' | 'thirdParty') => void;
}

export default function ApplicationForm({ onOpenPrivacyModal }: ApplicationFormProps) {
  // 대표자(팀장) 정보
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [university, setUniversity] = useState('');
  const [graduationStatus, setGraduationStatus] = useState<GraduationStatus>('enrolled');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // 팀 정보 (개인 참가 불가, 팀 참가 필수: 최소 1명의 팀원 기본 세팅)
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'member-1',
      name: '',
      birthDate: '',
      university: '',
      graduationStatus: 'enrolled',
    },
  ]);

  // 파일 상태
  const [applicationFile, setApplicationFile] = useState<File | null>(null);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [consentFile, setConsentFile] = useState<File | null>(null);

  // 약관 동의 상태
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeThirdParty, setAgreeThirdParty] = useState(false);
  const [agreeNotice, setAgreeNotice] = useState(false);

  // 제출 및 UI 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // 파일 인풋 참조
  const appFileRef = useRef<HTMLInputElement>(null);
  const propFileRef = useRef<HTMLInputElement>(null);
  const conFileRef = useRef<HTMLInputElement>(null);

  // 전체 동의 핸들러
  const handleToggleAllAgreements = (checked: boolean) => {
    setAgreePrivacy(checked);
    setAgreeThirdParty(checked);
    setAgreeNotice(checked);
  };

  const isAllAgreed = agreePrivacy && agreeThirdParty && agreeNotice;

  // 팀원 추가 (최대 3명 추가 가능: 대표자 포함 최대 4인 팀)
  const handleAddMember = () => {
    if (teamMembers.length >= 3) {
      alert('팀원은 대표자 포함 최대 4인까지 구성할 수 있습니다.');
      return;
    }
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: '',
      birthDate: '',
      university: '',
      graduationStatus: 'enrolled',
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  // 팀원 삭제 (팀원은 최소 1명 이상 유지)
  const handleRemoveMember = (id: string) => {
    if (teamMembers.length <= 1) {
      alert('본 공모전은 팀 참가 필수(개인 불가)이므로 최소 1명 이상의 팀원이 필요합니다.');
      return;
    }
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  // 팀원 정보 변경
  const handleUpdateMember = (
    id: string,
    field: keyof Omit<TeamMember, 'id'>,
    value: any
  ) => {
    setTeamMembers(
      teamMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // 파일 크기 포맷터
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 팀명 필수 검증
    if (!teamName.trim()) {
      setErrorMessage('팀 명을 반드시 입력해 주세요 (본 대회는 팀 참가 필수입니다).');
      return;
    }

    // 대표자 필수 항목 검증
    if (!name.trim()) {
      setErrorMessage('대표자(팀장) 이름을 입력해 주세요.');
      return;
    }
    if (!birthDate) {
      setErrorMessage('대표자 생년월일을 입력해 주세요.');
      return;
    }
    if (!university.trim()) {
      setErrorMessage('대표자 출신 대학(소속)을 입력해 주세요.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('대표자 연락처를 입력해 주세요.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('유효한 대표자 이메일 주소를 입력해 주세요.');
      return;
    }

    // 팀원 인원 검증 (개인 참가 불가 -> 최소 1명 이상의 팀원 필요)
    if (teamMembers.length < 1) {
      setErrorMessage('본 대회는 개인 참가가 불가합니다. 팀원을 최소 1명 이상 등록해 주세요 (대표자 포함 2인 이상).');
      return;
    }

    // 팀원 항목 검증
    for (let i = 0; i < teamMembers.length; i++) {
      const m = teamMembers[i];
      if (!m.name.trim() || !m.birthDate || !m.university.trim()) {
        setErrorMessage(`팀원 ${i + 1}의 모든 정보(이름, 생년월일, 대학, 졸업유무)를 빠짐없이 입력해 주세요.`);
        return;
      }
    }

    // 약관 동의 검증
    if (!agreePrivacy || !agreeThirdParty || !agreeNotice) {
      setErrorMessage('모든 필수 약관에 동의해 주셔야 접수가 진행됩니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('birthDate', birthDate);
      formData.append('university', university.trim());
      formData.append('graduationStatus', graduationStatus);
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('teamName', teamName.trim());
      formData.append('teamMembers', JSON.stringify(teamMembers));
      formData.append('agreePrivacy', String(agreePrivacy));
      formData.append('agreeThirdParty', String(agreeThirdParty));
      formData.append('agreeNotice', String(agreeNotice));

      if (applicationFile) formData.append('applicationFile', applicationFile);
      if (proposalFile) formData.append('proposalFile', proposalFile);
      if (consentFile) formData.append('consentFile', consentFile);

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '접수 처리 중 오류가 발생했습니다.');
      }

      // 축하 폭죽 효과 발생
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSuccessData(data);
    } catch (err: any) {
      setErrorMessage(err.message || '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 접수번호 복사
  const handleCopyRegNo = () => {
    if (successData?.registrationNumber) {
      navigator.clipboard.writeText(successData.registrationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 초기화 후 새 접수
  const handleResetForm = () => {
    setSuccessData(null);
    setName('');
    setBirthDate('');
    setUniversity('');
    setGraduationStatus('enrolled');
    setPhone('');
    setEmail('');
    setTeamName('');
    setTeamMembers([
      {
        id: 'member-1',
        name: '',
        birthDate: '',
        university: '',
        graduationStatus: 'enrolled',
      },
    ]);
    setApplicationFile(null);
    setProposalFile(null);
    setConsentFile(null);
    setAgreePrivacy(false);
    setAgreeThirdParty(false);
    setAgreeNotice(false);
  };

  return (
    <section id="apply" className="py-24 relative bg-slate-950">
      {/* 은은한 배경 그라디언트 */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 섹션 헤더 */}
        <div className="text-center max-w-2xl mx-auto mb-14 break-keep">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-3 border border-cyan-500/20">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>온라인 원스톱 팀 접수처</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 break-keep">
            참가 신청 및 서류 제출
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed break-keep">
            본 대회는 <strong className="text-cyan-300">팀 단위(2인 이상 4인 이하) 참가 필수</strong>이며, 
            개인 참가는 불가합니다. 인적사항 기재와 기획서/동의서 업로드를 완료하시면 구글 시트 및 구글 드라이브에 안전하게 자동 저장됩니다.
          </p>
        </div>

        {/* 접수 폼 카드 컨테이너 */}
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* 팀 참가 필수 안내 배너 */}
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-3 text-xs sm:text-sm text-cyan-200 break-keep">
              <Info className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="break-keep">
                <strong>[팀 참가 안내]</strong> 대표자(팀장) 외에 <strong>최소 1명 이상의 팀원</strong>(총 2~4인)을 등록하셔야 최종 접수가 가능합니다.
              </span>
            </div>

            {/* 1. 팀 기본 정보 (팀명) */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">팀 명 (필수)</h3>
                    <p className="text-xs text-slate-400">활동하실 팀의 공식 명칭을 입력해 주세요.</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  필수 입력
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  팀 명 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 부산오딧세이, 해양메이커스 등 팀명을 입력해 주세요"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            {/* 2. 대표자(팀장) 인적사항 */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-cyan-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">대표자(팀장) 인적사항</h3>
                    <p className="text-xs text-slate-400">공모전 안내 및 심사 결과가 수신되는 대표 정보입니다.</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  전체 필수
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* 이름 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    이름 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="대표자 성명"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                {/* 생년월일 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    생년월일 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors [color-scheme:dark]"
                  />
                </div>

                {/* 출신 대학 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    출신 대학(소속) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 부산대학교, 동아대학교, 한국해양대학교 등"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                {/* 졸업 유무 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    졸업 유무(학적 상태) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={graduationStatus}
                    onChange={(e) => setGraduationStatus(e.target.value as GraduationStatus)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                  >
                    <option value="enrolled">재학</option>
                    <option value="leave_of_absence">휴학</option>
                    <option value="expected_graduation">졸업예정</option>
                    <option value="graduated">졸업</option>
                  </select>
                </div>

                {/* 연락처 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    휴대전화 번호 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010-1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                {/* 이메일 주소 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    이메일 주소 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@busan.ac.kr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. 팀원 입력 섹션 (최소 1명 이상 필수) */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-6 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">팀원 정보 입력 (최소 1명 ~ 최대 3명)</h3>
                    <p className="text-xs text-slate-400">대표자를 제외한 팀원들의 인적사항을 입력해 주세요 (총 2~4인 팀).</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={teamMembers.length >= 3}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                  <span>팀원 추가 (+{teamMembers.length}/3)</span>
                </button>
              </div>

              {/* 팀원 카드 목록 */}
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-4 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>팀원 {index + 1} {index === 0 && <span className="text-[10px] text-rose-400">(필수)</span>}</span>
                      </span>
                      {teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* 팀원 이름 */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          이름 <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="팀원 성명"
                          value={member.name}
                          onChange={(e) =>
                            handleUpdateMember(member.id, 'name', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      {/* 팀원 생년월일 */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          생년월일 <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={member.birthDate}
                          onChange={(e) =>
                            handleUpdateMember(member.id, 'birthDate', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none [color-scheme:dark]"
                        />
                      </div>

                      {/* 팀원 출신대학 */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          출신 대학 <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="대학교명"
                          value={member.university}
                          onChange={(e) =>
                            handleUpdateMember(member.id, 'university', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                        />
                      </div>

                      {/* 팀원 졸업유무 */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          졸업 유무 <span className="text-rose-400">*</span>
                        </label>
                        <select
                          value={member.graduationStatus}
                          onChange={(e) =>
                            handleUpdateMember(
                              member.id,
                              'graduationStatus',
                              e.target.value as GraduationStatus
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
                        >
                          <option value="enrolled">재학</option>
                          <option value="leave_of_absence">휴학</option>
                          <option value="expected_graduation">졸업예정</option>
                          <option value="graduated">졸업</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 파일 업로드 섹션 */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-6 gap-3 break-keep">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white break-keep">서류 파일 업로드</h3>
                    <p className="text-xs text-slate-400 break-keep">
                      신청서, 아이디어 소개서, 개인정보 동의서를 첨부해 주세요 (HWP, DOCX, PDF, ZIP 지원).
                    </p>
                  </div>
                </div>

                <a
                  href="/downloads/참가서류_글로컬_부산관광_트래블톤.hwp"
                  download="참가서류_글로컬_부산관광_트래블톤.hwp"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all self-start sm:self-auto shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>공식 양식 다운로드 (HWP)</span>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1) 신청서 업로드 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200">[서식 1호] 신청서</span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">필수</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-4">참가신청서 양식</p>

                    <input
                      ref={appFileRef}
                      type="file"
                      accept=".docx,.doc,.hwp,.pdf,.zip"
                      className="hidden"
                      onChange={(e) => setApplicationFile(e.target.files?.[0] || null)}
                    />

                    {applicationFile ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 mb-2">
                        <div className="flex items-start gap-2">
                          <FileCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">
                              {applicationFile.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatFileSize(applicationFile.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => appFileRef.current?.click()}
                        className="p-5 border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 rounded-xl cursor-pointer text-center transition-all bg-slate-900/30 hover:bg-slate-900/60 mb-2"
                      >
                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-300 font-medium block">파일 선택 / 드래그</span>
                        <span className="text-[10px] text-slate-500">HWP, DOCX, PDF</span>
                      </div>
                    )}
                  </div>

                  {applicationFile && (
                    <button
                      type="button"
                      onClick={() => setApplicationFile(null)}
                      className="text-[11px] text-rose-400 hover:text-rose-300 text-center py-1 hover:underline"
                    >
                      파일 삭제 및 재선택
                    </button>
                  )}
                </div>

                {/* 2) 아이디어 기획서 업로드 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200">[서식 2호] 아이디어 계획서</span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">필수</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-4">5매 이내 기획안</p>

                    <input
                      ref={propFileRef}
                      type="file"
                      accept=".docx,.doc,.hwp,.pdf,.zip"
                      className="hidden"
                      onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
                    />

                    {proposalFile ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 mb-2">
                        <div className="flex items-start gap-2">
                          <FileCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">
                              {proposalFile.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatFileSize(proposalFile.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => propFileRef.current?.click()}
                        className="p-5 border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 rounded-xl cursor-pointer text-center transition-all bg-slate-900/30 hover:bg-slate-900/60 mb-2"
                      >
                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-300 font-medium block">파일 선택 / 드래그</span>
                        <span className="text-[10px] text-slate-500">HWP, DOCX, PDF</span>
                      </div>
                    )}
                  </div>

                  {proposalFile && (
                    <button
                      type="button"
                      onClick={() => setProposalFile(null)}
                      className="text-[11px] text-rose-400 hover:text-rose-300 text-center py-1 hover:underline"
                    >
                      파일 삭제 및 재선택
                    </button>
                  )}
                </div>

                {/* 3) 개인정보 활용 동의서 업로드 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200">[서식 3호] 개인정보 동의서</span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">필수</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-4">팀원 전원 서명본</p>

                    <input
                      ref={conFileRef}
                      type="file"
                      accept=".docx,.doc,.hwp,.pdf,.jpg,.jpeg,.png,.zip"
                      className="hidden"
                      onChange={(e) => setConsentFile(e.target.files?.[0] || null)}
                    />

                    {consentFile ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 mb-2">
                        <div className="flex items-start gap-2">
                          <FileCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">
                              {consentFile.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatFileSize(consentFile.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => conFileRef.current?.click()}
                        className="p-5 border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 rounded-xl cursor-pointer text-center transition-all bg-slate-900/30 hover:bg-slate-900/60 mb-2"
                      >
                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-300 font-medium block">파일 선택 / 드래그</span>
                        <span className="text-[10px] text-slate-500">PDF, 이미지, HWP</span>
                      </div>
                    )}
                  </div>

                  {consentFile && (
                    <button
                      type="button"
                      onClick={() => setConsentFile(null)}
                      className="text-[11px] text-rose-400 hover:text-rose-300 text-center py-1 hover:underline"
                    >
                      파일 삭제 및 재선택
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 5. 개인정보 약관 동의 및 서약 */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">개인정보 동의 및 유의사항 확인</h3>
                    <p className="text-xs text-slate-400">원활한 심사 진행을 위해 팀원 전원 동의를 확인해 주세요.</p>
                  </div>
                </div>
              </div>

              {/* 전체 동의 박스 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-4 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAllAgreed}
                    onChange={(e) => handleToggleAllAgreements(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded border-slate-700 bg-slate-900 focus:ring-cyan-400"
                  />
                  <span className="text-sm font-bold text-white">모든 필수 약관에 전체 동의합니다.</span>
                </label>
              </div>

              {/* 개별 동의 항목 */}
              <div className="space-y-3 text-xs sm:text-sm">
                {/* 1) 개인정보 수집 및 활용 동의 */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-950/40 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer select-none text-slate-300">
                    <input
                      type="checkbox"
                      required
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded border-slate-700 bg-slate-900 focus:ring-cyan-400"
                    />
                    <span>
                      <strong className="text-cyan-400">[필수]</strong> 개인정보 수집 및 활용 동의
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onOpenPrivacyModal('collection')}
                    className="text-xs text-slate-400 hover:text-cyan-400 underline underline-offset-2"
                  >
                    전문 보기
                  </button>
                </div>

                {/* 2) 개인정보 제3자 제공 동의 */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-950/40 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer select-none text-slate-300">
                    <input
                      type="checkbox"
                      required
                      checked={agreeThirdParty}
                      onChange={(e) => setAgreeThirdParty(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded border-slate-700 bg-slate-900 focus:ring-cyan-400"
                    />
                    <span>
                      <strong className="text-cyan-400">[필수]</strong> 개인정보 제3자 제공 동의
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onOpenPrivacyModal('thirdParty')}
                    className="text-xs text-slate-400 hover:text-cyan-400 underline underline-offset-2"
                  >
                    전문 보기
                  </button>
                </div>

                {/* 3) 공모전 유의사항 및 규정 확인 */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-950/40 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer select-none text-slate-300">
                    <input
                      type="checkbox"
                      required
                      checked={agreeNotice}
                      onChange={(e) => setAgreeNotice(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded border-slate-700 bg-slate-900 focus:ring-cyan-400"
                    />
                    <span>
                      <strong className="text-cyan-400">[필수]</strong> 대회 유의사항 확인 및 기재사항이 사실임을 확인합니다 (팀 참가 필수).
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-base sm:text-lg transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>구글 드라이브 및 구글 시트로 안전하게 전송 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>2026 글로컬 부산관광 트래블톤 팀 참가 신청 완료하기</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-3">
                제출 즉시 대표자 이메일로 접수 확인이 통보되며, 상단 [접수 확인] 메뉴에서 언제든 조회할 수 있습니다.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* 접수 완료 축하 모달 */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 mx-auto">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <div className="break-keep">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                접수 완료
              </span>
              <h3 className="text-2xl font-black text-white mt-2 break-keep">
                팀 참가 신청이 성공적으로 접수되었습니다!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 break-keep">
                2026 글로컬 부산관광 트래블톤 공모전에 도전해 주셔서 감사합니다.
              </p>
            </div>

            {/* 발급된 접수번호 카드 */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">발급된 고유 접수번호</span>
                <button
                  type="button"
                  onClick={handleCopyRegNo}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? '복사됨!' : '접수번호 복사'}</span>
                </button>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-cyan-400 tracking-wider">
                {successData.registrationNumber}
              </div>
              <p className="text-[11px] text-slate-500">
                * 접수번호는 향후 서류 심사 결과 조회 및 수정 접수 시 필요하므로 반드시 메모해 두시기 바랍니다.
              </p>
            </div>

            {/* 요약 정보 */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-slate-300 space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">팀 명:</span>
                <span className="font-semibold text-white">{successData.details?.teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">대표자(팀장):</span>
                <span className="font-semibold text-white">{successData.details?.leaderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">총 팀원 수:</span>
                <span className="font-semibold text-white">{successData.details?.memberCount}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">대표 이메일:</span>
                <span className="font-semibold text-white">{successData.details?.email}</span>
              </div>
            </div>

            {/* 모달 닫기 버튼 */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-cyan-500/20"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

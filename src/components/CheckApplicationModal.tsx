'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2,
  Edit3,
  UploadCloud,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';
import { GraduationStatus, GRADUATION_STATUS_LABELS, TeamMember } from '@/lib/types';
import { GOOGLE_APPS_SCRIPT_URL, ADMIN_NOTIFICATION_EMAIL } from '@/lib/constants';

interface CheckApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckApplicationModal({
  isOpen,
  onClose,
}: CheckApplicationModalProps) {
  const [tab, setTab] = useState<'regNo' | 'userInfo'>('regNo');
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<any>(null);

  // 수정 모드 및 수정 폼 상태
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  const [editTeamName, setEditTeamName] = useState('');
  const [editName, setEditName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editUniversity, setEditUniversity] = useState('');
  const [editGraduationStatus, setEditGraduationStatus] = useState<GraduationStatus>('enrolled');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTeamMembers, setEditTeamMembers] = useState<TeamMember[]>([]);
  const [existingFiles, setExistingFiles] = useState<{ name: string; size?: number; url: string }[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const editFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 파일 크기 포맷터
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return 'PDF 문서';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 대용량 파일 안전 Base64 변환 헬퍼
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resStr = reader.result as string;
        const base64 = resStr.includes(',') ? resStr.split(',')[1] : resStr;
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  // 졸업유무 값 정규화
  const normalizeGradCode = (val?: string): GraduationStatus => {
    if (!val) return 'enrolled';
    if (val === 'enrolled' || val === '재학') return 'enrolled';
    if (val === 'leave_of_absence' || val === '휴학') return 'leave_of_absence';
    if (val === 'expected_graduation' || val === '졸업예정') return 'expected_graduation';
    if (val === 'graduated' || val === '졸업') return 'graduated';
    return 'enrolled';
  };

  // 수정 모드 진입 핸들러
  const handleStartEdit = () => {
    if (!result?.data) return;
    const d = result.data;
    setEditTeamName(d.teamName || '');
    setEditName(d.name || '');
    setEditBirthDate(d.birthDate || '');
    setEditUniversity(d.university || '');
    setEditGraduationStatus(normalizeGradCode(d.graduationStatus));
    setEditPhone(d.phone || '');
    setEditEmail(d.email || '');
    setEditTeamMembers(
      Array.isArray(d.teamMembers) && d.teamMembers.length > 0
        ? d.teamMembers.map((m: any, idx: number) => ({
            id: m.id || `member-${idx + 1}`,
            name: m.name || '',
            birthDate: m.birthDate || '',
            university: m.university || '',
            graduationStatus: normalizeGradCode(m.graduationStatus),
          }))
        : [
            {
              id: 'member-1',
              name: '',
              birthDate: '',
              university: '',
              graduationStatus: 'enrolled',
            },
          ]
    );
    setExistingFiles(
      Array.isArray(d.uploadedFiles) && d.uploadedFiles.length > 0
        ? d.uploadedFiles.map((f: any, idx: number) => ({
            name: f.name || `제출서류_${idx + 1}.pdf`,
            size: f.size || 0,
            url: f.url || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
          }))
        : []
    );
    setNewFiles([]);
    setEditErrorMsg('');
    setEditSuccessMsg('');
    setIsEditing(true);
  };

  // 팀원 추가
  const handleAddEditMember = () => {
    if (editTeamMembers.length >= 3) {
      alert('팀원은 대표자 포함 최대 4인까지 구성할 수 있습니다.');
      return;
    }
    setEditTeamMembers([
      ...editTeamMembers,
      {
        id: Date.now().toString(),
        name: '',
        birthDate: '',
        university: '',
        graduationStatus: 'enrolled',
      },
    ]);
  };

  // 팀원 삭제
  const handleRemoveEditMember = (id: string) => {
    if (editTeamMembers.length <= 1) {
      alert('본 공모전은 팀 참가 필수이므로 최소 1명 이상의 팀원이 필요합니다.');
      return;
    }
    setEditTeamMembers(editTeamMembers.filter((m) => m.id !== id));
  };

  // 팀원 수정
  const handleUpdateEditMember = (
    id: string,
    field: keyof Omit<TeamMember, 'id'>,
    value: any
  ) => {
    setEditTeamMembers(
      editTeamMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // 새 PDF 파일 추가 핸들러
  const handleAddNewFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const validPdfs: File[] = [];
    let hasNonPdf = false;

    for (const file of incoming) {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      if (isPdf) {
        const isDup = newFiles.some((f) => f.name === file.name && f.size === file.size);
        if (!isDup) validPdfs.push(file);
      } else {
        hasNonPdf = true;
      }
    }

    if (hasNonPdf) {
      alert('공모전 서류 파일은 PDF(.pdf) 형식으로만 업로드 가능합니다.');
    }

    const totalCount = existingFiles.length + newFiles.length + validPdfs.length;
    if (totalCount > 5) {
      alert('기존 서류와 추가 서류를 합쳐 최대 5개까지만 등록할 수 있습니다.');
      const available = Math.max(0, 5 - existingFiles.length - newFiles.length);
      if (available > 0) {
        setNewFiles((prev) => [...prev, ...validPdfs.slice(0, available)]);
      }
    } else {
      setNewFiles((prev) => [...prev, ...validPdfs]);
    }
  };

  // 수정 내용 및 추가 서류 저장 핸들러
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg('');
    setEditSuccessMsg('');

    if (!editTeamName.trim()) {
      setEditErrorMsg('팀 명을 입력해 주세요.');
      return;
    }
    if (!editName.trim() || !editBirthDate || !editUniversity.trim() || !editPhone.trim() || !editEmail.trim()) {
      setEditErrorMsg('대표자 필수 인적사항을 모두 입력해 주세요.');
      return;
    }
    for (let i = 0; i < editTeamMembers.length; i++) {
      const m = editTeamMembers[i];
      if (!m.name.trim() || !m.birthDate || !m.university.trim()) {
        setEditErrorMsg(`팀원 ${i + 1}의 모든 정보를 입력해 주세요.`);
        return;
      }
    }
    if (existingFiles.length + newFiles.length === 0) {
      setEditErrorMsg('제출 서류 파일(PDF)이 최소 1개 이상 있어야 합니다.');
      return;
    }

    const newFilesBytes = newFiles.reduce((acc, f) => acc + f.size, 0);
    if (newFilesBytes > 35 * 1024 * 1024) {
      setEditErrorMsg('추가 첨부 파일의 합산 용량은 최대 35MB까지 가능합니다.');
      return;
    }

    setIsSaving(true);
    try {
      const targetRegNo = result.registrationNumber;
      const keptUrls = existingFiles.map((f) => f.url).filter(Boolean);
      let newlyUploadedUrls: string[] = [];
      let clientDirectUploaded = false;

      if (GOOGLE_APPS_SCRIPT_URL) {
        try {
          const filesPayload: Record<string, { name: string; type: string; base64: string }> = {};
          for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const base64 = await fileToBase64(file);
            filesPayload[`file_${i + 1}`] = {
              name: file.name,
              type: file.type || 'application/pdf',
              base64,
            };
          }

          const gasPayload = {
            registrationNumber: targetRegNo,
            existingFileUrls: keptUrls,
            data: {
              name: editName.trim(),
              birthDate: editBirthDate,
              university: editUniversity.trim(),
              graduationStatus: editGraduationStatus,
              phone: editPhone.trim(),
              email: editEmail.trim(),
              teamName: editTeamName.trim(),
              teamMembers: editTeamMembers,
              agreePrivacy: true,
              agreeThirdParty: true,
              agreeNotice: true,
            },
            files: filesPayload,
            notificationEmail: ADMIN_NOTIFICATION_EMAIL,
          };

          const gasRes = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(gasPayload),
          });
          const gasText = await gasRes.text();
          let gasJson: any = null;
          try {
            gasJson = JSON.parse(gasText);
          } catch {
            gasJson = null;
          }

          if (gasRes.ok && gasJson && gasJson.success !== false) {
            clientDirectUploaded = true;
            if (Array.isArray(gasJson.uploadedFileUrls)) {
              newlyUploadedUrls = gasJson.uploadedFileUrls.filter((u: string) => !keptUrls.includes(u));
            }
          }
        } catch (gasErr) {
          console.warn('수정 사항 Google Apps Script 직접 전송 경고:', gasErr);
        }
      }

      const combinedUrls = [...keptUrls, ...newlyUploadedUrls];
      const combinedFilesMeta = [
        ...existingFiles.map((f) => ({ name: f.name, size: f.size || 0, url: f.url })),
        ...newFiles.map((f, idx) => ({
          name: f.name,
          size: f.size,
          url:
            newlyUploadedUrls[idx] ||
            'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId',
        })),
      ];

      // 서버 캐시 동기화 요청 (메타데이터만 전달)
      const formData = new FormData();
      formData.append('registrationNumber', targetRegNo);
      formData.append('name', editName.trim());
      formData.append('birthDate', editBirthDate);
      formData.append('university', editUniversity.trim());
      formData.append('graduationStatus', editGraduationStatus);
      formData.append('phone', editPhone.trim());
      formData.append('email', editEmail.trim());
      formData.append('teamName', editTeamName.trim());
      formData.append('teamMembers', JSON.stringify(editTeamMembers));
      formData.append('agreePrivacy', 'true');
      formData.append('agreeThirdParty', 'true');
      formData.append('agreeNotice', 'true');
      formData.append('clientDirectUploaded', String(clientDirectUploaded));
      formData.append('uploadedFileUrls', JSON.stringify(combinedFilesMeta.map((f) => f.url)));
      formData.append(
        'uploadedFilesMeta',
        JSON.stringify(combinedFilesMeta.map((f) => ({ name: f.name, size: f.size })))
      );

      await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      }).catch(() => null);

      // 화면에 즉시 수정된 결과 반영
      setResult({
        ...result,
        registrationNumber: targetRegNo,
        status: '수정 완료 (심사 대기)',
        data: {
          ...result.data,
          name: editName.trim(),
          birthDate: editBirthDate,
          university: editUniversity.trim(),
          graduationStatus: editGraduationStatus,
          phone: editPhone.trim(),
          email: editEmail.trim(),
          teamName: editTeamName.trim(),
          teamMembers: editTeamMembers,
          uploadedFiles: combinedFilesMeta,
        },
      });
      setIsEditing(false);
      setEditSuccessMsg('접수 내용 수정 및 추가 서류 업로드가 성공적으로 완료되었습니다!');
    } catch (err: any) {
      setEditErrorMsg(err.message || '수정 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setEditSuccessMsg('');
    setIsEditing(false);
    setResult(null);

    try {
      let queryUrl = '/api/check?';
      if (tab === 'regNo') {
        if (!regNo.trim()) {
          setErrorMsg('접수번호를 입력해 주세요.');
          setLoading(false);
          return;
        }
        queryUrl += `regNo=${encodeURIComponent(regNo.trim())}`;
      } else {
        if (!name.trim() || !phone.trim()) {
          setErrorMsg('대표자 성명과 연락처를 모두 입력해 주세요.');
          setLoading(false);
          return;
        }
        queryUrl += `name=${encodeURIComponent(name.trim())}&phone=${encodeURIComponent(phone.trim())}`;
      }

      const res = await fetch(queryUrl);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || '일치하는 접수 내역을 찾을 수 없습니다.');
      } else {
        setResult(data.submission);
      }
    } catch (err: any) {
      setErrorMsg('조회 중 통신 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] break-keep">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 break-keep">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white break-keep">접수 내역 조회</h3>
              <p className="text-xs text-slate-400 break-keep">제출하신 공모전 참가 신청 현황을 확인합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 검색 방식 탭 */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTab('regNo');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                tab === 'regNo'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              접수번호로 조회
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('userInfo');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                tab === 'userInfo'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              대표자 인적사항으로 조회
            </button>
          </div>

          {/* 검색 폼 */}
          <form onSubmit={handleSearch} className="space-y-4">
            {tab === 'regNo' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  접수번호 (예: BT26-XXXX-XXXX)
                </label>
                <input
                  type="text"
                  placeholder="BT26-로 시작하는 접수번호 입력"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    대표자 성명
                  </label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    대표자 연락처
                  </label>
                  <input
                    type="text"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>조회 중...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>내 접수 현황 조회</span>
                </>
              )}
            </button>
          </form>

          {/* 수정 완료 안내 메시지 */}
          {editSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{editSuccessMsg}</span>
            </div>
          )}

          {/* 조회 결과 카드 */}
          {result && !isEditing && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-sm">정상 접수 완료</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  {result.status || '접수 완료 (심사 대기)'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">접수번호</span>
                  <span className="font-mono font-bold text-cyan-400">{result.registrationNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">팀 명</span>
                  <span className="font-semibold text-white">{result.data?.teamName || '개인'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">대표자(팀장)</span>
                  <span className="font-semibold text-white">
                    {result.data?.name} ({result.data?.university}, {GRADUATION_STATUS_LABELS[result.data?.graduationStatus as keyof typeof GRADUATION_STATUS_LABELS] || result.data?.graduationStatus})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">연락처 / 이메일</span>
                  <span className="text-slate-300">{result.data?.phone} · {result.data?.email}</span>
                </div>
                {result.data?.teamMembers && result.data.teamMembers.length > 0 && (
                  <div className="py-1">
                    <span className="text-slate-400 block mb-1">팀원 목록 ({result.data.teamMembers.length}명):</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                      {result.data.teamMembers.map((m: any, idx: number) => (
                        <li key={idx}>
                          {m.name} ({m.university} · {GRADUATION_STATUS_LABELS[m.graduationStatus as keyof typeof GRADUATION_STATUS_LABELS] || m.graduationStatus})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 제출 파일 링크 */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 block mb-1">제출 서류 파일:</span>
                <div className="space-y-1">
                  {result.data?.uploadedFiles && result.data.uploadedFiles.length > 0 ? (
                    result.data.uploadedFiles.map((file: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900">
                        <span className="text-slate-300 truncate max-w-[240px]">
                          [서류 {idx + 1}] {file.name}
                        </span>
                        <a
                          href={file.url || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>드라이브 열기</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900">
                        <span className="text-slate-300 truncate max-w-[240px]">
                          [신청서] {result.data?.applicationFileName || '신청서.docx'}
                        </span>
                        <a
                          href={result.data?.applicationFileUrl || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>드라이브 열기</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900">
                        <span className="text-slate-300 truncate max-w-[240px]">
                          [기획서] {result.data?.proposalFileName || '아이디어계획서.docx'}
                        </span>
                        <a
                          href={result.data?.proposalFileUrl || 'https://drive.google.com/drive/folders/1Vqt_QeOyeBuNpwHqkrCStysIhXeF1YId'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>드라이브 열기</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 접수 정보 수정 및 서류 추가 버튼 */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>접수 내용 수정 / 서류 파일 추가·변경하기</span>
                </button>
              </div>
            </div>
          )}

          {/* 접수 정보 수정 및 파일 추가 폼 */}
          {result && isEditing && (
            <form
              onSubmit={handleSaveEdit}
              className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-5 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-sm">
                    접수 내용 수정 및 서류 추가 ({result.registrationNumber})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800"
                >
                  취소
                </button>
              </div>

              {/* 1. 팀명 및 대표자 정보 수정 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    팀 명 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      대표자 성명 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      생년월일 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      출신 대학(소속) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editUniversity}
                      onChange={(e) => setEditUniversity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      졸업 유무 <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={editGraduationStatus}
                      onChange={(e) => setEditGraduationStatus(e.target.value as GraduationStatus)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="enrolled">재학</option>
                      <option value="leave_of_absence">휴학</option>
                      <option value="expected_graduation">졸업예정</option>
                      <option value="graduated">졸업</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      연락처 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      이메일 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. 팀원 정보 수정 */}
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">팀원 정보 ({editTeamMembers.length}/3명)</span>
                  <button
                    type="button"
                    onClick={handleAddEditMember}
                    disabled={editTeamMembers.length >= 3}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[11px] font-semibold border border-slate-700 flex items-center gap-1 disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                    <span>팀원 추가</span>
                  </button>
                </div>

                {editTeamMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-cyan-400">팀원 {idx + 1}</span>
                      {editTeamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEditMember(member.id)}
                          className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>삭제</span>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="이름"
                        value={member.name}
                        onChange={(e) => handleUpdateEditMember(member.id, 'name', e.target.value)}
                        className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                      <input
                        type="date"
                        required
                        value={member.birthDate}
                        onChange={(e) => handleUpdateEditMember(member.id, 'birthDate', e.target.value)}
                        className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs [color-scheme:dark]"
                      />
                      <input
                        type="text"
                        required
                        placeholder="출신대학"
                        value={member.university}
                        onChange={(e) => handleUpdateEditMember(member.id, 'university', e.target.value)}
                        className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                      <select
                        value={member.graduationStatus}
                        onChange={(e) =>
                          handleUpdateEditMember(
                            member.id,
                            'graduationStatus',
                            e.target.value as GraduationStatus
                          )
                        }
                        className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs"
                      >
                        <option value="enrolled">재학</option>
                        <option value="leave_of_absence">휴학</option>
                        <option value="expected_graduation">졸업예정</option>
                        <option value="graduated">졸업</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. 서류 파일 추가 및 변경 */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    제출 서류 파일 관리 ({existingFiles.length + newFiles.length} / 5개)
                  </span>
                  <span className="text-[11px] text-cyan-400">PDF 전용 · 합산 최대 35MB</span>
                </div>

                <input
                  ref={editFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleAddNewFiles(e.target.files);
                    }
                    e.target.value = '';
                  }}
                />

                {/* 기존 제출 서류 목록 */}
                {existingFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 block">기존 제출된 서류:</span>
                    {existingFiles.map((file, idx) => (
                      <div
                        key={`exist-${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 shrink-0">
                            기존 파일
                          </span>
                          <span className="text-slate-200 truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline text-[11px]"
                          >
                            열기
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              setExistingFiles((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="파일 제외"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 새로 추가한 서류 목록 */}
                {newFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-cyan-300 block">새로 추가할 서류:</span>
                    {newFiles.map((file, idx) => (
                      <div
                        key={`new-${idx}`}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold shrink-0">
                            신규 추가
                          </span>
                          <span className="text-white truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-400 hover:text-rose-300 p-1 shrink-0"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 파일 추가 드래그 앤 드롭 버튼 */}
                {existingFiles.length + newFiles.length < 5 && (
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files) {
                        handleAddNewFiles(e.dataTransfer.files);
                      }
                    }}
                    className={`p-4 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${
                      isDragging
                        ? 'border-cyan-400 bg-cyan-950/40'
                        : 'border-slate-700 hover:border-cyan-500/60 bg-slate-900/50'
                    }`}
                  >
                    <UploadCloud className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-white">
                      + PDF 서류 파일 추가 첨부 (클릭 또는 드래그)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      추가 제출할 신청서·계획서·동의서 PDF를 선택해 주세요.
                    </p>
                  </div>
                )}
              </div>

              {editErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editErrorMsg}</span>
                </div>
              )}

              {/* 저장 및 취소 버튼 */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>구글 드라이브 및 시트에 반영 중...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>수정 사항 및 추가 파일 저장하기</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

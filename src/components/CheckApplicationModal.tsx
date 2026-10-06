'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { GRADUATION_STATUS_LABELS } from '@/lib/types';

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

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
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

          {/* 조회 결과 카드 */}
          {result && (
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
                <span className="text-xs font-semibold text-slate-400 block mb-1">제출 파일:</span>
                <div className="space-y-1">
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

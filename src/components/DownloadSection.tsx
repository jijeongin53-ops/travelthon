'use client';

import React from 'react';
import {
  Download,
  FileText,
  FileCheck,
  FolderArchive,
  ExternalLink,
  FolderOpen,
  ArrowDownToLine,
  CheckCircle,
} from 'lucide-react';
import { DOWNLOAD_DOCUMENTS, GOOGLE_DRIVE_FOLDER_URL } from '@/lib/constants';

export default function DownloadSection() {
  return (
    <section id="downloads" className="py-20 relative bg-slate-900/60 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 타이틀 */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-3 border border-cyan-500/20">
            <Download className="w-3.5 h-3.5" />
            <span>양식 및 자료 다운로드 센터</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            대회 공모요강 및 제출 서식 다운로드
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            대회 참가 신청 시 제출해야 하는 공식 서식입니다. 양식을 다운로드하여 작성하신 후, 아래의 [참가 신청] 섹션에서 업로드해 주시기 바랍니다.
          </p>
        </div>

        {/* 구글 드라이브 공식 저장소 강조 배너 */}
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 backdrop-blur-md">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <FolderOpen className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">공식 구글 드라이브</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">실시간 연동</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                대회 공식 Google Drive 공유 폴더 바로가기
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                구글 드라이브에서 직접 최신 양식 파일 열람 및 추가 참고자료(부산 관광 통계자료 등)를 확인하실 수 있습니다.
              </p>
            </div>
          </div>

          <a
            href={GOOGLE_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] shrink-0"
          >
            <span>구글 드라이브 폴더 열기</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* 개별 서식 다운로드 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {DOWNLOAD_DOCUMENTS.map((doc) => {
            const isAllBundle = doc.id === 'all-bundle';
            return (
              <div
                key={doc.id}
                className={`p-6 rounded-2xl transition-all flex flex-col justify-between ${
                  isAllBundle
                    ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-2 border-cyan-500/50 shadow-lg shadow-cyan-950/30 lg:col-span-1 md:col-span-2'
                    : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                        doc.badge === '필독'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : doc.badge === '필수 제출'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {doc.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {doc.fileType} · {doc.size}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                      {isAllBundle ? (
                        <FolderArchive className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {doc.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {doc.description}
                  </p>
                </div>

                <a
                  href={doc.downloadPath}
                  download={doc.fileName}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isAllBundle
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>{isAllBundle ? '전체 서식 한 번에 다운로드' : '파일 다운로드'}</span>
                </a>
              </div>
            );
          })}
        </div>

        {/* 서류 작성 유의사항 박스 */}
        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm text-slate-400 space-y-1.5">
          <div className="font-bold text-slate-200 flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>서류 작성 및 제출 시 유의사항</span>
          </div>
          <p>• 아이디어 계획서(서식 2호)는 <strong>5페이지 이내</strong>로 작성하며, 표지와 첨부 증빙은 분량 제한에 포함되지 않습니다.</p>
          <p>• 개인정보 동의서(서식 3호)는 <strong>대표자 및 팀원 전원의 자필 서명 또는 도장 날인</strong> 후 스캔본(PDF/이미지)으로 첨부해 주세요.</p>
          <p>• 파일 제출 형식은 <strong>HWP, DOCX, PDF, ZIP</strong> 파일 포맷을 모두 지원합니다.</p>
        </div>
      </div>
    </section>
  );
}

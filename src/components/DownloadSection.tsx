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
import { DOWNLOAD_DOCUMENTS, GOOGLE_DRIVE_FOLDER_URL, GOOGLE_DRIVE_FORM_FILE_URL } from '@/lib/constants';

export default function DownloadSection() {
  return (
    <section id="downloads" className="py-20 relative bg-slate-900/60 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 타이틀 */}
        <div className="text-center max-w-3xl mx-auto mb-14 break-keep">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-3 border border-cyan-500/20">
            <Download className="w-3.5 h-3.5" />
            <span>양식 및 자료 다운로드 센터</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 break-keep">
            대회 공모요강 및 참가서류 서식 다운로드
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed break-keep">
            대회 참가 신청 시 제출해야 하는 공식 서식입니다.
            <br className="hidden sm:inline" />
            양식을 다운로드하여 작성하신 후, 아래의 [참가 신청] 섹션에서 업로드해 주시기 바랍니다.
          </p>
        </div>

        {/* 참가 서류 일체 다운로드 배너 */}
        <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md break-keep">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <FolderArchive className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight break-keep">
                참가 서류 일체
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 break-keep">
                공모전 참가를 위한 공식 양식 파일(참가신청서·서약서 HWP 및 아이디어 계획서 PPTX)을 다운로드하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* 서식 다운로드 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
            {/* 1. 참가서류 양식 즉시 다운로드 (HWP) */}
            <a
              href="/downloads/참가서류_글로컬_부산관광_트래블톤.hwp"
              download="참가서류_글로컬_부산관광_트래블톤.hwp"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>참가서류 양식 즉시 다운로드 (HWP)</span>
            </a>

            {/* 2. 아이디어 계획서 양식 다운로드 (PPTX) */}
            <a
              href="/downloads/2026_글로컬관광트래블톤_아이디어계획서_양식.pptx"
              download="2026_글로컬관광트래블톤_아이디어계획서_양식.pptx"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>아이디어 계획서 양식 다운로드 (PPTX)</span>
            </a>

            {/* 3. 전체 서식 일체 묶음 다운로드 (ZIP) */}
            <a
              href="/downloads/2026_글로컬_부산관광_트래블톤_서식일체.zip"
              download="2026_글로컬_부산관광_트래블톤_서식일체.zip"
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 hover:border-slate-500"
            >
              <FolderArchive className="w-4 h-4 text-cyan-400" />
              <span>전체 서식 묶음 (ZIP)</span>
            </a>
          </div>
        </div>

        {/* 서류 작성 유의사항 박스 */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm text-slate-400 space-y-2 break-keep">
          <div className="font-bold text-slate-200 flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>서류 작성 및 제출 시 유의사항</span>
          </div>
          <p>• <strong>참가서류 양식(HWP)</strong>: 참가신청서, 개인정보 수집·이용 동의서, 참가자 서약서가 포함되어 있습니다 (팀원 전원 서명/날인 필수).</p>
          <p>• <strong>아이디어 계획서(PPTX)</strong>: 제공된 슬라이드 양식에 맞추어 팀의 아이디어와 비즈니스 모델을 작성해 주세요.</p>
          <p>• <strong>제출 형식</strong>: 아래의 [참가 신청] 섹션에서 모든 서류를 <strong>PDF 파일</strong>로 변환하여 업로드해 주시기 바랍니다 (최대 5개 파일까지 일괄 첨부 가능).</p>
        </div>
      </div>
    </section>
  );
}


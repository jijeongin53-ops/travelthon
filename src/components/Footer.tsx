'use client';

import React from 'react';
import { Compass, ExternalLink, ArrowUp, FolderOpen, FileSpreadsheet } from 'lucide-react';
import { GOOGLE_DRIVE_FOLDER_URL, GOOGLE_SHEET_URL } from '@/lib/constants';

interface FooterProps {
  onScrollToTop: () => void;
}

export default function Footer({ onScrollToTop }: FooterProps) {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-slate-800/60">
          {/* 로고 & 슬로건 */}
          <div className="space-y-3 break-keep">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Compass className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-base font-extrabold text-white break-keep">
                2026 글로컬 부산관광 트래블톤 공모전
              </span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed break-keep">
              부산의 매력적인 로컬 자원과 디지털 기술이 결합된 지속 가능한 미래 관광 비즈니스를 창조하는 2일간의 메이커톤입니다.
            </p>
          </div>

          {/* 공식 구글 클라우드 링크들 */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center gap-2 font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>공식 Google 시트 DB</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-2 font-medium"
            >
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>공식 Google 드라이브</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            <button
              type="button"
              onClick={onScrollToTop}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
              aria-label="맨 위로 스크롤"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 주최/주관 및 하단 저작권 */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-slate-500 text-[11px] break-keep">
          <div className="space-y-1 break-keep">
            <p>주최 : 부산광역시 | 주관 : 부산관광공사, 글로컬 트래블톤 조직위원회</p>
            <p>운영사무국 : 부산광역시 해운대구 APEC로 55, 벡스코 제2전시장 컨벤션센터</p>
            <p>문의전화 : 051-740-0000 | 이메일 : contact@busan-travelthon.kr</p>
          </div>

          <div className="text-left md:text-right">
            <p>© 2026 Glocal Busan Travelthon. All rights reserved.</p>
            <p className="text-slate-600 mt-0.5">Powered by Next.js & Google Cloud Integration</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

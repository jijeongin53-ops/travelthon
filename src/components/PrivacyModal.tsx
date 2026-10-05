'use client';

import React from 'react';
import { X, ShieldCheck, Check } from 'lucide-react';
import { PRIVACY_TERMS } from '@/lib/constants';

interface PrivacyModalProps {
  isOpen: boolean;
  type: 'collection' | 'thirdParty' | null;
  onClose: () => void;
  onAgree: (type: 'collection' | 'thirdParty') => void;
}

export default function PrivacyModal({
  isOpen,
  type,
  onClose,
  onAgree,
}: PrivacyModalProps) {
  if (!isOpen || !type) return null;

  const title =
    type === 'collection'
      ? '개인정보 수집 및 이용 동의 전문'
      : '개인정보 제3자 제공 동의 전문';

  const content =
    type === 'collection' ? PRIVACY_TERMS.collection : PRIVACY_TERMS.thirdParty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="px-6 py-5 overflow-y-auto text-sm text-slate-300 leading-relaxed space-y-3 font-mono bg-slate-900/90 whitespace-pre-line">
          {content}
        </div>

        {/* 모달 푸터 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => {
              onAgree(type);
              onClose();
            }}
            className="px-5 py-2 text-xs sm:text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <Check className="w-4 h-4" />
            <span>동의하고 닫기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

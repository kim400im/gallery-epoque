"use client";

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ShareButton() {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
        copied
          ? 'border-[#7c8d4c] text-[#7c8d4c] bg-[#7c8d4c]/10'
          : 'border-[#7c8d4c]/30 text-[#ccc5b9] hover:border-[#7c8d4c]/60 hover:text-[#f8f4e3]'
      }`}
    >
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
      {copied ? t('linkCopied') : t('share')}
    </button>
  );
}

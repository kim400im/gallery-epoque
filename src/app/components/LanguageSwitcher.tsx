"use client";

import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';
import { locales } from '@/i18n/routing';
import { useRouter, usePathname } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Globe className="w-4 h-4 text-[#7c8d4c]" />
      <div className="flex gap-2">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={`px-3 py-1 rounded-full transition-all ${
              locale === loc
                ? 'bg-[#7c8d4c] text-[#f8f4e3]'
                : 'text-[#7c8d4c] hover:bg-[#7c8d4c]/20'
            }`}
          >
            {loc.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

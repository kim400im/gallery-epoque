"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

type SubMenuItem = {
  labelKey: string;
  href: string;
};

type MenuItem = {
  labelKey: string;
  href: string;
  subItems: SubMenuItem[];
};

const menuItems: MenuItem[] = [
  {
    labelKey: 'exhibition',
    href: '/exhibition',
    subItems: [
      { labelKey: 'currentExhibition', href: '/exhibition/current' },
      { labelKey: 'pastExhibition', href: '/exhibition/past' },
      { labelKey: 'upcomingExhibition', href: '/exhibition/upcoming' },
    ],
  },
  {
    labelKey: 'aboutUs',
    href: '/about',
    subItems: [
      { labelKey: 'galleryIntro', href: '/about' },
      { labelKey: 'location', href: '/about/location' },
    ],
  },
  {
    labelKey: 'artist',
    href: '/artist',
    subItems: [{ labelKey: 'artistList', href: '/artist' }],
  },
  {
    labelKey: 'notice',
    href: '/notice',
    subItems: [{ labelKey: 'noticeList', href: '/notice' }],
  },
  {
    labelKey: 'contact',
    href: '/contact',
    subItems: [
      { labelKey: 'rentalInfo', href: '/contact/rental' },
      { labelKey: 'purchaseInquiry', href: '/contact/purchase' },
    ],
  },
];

export default function Navigation() {
  const t = useTranslations('nav');
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[var(--color-border)] bg-white/95 backdrop-blur-md">
      <nav className="ge-container flex h-[var(--nav-height)] items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Gallery Epoque home">
          <Image src="/logo.svg" alt="Gallery Epoque" width={178} height={40} priority className="h-10 w-auto" />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <div className="flex items-center gap-1">
            {menuItems.map((item) => (
              <div
                key={item.labelKey}
                className="relative"
                onMouseEnter={() => setHoveredMenu(item.labelKey)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 border-l-2 border-transparent px-4 py-6 text-[13px] font-medium tracking-[0.04em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)]"
                >
                  {t(item.labelKey)}
                  <ChevronDown className={`h-3.5 w-3.5 text-[var(--color-fg-muted)] transition-transform ${hoveredMenu === item.labelKey ? 'rotate-180' : ''}`} />
                </Link>

                <div
                  className={`absolute left-0 top-full min-w-[196px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-lg)] transition-all duration-200 ${
                    hoveredMenu === item.labelKey
                      ? 'visible translate-y-0 opacity-100'
                      : 'invisible -translate-y-2 opacity-0'
                  }`}
                >
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.labelKey}
                      href={subItem.href}
                      className="block border-l-2 border-transparent px-5 py-3 text-sm text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                    >
                      {t(subItem.labelKey)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border-l border-[var(--color-border)] pl-6">
            <LanguageSwitcher />
            <Link href="/book" className="ge-btn">
              {t('bookSpace')}
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-primary)] md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-[var(--color-border)] bg-white md:hidden">
          <div className="ge-container py-3">
            {menuItems.map((item) => (
              <div key={item.labelKey} className="border-b border-[var(--color-border)]">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-4 text-left text-base text-[var(--color-ink)]"
                  onClick={() => setMobileSubmenuOpen(mobileSubmenuOpen === item.labelKey ? null : item.labelKey)}
                >
                  {t(item.labelKey)}
                  <ChevronDown className={`h-4 w-4 text-[var(--color-primary)] transition-transform ${mobileSubmenuOpen === item.labelKey ? 'rotate-180' : ''}`} />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${mobileSubmenuOpen === item.labelKey ? 'max-h-56 pb-3' : 'max-h-0'}`}>
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.labelKey}
                      href={subItem.href}
                      className="block border-l-2 border-[var(--color-primary)] px-4 py-2 text-sm text-[var(--color-fg-muted)]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(subItem.labelKey)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between gap-4 py-5">
              <LanguageSwitcher />
              <Link href="/book" className="ge-btn" onClick={() => setMobileOpen(false)}>
                {t('bookSpace')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

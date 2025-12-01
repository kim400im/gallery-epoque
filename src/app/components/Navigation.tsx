"use client";

import { useState } from 'react';
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
    subItems: [
      { labelKey: 'artistList', href: '/artist' },
    ],
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);

  return (
    <nav className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-50 text-[#f8f4e3]">
      {/* Logo */}
      <Link href="/" className="text-xl md:text-2xl font-serif font-bold tracking-widest uppercase text-[#7c8d4c]">
        Gallery Epoque
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        {/* Main Menu Items */}
        <div className="flex items-center gap-4 lg:gap-6">
          {menuItems.map((item) => (
            <div
              key={item.labelKey}
              className="relative"
              onMouseEnter={() => setHoveredMenu(item.labelKey)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              {/* Main Menu Button */}
              <button className="flex items-center gap-1 text-sm tracking-wider text-[#f8f4e3] hover:text-[#d4af37] transition-colors py-2">
                {t(item.labelKey)}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${hoveredMenu === item.labelKey ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute top-full left-0 mt-1 min-w-[180px] bg-[#1a1c1a]/95 backdrop-blur-md border border-[#7c8d4c]/20 rounded-lg shadow-xl overflow-hidden transition-all duration-200 ${
                  hoveredMenu === item.labelKey
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-2'
                }`}
              >
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.labelKey}
                    href={subItem.href}
                    className="block px-5 py-3 text-sm text-[#ccc5b9] hover:bg-[#7c8d4c]/20 hover:text-[#d4af37] transition-colors"
                  >
                    {t(subItem.labelKey)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Language Switcher & Book Button */}
        <div className="flex items-center gap-4 lg:gap-6 ml-4 border-l border-[#7c8d4c]/30 pl-4 lg:pl-6">
          <LanguageSwitcher />
          <Link
            href="/book"
            className="px-5 py-2 border border-[#7c8d4c]/50 text-[#7c8d4c] rounded-full hover:bg-[#7c8d4c] hover:text-[#f8f4e3] transition-all text-sm"
          >
            {t('bookSpace')}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-[#f8f4e3] p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-[#111311]/98 backdrop-blur-md z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6 pb-8 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.labelKey} className="border-b border-[#7c8d4c]/20">
              <button
                className="flex items-center justify-between w-full py-4 text-lg text-[#f8f4e3]"
                onClick={() => setMobileSubmenuOpen(mobileSubmenuOpen === item.labelKey ? null : item.labelKey)}
              >
                {t(item.labelKey)}
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileSubmenuOpen === item.labelKey ? 'rotate-180' : ''}`} />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  mobileSubmenuOpen === item.labelKey ? 'max-h-60' : 'max-h-0'
                }`}
              >
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.labelKey}
                    href={subItem.href}
                    className="block py-3 pl-4 text-[#ccc5b9] hover:text-[#d4af37]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(subItem.labelKey)}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Mobile Footer */}
          <div className="mt-auto pt-6 space-y-4">
            <LanguageSwitcher />
            <Link
              href="/book"
              className="block w-full py-3 text-center bg-[#7c8d4c] text-[#f8f4e3] rounded-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('bookSpace')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useTranslations } from 'next-intl';
import Navigation from '@/app/components/Navigation';
import { Download } from 'lucide-react';

export default function RentalPage() {
  const t = useTranslations('rental');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/floor-plan.pdf';
    link.download = 'gallery-epoque-floor-plan.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#111311]">
      <Navigation />
      <div className="pt-32 px-8 md:px-24 pb-16">
        <h1 className="text-4xl md:text-6xl font-serif text-[#f8f4e3] mb-12">
          {t('pageTitle')}
        </h1>

        {/* 전시장 도면 섹션 */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-[#c9a227] mb-6 border-b border-[#333] pb-2">
            {t('floorPlan')}
          </h2>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-3 px-6 py-4 bg-[#1a1c1a] border border-[#c9a227] rounded-lg text-[#f8f4e3] hover:bg-[#c9a227] hover:text-[#111311] transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">{t('downloadFloorPlan')}</span>
          </button>
        </section>

        {/* 대관료 섹션 */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-[#c9a227] mb-6 border-b border-[#333] pb-2">
            {t('rentalFee')}
          </h2>
          
          <div className="overflow-hidden rounded-lg border border-[#333]">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1a1c1a]">
                  <th className="px-6 py-4 text-left text-[#ccc5b9] font-medium">
                    {t('period')}
                  </th>
                  <th className="px-6 py-4 text-right text-[#ccc5b9] font-medium">
                    {t('price')}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#333]">
                  <td className="px-6 py-4 text-[#f8f4e3]">
                    {t('week1')}
                  </td>
                  <td className="px-6 py-4 text-right text-[#f8f4e3] font-medium">
                    1,500,000원
                  </td>
                </tr>
                <tr className="border-t border-[#333] bg-[#1a1c1a]/50">
                  <td className="px-6 py-4 text-[#f8f4e3]">
                    {t('week2')}
                  </td>
                  <td className="px-6 py-4 text-right text-[#f8f4e3] font-medium">
                    2,700,000원
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[#ccc5b9]/70">{t('priceNote')}</p>
        </section>

        {/* 포함 사항 섹션 */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-[#c9a227] mb-6 border-b border-[#333] pb-2">
            {t('includes')}
          </h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-[#ccc5b9]">
              <span className="w-1.5 h-1.5 bg-[#c9a227] rounded-full" />
              {t('includeItem1')}
            </li>
            <li className="flex items-center gap-3 text-[#ccc5b9]">
              <span className="w-1.5 h-1.5 bg-[#c9a227] rounded-full" />
              {t('includeItem2')}
            </li>
            <li className="flex items-center gap-3 text-[#ccc5b9]">
              <span className="w-1.5 h-1.5 bg-[#c9a227] rounded-full" />
              {t('includeItem3')}
            </li>
            <li className="flex items-center gap-3 text-[#ccc5b9]">
              <span className="w-1.5 h-1.5 bg-[#c9a227] rounded-full" />
              {t('includeItem4')}
            </li>
            <li className="flex items-center gap-3 text-[#ccc5b9]">
              <span className="w-1.5 h-1.5 bg-[#c9a227] rounded-full" />
              {t('includeItem5')}
            </li>
          </ul>
        </section>

        {/* 주의 사항 섹션 */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-[#c9a227] mb-6 border-b border-[#333] pb-2">
            {t('caution')}
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-[#ccc5b9]">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
              {t('cautionItem1')}
            </li>
          </ul>
        </section>

        {/* 문의 섹션 */}
        <section>
          <h2 className="text-2xl font-serif text-[#c9a227] mb-6 border-b border-[#333] pb-2">
            {t('inquiryTitle')}
          </h2>
          <p className="text-[#ccc5b9] mb-4">{t('inquiryDesc')}</p>
          <p className="text-[#ccc5b9]">Tel. 02-723-3420</p>
        </section>
      </div>
    </div>
  );
}

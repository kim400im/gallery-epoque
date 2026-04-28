"use client";

import { Mail, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Navigation from '@/app/components/Navigation';

export default function PurchasePage() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');

  return (
    <div className="ge-page">
      <Navigation />
      <main className="ge-container ge-page-pad">
        <div className="mb-12 max-w-3xl">
          <p className="ge-kicker mb-4">Acquisition</p>
          <h1 className="ge-title">{t('purchaseInquiry')}</h1>
          <p className="ge-lead mt-5">
            {tc('comingSoon')}. 작품 구매 문의 화면은 디자인만 준비되어 있으며, 요청대로 아직 별도 API는 연결하지 않았습니다.
          </p>
        </div>

        <section className="ge-card grid gap-8 p-8 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="mb-4 font-[var(--font-display)] text-3xl font-light text-[var(--color-ink)]">Contact the gallery</h2>
            <p className="leading-7 text-[var(--color-fg-muted)]">
              관심 작품, 예산, 설치 공간 정보를 남겨 주시면 구매 상담 플로우가 준비되는 대로 연결할 수 있습니다.
            </p>
          </div>
          <div className="space-y-4">
            <a className="flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-[var(--color-primary)]" href="mailto:galleryepoque@naver.com">
              <Mail className="h-5 w-5" />
              galleryepoque@naver.com
            </a>
            <a className="flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-[var(--color-primary)]" href="tel:027233420">
              <Phone className="h-5 w-5" />
              02-723-3420
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

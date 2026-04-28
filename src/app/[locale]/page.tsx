"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from '../components/Navigation';
import HeroSlider, { SlideData, TransitionEffect } from '../components/HeroSlider';

const SLIDER_EFFECT: TransitionEffect = 'fade';

type Exhibition = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  startDate: string;
  endDate: string;
};

function formatDate(dateString: string, locale: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ExhibitionCard({ exhibition, index }: { exhibition: Exhibition; index: number }) {
  const locale = useLocale();
  const dateRange = `${formatDate(exhibition.startDate, locale)} - ${formatDate(exhibition.endDate, locale)}`;

  return (
    <Link href={`/exhibition/${exhibition.id}`} className="group block">
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        viewport={{ once: true }}
        className="ge-card overflow-hidden"
      >
        <div className="ge-art-mat">
          <div className="aspect-[4/5] overflow-hidden">
            <img src={exhibition.imageUrl} alt={exhibition.title} className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="p-6">
          <p className="mb-3 font-mono text-xs tracking-[0.04em] text-[var(--color-fg-muted)]">{dateRange}</p>
          <h3 className="font-[var(--font-display)] text-2xl font-normal italic leading-tight text-[var(--color-ink)]">
            {exhibition.title}
          </h3>
          {exhibition.description && (
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--color-fg-muted)]">{exhibition.description}</p>
          )}
        </div>
      </motion.article>
    </Link>
  );
}

function ExhibitionSection({
  kicker,
  title,
  exhibitions,
  link,
  loading,
}: {
  kicker: string;
  title: string;
  exhibitions: Exhibition[];
  link: string;
  loading: boolean;
}) {
  const tc = useTranslations('common');

  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-20 md:py-24">
      <div className="ge-container">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="ge-kicker mb-3">{kicker}</p>
            <h2 className="font-[var(--font-display)] text-4xl font-light leading-tight text-[var(--color-ink)] md:text-5xl">
              {title}
            </h2>
          </div>
          <Link href={link} className="ge-btn-secondary hidden sm:inline-flex">
            {tc('viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <p className="py-16 text-center text-[var(--color-fg-muted)]">{tc('loading')}</p>
        ) : exhibitions.length === 0 ? (
          <div className="border-y border-[var(--color-border)] py-16 text-center">
            <p className="ge-lead">{tc('comingSoon')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exhibitions.slice(0, 3).map((exhibition, index) => (
              <ExhibitionCard key={exhibition.id} exhibition={exhibition} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function GalleryLanding() {
  const t = useTranslations();
  const locale = useLocale();
  const [currentExhibitions, setCurrentExhibitions] = useState<Exhibition[]>([]);
  const [pastExhibitions, setPastExhibitions] = useState<Exhibition[]>([]);
  const [upcomingExhibitions, setUpcomingExhibitions] = useState<Exhibition[]>([]);
  const [homeSlides, setHomeSlides] = useState<SlideData[]>([]);
  const [featuredNotice, setFeaturedNotice] = useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeImages() {
      try {
        const response = await fetch('/api/home-images');
        if (response.ok) setHomeSlides(await response.json());
      } catch (error) {
        console.error('Failed to fetch home images:', error);
      }
    }

    async function fetchFeaturedNotice() {
      try {
        const response = await fetch('/api/notices/featured');
        if (response.ok) setFeaturedNotice(await response.json());
      } catch (error) {
        console.error('Failed to fetch featured notice:', error);
      }
    }

    fetchHomeImages();
    fetchFeaturedNotice();
  }, []);

  useEffect(() => {
    async function fetchExhibitions() {
      try {
        const response = await fetch('/api/exhibitions');
        if (!response.ok) return;

        const data: Exhibition[] = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const current: Exhibition[] = [];
        const past: Exhibition[] = [];
        const upcoming: Exhibition[] = [];

        data.forEach((exhibition) => {
          const startDate = new Date(exhibition.startDate);
          const endDate = new Date(exhibition.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);

          if (startDate > today) upcoming.push(exhibition);
          else if (endDate < today) past.push(exhibition);
          else current.push(exhibition);
        });

        past.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
        upcoming.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        setCurrentExhibitions(current);
        setPastExhibitions(past);
        setUpcomingExhibitions(upcoming);
      } catch (error) {
        console.error('Failed to fetch exhibitions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExhibitions();
  }, []);

  const primaryExhibition = currentExhibitions[0] || upcomingExhibitions[0];

  return (
    <div className="ge-page">
      <Navigation />

      <section className="relative min-h-[92vh] overflow-hidden bg-[var(--color-green-900)]">
        <div className="absolute inset-0">
          <HeroSlider
            slides={homeSlides}
            effect={SLIDER_EFFECT}
            autoPlay
            interval={5000}
            showArrows={false}
            showDots
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(14,45,26,0.88)] via-[rgba(14,45,26,0.54)] to-[rgba(14,45,26,0.12)]" />

        <div className="ge-container relative z-10 flex min-h-[92vh] items-center pb-20 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="ge-kicker mb-5">{t('home.subtitle')}</p>
            <h1 className="font-[var(--font-display)] text-[clamp(54px,10vw,116px)] font-light leading-[0.96] text-white">
              {t('home.title')} <span className="italic text-[var(--color-gold)]">{t('home.titleHighlight')}</span>
            </h1>
            <p className="mt-8 max-w-xl font-[var(--font-display)] text-2xl font-light italic leading-relaxed text-white/70">
              Curated with intention. Available for your walls.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/book" className="ge-btn bg-white text-[var(--color-primary)] hover:bg-[var(--color-warm-gray-50)]">
                {t('home.cta')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {featuredNotice && (
                <Link href={`/notice/${featuredNotice.id}`} className="ge-btn-secondary border-white/50 text-white hover:bg-white/10">
                  {t('home.callForArtists')}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {primaryExhibition && (
        <section className="bg-[var(--color-green-800)] py-16 text-white">
          <div className="ge-container grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="ge-badge mb-5">{currentExhibitions[0] ? 'Now showing' : 'Upcoming'}</span>
              <h2 className="font-[var(--font-display)] text-4xl font-light leading-tight md:text-6xl">{primaryExhibition.title}</h2>
              <p className="mt-4 font-mono text-xs text-white/55">
                {formatDate(primaryExhibition.startDate, locale)} - {formatDate(primaryExhibition.endDate, locale)}
              </p>
            </div>
            <Link href={`/exhibition/${primaryExhibition.id}`} className="ge-btn bg-white text-[var(--color-primary)] hover:bg-[var(--color-warm-gray-50)]">
              View Exhibition
            </Link>
          </div>
        </section>
      )}

      <ExhibitionSection kicker="Programme" title={t('home.currentExhibition')} exhibitions={currentExhibitions} link="/exhibition/current" loading={loading} />
      <ExhibitionSection kicker="Next" title={t('home.upcomingExhibition')} exhibitions={upcomingExhibitions} link="/exhibition/upcoming" loading={loading} />
      <ExhibitionSection kicker="Archive" title={t('home.pastExhibition')} exhibitions={pastExhibitions} link="/exhibition/past" loading={loading} />

      <section className="bg-[var(--color-green-800)] py-24 text-white">
        <div className="ge-container grid gap-12 md:grid-cols-[1fr_0.9fr] md:items-center">
          <div>
            <p className="ge-kicker mb-4">Our Story</p>
            <h2 className="font-[var(--font-display)] text-5xl font-light leading-tight">
              A refined gallery for contemporary work.
            </h2>
            <p className="mt-6 max-w-xl font-[var(--font-display)] text-xl font-light italic leading-relaxed text-white/65">
              We introduce exhibitions, artists, and collectable works with a calm, intentional point of view.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['10+', 'Exhibitions'],
              ['2F', 'Gallery space'],
              ['2025', 'Seoul'],
              ['100%', 'Curated'],
            ].map(([value, label]) => (
              <div key={label} className="border border-white/10 bg-white/[0.06] p-6">
                <div className="font-[var(--font-display)] text-4xl font-light">{value}</div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/45">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] bg-white py-14">
        <div className="ge-container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <img src="/logo.svg" alt="Gallery Epoque" className="h-10 w-auto" />
          <div className="text-sm text-[var(--color-fg-muted)] md:text-right">
            <p>{t('home.footerAddress')}</p>
            <p className="mt-1">Tel. 02-723-3420 | galleryepoque@naver.com</p>
            <p className="mt-5 font-mono text-xs text-[var(--color-fg-faint)]">{t('home.footerCopyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

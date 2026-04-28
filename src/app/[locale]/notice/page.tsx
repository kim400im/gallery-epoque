"use client";

import { useEffect, useState } from 'react';
import { Paperclip, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from '@/app/components/Navigation';

type NoticeAttachment = {
  id: string;
  fileName: string;
};

type Notice = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  attachments: NoticeAttachment[];
};

export default function NoticePage() {
  const t = useTranslations('notice');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotices() {
      setLoading(true);
      try {
        const res = await fetch(`/api/notices?page=${page}`);
        if (res.ok) {
          const data = await res.json();
          setNotices(data.notices);
          setTotalPages(data.totalPages);
          setTotal(data.total);
        }
      } catch (err) {
        console.error('Failed to fetch notices:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotices();
  }, [page]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  const getRowNumber = (index: number) => total - (page - 1) * 10 - index;

  return (
    <div className="ge-page">
      <Navigation />
      <main className="ge-container ge-page-pad max-w-5xl">
        <div className="mb-12">
          <p className="ge-kicker mb-4">From the Gallery</p>
          <h1 className="ge-title">{t('pageTitle')}</h1>
        </div>

        {loading ? (
          <p className="border-y border-[var(--color-border)] py-16 text-center text-[var(--color-fg-muted)]">{tc('loading')}</p>
        ) : notices.length === 0 ? (
          <p className="ge-lead border-y border-[var(--color-border)] py-16 text-center">{t('noNotices')}</p>
        ) : (
          <>
            <div className="overflow-hidden border-y border-[var(--color-border)] bg-white">
              {notices.map((notice, index) => (
                <div key={notice.id} className="grid grid-cols-[1fr_auto] gap-4 border-b border-[var(--color-border)] last:border-b-0 md:grid-cols-[72px_1fr_140px]">
                  <span className="hidden py-5 text-center font-mono text-xs text-[var(--color-fg-faint)] md:block">
                    {getRowNumber(index)}
                  </span>
                  <Link href={`/notice/${notice.id}`} className="flex min-w-0 items-center gap-2 py-5 pl-5 md:pl-0">
                    <span className="truncate text-[var(--color-ink)] transition-colors hover:text-[var(--color-primary)]">{notice.title}</span>
                    {notice.attachments.length > 0 && <Paperclip className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />}
                  </Link>
                  <span className="whitespace-nowrap py-5 pr-5 text-right font-mono text-xs text-[var(--color-fg-muted)]">
                    {formatDate(notice.createdAt)}
                  </span>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="ge-btn-secondary px-3 disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                  {t('prev')}
                </button>
                <span className="font-mono text-sm text-[var(--color-fg-muted)]">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="ge-btn-secondary px-3 disabled:opacity-30">
                  {t('next')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

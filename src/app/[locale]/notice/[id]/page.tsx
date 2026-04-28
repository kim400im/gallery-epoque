"use client";

import { use, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Eye, Paperclip } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from '@/app/components/Navigation';

type NoticeAttachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
};

type Notice = {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  attachments: NoticeAttachment[];
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NoticeDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params);
  const t = useTranslations('notice');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewCounted = useRef(false);

  useEffect(() => {
    async function fetchNotice() {
      try {
        const res = await fetch(`/api/notices/${id}`);
        if (!res.ok) {
          setError(t('notFound'));
          return;
        }
        setNotice(await res.json());
        if (!viewCounted.current) {
          viewCounted.current = true;
          fetch(`/api/notices/${id}/view`, { method: 'POST' }).catch(() => {});
        }
      } catch (err) {
        console.error('Failed to fetch notice:', err);
        setError(t('notFound'));
      } finally {
        setLoading(false);
      }
    }

    fetchNotice();
  }, [id, t]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="ge-page">
      <Navigation />
      <main className="ge-container ge-page-pad max-w-4xl">
        <Link href="/notice" className="mb-10 inline-flex items-center gap-2 text-[var(--color-primary)] transition-colors hover:text-[var(--color-gold)]">
          <ArrowLeft className="h-5 w-5" />
          <span>{t('backToList')}</span>
        </Link>

        {loading ? (
          <p className="text-[var(--color-fg-muted)]">{tc('loading')}</p>
        ) : error || !notice ? (
          <p className="text-lg text-[var(--color-fg-muted)]">{error || t('notFound')}</p>
        ) : (
          <article className="ge-card p-6 md:p-10">
            <div className="mb-8 border-b border-[var(--color-border)] pb-8">
              <p className="ge-kicker mb-4">Notice</p>
              <h1 className="font-[var(--font-display)] text-4xl font-light leading-tight text-[var(--color-ink)] md:text-5xl">
                {notice.title}
              </h1>
              <div className="mt-5 flex items-center gap-4 font-mono text-xs text-[var(--color-fg-muted)]">
                <span>{formatDate(notice.createdAt)}</span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {notice.viewCount.toLocaleString()}
                </span>
              </div>
            </div>

            {notice.attachments.length > 0 && (
              <div className="mb-8 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5">
                <p className="ge-kicker mb-3 flex items-center gap-2">
                  <Paperclip className="h-3.5 w-3.5" />
                  {t('attachments')}
                </p>
                <ul className="space-y-2">
                  {notice.attachments.map((att) => (
                    <li key={att.id}>
                      <a href={att.fileUrl} download={att.fileName} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--color-primary)] underline underline-offset-4">
                        <Download className="h-4 w-4" />
                        <span>{att.fileName}</span>
                        {att.fileSize && <span className="text-xs text-[var(--color-fg-muted)]">({formatBytes(att.fileSize)})</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="whitespace-pre-wrap leading-8 text-[var(--color-fg-muted)]">{notice.content}</div>
          </article>
        )}
      </main>
    </div>
  );
}

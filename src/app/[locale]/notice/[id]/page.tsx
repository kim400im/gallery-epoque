"use client";

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Paperclip, Download } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
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
  createdAt: string;
  attachments: NoticeAttachment[];
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations('notice');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(`/api/notices/${id}`);
        if (!res.ok) {
          setError(t('notFound'));
          return;
        }
        const data = await res.json();
        setNotice(data);
      } catch (err) {
        console.error('Failed to fetch notice:', err);
        setError(t('notFound'));
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111311]">
        <Navigation />
        <div className="pt-32 px-8 md:px-24">
          <p className="text-[#ccc5b9]">{tc('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-[#111311]">
        <Navigation />
        <div className="pt-32 px-8 md:px-24">
          <Link
            href="/notice"
            className="inline-flex items-center gap-2 text-[#7c8d4c] hover:text-[#d4af37] transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToList')}</span>
          </Link>
          <p className="text-[#ccc5b9] text-lg">{error || t('notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111311]">
      <Navigation />

      <div className="pt-32 pb-20 px-8 md:px-24 max-w-4xl">
        <Link
          href="/notice"
          className="inline-flex items-center gap-2 text-[#7c8d4c] hover:text-[#d4af37] transition-colors mb-10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('backToList')}</span>
        </Link>

        <div className="border-b border-[#7c8d4c]/20 pb-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-4 leading-snug">
            {notice.title}
          </h1>
          <p className="text-sm text-[#ccc5b9]">{formatDate(notice.createdAt)}</p>
        </div>

        {notice.attachments.length > 0 && (
          <div className="mb-8 p-4 bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg">
            <p className="text-xs uppercase tracking-widest text-[#7c8d4c] mb-3 flex items-center gap-2">
              <Paperclip className="w-3.5 h-3.5" />
              {t('attachments')}
            </p>
            <ul className="space-y-2">
              {notice.attachments.map((att) => (
                <li key={att.id}>
                  <a
                    href={att.fileUrl}
                    download={att.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#f8f4e3] hover:text-[#d4af37] transition-colors group"
                  >
                    <Download className="w-4 h-4 text-[#7c8d4c] group-hover:text-[#d4af37] flex-shrink-0" />
                    <span className="text-sm underline underline-offset-2 decoration-[#7c8d4c]/40 group-hover:decoration-[#d4af37]">
                      {att.fileName}
                    </span>
                    {att.fileSize && (
                      <span className="text-xs text-[#ccc5b9]/60 no-underline">
                        ({formatBytes(att.fileSize)})
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-[#ccc5b9] text-base leading-relaxed whitespace-pre-wrap">
          {notice.content}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Paperclip, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const fetchNotices = async () => {
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
    };
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
    <div className="min-h-screen bg-[#111311]">
      <Navigation />

      <div className="pt-32 pb-20 px-6 md:px-24 max-w-5xl">
        <h1 className="text-4xl md:text-6xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-12">
          {t('pageTitle')}
        </h1>

        {loading ? (
          <p className="text-[#ccc5b9]">{tc('loading')}</p>
        ) : notices.length === 0 ? (
          <p className="text-[#ccc5b9] text-lg py-16 text-center border-t border-b border-[#7c8d4c]/20">
            {t('noNotices')}
          </p>
        ) : (
          <>
            <div className="border-t border-[#7c8d4c]/30">
              {notices.map((notice, index) => (
                <div
                  key={notice.id}
                  className="flex items-center gap-4 border-b border-[#7c8d4c]/10 hover:bg-[#7c8d4c]/5 transition-colors"
                >
                  <span className="hidden md:block w-14 shrink-0 text-center text-[#ccc5b9]/50 text-sm tabular-nums">
                    {getRowNumber(index)}
                  </span>

                  <Link
                    href={`/notice/${notice.id}`}
                    className="flex-1 flex items-center gap-2 py-4 pr-4 min-w-0"
                  >
                    <span className="text-[#f8f4e3] hover:text-[#d4af37] transition-colors text-sm md:text-base truncate">
                      {notice.title}
                    </span>
                    {notice.attachments.length > 0 && (
                      <Paperclip className="w-3.5 h-3.5 text-[#7c8d4c] shrink-0" />
                    )}
                  </Link>

                  <span className="shrink-0 text-[#ccc5b9]/60 text-xs md:text-sm tabular-nums whitespace-nowrap pr-4 md:pr-0">
                    {formatDate(notice.createdAt)}
                  </span>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-2 text-[#ccc5b9] hover:text-[#f8f4e3] transition-colors disabled:opacity-30 text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('prev')}
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded text-sm transition-colors ${
                        p === page
                          ? 'bg-[#7c8d4c] text-[#f8f4e3]'
                          : 'text-[#ccc5b9] hover:text-[#f8f4e3]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-[#ccc5b9] hover:text-[#f8f4e3] transition-colors disabled:opacity-30 text-sm"
                >
                  {t('next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

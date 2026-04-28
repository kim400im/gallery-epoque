import type { Metadata } from 'next';
import { getExhibition } from '@/lib/pocketbase-data';
import ExhibitionDetailClient from './ExhibitionDetailClient';

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const exhibition = await getExhibition(id).catch(() => null);

  if (!exhibition) {
    return {
      title: 'Exhibition Not Found',
    };
  }

  const title = exhibition.title;
  const description = exhibition.description || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [
        {
          url: exhibition.imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [exhibition.imageUrl],
    },
  };
}

export default function ExhibitionDetailPage({ params }: Props) {
  return <ExhibitionDetailClient params={params} />;
}

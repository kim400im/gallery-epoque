import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://galleryepoque.org'),
  title: {
    default: '갤러리 에포크 | Gallery Époque',
    template: '%s | 갤러리 에포크',
  },
  description: '서울 삼청동 갤러리 에포크 - 생각을 뛰어넘다, 시대를 뛰어넘다. 현대미술 전시, 신진 작가 소개, 갤러리 대관 서비스를 제공합니다.',
  keywords: [
    '갤러리 에포크',
    'Gallery Epoque',
    '삼청동 갤러리',
    '서울 갤러리',
    '현대미술',
    '미술 전시',
    '갤러리 대관',
    '전시 공간',
    '아트 갤러리',
    '신진 작가',
  ],
  authors: [{ name: 'Gallery Epoque', url: 'https://galleryepoque.org' }],
  creator: 'Gallery Epoque',
  publisher: 'Gallery Epoque',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
    url: 'https://galleryepoque.org',
    siteName: '갤러리 에포크',
    title: '갤러리 에포크 | Gallery Epoque',
    description: '서울 삼청동 갤러리 에포크 - 생각을 뛰어넘다, 시대를 뛰어넘다',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '갤러리 에포크 - Gallery Epoque',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '갤러리 에포크 | Gallery Epoque',
    description: '서울 삼청동 갤러리 에포크 - 생각을 뛰어넘다, 시대를 뛰어넘다',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Google Search Console 인증 코드 (나중에 발급받아서 입력)
    // google: 'your-google-verification-code',
    // 네이버 웹마스터 도구 인증 코드 (나중에 발급받아서 입력)
    // other: {
    //   'naver-site-verification': 'your-naver-verification-code',
    // },
  },
  alternates: {
    canonical: 'https://galleryepoque.org',
    languages: {
      'ko-KR': 'https://galleryepoque.org/ko',
      'en-US': 'https://galleryepoque.org/en',
    },
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

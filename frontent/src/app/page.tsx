import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Zevora | Premium E-Commerce — Shop Electronics, Audio & Fitness',
  description: 'Shop trending electronics, audio gear, accessories, and fitness products on Zevora. Free shipping on orders over $100. AI-powered recommendations.',
  keywords: 'zevora, e-commerce, electronics, headphones, fitness, accessories, online shopping, next.js',
  openGraph: {
    title: 'Zevora | Premium E-Commerce',
    description: 'Discover premium electronics, audio, accessories and fitness products. Fast delivery, AI shopping assistant, and hassle-free returns.',
    url: 'https://zevora.shop',
    siteName: 'Zevora',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1200&h=630',
        width: 1200,
        height: 630,
        alt: 'Zevora premium e-commerce store',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zevora | Premium E-Commerce',
    description: 'Shop trending electronics, audio gear, accessories, and fitness products. Free shipping on orders over $100.',
    images: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1200&h=630'],
  },
};

export default function Home() {
  return <HomeClient />;
}

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#121417',
};

export const metadata: Metadata = {
  title: 'Navidad David | Árboles y Momentos que Unen a tu Familia',
  description: 'Diseño, confort y magia artesanal para celebrar la Navidad más inolvidable junto a quienes amas en Colombia.',
  icons: {
    icon: [
      { url: '/Logo_david_original.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/Logo_david_original.png',
    apple: [
      { url: '/Logo_david_original.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="icon" href="/Logo_david_original.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Logo_david_original.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#121417] text-white selection:bg-[#E5B869] selection:text-black">
        {children}
      </body>
    </html>
  );
}

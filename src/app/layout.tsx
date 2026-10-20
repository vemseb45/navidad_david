import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Navidad David - Artisan Christmas Co. | Árboles y Decoración Navideña',
  description: 'Colección exclusiva de árboles de Navidad tradicionales, tecnología en fibra óptica y adornos artesanales. Envíos a toda Colombia o recoge tu arbolito en tienda.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#fbf9f5] text-[#1b1c1a]">
        {children}
      </body>
    </html>
  );
}

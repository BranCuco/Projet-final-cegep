import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import '@/styles/scss/globals.scss';
import Header from '@/app/components/common/Header';
import Footer from '@/app/components/common/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'TechGear Shop - Boutique en Ligne',
  description: 'Achetez les meilleurs produits technologiques chez TechGear Shop',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text y='32' font-size='32'>⚙️</text></svg>" />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

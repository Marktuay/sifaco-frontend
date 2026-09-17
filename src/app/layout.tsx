import './globals.css';
import React from 'react';
import Providers from './providers';
import Navbar from '@/components/navbar';

export const metadata = {
  title: 'SIFACO - Sistema de Facturación, Cartera y Contabilidad DGI',
  description: 'Sistema de Facturación Preimpresa, Cartera CxC/CxP y Contabilidad para Eventos Corporativos (Nicaragua DGI)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
          <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-400">
            SIFACO &copy; {new Date().getFullYear()}
          </footer>
        </Providers>
      </body>
    </html>
  );
}

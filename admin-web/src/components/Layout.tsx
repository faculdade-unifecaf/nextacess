import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content">
        <Header title={title} subtitle={subtitle} />
        <main className="page-body page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}

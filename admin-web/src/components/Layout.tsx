import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chat from './Chat';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content">
        <Header title={title} subtitle={subtitle} onOpenChat={() => setChatOpen(true)} />
        <main className="page-body page-enter">
          {children}
        </main>
      </div>
      <Chat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Player } from '../player/Player';
import { QueueDrawer } from '../player/QueueDrawer';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-text flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header />
        
        <main className="flex-1 pb-[120px] lg:pb-[100px]">
          {children}
        </main>
      </div>

      <Player />
      <QueueDrawer />
      <MobileNav />
    </div>
  );
}

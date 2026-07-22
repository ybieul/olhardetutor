import { Outlet } from 'react-router-dom';

import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-svh max-w-content flex-col">
      <Header />
      <Nav />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}

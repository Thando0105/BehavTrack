'use client';

import { useFirebase, useUser } from '@/firebase';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isUserLoading, user } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      redirect('/login');
    }
  }, [isUserLoading, user]);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

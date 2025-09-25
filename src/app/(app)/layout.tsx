import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { Suspense } from 'react';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <Suspense>{children}</Suspense>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}

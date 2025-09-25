'use client';
import { School, LayoutDashboard, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useMemo } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import type { User as UserData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, auth, firestore } = useFirebase();
  const router = useRouter();

  const userRef = useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  const role = userData?.role;
  const getHref = (path: string) => `${path}`;

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/students', label: 'Students', icon: Users, disabled: true }, // Disabled until data is moved to Firestore
    { href: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
    { href: '/settings', label: 'Settings', icon: Settings },
  ].filter(item => !(item.adminOnly && role !== 'admin'));

   const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <School className="h-8 w-8 text-primary" />
          <h2 className="font-headline text-2xl font-semibold">BehavTrack</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.label}>
              <Link href={getHref(item.href)} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild={item.disabled}
                  disabled={item.disabled}
                  isActive={pathname === item.href}
                  className={cn(pathname === item.href && "font-semibold")}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        {isUserDataLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className='overflow-hidden space-y-1'>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-28" />
              </div>
            </div>
        ) : (
          <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userData?.avatarUrl} alt={userData?.name ?? ''} data-ai-hint="person professional"/>
                <AvatarFallback>{userData?.name?.charAt(0) ?? user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className='overflow-hidden'>
                  <p className="font-medium truncate">{userData?.name ?? 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <LogOut onClick={handleSignOut} className="ml-auto h-5 w-5 shrink-0 text-muted-foreground cursor-pointer" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

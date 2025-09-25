'use client';
import { School, LayoutDashboard, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

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
import type { User, UserRole } from '@/lib/types';
import { users } from '@/lib/data';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as UserRole) || 'teacher';
  const user: User = users[role];

  const getHref = (path: string) => `${path}?role=${role}`;

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
    { href: '/settings', label: 'Settings', icon: Settings },
  ].filter(item => !(item.adminOnly && role !== 'admin'));

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
              <Link href={getHref(item.href)}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className={cn(pathname === item.href && "font-semibold")}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person professional"/>
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='overflow-hidden'>
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <LogOut className="ml-auto h-5 w-5 shrink-0 text-muted-foreground cursor-pointer" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

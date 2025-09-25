'use client';

import { Bell, LogOut, PanelLeft, Settings, User as UserIcon } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useMemo } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import type { User as UserData } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { toggleSidebar } = useSidebar();
  const { user, auth, firestore } = useFirebase();
  const router = useRouter();

  const userRef = useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const userInitial = userData?.name ? userData.name.charAt(0) : user?.email?.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={toggleSidebar}
      >
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <h1 className="font-headline text-xl font-semibold md:text-2xl">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {isUserDataLoading ? (
                <Skeleton className="h-8 w-8 rounded-full" />
              ) : (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.avatarUrl} alt={userData?.name ?? ''} data-ai-hint="person professional"/>
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isUserDataLoading ? (
               <div className="p-2">
                 <Skeleton className="h-4 w-24 mb-2" />
                 <Skeleton className="h-3 w-32" />
               </div>
            ) : (
              <DropdownMenuLabel>
                <div className="font-medium">{userData?.name ?? 'User'}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

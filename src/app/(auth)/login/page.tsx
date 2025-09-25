import { School } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="mb-4 flex items-center gap-3 text-primary">
              <School className="h-8 w-8" />
              <h1 className="font-headline text-3xl font-semibold">BehavTrack</h1>
            </div>
            <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
            <CardDescription>Select your role to proceed to the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard?role=teacher">Login as Teacher</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full">
              <Link href="/dashboard?role=admin">Login as Admin</Link>
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              This is a simulated login for demonstration purposes.
              <br />
              No authentication is performed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

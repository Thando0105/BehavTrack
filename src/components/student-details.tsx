'use client';

import { useState, useTransition } from 'react';
import { Loader2, PlusCircle, Sparkles } from 'lucide-react';

import { getStudentSummary } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Incident, Student } from '@/lib/types';
import { IncidentLog } from './incident-log';
import { LogIncidentDialog } from './log-incident-dialog';
import type { GenerateWeeklyBehaviorSummaryOutput } from '@/ai/flows/generate-weekly-behavior-summary';
import { AppHeader } from './app-header';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface StudentDetailsProps {
  student: Student;
  initialIncidents: Incident[];
}

export function StudentDetails({ student, initialIncidents }: StudentDetailsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [summary, setSummary] = useState<GenerateWeeklyBehaviorSummaryOutput | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerateSummary = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('studentId', student.id);
      
      const result = await getStudentSummary(formData);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        setSummary(result);
        toast({
          title: 'Summary Generated',
          description: 'AI-powered behavior summary is ready.',
        });
      }
    });
  };

  const handleIncidentLogged = (newIncidentData: {
    severity: 'low' | 'medium' | 'high';
    description: string;
  }) => {
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      studentId: student.id,
      teacherId: 't-1', // Mocked teacher ID
      dateTime: new Date().toISOString(),
      ...newIncidentData,
    };
    setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
  };
  
  const role = searchParams.get('role');
  const getHref = (path: string) => `${path}?role=${role}`;


  return (
    <>
      <LogIncidentDialog
        student={student}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onIncidentLogged={handleIncidentLogged}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={getHref('/dashboard')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-headline text-xl font-semibold md:text-2xl">Student Profile</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint={student.imageHint} />
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="font-headline text-2xl">{student.name}</CardTitle>
                  <CardDescription>Grade {student.grade} &middot; Class {student.classId}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Log Incident
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGenerateSummary}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Summary
                </Button>
              </CardContent>
            </Card>

            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Weekly Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Behavior Summary</h4>
                    <p className="text-sm text-muted-foreground">{summary.summaryText}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Suggested Actions</h4>
                    <p className="text-sm text-muted-foreground">{summary.suggestedActions}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2">
            <IncidentLog incidents={incidents} />
          </div>
        </div>
      </main>
    </>
  );
}

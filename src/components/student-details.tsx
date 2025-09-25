'use client';

import { useState, useTransition, useMemo } from 'react';
import { Loader2, PlusCircle, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { getStudentSummary } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Incident, Student } from '@/lib/types';
import { IncidentLog } from './incident-log';
import { LogIncidentDialog } from './log-incident-dialog';
import type { GenerateWeeklyBehaviorSummaryOutput } from '@/ai/flows/generate-weekly-behavior-summary';
import { AppHeader } from './app-header';
import { useFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase/firestore/use-collection';

interface StudentDetailsProps {
  student: Student;
  initialIncidents: Incident[]; // This will now be fed from the real-time hook
}

export function StudentDetails({ student }: StudentDetailsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const [summary, setSummary] = useState<GenerateWeeklyBehaviorSummaryOutput | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Real-time incidents
  const incidentsQuery = useMemoFirebase(() => {
    if (!firestore || !student.id) return null;
    return query(collection(firestore, 'incidents'), where('studentId', '==', student.id));
  }, [firestore, student.id]);

  const { data: incidents, isLoading: areIncidentsLoading } = useCollection<Incident>(incidentsQuery);
  const sortedIncidents = useMemo(() => 
    (incidents || []).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
    [incidents]
  );


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

  const handleIncidentLogged = () => {
    // This function is now a no-op because the useCollection hook will automatically update the UI.
  };

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
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
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
            {areIncidentsLoading ? <div>Loading incidents...</div> : <IncidentLog incidents={sortedIncidents} />}
          </div>
        </div>
      </main>
    </>
  );
}

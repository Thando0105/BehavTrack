'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Student, Incident } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase';

const incidentSchema = z.object({
  severity: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select a severity level.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
});

interface LogIncidentDialogProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncidentLogged: (incident: Incident) => void;
}

export function LogIncidentDialog({
  student,
  open,
  onOpenChange,
  onIncidentLogged,
}: LogIncidentDialogProps) {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const form = useForm<z.infer<typeof incidentSchema>>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      severity: undefined,
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof incidentSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    const newIncident: Omit<Incident, 'id'> = {
      studentId: student.id,
      teacherId: user.uid,
      dateTime: new Date().toISOString(),
      severity: values.severity,
      description: values.description,
    };

    const incidentsCol = collection(firestore, 'incidents');
    await addDocumentNonBlocking(incidentsCol, newIncident);

    // No longer need onIncidentLogged for local state. This will be handled by real-time listener.
    toast({
      title: 'Incident Logged',
      description: `A new incident has been logged for ${student.name}.`,
    });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Log Incident for {student.name}</DialogTitle>
          <DialogDescription>
            Record a new behavior incident. Please be specific and objective.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a severity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the incident in detail..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Log Incident</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

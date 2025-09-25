'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
import type { Student } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
  onIncidentLogged: (incident: z.infer<typeof incidentSchema>) => void;
}

export function LogIncidentDialog({
  student,
  open,
  onOpenChange,
  onIncidentLogged,
}: LogIncidentDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof incidentSchema>>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      severity: undefined,
      description: '',
    },
  });

  function onSubmit(values: z.infer<typeof incidentSchema>) {
    onIncidentLogged(values);
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

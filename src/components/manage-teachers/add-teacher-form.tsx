'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const addTeacherSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  classId: z.string().min(1, { message: 'Class ID is required.' }),
});

type AddTeacherFormValues = z.infer<typeof addTeacherSchema>;

export function AddTeacherForm() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const form = useForm<AddTeacherFormValues>({
    resolver: zodResolver(addTeacherSchema),
    defaultValues: {
      email: '',
      classId: '',
    },
  });

  const onSubmit = (data: AddTeacherFormValues) => {
    if (!firestore) return;
    // We can't create a user with password from the client-side for security reasons.
    // Instead, we'll create a user profile. The teacher will need to sign up with this email.
    const userDocRef = doc(firestore, 'users', data.email); // Use email as temporary ID

    const newTeacher = {
      email: data.email,
      role: 'teacher',
      classId: data.classId,
      status: 'pending'
    };

    setDocumentNonBlocking(userDocRef, newTeacher, { merge: true });

    toast({
      title: 'Teacher Pre-registered',
      description: `${data.email} can now sign up to access their teacher account.`,
    });

    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Add New Teacher</CardTitle>
        <CardDescription>
          Enter the teacher's email and assigned class. They will need to complete registration by signing up with this email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="teacher@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., C101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Teacher
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

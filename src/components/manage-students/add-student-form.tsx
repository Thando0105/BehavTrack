'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { Student } from '@/lib/types';


const addStudentSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  grade: z.string().min(1, { message: 'Grade is required.' }),
  classId: z.string().min(1, { message: 'Class ID is required.' }),
});

type AddStudentFormValues = z.infer<typeof addStudentSchema>;

export function AddStudentForm() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: '',
      grade: '',
      classId: '',
    },
  });

  const onSubmit = (data: AddStudentFormValues) => {
    if (!firestore) return;
    
    const studentId = uuidv4();
    const studentDocRef = doc(firestore, 'students', studentId);

    const newStudent: Student = {
      id: studentId,
      name: data.name,
      grade: data.grade,
      classId: data.classId,
      // Using a generic placeholder, can be enhanced later
      avatarUrl: `https://picsum.photos/seed/${studentId}/100/100`,
      imageHint: 'person student'
    };

    setDocumentNonBlocking(studentDocRef, newStudent);

    toast({
      title: 'Student Added',
      description: `${data.name} has been added to the system.`,
    });

    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Add New Student</CardTitle>
        <CardDescription>
          Enter the student's details to add them to the roster.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 4" {...field} />
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
              Add Student
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { School, Loader2 } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
  AuthError,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase, useFirestore } from '@/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = loginSchema.extend({
  role: z.enum(['teacher', 'admin'], { required_error: 'You must select a role.' }),
  classId: z.string().optional(),
}).refine(data => data.role === 'admin' || (data.role === 'teacher' && data.classId), {
  message: "Class ID is required for teachers.",
  path: ["classId"],
});


type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });
  
  const handleRoleChange = (value: "teacher" | "admin") => {
    setIsTeacher(value === "teacher");
    signupForm.setValue("role", value);
  };

  const handleAuthError = (err: AuthError) => {
    switch (err.code) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please log in.';
      case 'auth/weak-password':
        return 'Password is too weak. It must be at least 6 characters long.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      
      const newUser = {
        uid: user.uid,
        email: user.email,
        role: data.role,
        ...(data.role === 'teacher' && { classId: data.classId }),
      };

      setDocumentNonBlocking(userDocRef, newUser, { merge: true });

      toast({
        title: 'Account Created',
        description: 'Welcome to BehavTrack! You are now being redirected.',
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="mb-4 flex items-center gap-3 text-primary">
              <School className="h-8 w-8" />
              <h1 className="font-headline text-3xl font-semibold">BehavTrack</h1>
            </div>
            <CardTitle className="font-headline text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in or create an account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="m@example.com" {...loginForm.register('email')} />
                    {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" {...loginForm.register('password')} />
                    {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
                  </div>
                  {error && <p className="text-center text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="m@example.com" {...signupForm.register('email')} />
                     {signupForm.formState.errors.email && <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" {...signupForm.register('password')} />
                    {signupForm.formState.errors.password && <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <RadioGroup onValueChange={handleRoleChange} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="r-teacher" />
                        <Label htmlFor="r-teacher">Teacher</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="r-admin" />
                        <Label htmlFor="r-admin">Admin</Label>
                      </div>
                    </RadioGroup>
                    {signupForm.formState.errors.role && <p className="text-sm text-destructive">{signupForm.formState.errors.role.message}</p>}
                  </div>

                  {isTeacher && (
                    <div className="space-y-2">
                      <Label htmlFor="classId">Class ID</Label>
                      <Input id="classId" placeholder="e.g., C101" {...signupForm.register('classId')} />
                      {signupForm.formState.errors.classId && <p className="text-sm text-destructive">{signupForm.formState.errors.classId.message}</p>}
                    </div>
                  )}

                  {error && <p className="text-center text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

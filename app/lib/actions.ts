'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';

// Define input validation scheme matching our login rules
const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
}

/**
 * Server Action to securely authenticate users.
 * This is invoked by your client-side form using action or transition fields.
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    // 1. Convert form data fields and validate schemas securely
    const rawFields = Object.fromEntries(formData.entries());
    const validatedFields = LoginSchema.safeParse(rawFields);

    if (!validatedFields.success) {
      return 'Invalid email or password structure.';
    }

    const { email, password } = validatedFields.data;

    // 2. Invoke NextAuth's underlying signIn procedure
    await signIn('credentials', {
      email,
      password,
      // Setting redirect to true lets our middleware route guards automatically 
      // handle routing users to /dashboard or /my-profile based on roles.
      redirect: true, 
    });

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials. Please check your email and password.';
        default:
          return 'Something went wrong. Please try again.';
      }
    }
    
    // CRITICAL: Next.js handling redirects relies on throwing native internal routing exceptions. 
    // We must re-throw this error so Next.js actually redirects the user instead of catching it as an error!
    throw error;
  }
}
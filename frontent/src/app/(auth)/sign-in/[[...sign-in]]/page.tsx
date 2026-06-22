import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 py-12 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md flex justify-center">
        <SignIn 
          appearance={{
            elements: {
              card: "shadow-md rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900",
              headerTitle: "text-zinc-900 dark:text-zinc-100",
              headerSubtitle: "text-zinc-500 dark:text-zinc-400",
              socialButtonsBlockButton: "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:text-zinc-300",
              formButtonPrimary: "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950",
              footerActionLink: "text-zinc-900 hover:text-zinc-800 dark:text-zinc-100 dark:hover:text-zinc-200",
              formFieldLabel: "text-zinc-700 dark:text-zinc-300",
              formFieldInput: "bg-transparent border-zinc-200 dark:border-zinc-800 dark:text-zinc-100",
              identityPreviewText: "dark:text-zinc-300",
              identityPreviewEditButton: "text-zinc-900 dark:text-zinc-100",
            }
          }}
        />
      </div>
    </div>
  );
}

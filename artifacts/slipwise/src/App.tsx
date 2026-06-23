import React from "react";
import { ClerkProvider, SignIn, SignUp, useClerk, useAuth } from '@clerk/react';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PreferencesProvider } from "@/contexts/PreferencesContext";

import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import ExpenseDetail from "@/pages/ExpenseDetail";
import NewExpense from "@/pages/NewExpense";
import EditExpense from "@/pages/EditExpense";
import Reports from "@/pages/Reports";
import Budgets from "@/pages/Budgets";
import Goals from "@/pages/Goals";
import Settings from "@/pages/Settings";
import Premium from "@/pages/Premium";
import Categories from "@/pages/Categories";
import Scanner from "@/pages/Scanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  }
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "hsl(221 83% 53%)",
    colorBackground: "hsl(225 50% 14%)",
    colorInput: "hsl(225 30% 20%)",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = React.useRef<string | null | undefined>(undefined);

  React.useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function AuthTokenSetter() {
  const { getToken } = useAuth();
  React.useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);
  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <AuthTokenSetter />
        <Switch>
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          
          <Route path="/">
            <AppLayout><Dashboard /></AppLayout>
          </Route>
          <Route path="/expenses">
            <AppLayout><Expenses /></AppLayout>
          </Route>
          <Route path="/expenses/new">
            <AppLayout><NewExpense /></AppLayout>
          </Route>
          <Route path="/expenses/:id/edit">
            <AppLayout><EditExpense /></AppLayout>
          </Route>
          <Route path="/expenses/:id">
            <AppLayout><ExpenseDetail /></AppLayout>
          </Route>
          <Route path="/scan">
            <AppLayout><Scanner /></AppLayout>
          </Route>
          <Route path="/reports">
            <AppLayout><Reports /></AppLayout>
          </Route>
          <Route path="/budgets">
            <AppLayout><Budgets /></AppLayout>
          </Route>
          <Route path="/goals">
            <AppLayout><Goals /></AppLayout>
          </Route>
          <Route path="/settings">
            <AppLayout><Settings /></AppLayout>
          </Route>
          <Route path="/premium">
            <AppLayout><Premium /></AppLayout>
          </Route>
          <Route path="/categories">
            <AppLayout><Categories /></AppLayout>
          </Route>
          <Route>
            <AppLayout>
              <div className="p-4 text-center mt-20">
                <h2 className="text-xl font-bold">Not found</h2>
              </div>
            </AppLayout>
          </Route>
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="slipwise-theme">
      <PreferencesProvider>
        <WouterRouter base={basePath}>
          <TooltipProvider>
            <ClerkProviderWithRoutes />
            <Toaster />
          </TooltipProvider>
        </WouterRouter>
      </PreferencesProvider>
    </ThemeProvider>
  );
}

export default App;
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { Toaster } from './components/ui/sonner';
import { initializeTheme } from './hooks/use-appearance';
import { NuqsAdapter } from './lib/nuqs-adapter';
declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const queryClient = new QueryClient();
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <NuqsAdapter>
                <QueryClientProvider client={queryClient}>
                    <App {...props} />
                    <Toaster />
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </NuqsAdapter>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

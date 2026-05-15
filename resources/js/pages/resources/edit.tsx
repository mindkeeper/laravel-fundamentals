import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useResource, useUpdateResource } from '@/hooks/api/use-resource';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Resources', href: '/resources' },
    { title: 'Edit', href: '#' },
];

function EditSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-9 w-24" />
            <div className="rounded-xl border p-8">
                <Skeleton className="mb-6 h-7 w-1/3" />
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface Props {
    id: string;
}

export default function ResourceEdit({ id }: Props) {
    const { data, isLoading, isError } = useResource(id);
    const { mutate, isPending, error } = useUpdateResource(id);
    const resource = data?.data;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (resource) {
            setTitle(resource.title);
            setDescription(resource.description);
        }
    }, [resource]);

    const errors = (error as Record<string, string> | null) ?? {};

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        mutate(
            { title, description },
            {
                onSuccess: () => router.visit(route('resources.show', id)),
                onError: (err) => {
                    if ((err as Error).message === 'forbidden') {
                        toast.warning('You are not allowed to edit this resource.');
                    }
                },
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={resource ? `Edit: ${resource.title}` : 'Edit Resource'} />

            <div className="flex flex-col gap-6 p-6">
                {isLoading && <EditSkeleton />}

                {isError && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-muted-foreground text-lg font-medium">Resource not found.</p>
                        <Button variant="link" className="mt-2" nativeButton={false} render={<Link href={route('resources')} />}>
                            Back to Resources
                        </Button>
                    </div>
                )}

                {!isLoading && resource && (
                    <>
                        <div>
                            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={route('resources.show', id)} />}>
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </div>

                        <div className="rounded-xl border bg-card p-8 shadow-sm">
                            <h1 className="mb-6 text-xl font-semibold tracking-tight">Edit Resource</h1>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Resource title"
                                        aria-invalid={!!errors.title}
                                    />
                                    {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Resource description"
                                        rows={6}
                                        aria-invalid={!!errors.description}
                                    />
                                    {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        nativeButton={false} render={<Link href={route('resources.show', id)} />}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

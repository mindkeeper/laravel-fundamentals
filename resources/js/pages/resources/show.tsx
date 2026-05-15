import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteResource, useResource } from '@/hooks/api/use-resource';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Pencil, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Resources', href: '/resources' },
    { title: 'Detail', href: '#' },
];

function ResourceShowSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
            </div>
            <div className="rounded-xl border p-8">
                <Skeleton className="mb-3 h-8 w-2/3" />
                <Skeleton className="mb-6 h-5 w-1/4" />
                <Separator className="mb-6" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
            </div>
        </div>
    );
}

interface Props {
    id: string;
}

export default function ResourceShow({ id }: Props) {
    const { data, isLoading, isError } = useResource(id);
    const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource(id);
    const resource = data?.data;
    const [confirmOpen, setConfirmOpen] = useState(false);

    function handleDelete() {
        deleteResource(undefined, {
            onSuccess: () => {
                setConfirmOpen(false);
                router.visit(route('resources'));
            },
            onError: (error) => {
                setConfirmOpen(false);
                if ((error as Error).message === 'forbidden') {
                    toast.warning('You are not allowed to delete this resource.');
                }
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={resource?.title ?? 'Resource Detail'} />

            <div className="flex flex-col gap-6 p-6">
                {isLoading && <ResourceShowSkeleton />}

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
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={route('resources')} />}>
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <Button size="sm" nativeButton={false} render={<Link href={route('resources.edit', resource.id)} />}>
                                <Pencil className="h-4 w-4" />
                                Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setConfirmOpen(true)}>
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>

                        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Resource</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Content card */}
                        <div className="bg-card rounded-xl border p-8 shadow-sm">
                            <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
                                <h1 className="text-2xl font-bold tracking-tight">{resource.title}</h1>
                            </div>

                            <div className="text-muted-foreground mb-6 flex flex-wrap items-center gap-4 text-sm">
                                {resource.user && (
                                    <span className="flex items-center gap-1">
                                        <User className="h-3.5 w-3.5" />
                                        <Badge variant="secondary">{resource.user}</Badge>
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(resource.updated_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>

                            <Separator className="mb-6" />
                            {resource.image_url && (
                                <div className="mb-6 aspect-square w-64 overflow-hidden rounded-lg">
                                    <img src={resource.image_url} alt={resource.title} className="h-full w-full object-cover" />
                                </div>
                            )}
                            <p className="text-foreground/80 leading-7 whitespace-pre-line">{resource.description}</p>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

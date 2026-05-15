import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useResource } from '@/hooks/api/use-resource';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    const resource = data?.data;

    const {
        data: formData,
        setData,
        put,
        processing,
        errors,
        setError,
        clearErrors,
    } = useForm<{
        title: string;
        description: string;
        image: File | null;
        _method: string;
    }>({
        title: '',
        description: '',
        image: null,
        _method: 'PUT',
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (resource) {
            setData((prev) => ({
                ...prev,
                title: resource.title,
                description: resource.description,
            }));
        }
    }, [resource, setData]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    function handleImageChange(file: File | null) {
        setData('image', file);

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        if (file && !file.type.startsWith('image/')) {
            setPreviewUrl(null);
            setError('image', 'The image must be a file of type: jpg, jpeg, png, gif, webp.');
        } else if (file && file.size > 2 * 1024 * 1024) {
            setPreviewUrl(null);
            setError('image', 'The image must not be greater than 2MB.');
        } else {
            setPreviewUrl(file ? URL.createObjectURL(file) : null);
            clearErrors('image');
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (errors.image) {
            return;
        }

        put(route('resources.data.update', id), {
            forceFormData: true,
        });
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

                        <div className="bg-card rounded-xl border p-8 shadow-sm">
                            <h1 className="mb-6 text-xl font-semibold tracking-tight">Edit Resource</h1>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Resource title"
                                        aria-invalid={!!errors.title}
                                    />
                                    {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Resource description"
                                        rows={6}
                                        aria-invalid={!!errors.description}
                                    />
                                    {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="image">Image</Label>
                                    {(previewUrl ?? resource.image_url) && (
                                        <div className="aspect-square w-40 overflow-hidden rounded-lg">
                                            <img
                                                src={previewUrl ?? resource.image_url!}
                                                alt={previewUrl ? 'New image preview' : 'Current image'}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                                        aria-invalid={!!errors.image}
                                    />
                                    <p className="text-muted-foreground text-xs">Leave empty to keep the current image. Max 2MB.</p>
                                    {errors.image && <p className="text-destructive text-sm">{errors.image}</p>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button type="button" variant="outline" nativeButton={false} render={<Link href={route('resources.show', id)} />}>
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

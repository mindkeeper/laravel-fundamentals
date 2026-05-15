import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Resources', href: '/resources' },
    { title: 'New Resource', href: '#' },
];

export default function ResourceCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('resources.data.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Resource" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <Button variant="outline" size="sm" nativeButton={false} render={<Link href={route('resources')} />}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>

                <div className="rounded-xl border bg-card p-8 shadow-sm">
                    <h1 className="mb-6 text-xl font-semibold tracking-tight">New Resource</h1>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
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
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Resource description"
                                rows={6}
                                aria-invalid={!!errors.description}
                            />
                            {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Resource'}
                            </Button>
                            <Button type="button" variant="outline" nativeButton={false} render={<Link href={route('resources')} />}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useResources } from '@/hooks/api/use-resource';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Resource } from '@/types/api/resource';
import { Head } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useCallback, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Resources',
        href: '/resources',
    },
];

function ResourceCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="mt-1 h-4 w-1/3" />
            </CardHeader>
            <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-4 w-1/4" />
            </CardFooter>
        </Card>
    );
}

function ResourceCard({ resource }: { resource: Resource }) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-base">{resource.title}</CardTitle>
                {resource.user && (
                    <CardDescription>
                        <Badge variant="secondary">{resource.user}</Badge>
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-muted-foreground line-clamp-3 text-sm">{resource.description}</p>
            </CardContent>
            <CardFooter>
                <span className="text-muted-foreground text-xs">{new Date(resource.updated_at).toLocaleDateString()}</span>
            </CardFooter>
        </Card>
    );
}

export default function ResourcePage() {
    const [search, setSearch] = useState('');
    const [{ q, page }, setParams] = useQueryStates(
        {
            q: parseAsString.withDefault(''),
            page: parseAsInteger.withDefault(1),
        },
        { shallow: true, history: 'replace' },
    );
    const { data: resources, isLoading } = useResources({ q, page });

    const handleSearch = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            // Push a new history entry so the back button restores the previous search
            setParams({ q: search, page: 1 }, { history: 'push' });
        },
        [search, setParams],
    );

    const handlePageChange = useCallback(
        (newPage: number) => {
            // Replace the current history entry — pagination doesn't need back-button entries
            setParams({ page: newPage }, { history: 'replace' });
        },
        [setParams],
    );

    const meta = resources?.meta;
    const totalPages = meta?.last_page ?? 1;
    const currentPage = meta?.current_page ?? page;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resources" />

            <div className="flex flex-col gap-6 p-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="relative flex max-w-sm flex-1 items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Button type="submit" variant="outline" size="default">
                            Search
                        </Button>
                    </form>

                    <Button>
                        <Plus className="mr-1 h-4 w-4" />
                        New Resource
                    </Button>
                </div>

                {/* Meta info */}
                {!isLoading && meta && (
                    <p className="text-muted-foreground text-sm">
                        Showing {meta.from}–{meta.to} of {meta.total} resources
                    </p>
                )}

                {/* Card grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, i) => <ResourceCardSkeleton key={i} />)
                        : resources?.data.map((resource: Resource) => <ResourceCard key={resource.id} resource={resource} />)}
                </div>

                {/* Empty state */}
                {!isLoading && resources?.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-muted-foreground">No resources found.</p>
                        {q && (
                            <Button
                                variant="link"
                                className="mt-2"
                                onClick={() => {
                                    setSearch('');
                                    setParams({ q: '', page: 1 });
                                }}
                            >
                                Clear search
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}>
                            Previous
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                                    acc.push('...');
                                }
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((item, idx) =>
                                item === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="text-muted-foreground px-2">
                                        …
                                    </span>
                                ) : (
                                    <Button
                                        key={item}
                                        variant={item === currentPage ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handlePageChange(item as number)}
                                    >
                                        {item}
                                    </Button>
                                ),
                            )}

                        <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

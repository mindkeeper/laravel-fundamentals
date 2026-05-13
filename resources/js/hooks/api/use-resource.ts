import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { type paginatedResources } from '@/types/api/resource';

interface resourceParams {
    q: string;
    page: number;
}

async function fetchResources({ q, page }: resourceParams): Promise<paginatedResources> {
    const params = new URLSearchParams({
        q,
        page: page.toString(),
        per_page: '15',
    });

    const response = await fetch(`/resources/data/list?${params.toString()}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}

export const useResources = (params: resourceParams) => {
    return useQuery({
        queryKey: ['resources', params],
        queryFn: () => fetchResources(params),
        placeholderData: keepPreviousData,
    });
};

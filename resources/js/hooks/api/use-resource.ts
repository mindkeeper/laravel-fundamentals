import { type paginatedResources, type Resource } from '@/types/api/resource';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

async function fetchResource(id: string | number): Promise<{ data: Resource }> {
    const response = await fetch(`/resources/data/${id}`, {
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

export const useResource = (id: string | number) => {
    return useQuery({
        queryKey: ['resources', id],
        queryFn: () => fetchResource(id),
        enabled: !!id,
    });
};

interface UpdateResourcePayload {
    title: string;
    description: string;
}

async function updateResource(id: string | number, payload: UpdateResourcePayload): Promise<Resource> {
    const xsrfToken = decodeURIComponent(
        document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] ?? '',
    );

    const response = await fetch(`/resources/data/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': xsrfToken,
        },
        body: JSON.stringify(payload),
    });

    if (response.status === 403) {
        throw new Error('forbidden');
    }

    if (response.status === 422) {
        const json = await response.json();
        throw json.errors ?? json;
    }

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const json = await response.json();
    return json.data;
}

export const useUpdateResource = (id: string | number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateResourcePayload) => updateResource(id, payload),
        throwOnError: false,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};

async function deleteResource(id: string | number): Promise<void> {
    const xsrfToken = decodeURIComponent(
        document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] ?? '',
    );

    const response = await fetch(`/resources/data/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': xsrfToken,
        },
    });

    if (response.status === 403) {
        throw new Error('forbidden');
    }

    if (!response.ok) {
        throw new Error(response.statusText);
    }
}

export const useDeleteResource = (id: string | number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteResource(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
};

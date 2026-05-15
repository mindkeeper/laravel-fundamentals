import { PaginatedResponse } from './response';

export interface Resource {
    id: number;
    title: string;
    description: string;
    user: string | null;
    image_url: string | null;
    crated_at: string;
    updated_at: string;
}

export type paginatedResources = PaginatedResponse<Resource>;

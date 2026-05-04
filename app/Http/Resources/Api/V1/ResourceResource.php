<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'ResourceResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'title', type: 'string', example: 'My Resource'),
        new OA\Property(property: 'description', type: 'string', example: 'A detailed description'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-05-04T10:00:00Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-05-04T10:00:00Z'),
        new OA\Property(property: 'user', type: 'string', nullable: true, example: 'John Doe'),
    ]
)]
class ResourceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $this->whenLoaded('user', fn () => $this->user->name),
        ];
    }
}

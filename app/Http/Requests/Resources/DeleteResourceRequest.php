<?php

namespace App\Http\Requests\Resources;

use App\Models\Resource;
use Illuminate\Foundation\Http\FormRequest;

class DeleteResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $resource = $this->route('resource');

        return $resource instanceof Resource && $this->user()->id === $resource->user_id;
    }

    public function rules(): array
    {
        return [];
    }
}

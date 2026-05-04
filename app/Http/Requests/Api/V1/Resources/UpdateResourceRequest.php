<?php

namespace App\Http\Requests\Api\V1\Resources;

use App\Models\Resource;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateResourceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $resource = $this->route('resource');

        return $resource instanceof Resource && $this->user()->id === $resource->user_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string'],
            'description' => ['sometimes', 'string'],
        ];
    }
}

<?php

namespace App\Services;

use App\Repositories\Interfaces\AuthRepositoryInterface;
use App\Services\Interfaces\AuthServiceInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService implements AuthServiceInterface
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private readonly AuthRepositoryInterface $authRepository,
    ) {}

    public function login(string $email, string $password): array
    {
        $user = $this->authRepository->findByEmail($email);
        if (! $user) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }
        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => [__('auth.failed')],
            ]);
        }

        $this->authRepository->revokeToken($user);

        return [
            'token' => $this->authRepository->createToken($user),
            'user' => $user,
        ];

    }
}

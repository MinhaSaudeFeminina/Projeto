<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type',
        'is_active',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function adminRoles(): BelongsToMany
    {
        return $this->belongsToMany(AdminRole::class, 'admin_role_assignments')
            ->withPivot('assigned_by')
            ->withTimestamps();
    }

    public function isMobileUser(): bool
    {
        return $this->user_type === 'mobile_user';
    }

    public function isAdminUser(): bool
    {
        return $this->user_type === 'admin_user';
    }

    public function hasAdminRole(string $role): bool
    {
        return $this->isAdminUser()
            && $this->is_active
            && $this->adminRoles()
                ->where(function ($query) use ($role): void {
                    $query->where('key', $role)->orWhere('name', $role);
                })
                ->exists();
    }

    public function hasAnyAdminRole(array $roles): bool
    {
        return $this->isAdminUser()
            && $this->is_active
            && $this->adminRoles()
                ->where(function ($query) use ($roles): void {
                    $query->whereIn('key', $roles)->orWhereIn('name', $roles);
                })
                ->exists();
    }

    public function hasPermission(string $permission): bool
    {
        if (! $this->isAdminUser() || ! $this->is_active) {
            return false;
        }

        return $this->adminRoles()
            ->whereHas('permissions', fn ($query) => $query->where('key', $permission))
            ->exists();
    }

    public function isAdmin(): bool
    {
        return $this->hasAdminRole(AdminRole::ADMIN) || $this->hasAdminRole('Admin');
    }

    public function isAcademicAuthor(): bool
    {
        return $this->hasAdminRole(AdminRole::AUTHOR);
    }

    public function isReviewerProfessor(): bool
    {
        return $this->hasAdminRole(AdminRole::REVIEWER);
    }
}

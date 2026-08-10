<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AdminRole extends Model
{
    public const AUTHOR = 'academic_author';
    public const REVIEWER = 'reviewer_professor';
    public const ADMIN = 'admin';

    protected $fillable = ['key', 'name', 'description', 'permissions'];

    protected function casts(): array
    {
        return ['permissions' => 'array'];
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'admin_role_permission')->withTimestamps();
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'admin_role_assignments')->withTimestamps();
    }
}

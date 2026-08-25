<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Symptom extends Model
{
    protected $fillable = ['name', 'description', 'is_alert_candidate'];

    protected function casts(): array
    {
        return ['is_alert_candidate' => 'boolean'];
    }
}

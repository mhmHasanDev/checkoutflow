<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Form extends Model
{
    protected $fillable = [
        'shop_id',
        'name',
        'is_active',
        'fields',
        'conditional_rules',
        'appearance',
    ];

    protected $casts = [
        'is_active'         => 'boolean',
        'fields'            => 'array',
        'conditional_rules' => 'array',
        'appearance'        => 'array',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function submissionsThisMonth(): HasMany
    {
        return $this->hasMany(Submission::class)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);
    }

    public function getFieldCount(): int
    {
        return count($this->fields ?? []);
    }

    public function getCompletionRate(): float
    {
        $total     = $this->submissions()->count();
        $completed = $this->submissions()->whereNotNull('order_id')->count();
        if ($total === 0) return 0;
        return round(($completed / $total) * 100, 1);
    }
}

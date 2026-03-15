<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shop extends Model
{
    protected $fillable = [
        'shopify_domain',
        'access_token',
        'plan_name',
        'plan_status',
        'trial_ends_at',
        'settings',
    ];

    protected $casts = [
        'settings'      => 'array',
        'trial_ends_at' => 'datetime',
    ];

    protected $hidden = ['access_token'];

    public function forms(): HasMany
    {
        return $this->hasMany(Form::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function activeForms(): HasMany
    {
        return $this->hasMany(Form::class)->where('is_active', true);
    }

    public function isFreePlan(): bool
    {
        return $this->plan_name === 'free';
    }

    public function canAddForm(): bool
    {
        if ($this->plan_name !== 'free') return true;
        return $this->forms()->count() < 1;
    }

    public function monthlySubmissionCount(): int
    {
        return $this->submissions()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
    }

    public function hasReachedSubmissionLimit(): bool
    {
        $limits = ['free' => 50, 'essential' => 500];
        $limit  = $limits[$this->plan_name] ?? null;
        if (!$limit) return false;
        return $this->monthlySubmissionCount() >= $limit;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    protected $fillable = [
        'form_id',
        'shop_id',
        'customer_id',
        'order_id',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function getFormattedData(): string
    {
        $lines = [];
        foreach ($this->data ?? [] as $key => $value) {
            $label   = ucwords(str_replace('_', ' ', $key));
            $val     = is_array($value) ? implode(', ', $value) : $value;
            $lines[] = "{$label}: {$val}";
        }
        return implode("\n", $lines);
    }
}

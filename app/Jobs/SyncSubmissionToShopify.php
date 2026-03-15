<?php

namespace App\Jobs;

use App\Models\Submission;
use App\Services\ShopifyService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncSubmissionToShopify implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 60;

    public function __construct(
        protected Submission $submission
    ) {}

    public function handle(ShopifyService $shopify): void
    {
        try {
            $shopify->syncSubmission([
                'data'        => $this->submission->data,
                'customer_id' => $this->submission->customer_id,
                'order_id'    => $this->submission->order_id,
            ]);

            Log::info('Submission synced to Shopify', [
                'submission_id' => $this->submission->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to sync submission to Shopify', [
                'submission_id' => $this->submission->id,
                'error'         => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncSubmissionToShopify job permanently failed', [
            'submission_id' => $this->submission->id,
            'error'         => $exception->getMessage(),
        ]);
    }
}

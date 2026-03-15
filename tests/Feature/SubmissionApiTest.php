<?php
namespace Tests\Feature;
use App\Models\Shop;
use App\Models\Form;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubmissionApiTest extends TestCase
{
    use RefreshDatabase;

    private Shop $shop;
    private Form $form;

    protected function setUp(): void {
        parent::setUp();
        $this->shop = Shop::create(['shopify_domain' => 'test.myshopify.com', 'access_token' => 'tok', 'plan_name' => 'essential', 'plan_status' => 'active']);
        $this->form = $this->shop->forms()->create(['name' => 'Test', 'is_active' => true, 'fields' => []]);
    }

    public function test_can_submit_form(): void {
        $this->postJson('/api/v1/submit', ['form_id' => $this->form->id, 'customer_id' => '123', 'data' => ['name' => 'Test']])
            ->assertStatus(201)->assertJsonPath('success', true);
        $this->assertDatabaseHas('submissions', ['form_id' => $this->form->id]);
    }

    public function test_submission_requires_form_id(): void {
        $this->postJson('/api/v1/submit', ['data' => ['name' => 'Test']])->assertStatus(422);
    }

    public function test_free_plan_blocks_after_50_submissions(): void {
        $this->shop->update(['plan_name' => 'free']);
        for ($i = 0; $i < 50; $i++) {
            $this->form->submissions()->create(['shop_id' => $this->shop->id, 'data' => ['i' => $i]]);
        }
        $this->postJson('/api/v1/submit', ['form_id' => $this->form->id, 'data' => ['name' => 'X']])
            ->assertStatus(429);
    }
}

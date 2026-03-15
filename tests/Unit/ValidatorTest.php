<?php
namespace Tests\Unit;
use App\Services\ValidationService;
use PHPUnit\Framework\TestCase;

class ValidatorTest extends TestCase
{
    private ValidationService $v;
    protected function setUp(): void { $this->v = new ValidationService(); }

    public function test_valid_cvr(): void { $this->assertTrue($this->v->validateCVR('10150817')); }
    public function test_invalid_cvr(): void { $this->assertFalse($this->v->validateCVR('1234567')); }
    public function test_valid_ean(): void { $this->assertTrue($this->v->validateEAN('5701234567899')); }
    public function test_invalid_ean(): void { $this->assertFalse($this->v->validateEAN('12345')); }
    public function test_valid_vat(): void { $this->assertTrue($this->v->validateVAT('DK10150817')); }
    public function test_valid_email(): void { $this->assertTrue($this->v->validateEmail('test@example.com')); }
    public function test_invalid_email(): void { $this->assertFalse($this->v->validateEmail('not-email')); }
    public function test_valid_phone(): void { $this->assertTrue($this->v->validatePhone('+4512345678')); }
    public function test_valid_postal_dk(): void { $this->assertTrue($this->v->validatePostalCode('2100', 'DK')); }
    public function test_invalid_postal_dk(): void { $this->assertFalse($this->v->validatePostalCode('123', 'DK')); }
}

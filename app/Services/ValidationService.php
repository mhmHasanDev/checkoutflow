<?php

namespace App\Services;

class ValidationService
{
    // ───────
    // CVR — Danish Company Registration (8 digits)
    // ──
    public function validateCVR(string $cvr): bool
    {
        $cvr = preg_replace('/\s+/', '', $cvr);
        if (!preg_match('/^\d{8}$/', $cvr)) return false;

        $weights = [2, 7, 6, 5, 4, 3, 2, 1];
        $sum = 0;
        for ($i = 0; $i < 8; $i++) {
            $sum += (int)$cvr[$i] * $weights[$i];
        }
        return $sum % 11 === 0;
    }

    // ─────────────────────
    // VAT ID — EU Format Validation
    // ──────
    public function validateVAT(string $vat): bool
    {
        $vat = strtoupper(preg_replace('/\s+/', '', $vat));
        $patterns = [
            'AT' => '/^ATU\d{8}$/',
            'BE' => '/^BE0\d{9}$/',
            'DK' => '/^DK\d{8}$/',
            'FI' => '/^FI\d{8}$/',
            'FR' => '/^FR[A-Z0-9]{2}\d{9}$/',
            'DE' => '/^DE\d{9}$/',
            'NL' => '/^NL\d{9}B\d{2}$/',
            'NO' => '/^NO\d{9}MVA$/',
            'PL' => '/^PL\d{10}$/',
            'SE' => '/^SE\d{12}$/',
            'GB' => '/^GB(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/',
        ];

        $countryCode = substr($vat, 0, 2);
        if (isset($patterns[$countryCode])) {
            return (bool)preg_match($patterns[$countryCode], $vat);
        }

        // Generic EU VAT fallback
        return (bool)preg_match('/^[A-Z]{2}[A-Z0-9]{8,12}$/', $vat);
    }

    // ─
    // EAN — 13-digit with Luhn checksum
    // ───
    public function validateEAN(string $ean): bool
    {
        $ean = preg_replace('/\s+/', '', $ean);
        if (!preg_match('/^\d{13}$/', $ean)) return false;

        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $sum += (int)$ean[$i] * ($i % 2 === 0 ? 1 : 3);
        }
        $checkDigit = (10 - ($sum % 10)) % 10;
        return $checkDigit === (int)$ean[12];
    }

    // ───
    // Email Validation
    // ────────────────
    public function validateEmail(string $email): bool
    {
        return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    // ─
    // Phone — International Format
    // ─────────────────
    public function validatePhone(string $phone): bool
    {
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);
        return (bool)preg_match('/^\+?[1-9]\d{7,14}$/', $phone);
    }

    // ─────────────────────────────────────────
    // Postal Code by Country
    // ─────────────────────────────────────────
    public function validatePostalCode(string $code, string $country = 'DK'): bool
    {
        $patterns = [
            'DK' => '/^\d{4}$/',
            'SE' => '/^\d{3}\s?\d{2}$/',
            'NO' => '/^\d{4}$/',
            'FI' => '/^\d{5}$/',
            'DE' => '/^\d{5}$/',
            'GB' => '/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i',
            'US' => '/^\d{5}(-\d{4})?$/',
        ];

        $pattern = $patterns[$country] ?? '/^\d{4,10}$/';
        return (bool)preg_match($pattern, trim($code));
    }

    // ─
    // Validate All Form Fields
    // ────
    public function validateFormData(array $fields, array $data): array
    {
        $errors = [];

        foreach ($fields as $field) {
            $key      = $field['key'];
            $value    = $data[$key] ?? null;
            $required = $field['required'] ?? false;
            $type     = $field['validation'] ?? $field['type'] ?? 'text';

            // Required check
            if ($required && empty($value)) {
                $errors[$key] = ($field['label'] ?? $key) . ' is required.';
                continue;
            }

            if (empty($value)) continue;

            // Type-specific validation
            $error = match($type) {
                'cvr'   => $this->validateCVR($value)   ? null : 'Invalid CVR number (must be 8 digits).',
                'vat'   => $this->validateVAT($value)   ? null : 'Invalid VAT ID format.',
                'ean'   => $this->validateEAN($value)   ? null : 'Invalid EAN number (must be 13 digits).',
                'email' => $this->validateEmail($value) ? null : 'Invalid email address.',
                'phone' => $this->validatePhone($value) ? null : 'Invalid phone number.',
                default => null,
            };

            if ($error) $errors[$key] = $error;
        }

        return $errors;
    }
}

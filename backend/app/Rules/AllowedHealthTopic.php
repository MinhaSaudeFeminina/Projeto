<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class AllowedHealthTopic implements ValidationRule
{
    private const EXCLUDED_TOPIC_PATTERN = '/(?:gravidez|gesta(?:c|ç)(?:a|ã)o|gestacional|gestante|puerp(?:e|é)rio|p(?:o|ó)s[- ]parto|pr(?:e|é)[- ]natal|engravidar|fertilidade|f(?:e|é)rtil|ovula(?:c|ç)(?:a|ã)o|concep(?:c|ç)(?:a|ã)o|parto|obst(?:e|é)tr(?:ico|ica)|feto|fetal|beb(?:e|ê)|matern(?:o|a|idade)|amamenta(?:c|ç)(?:a|ã)o|aleitamento|lacta(?:c|ç)(?:a|ã)o|embri(?:a|ã)o|ces(?:a|á)rea|rec(?:e|é)m[- ]nascid|nascimento)/iu';

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && preg_match(self::EXCLUDED_TOPIC_PATTERN, $value) === 1) {
            $fail('Este tema não está disponível no escopo atual.');
        }
    }
}

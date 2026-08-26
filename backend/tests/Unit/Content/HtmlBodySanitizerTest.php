<?php

use App\Services\Content\HtmlBodySanitizer;

beforeEach(function (): void {
    $this->sanitizer = new HtmlBodySanitizer;
});

it('keeps the markup produced by the editor', function (): void {
    $html = '<h2>Sinais de alerta</h2><p>Procure a <strong>UBS</strong> se houver <em>dor intensa</em>.</p><ul><li>Febre</li></ul>';

    expect($this->sanitizer->sanitize($html))->toBe($html);
});

it('removes script tags and their content', function (): void {
    $result = $this->sanitizer->sanitize('<p>Orientação</p><script>alert("xss")</script>');

    expect($result)->toBe('<p>Orientação</p>')
        ->and($result)->not->toContain('alert');
});

it('strips event handler attributes', function (): void {
    $result = $this->sanitizer->sanitize('<p onclick="steal()">Conteúdo educativo</p>');

    expect($result)->toBe('<p>Conteúdo educativo</p>');
});

it('drops javascript links but keeps the visible text', function (): void {
    $result = $this->sanitizer->sanitize('<p>Veja <a href="javascript:alert(1)">este item</a></p>');

    expect($result)->toBe('<p>Veja este item</p>');
});

it('keeps links that use a safe scheme', function (): void {
    $html = '<p><a href="https://saude.gov.br">Ministério da Saúde</a></p>';

    expect($this->sanitizer->sanitize($html))->toBe($html);
});

it('unwraps unsupported tags without losing the text', function (): void {
    $result = $this->sanitizer->sanitize('<div><span>Texto <b>importante</b></span></div>');

    expect($result)->toBe('Texto importante');
});

it('preserves accented characters', function (): void {
    $result = $this->sanitizer->sanitize('<p>Climatério, menopausa e prevenção</p>');

    expect($result)->toBe('<p>Climatério, menopausa e prevenção</p>');
});

it('accepts plain text saved before the rich text editor', function (): void {
    expect($this->sanitizer->sanitize('Conteúdo antigo sem HTML.'))->toBe('Conteúdo antigo sem HTML.');
});

it('returns an empty string for blank input', function (): void {
    expect($this->sanitizer->sanitize('   '))->toBe('');
});

it('removes iframes entirely', function (): void {
    $result = $this->sanitizer->sanitize('<p>Antes</p><iframe src="https://evil.test"></iframe><p>Depois</p>');

    expect($result)->toBe('<p>Antes</p><p>Depois</p>');
});

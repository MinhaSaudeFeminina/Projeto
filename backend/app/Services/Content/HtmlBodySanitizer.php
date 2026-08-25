<?php

namespace App\Services\Content;

use DOMDocument;
use DOMElement;
use DOMNode;
use Illuminate\Support\Str;

/**
 * Reduz o HTML do corpo educativo ao conjunto de tags produzido pelo editor do
 * painel. O editor já limita a formatação, mas a API aceita qualquer string:
 * a limpeza precisa acontecer no servidor antes de persistir o conteúdo.
 */
class HtmlBodySanitizer
{
    /**
     * Tags mantidas e, para cada uma, os atributos preservados.
     *
     * @var array<string, list<string>>
     */
    private const ALLOWED = [
        'p' => [],
        'br' => [],
        'strong' => [],
        'em' => [],
        's' => [],
        'h2' => [],
        'h3' => [],
        'ul' => [],
        'ol' => [],
        'li' => [],
        'blockquote' => [],
        'a' => ['href'],
    ];

    /** Esquemas aceitos em `href`; demais viram texto sem link. */
    private const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

    public function sanitize(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        $document = new DOMDocument;
        $previous = libxml_use_internal_errors(true);

        // O wrapper evita que o DOMDocument injete <html>/<body> na saída.
        $loaded = $document->loadHTML(
            '<?xml encoding="UTF-8"?><div id="msf-root">'.$html.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET
        );

        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $document->getElementById('msf-root');

        if (! $loaded || ! $root instanceof DOMElement) {
            return '';
        }

        $this->cleanChildren($root);

        $result = '';

        foreach (iterator_to_array($root->childNodes) as $child) {
            $result .= $document->saveHTML($child);
        }

        return trim($result);
    }

    private function cleanChildren(DOMNode $parent): void
    {
        foreach (iterator_to_array($parent->childNodes) as $child) {
            if ($child instanceof DOMElement) {
                $this->cleanElement($child);

                continue;
            }

            // Preserva apenas texto; comentários, CDATA e instruções são descartados.
            if ($child->nodeType !== XML_TEXT_NODE) {
                $parent->removeChild($child);
            }
        }
    }

    private function cleanElement(DOMElement $element): void
    {
        $tag = strtolower($element->nodeName);

        if (! array_key_exists($tag, self::ALLOWED)) {
            $this->unwrap($element);

            return;
        }

        foreach (iterator_to_array($element->attributes ?? []) as $attribute) {
            if (! in_array(strtolower($attribute->nodeName), self::ALLOWED[$tag], true)) {
                $element->removeAttribute($attribute->nodeName);
            }
        }

        if ($tag === 'a' && ! $this->hasSafeHref($element)) {
            $this->unwrap($element);

            return;
        }

        $this->cleanChildren($element);
    }

    private function hasSafeHref(DOMElement $element): bool
    {
        $href = trim($element->getAttribute('href'));

        if ($href === '') {
            return false;
        }

        // Links relativos não carregam esquema executável.
        if (Str::startsWith($href, ['/', '#'])) {
            return true;
        }

        $scheme = strtolower((string) parse_url($href, PHP_URL_SCHEME));

        return in_array($scheme, self::ALLOWED_SCHEMES, true);
    }

    /**
     * Remove a tag mantendo o conteúdo textual — descartar o nó inteiro
     * apagaria texto legítimo que o editor aninhou em markup não suportado.
     */
    private function unwrap(DOMElement $element): void
    {
        $parent = $element->parentNode;

        if (! $parent instanceof DOMNode) {
            return;
        }

        // Tags cujo conteúdo não é texto visível são removidas por inteiro.
        if (in_array(strtolower($element->nodeName), ['script', 'style', 'iframe', 'object', 'embed'], true)) {
            $parent->removeChild($element);

            return;
        }

        $this->cleanChildren($element);

        foreach (iterator_to_array($element->childNodes) as $child) {
            $parent->insertBefore($child, $element);
        }

        $parent->removeChild($element);
    }
}

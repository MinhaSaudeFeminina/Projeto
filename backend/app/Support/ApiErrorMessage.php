<?php

namespace App\Support;

use Symfony\Component\HttpFoundation\Response;

/**
 * Picks the user-facing message for an API error response.
 *
 * Messages passed to abort() by the application are already written for the
 * user and are kept. Messages produced by the framework (model or route not
 * found, "This action is unauthorized.", status texts) are technical and in
 * English, so they are replaced by a Portuguese default for the status code.
 */
class ApiErrorMessage
{
    private const DEFAULTS = [
        400 => 'Não foi possível entender a solicitação. Confira os dados e tente novamente.',
        401 => 'Sua sessão expirou. Entre novamente.',
        403 => 'Você não tem permissão para realizar esta ação.',
        404 => 'O registro solicitado não foi encontrado. Ele pode ter sido removido.',
        405 => 'Esta ação não está disponível.',
        409 => 'Esta ação entra em conflito com outra alteração. Atualize a página e tente novamente.',
        413 => 'O arquivo ou os dados enviados são grandes demais.',
        419 => 'Sua sessão expirou. Atualize a página e tente novamente.',
        422 => 'Confira os dados informados e tente novamente.',
        429 => 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
        503 => 'O serviço está temporariamente indisponível. Tente novamente em instantes.',
    ];

    private const FALLBACK = 'Ocorreu um erro inesperado. Tente novamente em instantes.';

    /** Statuses whose framework message never makes sense to the user. */
    private const ALWAYS_DEFAULT = [404, 405];

    private const FRAMEWORK_MESSAGES = [
        'This action is unauthorized.',
        'Unauthenticated.',
        'Too Many Attempts.',
        'Bad request.',
        'CSRF token mismatch.',
        'Not found.',
        'Server Error',
        'Service Unavailable',
        'Whoops, looks like something went wrong.',
    ];

    public static function for(int $status, string $message = ''): string
    {
        if ($status < 500 && self::isApplicationMessage($status, $message)) {
            return $message;
        }

        return self::DEFAULTS[$status] ?? self::FALLBACK;
    }

    private static function isApplicationMessage(int $status, string $message): bool
    {
        $message = trim($message);

        return $message !== ''
            && ! in_array($status, self::ALWAYS_DEFAULT, true)
            && ! in_array($message, self::FRAMEWORK_MESSAGES, true)
            && ! in_array($message, Response::$statusTexts, true);
    }
}

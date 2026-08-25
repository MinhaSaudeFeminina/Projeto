<?php

namespace App\Services\Notifications;

use App\Models\AdminNotification;
use App\Models\EducationalContent;
use App\Models\User;

class AdminNotificationService
{
    /**
     * @var array<string, array{title: string, message: string}>
     */
    private const COPY = [
        'submitted_for_review' => [
            'title' => 'Conteúdo enviado para revisão',
            'message' => 'Há um conteúdo aguardando revisão. Acesse o portal administrativo para analisar.',
        ],
        'adjustments_requested' => [
            'title' => 'Ajustes solicitados no conteúdo',
            'message' => 'Foram solicitados ajustes. Acesse o portal administrativo para revisar as orientações.',
        ],
        'approved' => [
            'title' => 'Conteúdo aprovado para publicação',
            'message' => 'Há um conteúdo aprovado aguardando publicação no portal administrativo.',
        ],
        'published' => [
            'title' => 'Conteúdo publicado',
            'message' => 'Seu conteúdo foi publicado no portal administrativo.',
        ],
        'archived' => [
            'title' => 'Conteúdo arquivado',
            'message' => 'Seu conteúdo foi arquivado. Consulte o portal administrativo para ver o histórico.',
        ],
    ];

    public function __construct(
        private readonly AdminNotificationRecipientResolver $recipients,
        private readonly AdminNotificationMailSender $mailSender,
    ) {}

    public function notify(string $event, EducationalContent $content, User $actor): void
    {
        $copy = self::COPY[$event] ?? null;

        if ($copy === null) {
            return;
        }

        foreach ($this->recipients->resolve($event, $content, $actor) as $recipient) {
            $notification = AdminNotification::create([
                'recipient_id' => $recipient->id,
                'content_id' => $content->id,
                'type' => $event,
                'title' => $copy['title'],
                'message' => $copy['message'],
                'action_url' => "/conteudos/{$content->id}",
            ]);

            $this->mailSender->send($notification);
        }
    }
}

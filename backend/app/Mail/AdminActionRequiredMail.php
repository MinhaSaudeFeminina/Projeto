<?php

namespace App\Mail;

use App\Models\AdminNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminActionRequiredMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly AdminNotification $notification) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Ação necessária: {$this->notification->title}");
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.admin-action-required',
            with: [
                'title' => $this->notification->title,
                'messageText' => $this->notification->message,
                'actionUrl' => rtrim((string) config('app.admin_url'), '/').$this->notification->action_url,
            ],
        );
    }
}

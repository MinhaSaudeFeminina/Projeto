<?php

namespace App\Services\Notifications;

use App\Mail\AdminActionRequiredMail;
use App\Models\AdminNotification;
use Illuminate\Support\Facades\Mail;
use Throwable;

class AdminNotificationMailSender
{
    public function send(AdminNotification $notification): void
    {
        try {
            Mail::to($notification->recipient)->send(new AdminActionRequiredMail($notification));
            $notification->forceFill(['email_sent_at' => now(), 'email_failed_at' => null])->save();
        } catch (Throwable $exception) {
            report($exception);
            $notification->forceFill(['email_failed_at' => now()])->save();
        }
    }
}

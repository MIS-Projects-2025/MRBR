<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MeetingRoomNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $messageBody;

    public function __construct(string $messageBody)
    {
        $this->messageBody = $messageBody;
    }

    public function build()
    {
        return $this->subject('Meeting Room Notification')
            ->text('emails.plain', ['body' => $this->messageBody]);
    }
}

<?php

namespace Pterodactyl\Events\Auth;

use Pterodactyl\Events\Event;
use Illuminate\Queue\SerializesModels;

class FailedCaptcha extends Event
{
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * `$domain` is nullable on purpose: when the reCAPTCHA response is missing or
     * invalid there is no hostname to report, and the caller passes null. The
     * original non-nullable `string` type made every failed captcha throw a
     * TypeError (HTTP 500) instead of dispatching the event — so a wrong password
     * produced a server error rather than an "invalid credentials" message.
     */
    public function __construct(public string $ip, public ?string $domain)
    {
    }
}

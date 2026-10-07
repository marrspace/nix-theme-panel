<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * \Pterodactyl\Models\ServerRuntimeTotal.
 *
 * Durable runtime accumulator for one server. See the create migration for why
 * this exists at all: Pterodactyl keeps no uptime history, so the leaderboard
 * needs its own store.
 *
 * @property int $server_id
 * @property int $sampled_seconds
 * @property int $backfilled_seconds
 * @property \Carbon\Carbon|null $last_sampled_at
 * @property string|null $last_state
 * @property \Carbon\Carbon|null $backfilled_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property Server $server
 */
class ServerRuntimeTotal extends Model
{
    /**
     * The table is keyed by server_id, not an auto-incrementing id.
     */
    protected $table = 'server_runtime_totals';

    protected $primaryKey = 'server_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'server_id',
        'sampled_seconds',
        'backfilled_seconds',
        'last_sampled_at',
        'last_state',
        'backfilled_at',
    ];

    public static array $validationRules = [
        'server_id' => 'required|integer|exists:servers,id',
        'sampled_seconds' => 'integer|min:0',
        'backfilled_seconds' => 'integer|min:0',
        'last_state' => 'nullable|string|max:32',
    ];

    protected $casts = [
        'server_id' => 'integer',
        'sampled_seconds' => 'integer',
        'backfilled_seconds' => 'integer',
        'last_sampled_at' => 'datetime',
        'backfilled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Total seconds this server has been running: sampled history plus the
     * one-time reconstruction from the activity log.
     */
    public function getTotalSecondsAttribute(): int
    {
        return $this->sampled_seconds + $this->backfilled_seconds;
    }

    /**
     * Whether any part of this figure came from the log reconstruction rather
     * than live sampling. The UI uses this to label a number as an estimate.
     */
    public function getIsEstimatedAttribute(): bool
    {
        return !is_null($this->backfilled_at);
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }
}

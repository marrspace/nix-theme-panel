<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    /**
     * Run the migrations.
     *
     * Pterodactyl stores no runtime/uptime history: the only uptime it knows is
     * the daemon's live counter, which resets on every restart (one server here
     * has restarted 225 times). This table is the durable accumulator that makes
     * a leaderboard possible.
     *
     * Two counters, deliberately separate:
     *
     *   sampled_seconds    — accumulated by the per-minute Wings sampler. Accurate
     *                        going forward; a server that is offline contributes 0.
     *   backfilled_seconds — reconstructed once from activity_logs (power events),
     *                        marked estimated because crash-deaths leave no stop
     *                        event. Re-running the backfill RESETS sampled_seconds,
     *                        so history is never counted twice.
     *
     * A server's total is the sum of both; `backfilled_at` being set is what the
     * UI uses to label a figure as an estimate.
     */
    public function up(): void
    {
        Schema::create('server_runtime_totals', function (Blueprint $table) {
            $table->unsignedInteger('server_id')->primary();

            $table->unsignedBigInteger('sampled_seconds')->default(0);
            $table->unsignedBigInteger('backfilled_seconds')->default(0);

            // last time the sampler looked at this server, and what it saw. The
            // delta between now and this timestamp is what gets credited.
            $table->timestamp('last_sampled_at')->nullable();
            $table->string('last_state')->nullable();

            $table->timestamp('backfilled_at')->nullable();

            $table->timestamps();

            $table->foreign('server_id')->references('id')->on('servers')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('server_runtime_totals');
    }
};

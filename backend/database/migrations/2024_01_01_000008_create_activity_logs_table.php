<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->string('level')->default('info'); // info, warning, error, debug
            $table->string('action'); // create_user, update_user, delete_user, login, etc.
            $table->text('message');
            $table->integer('user_id')->nullable(); // User who performed the action
            $table->integer('target_user_id')->nullable(); // User being acted upon (for user management)
            $table->string('resource_type')->nullable(); // user, organization, group, role
            $table->integer('resource_id')->nullable(); // ID of the resource being acted upon
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->json('additional_data')->nullable(); // Any extra data as JSON
            $table->timestamps();

            // Add foreign key for the user who performed the action
            $table->index(['user_id', 'created_at']);
            $table->index(['action', 'created_at']);
            $table->index(['resource_type', 'resource_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('activity_logs');
    }
};

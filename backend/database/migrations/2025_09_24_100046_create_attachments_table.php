<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Attachments', function (Blueprint $table) {
            $table->string('Account_No')->nullable();
            $table->string('Attachment_1')->nullable();
            $table->string('Attachment_2')->nullable();
            $table->string('Attachment_3')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Attachments');
    }
};

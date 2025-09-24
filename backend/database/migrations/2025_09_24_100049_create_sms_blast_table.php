<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('SMS_Blast', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('contact_number')->nullable();
            $table->string('account_no')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->nullable();
            $table->datetime('modified_date')->nullable();
            $table->string('modified_email')->nullable();
            $table->string('useremail')->nullable();
            $table->integer('barangay')->nullable();
            $table->string('city')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('SMS_Blast');
    }
};

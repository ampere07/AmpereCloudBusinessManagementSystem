<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Service_Charge_Logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('Account_No')->nullable();
            $table->decimal('Service_Charge', 10, 2)->nullable();
            $table->string('Status')->nullable();
            $table->date('Date')->nullable();
            $table->date('Date_Used')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->text('Remarks')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
            $table->string('SO_ID')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Service_Charge_Logs');
    }
};

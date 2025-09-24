<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Plan_Change_Logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('Account_No')->nullable();
            $table->string('Old_Plan')->nullable();
            $table->string('New_Plan')->nullable();
            $table->string('Status')->nullable();
            $table->date('Date')->nullable();
            $table->date('Date_Used')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->text('Remarks')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Plan_Change_Logs');
    }
};

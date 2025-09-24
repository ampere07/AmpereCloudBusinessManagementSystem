<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Transactions', function (Blueprint $table) {
            $table->string('Transaction_ID')->primary();
            $table->string('Account_No')->nullable();
            $table->string('Full_Name')->nullable();
            $table->string('ContactNo')->nullable();
            $table->decimal('Received_Payment', 10, 2)->nullable();
            $table->datetime('Date_Processed')->nullable();
            $table->string('Processed_By')->nullable();
            $table->string('Payment_Method')->nullable();
            $table->string('Reference_No')->nullable();
            $table->string('OR_No')->nullable();
            $table->text('Remarks')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Status')->nullable();
            $table->string('Provider')->nullable();
            $table->string('Transaction_Type')->nullable();
            $table->string('Location')->nullable();
            $table->datetime('Payment_Date')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
            $table->string('Image')->nullable();
            $table->string('Plan')->nullable();
            $table->decimal('Account_Balance', 10, 2)->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Transactions');
    }
};

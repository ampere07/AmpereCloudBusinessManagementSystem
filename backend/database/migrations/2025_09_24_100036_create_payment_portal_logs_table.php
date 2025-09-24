<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Payment_Portal_Logs', function (Blueprint $table) {
            $table->string('Reference_No')->primary();
            $table->string('Account_No')->nullable();
            $table->string('Contact_No')->nullable();
            $table->decimal('Account_Balance', 10, 2)->nullable();
            $table->decimal('Total_Amount', 10, 2)->nullable();
            $table->datetime('Date_Time')->nullable();
            $table->string('Checkout_ID')->nullable();
            $table->string('Status')->nullable();
            $table->string('Transaction_Status')->nullable();
            $table->string('Provider')->nullable();
            $table->string('Location')->nullable();
            $table->string('Plan')->nullable();
            $table->string('EWallet_Type')->nullable();
            $table->string('Payment_Method')->nullable();
            $table->string('Payment_Channel')->nullable();
            $table->string('Name')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
            $table->string('Type')->nullable();

            $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
            $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('Payment_Portal_Logs');
    }
};

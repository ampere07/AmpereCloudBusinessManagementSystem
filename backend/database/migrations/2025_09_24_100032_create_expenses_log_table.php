<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Expenses_Log', function (Blueprint $table) {
            $table->string('Expenses_ID')->primary();
            $table->date('Date')->nullable();
            $table->string('Provider')->nullable();
            $table->text('Description')->nullable();
            $table->decimal('Amount', 10, 2)->nullable();
            $table->string('Photo')->nullable();
            $table->string('Processed_By')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Location')->nullable();
            $table->string('Payee')->nullable();
            $table->string('Category')->nullable();
            $table->string('Invoice_No')->nullable();
            $table->string('Cheque_No')->nullable();
            $table->date('Received_Date')->nullable();
            $table->string('Supplier')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Expenses_Log');
    }
};

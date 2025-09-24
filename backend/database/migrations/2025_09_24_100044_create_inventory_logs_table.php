<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Inventory_Logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->datetime('Date')->nullable();
            $table->string('Item_Name')->nullable();
            $table->text('Item_Description')->nullable();
            $table->string('Account_No')->nullable();
            $table->string('SN')->nullable();
            $table->integer('Item_Quantity')->nullable();
            $table->string('Requested_By')->nullable();
            $table->string('Requested_With')->nullable();
            $table->string('Status')->nullable();
            $table->text('Remarks')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->integer('Item_ID')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Inventory_Logs');
    }
};

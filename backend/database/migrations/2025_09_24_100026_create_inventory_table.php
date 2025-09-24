<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Inventory', function (Blueprint $table) {
            $table->string('Item_Name')->primary();
            $table->text('Item_Description')->nullable();
            $table->string('Supplier')->nullable();
            $table->integer('Quantity_Alert')->nullable();
            $table->string('Image')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Category')->nullable();
            $table->integer('Item_ID')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Inventory');
    }
};

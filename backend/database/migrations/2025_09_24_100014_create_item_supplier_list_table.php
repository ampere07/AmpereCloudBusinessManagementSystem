<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Item_Supplier_List', function (Blueprint $table) {
            $table->string('Supplier_Name')->primary();
            $table->string('Contact_Number')->nullable();
            $table->string('Email')->nullable();
            $table->string('Category')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Item_Supplier_List');
    }
};

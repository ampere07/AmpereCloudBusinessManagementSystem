<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Plan_List', function (Blueprint $table) {
            $table->string('Plan_Name')->primary();
            $table->text('Description')->nullable();
            $table->decimal('Price', 10, 2)->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('Modified_By')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Plan_List');
    }
};

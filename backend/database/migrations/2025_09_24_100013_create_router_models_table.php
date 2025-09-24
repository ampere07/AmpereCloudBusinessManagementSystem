<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Router_Models', function (Blueprint $table) {
            $table->string('Model')->primary();
            $table->string('Brand')->nullable();
            $table->text('Description')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Router_Models');
    }
};

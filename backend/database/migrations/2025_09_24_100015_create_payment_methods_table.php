<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Payment_Methods', function (Blueprint $table) {
            $table->integer('Payment_Method_ID')->primary();
            $table->string('Payment_Method')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Payment_Methods');
    }
};

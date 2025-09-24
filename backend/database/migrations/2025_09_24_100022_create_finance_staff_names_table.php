<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Finance_Staff_Names', function (Blueprint $table) {
            $table->string('Name')->primary();
            $table->date('Started_Date')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('Modified_By')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Finance_Staff_Names');
    }
};

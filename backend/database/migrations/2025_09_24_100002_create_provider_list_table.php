<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Provider_List', function (Blueprint $table) {
            $table->string('Provider_Name')->primary();
            $table->string('FB_Page_Link')->nullable();
            $table->string('FB_Messenger_Link')->nullable();
            $table->integer('Template')->nullable();
            $table->string('Company_Name')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('Modified_By')->nullable();
            $table->string('Portal_Url')->nullable();
            $table->string('Hotline')->nullable();
            $table->string('Email')->nullable();
            $table->string('FB_Username')->nullable();
            $table->string('IG_Username')->nullable();
            $table->string('Website')->nullable();
            $table->string('Customer_Tag')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Provider_List');
    }
};

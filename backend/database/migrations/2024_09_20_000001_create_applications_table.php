<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('app_applications', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->timestamp('timestamp')->nullable();
            $table->text('address');
            $table->string('status')->nullable();
            $table->string('location')->nullable();
            $table->string('email')->nullable();
            $table->string('mobile_number')->nullable();
            $table->string('secondary_number')->nullable();
            $table->timestamp('visit_date')->nullable();
            $table->string('visit_by')->nullable();
            $table->string('visit_with')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('last_modified')->nullable();
            $table->string('modified_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('app_applications');
    }
}

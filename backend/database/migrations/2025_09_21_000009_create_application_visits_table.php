<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationVisitsTable extends Migration
{
    public function up()
    {
        Schema::create('application_visits', function (Blueprint $table) {
            $table->id();
            $table->string('application_id');
            $table->string('assigned_email')->nullable();
            $table->string('visit_by')->nullable();
            $table->string('visit_with')->nullable();
            $table->string('visit_with_other')->nullable();
            $table->string('visit_status')->nullable();
            $table->text('visit_remarks')->nullable();
            $table->text('visit_notes')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_initial')->nullable();
            $table->string('contact_number');
            $table->string('second_contact_number')->nullable();
            $table->string('email_address');
            $table->text('address');
            $table->string('location')->nullable();
            $table->string('barangay')->nullable();
            $table->string('city')->nullable();
            $table->string('region')->nullable();
            $table->string('choose_plan')->nullable();
            $table->integer('barangay_id')->nullable();
            $table->integer('city_id')->nullable();
            $table->integer('region_id')->nullable();
            $table->integer('plan_id')->nullable();
            $table->text('remarks')->nullable();
            $table->text('installation_landmark')->nullable();
            $table->string('application_status')->nullable();
            $table->string('modified_by')->nullable();
            $table->dateTime('modified_date')->nullable();
            $table->dateTime('scheduled_date');
            $table->text('status_remarks')->nullable();
            $table->string('referrer_account_number')->nullable();
            $table->string('application_identifier')->nullable();
            $table->string('house_front_picture')->nullable();
            $table->integer('group_id')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('application_visits');
    }
}
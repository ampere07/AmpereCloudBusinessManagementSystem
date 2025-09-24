<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Application_Visit', function (Blueprint $table) {
            $table->string('ID')->primary();
            $table->datetime('Timestamp')->nullable();
            $table->string('Email_Address')->nullable();
            $table->string('Referred_By')->nullable();
            $table->string('First_Name')->nullable();
            $table->string('Middle_Initial')->nullable();
            $table->string('Last_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Applicant_Email_Address')->nullable();
            $table->text('Address')->nullable();
            $table->string('Location')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
            $table->string('Region')->nullable();
            $table->string('Choose_Plan')->nullable();
            $table->text('Remarks')->nullable();
            $table->string('Installation_Landmark')->nullable();
            $table->string('Second_Contact_Number')->nullable();
            $table->string('Assigned_Email')->nullable();
            $table->string('Image_1')->nullable();
            $table->string('Image_2')->nullable();
            $table->string('Image_3')->nullable();
            $table->string('Visit_By')->nullable();
            $table->string('Visit_With')->nullable();
            $table->string('Visit_With_Other')->nullable();
            $table->string('Visit_Status')->nullable();
            $table->text('Visit_Remarks')->nullable();
            $table->string('Application_Status')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('Status_Remarks')->nullable();
            $table->string('Referrers_Account_Number')->nullable();
            $table->integer('Application_ID')->nullable();
            $table->string('House_Front_Picture')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Application_Visit');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Application', function (Blueprint $table) {
            $table->integer('Application_ID')->primary();
            $table->datetime('Timestamp')->nullable();
            $table->string('Email_Address')->nullable();
            $table->string('Region')->nullable();
            $table->string('City')->nullable();
            $table->string('Barangay')->nullable();
            $table->string('Referred_by')->nullable();
            $table->string('First_Name')->nullable();
            $table->string('Middle_Initial')->nullable();
            $table->string('Last_Name')->nullable();
            $table->string('Mobile_Number')->nullable();
            $table->string('Secondary_Mobile_Number')->nullable();
            $table->text('Installation_Address')->nullable();
            $table->text('Landmark')->nullable();
            $table->string('Desired_Plan')->nullable();
            $table->string('Proof_of_Billing')->nullable();
            $table->string('Government_Valid_ID')->nullable();
            $table->string('2nd_Government_Valid_ID')->nullable();
            $table->string('House_Front_Picture')->nullable();
            $table->boolean('I_agree_to_the_terms_and_conditions')->nullable();
            $table->text('First_Nearest_landmark')->nullable();
            $table->text('Second_Nearest_landmark')->nullable();
            $table->string('Select_the_applicable_promo')->nullable();
            $table->string('Attach_the_picture_of_your_document')->nullable();
            $table->string('Attach_SOA_from_other_provider')->nullable();
            $table->string('Referrers_Account_Number')->nullable();
            $table->string('Applying_for')->nullable();
            $table->string('Status')->nullable();
            $table->string('Visit_By')->nullable();
            $table->string('Visit_With')->nullable();
            $table->string('Visit_With_Other')->nullable();
            $table->text('Remarks')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            
            $table->foreign('Desired_Plan')->references('Plan_Name')->on('Plan_List')->onDelete('cascade');
            $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('cascade');
            $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('Application');
    }
};

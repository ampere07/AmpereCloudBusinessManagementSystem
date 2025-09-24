<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Job_Order', function (Blueprint $table) {
            $table->string('id')->primary();
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
            $table->decimal('Installation_Fee', 10, 2)->nullable();
            $table->integer('Contract_Template')->nullable();
            $table->integer('Billing_Day')->nullable();
            $table->string('Preferred_Day')->nullable();
            $table->text('JO_Remarks')->nullable();
            $table->string('Status')->nullable();
            $table->string('Verified_By')->nullable();
            $table->string('Modem_Router_SN')->nullable();
            $table->string('Provider')->nullable();
            $table->string('LCP')->nullable();
            $table->string('NAP')->nullable();
            $table->string('PORT')->nullable();
            $table->string('VLAN')->nullable();
            $table->string('Username')->nullable();
            $table->string('Visit_By')->nullable();
            $table->string('Visit_With')->nullable();
            $table->string('Visit_With_Other')->nullable();
            $table->string('Onsite_Status')->nullable();
            $table->text('Onsite_Remarks')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('Contract_Link')->nullable();
            $table->string('Connection_Type')->nullable();
            $table->string('Assigned_Email')->nullable();
            $table->string('Setup_Image')->nullable();
            $table->string('Speedtest_Image')->nullable();
            $table->datetime('StartTimeStamp')->nullable();
            $table->datetime('EndTimeStamp')->nullable();
            $table->time('Duration')->nullable();
            $table->string('LCPNAP')->nullable();
            $table->string('Billing_Status')->nullable();
            $table->string('Router_Model')->nullable();
            $table->date('Date_Installed')->nullable();
            $table->string('Client_Signature')->nullable();
            $table->string('IP')->nullable();
            $table->string('Signed_Contract_Image')->nullable();
            $table->string('Box_Reading_Image')->nullable();
            $table->string('Router_Reading_Image')->nullable();
            $table->string('Username_Status')->nullable();
            $table->string('LCPNAPPORT')->nullable();
            $table->string('Item_Name_1')->nullable();
            $table->integer('Item_Quantity_1')->nullable();
            $table->string('Item_Name_2')->nullable();
            $table->integer('Item_Quantity_2')->nullable();
            $table->string('Item_Name_3')->nullable();
            $table->integer('Item_Quantity_3')->nullable();
            $table->string('Item_Name_4')->nullable();
            $table->integer('Item_Quantity_4')->nullable();
            $table->string('Item_Name_5')->nullable();
            $table->integer('Item_Quantity_5')->nullable();
            $table->string('Item_Name_6')->nullable();
            $table->integer('Item_Quantity_6')->nullable();
            $table->string('Item_Name_7')->nullable();
            $table->integer('Item_Quantity_7')->nullable();
            $table->string('Item_Name_8')->nullable();
            $table->integer('Item_Quantity_8')->nullable();
            $table->string('Item_Name_9')->nullable();
            $table->integer('Item_Quantity_9')->nullable();
            $table->string('Item_Name_10')->nullable();
            $table->integer('Item_Quantity_10')->nullable();
            $table->string('Usage_Type')->nullable();
            $table->boolean('Renter')->nullable();
            $table->string('Installation_Landmark')->nullable();
            $table->string('Status_Remarks')->nullable();
            $table->string('Port_Label_Image')->nullable();
            $table->string('Second_Contact_Number')->nullable();
            $table->string('Account_No')->nullable();
            $table->string('Address_Coordinates')->nullable();
            $table->string('Referrers_Account_Number')->nullable();
            $table->integer('Application_ID')->nullable();
            $table->string('House_Front_Picture')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Job_Order');
    }
};

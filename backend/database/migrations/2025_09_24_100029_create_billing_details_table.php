<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Billing_Details', function (Blueprint $table) {
            $table->string('Account_No')->primary();
            $table->datetime('Date_Installed')->nullable();
            $table->string('Full_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Email_Address')->nullable();
            $table->text('Address')->nullable();
            $table->string('Location')->nullable();
            $table->string('Plan')->nullable();
            $table->string('Provider')->nullable();
            $table->decimal('Account_Balance', 10, 2)->nullable();
            $table->datetime('Balance_Update_Date')->nullable();
            $table->string('Username')->nullable();
            $table->string('Connection_Type')->nullable();
            $table->string('Router_Modem_SN')->nullable();
            $table->string('IP')->nullable();
            $table->string('LCP')->nullable();
            $table->string('NAP')->nullable();
            $table->string('PORT')->nullable();
            $table->string('VLAN')->nullable();
            $table->string('LCPNAP')->nullable();
            $table->string('Status')->nullable();
            $table->string('Group')->nullable();
            $table->string('SPLYNX_ID')->nullable();
            $table->string('MIKROTIK_ID')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->integer('Billing_Day')->nullable();
            $table->string('Billing_Status')->nullable();
            $table->string('Delivery_Status')->nullable();
            $table->string('Router_Model')->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
            $table->string('Region')->nullable();
            $table->string('LCPNAPPORT')->nullable();
            $table->string('Usage_Type')->nullable();
            $table->string('Renter')->nullable();
            $table->string('Attachment_1')->nullable();
            $table->string('Attachment_2')->nullable();
            $table->string('Attachment_3')->nullable();
            $table->string('Referred_By')->nullable();
            $table->string('Second_Contact_Number')->nullable();
            $table->string('Address_Coordinates')->nullable();
            $table->string('Referrers_Account_Number')->nullable();
            $table->string('House_Front_Picture')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Billing_Details');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('job_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('Application_ID')->nullable();
            $table->datetime('Timestamp')->nullable();
            $table->string('Email_Address')->nullable();
            $table->string('Referred_By')->nullable();
            $table->string('First_Name')->nullable();
            $table->string('Middle_Initial')->nullable();
            $table->string('Last_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Applicant_Email_Address')->nullable();
            $table->string('Address')->nullable();
            $table->string('Location')->nullable();
            $table->string('Barangay')->nullable();
            $table->string('City')->nullable();
            $table->string('Region')->nullable();
            $table->string('Choose_Plan')->nullable();
            $table->string('Remarks')->nullable();
            $table->decimal('Installation_Fee', 10, 2)->nullable();
            $table->string('Contract_Template')->nullable();
            $table->string('Billing_Day')->nullable();
            $table->string('Preferred_Day')->nullable();
            $table->string('JO_Remarks')->nullable();
            $table->string('Status')->nullable();
            $table->string('Verified_By')->nullable();
            $table->string('Modem_Router_SN')->nullable();
            $table->string('LCP')->nullable();
            $table->string('NAP')->nullable();
            $table->string('PORT')->nullable();
            $table->string('VLAN')->nullable();
            $table->string('Username')->nullable();
            $table->string('Visit_By')->nullable();
            $table->string('Visit_With')->nullable();
            $table->string('Visit_With_Other')->nullable();
            $table->string('Onsite_Status')->nullable();
            $table->string('Onsite_Remarks')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('Contract_Link')->nullable();
            $table->string('Connection_Type')->nullable();
            $table->string('Assigned_Email')->nullable();
            $table->string('Setup_Image')->nullable();
            $table->string('Speedtest_Image')->nullable();
            $table->datetime('StartTimeStamp')->nullable();
            $table->datetime('EndTimeStamp')->nullable();
            $table->string('Duration')->nullable();
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
            $table->string('Usage_Type')->nullable();
            $table->string('Renter')->nullable();
            $table->string('Installation_Landmark')->nullable();
            $table->string('Status_Remarks')->nullable();
            $table->string('Port_Label_Image')->nullable();
            $table->string('Second_Contact_Number')->nullable();
            $table->string('Account_No')->nullable();
            $table->string('Address_Coordinates')->nullable();
            $table->string('Referrers_Account_Number')->nullable();
            $table->string('House_Front_Picture')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('Application_ID')->references('id')->on('app_applications')->onDelete('set null');
            $table->foreign('Modem_Router_SN')->references('SN')->on('modem_router_sn')->onDelete('set null');
            $table->foreign('Contract_Template')->references('Template_Name')->on('contract_templates')->onDelete('set null');
            $table->foreign('LCP')->references('LCP_ID')->on('lcp')->onDelete('set null');
            $table->foreign('NAP')->references('NAP_ID')->on('nap')->onDelete('set null');
            $table->foreign('PORT')->references('PORT_ID')->on('ports')->onDelete('set null');
            $table->foreign('VLAN')->references('VLAN_ID')->on('vlans')->onDelete('set null');
            $table->foreign('LCPNAP')->references('LCPNAP_ID')->on('lcpnap')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('job_orders');
    }
};

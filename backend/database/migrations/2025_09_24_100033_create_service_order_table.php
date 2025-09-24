<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('Service_Order', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->datetime('Timestamp')->nullable();
            $table->string('Account_No')->nullable();
            $table->datetime('Date_Installed')->nullable();
            $table->string('Full_Name')->nullable();
            $table->string('Contact_Number')->nullable();
            $table->string('Email_Address')->nullable();
            $table->text('Address')->nullable();
            $table->string('Location')->nullable();
            $table->string('Plan')->nullable();
            $table->string('Provider')->nullable();
            $table->string('Username')->nullable();
            $table->string('Connection_Type')->nullable();
            $table->string('Router_Modem_SN')->nullable();
            $table->string('LCP')->nullable();
            $table->string('NAP')->nullable();
            $table->string('PORT')->nullable();
            $table->string('VLAN')->nullable();
            $table->string('Support_Status')->nullable();
            $table->string('Concern')->nullable();
            $table->text('Concern_Remarks')->nullable();
            $table->string('Priority_Level')->nullable();
            $table->string('Visit_Status')->nullable();
            $table->string('Visit_By')->nullable();
            $table->string('Visit_With')->nullable();
            $table->string('Visit_With_Other')->nullable();
            $table->text('Visit_Remarks')->nullable();
            $table->string('Modified_By')->nullable();
            $table->datetime('Modified_Date')->nullable();
            $table->string('User_Email')->nullable();
            $table->string('Requested_by')->nullable();
            $table->string('Assigned_Email')->nullable();
            $table->datetime('StartTimeStamp')->nullable();
            $table->datetime('StopTimeStamp')->nullable();
            $table->time('Duration')->nullable();
            $table->string('Repair_Category')->nullable();
            $table->string('New_Router_Modem_SN')->nullable();
            $table->string('New_LCP')->nullable();
            $table->string('New_NAP')->nullable();
            $table->string('New_Port')->nullable();
            $table->string('New_VLAN')->nullable();
            $table->string('Router_Model')->nullable();
            $table->string('Client_Signature')->nullable();
            $table->string('New_Plan')->nullable();
            $table->text('Support_Remarks')->nullable();
            $table->string('Pullout_Router_Model')->nullable();
            $table->string('Pullout_Router_SN')->nullable();
            $table->string('Pullout_CPE_SN')->nullable();
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
            $table->string('Image_1')->nullable();
            $table->string('Image_2')->nullable();
            $table->string('Image_3')->nullable();
            $table->decimal('Service_Charge', 10, 2)->nullable();
            $table->integer('Barangay')->nullable();
            $table->string('City')->nullable();
            $table->string('NEW_LCPNAPPORT')->nullable();
            $table->string('Status_Remarks')->nullable();
            $table->string('Address_Coordinate')->nullable();
            $table->string('House_Front_Picture')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('Service_Order');
    }
};

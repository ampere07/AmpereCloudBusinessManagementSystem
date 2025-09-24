<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // === Billing and Financial Management Foreign Keys ===
        
        // Billing_Details foreign keys
        try {
            Schema::table('Billing_Details', function (Blueprint $table) {
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('LCP')->references('LCP_Name')->on('LCP')->onDelete('set null');
                $table->foreign('NAP')->references('NAP_Name')->on('NAP')->onDelete('set null');
                $table->foreign('PORT')->references('Port_Name')->on('Port')->onDelete('set null');
                $table->foreign('VLAN')->references('VLAN_Name')->on('VLAN')->onDelete('set null');
                $table->foreign('Modified_By')->references('Name')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Statement_of_Account foreign keys
        try {
            Schema::table('Statement_of_Account', function (Blueprint $table) {
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Modified_By')->references('Name')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Invoice foreign keys
        try {
            Schema::table('Invoice', function (Blueprint $table) {
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Processed_By')->references('Name')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Modified_By')->references('Name')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Transactions foreign keys
        try {
            Schema::table('Transactions', function (Blueprint $table) {
                $table->foreign('Processed_By')->references('Name')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Payment_Portal_Logs foreign keys
        try {
            Schema::table('Payment_Portal_Logs', function (Blueprint $table) {
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Adjusted_Account_Logs foreign keys
        try {
            Schema::table('Adjusted_Account_Logs', function (Blueprint $table) {
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Modified_By')->references('Name')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Discounts foreign keys
        try {
            Schema::table('Discounts', function (Blueprint $table) {
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Processed_By')->references('Name')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Approved_By')->references('Name')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Invoice_Used')->references('Invoice_No')->on('Invoice')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Advanced_Payment foreign keys
        try {
            Schema::table('Advanced_Payment', function (Blueprint $table) {
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Received_By')->references('Name')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Invoice_Used')->references('Invoice_No')->on('Invoice')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Security_Deposit foreign keys
        try {
            Schema::table('Security_Deposit', function (Blueprint $table) {
                $table->foreign('Processed_By')->references('Name')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Staggered_Installation foreign keys
        try {
            Schema::table('Staggered_Installation', function (Blueprint $table) {
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('1st_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('2nd_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('3rd_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('4th_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('5th_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('6th_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('7th_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('8th_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('9th_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('10th_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('11th_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('12th_Invoice_No')->references('Invoice_No')->on('Invoice')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Expenses_Log foreign keys
        try {
            Schema::table('Expenses_Log', function (Blueprint $table) {
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Category')->references('Category_Name')->on('Expenses_Category')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // === Operations and Service Delivery Foreign Keys ===

        // Application foreign keys
        try {
            Schema::table('Application', function (Blueprint $table) {
                $table->foreign('Desired_Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Job_Order foreign keys
        try {
            Schema::table('Job_Order', function (Blueprint $table) {
                $table->foreign('Choose_Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('LCP')->references('LCP_Name')->on('LCP')->onDelete('set null');
                $table->foreign('NAP')->references('NAP_Name')->on('NAP')->onDelete('set null');
                $table->foreign('PORT')->references('Port_Name')->on('Port')->onDelete('set null');
                $table->foreign('VLAN')->references('VLAN_Name')->on('VLAN')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Item_Name_1')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_2')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_3')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_4')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_5')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_6')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_7')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_8')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_9')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_10')->references('Item_Name')->on('Inventory')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Application_Visit foreign keys
        try {
            Schema::table('Application_Visit', function (Blueprint $table) {
                $table->foreign('Choose_Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Service_Order foreign keys
        try {
            Schema::table('Service_Order', function (Blueprint $table) {
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('LCP')->references('LCP_Name')->on('LCP')->onDelete('set null');
                $table->foreign('NAP')->references('NAP_Name')->on('NAP')->onDelete('set null');
                $table->foreign('PORT')->references('Port_Name')->on('Port')->onDelete('set null');
                $table->foreign('VLAN')->references('VLAN_Name')->on('VLAN')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Requested_by')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('New_LCP')->references('LCP_Name')->on('LCP')->onDelete('set null');
                $table->foreign('New_NAP')->references('NAP_Name')->on('NAP')->onDelete('set null');
                $table->foreign('New_Port')->references('Port_Name')->on('Port')->onDelete('set null');
                $table->foreign('New_VLAN')->references('VLAN_Name')->on('VLAN')->onDelete('set null');
                $table->foreign('New_Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Item_Name_1')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_2')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_3')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_4')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_5')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_6')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_7')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_8')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_9')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Item_Name_10')->references('Item_Name')->on('Inventory')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Disconnected_Logs foreign keys
        try {
            Schema::table('Disconnected_Logs', function (Blueprint $table) {
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Reconnection_Logs foreign keys
        try {
            Schema::table('Reconnection_Logs', function (Blueprint $table) {
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // === Inventory and Asset Management Foreign Keys ===

        // Inventory foreign keys
        try {
            Schema::table('Inventory', function (Blueprint $table) {
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('Category')->references('Category_Name')->on('Inventory_Category')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Inventory_Logs foreign keys
        try {
            Schema::table('Inventory_Logs', function (Blueprint $table) {
                $table->foreign('Item_Name')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Borrowed_Logs foreign keys
        try {
            Schema::table('Borrowed_Logs', function (Blueprint $table) {
                $table->foreign('Item_Name')->references('Item_Name')->on('Inventory')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // === User and Access Control Foreign Keys ===

        // Admin_User_List foreign keys
        try {
            Schema::table('Admin_User_List', function (Blueprint $table) {
                $table->foreign('Email')->references('Email')->on('Employee_Email')->onDelete('cascade');
            });
        } catch (Exception $e) {}

        // IT_User_List foreign keys
        try {
            Schema::table('IT_User_List', function (Blueprint $table) {
                $table->foreign('Email')->references('Email')->on('Employee_Email')->onDelete('cascade');
            });
        } catch (Exception $e) {}

        // Technician_User_List foreign keys
        try {
            Schema::table('Technician_User_List', function (Blueprint $table) {
                $table->foreign('Email')->references('Email')->on('Employee_Email')->onDelete('cascade');
            });
        } catch (Exception $e) {}

        // Head_Tech_User_List foreign keys
        try {
            Schema::table('Head_Tech_User_List', function (Blueprint $table) {
                $table->foreign('Email')->references('Email')->on('Employee_Email')->onDelete('cascade');
            });
        } catch (Exception $e) {}

        // === Geographic and Network Infrastructure Foreign Keys ===

        // LCP_NAP_Location foreign keys
        try {
            Schema::table('LCP_NAP_Location', function (Blueprint $table) {
                $table->foreign('LCP')->references('LCP_Name')->on('LCP')->onDelete('set null');
                $table->foreign('NAP')->references('NAP_Name')->on('NAP')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // === Lookup and System Tables Foreign Keys ===

        // Plan_List foreign keys
        try {
            Schema::table('Plan_List', function (Blueprint $table) {
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Router_Models foreign keys
        try {
            Schema::table('Router_Models', function (Blueprint $table) {
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Service_Charge_Logs foreign keys
        try {
            Schema::table('Service_Charge_Logs', function (Blueprint $table) {
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Plan_Change_Logs foreign keys
        try {
            Schema::table('Plan_Change_Logs', function (Blueprint $table) {
                $table->foreign('Old_Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('New_Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
                $table->foreign('User_Email')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}

        // Change_Due_Logs foreign keys
        try {
            Schema::table('Change_Due_Logs', function (Blueprint $table) {
                $table->foreign('Plan')->references('Plan_Name')->on('Plan_List')->onDelete('set null');
                $table->foreign('Provider')->references('Provider_Name')->on('Provider_List')->onDelete('set null');
                $table->foreign('Modified_By')->references('Email')->on('Employee_Email')->onDelete('set null');
            });
        } catch (Exception $e) {}
    }

    public function down()
    {
        // Drop all foreign keys in reverse order
        // Implementation would drop all the foreign key constraints created above
    }
};

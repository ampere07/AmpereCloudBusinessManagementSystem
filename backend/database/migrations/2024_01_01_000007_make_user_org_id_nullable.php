<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['org_id']);
            
            // Make org_id nullable
            $table->integer('org_id')->nullable()->change();
            
            // Add the foreign key constraint with SET NULL on delete
            $table->foreign('org_id')->references('org_id')->on('organizations')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['org_id']);
            
            // Make org_id not nullable
            $table->integer('org_id')->nullable(false)->change();
            
            // Add the foreign key constraint with CASCADE on delete
            $table->foreign('org_id')->references('org_id')->on('organizations')->onDelete('cascade');
        });
    }
};

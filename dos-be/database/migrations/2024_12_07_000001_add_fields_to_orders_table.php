<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop the total_amount column
            $table->dropColumn('total_amount');

            // Add new columns
            $table->decimal('shipping_fee', 10, 2)->after('payment_method');
            $table->decimal('subtotal', 10, 2)->after('shipping_fee');
            $table->decimal('total', 10, 2)->after('subtotal');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Remove new columns
            $table->dropColumn(['shipping_fee', 'subtotal', 'total']);

            // Add back the total_amount column
            $table->decimal('total_amount', 10, 2)->after('payment_method');
        });
    }
};

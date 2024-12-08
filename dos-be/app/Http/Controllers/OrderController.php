<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $orders = Order::with('orderItems.product')
                ->where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'orders' => $orders
            ]);
        } catch (\Exception $e) {
            Log::error('Order retrieval error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to retrieve orders'], 500);
        }
    }

    public function store(Request $request)
    {
        Log::info('Order request received', ['data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'shipping_address' => 'required|string',
            'payment_method' => 'required|in:cash on delivery,online payment',
            'shipping_fee' => 'required|numeric|min:0',
            'cart_items' => 'required|array|min:1',
            'cart_items.*.product_id' => 'required|exists:products,id',
            'cart_items.*.quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            Log::error('Order validation failed', ['errors' => $validator->errors()->toArray()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            Log::info('Starting order creation with cart items', ['cart_items' => $request->cart_items]);

            // Get cart items from request
            $cartItems = collect($request->cart_items)->map(function ($item) {
                try {
                    $product = Product::findOrFail($item['product_id']);
                    return (object)[
                        'product' => $product,
                        'quantity' => $item['quantity'],
                        'product_id' => $item['product_id']
                    ];
                } catch (\Exception $e) {
                    Log::error('Error loading product', [
                        'product_id' => $item['product_id'],
                        'error' => $e->getMessage()
                    ]);
                    throw $e;
                }
            });

            // Validate stock
            foreach ($cartItems as $item) {
                if ($item->product->quantity < $item->quantity) {
                    Log::warning('Insufficient stock', [
                        'product' => $item->product->name,
                        'requested' => $item->quantity,
                        'available' => $item->product->quantity
                    ]);
                    return response()->json([
                        'message' => "Insufficient stock for {$item->product->name}. Available: {$item->product->quantity}"
                    ], 422);
                }
            }

            // Calculate totals
            $subtotal = $cartItems->sum(function ($item) {
                return $item->quantity * $item->product->price;
            });

            $total = $subtotal + $request->shipping_fee;

            Log::info('Creating order', [
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'total' => $total
            ]);

            // Create order
            $order = Order::create([
                'user_id' => $request->user()->id,
                'shipping_address' => $request->shipping_address,
                'payment_method' => $request->payment_method,
                'shipping_fee' => $request->shipping_fee,
                'subtotal' => $subtotal,
                'total' => $total,
                'status' => 'pending'
            ]);

            Log::info('Order created', ['order_id' => $order->id]);

            // Create order items and reduce stock
            foreach ($cartItems as $item) {
                $order->orderItems()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price
                ]);

                // Reduce stock
                $item->product->decrement('quantity', $item->quantity);
            }

            DB::commit();

            Log::info('Order completed successfully', ['order_id' => $order->id]);

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $order->load('orderItems.product')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json(['message' => 'Failed to create order: ' . $e->getMessage()], 500);
        }
    }

    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            return response()->json([
                'order' => $order->load('orderItems.product')
            ]);
        } catch (\Exception $e) {
            Log::error('Order detail retrieval error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to retrieve order details'], 500);
        }
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $order->update(['status' => $request->status]);

            return response()->json([
                'message' => 'Order status updated successfully',
                'order' => $order->load('orderItems.product')
            ]);
        } catch (\Exception $e) {
            Log::error('Order status update error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update order status'], 500);
        }
    }
}
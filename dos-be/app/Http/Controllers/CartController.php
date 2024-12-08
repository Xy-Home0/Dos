<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    public function getCartCount(Request $request)
    {
        try {
            $count = Cart::where('user_id', $request->user()->id)
                        ->sum('quantity');

            return response()->json([
                'cart_count' => $count
            ]);
        } catch (\Exception $e) {
            Log::error('Cart count retrieval error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to retrieve cart count'], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            $cartItems = Cart::with('product')
                ->where('user_id', $request->user()->id)
                ->get();

            $items = $cartItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'price_per_item' => $item->product->price,
                    'total_price' => $item->total_price,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'price' => $item->product->price,
                        'description' => $item->product->description,
                        'available_quantity' => $item->product->quantity
                    ]
                ];
            });

            return response()->json([
                'items' => $items,
                'total' => $cartItems->sum('total_price'),
                'item_count' => $cartItems->sum('quantity')
            ]);
        } catch (\Exception $e) {
            Log::error('Cart retrieval error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to retrieve cart'], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $product = Product::findOrFail($request->product_id);
            
            if ($product->quantity < $request->quantity) {
                return response()->json([
                    'message' => 'Insufficient stock. Available: ' . $product->quantity
                ], 422);
            }

            $existingItem = Cart::where('user_id', $request->user()->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingItem) {
                $newQuantity = $existingItem->quantity + $request->quantity;
                if ($product->quantity < $newQuantity) {
                    return response()->json([
                        'message' => 'Cannot add more items. Would exceed available stock.'
                    ], 422);
                }
                $existingItem->quantity = $newQuantity;
                $existingItem->save();
                $cartItem = $existingItem;
            } else {
                $cartItem = Cart::create([
                    'user_id' => $request->user()->id,
                    'product_id' => $request->product_id,
                    'quantity' => $request->quantity
                ]);
            }

            $cartItem->load('product');

            return response()->json([
                'message' => 'Product added to cart successfully',
                'cart_item' => [
                    'id' => $cartItem->id,
                    'product_name' => $cartItem->product->name,
                    'quantity' => $cartItem->quantity,
                    'price_per_item' => $cartItem->product->price,
                    'total_price' => $cartItem->total_price,
                    'product' => [
                        'id' => $cartItem->product->id,
                        'name' => $cartItem->product->name,
                        'price' => $cartItem->product->price
                    ]
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Add to cart error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to add item to cart'], 500);
        }
    }

    public function update(Request $request, Cart $cart)
    {
        if ($cart->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $product = $cart->product;
            
            if ($product->quantity < $request->quantity) {
                return response()->json([
                    'message' => 'Insufficient stock. Available: ' . $product->quantity
                ], 422);
            }

            $cart->quantity = $request->quantity;
            $cart->save();
            $cart->load('product');

            return response()->json([
                'message' => 'Cart updated successfully',
                'cart_item' => [
                    'id' => $cart->id,
                    'product_name' => $cart->product->name,
                    'quantity' => $cart->quantity,
                    'price_per_item' => $cart->product->price,
                    'total_price' => $cart->total_price,
                    'product' => [
                        'id' => $cart->product->id,
                        'name' => $cart->product->name,
                        'price' => $cart->product->price
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Cart update error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update cart'], 500);
        }
    }

    public function destroy(Request $request, Cart $cart)
    {
        if ($cart->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $cart->delete();
            return response()->json([
                'message' => 'Item removed from cart successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Cart item deletion error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to remove item from cart'], 500);
        }
    }
}
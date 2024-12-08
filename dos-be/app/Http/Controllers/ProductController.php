<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Product::query();

            // Search by name or description
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Filter by category
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            // Filter by price range
            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }

            // Filter by availability
            if ($request->has('in_stock')) {
                $query->where('quantity', '>', 0);
            }

            $products = $query->get();

            return response()->json([
                'products' => $products
            ]);
        } catch (\Exception $e) {
            Log::error('Product retrieval error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to retrieve products'], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'barcode' => 'required|string|unique:products',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'category' => 'required|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $product = Product::create($request->all());
            return response()->json($product, 201);
        } catch (\Exception $e) {
            Log::error('Product creation error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create product'], 500);
        }
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'barcode' => 'string|unique:products,barcode,' . $product->id,
            'name' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric|min:0',
            'quantity' => 'integer|min:0',
            'category' => 'string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $product->update($request->all());
            return response()->json($product);
        } catch (\Exception $e) {
            Log::error('Product update error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update product'], 500);
        }
    }

    public function destroy(Product $product)
    {
        try {
            $product->delete();
            return response()->json(['message' => 'Product deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Product deletion error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete product'], 500);
        }
    }

    public function categories()
    {
        try {
            $categories = Product::select('category')
                ->distinct()
                ->whereNotNull('category')
                ->pluck('category');

            return response()->json([
                'categories' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Category retrieval error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to retrieve categories'], 500);
        }
    }
}
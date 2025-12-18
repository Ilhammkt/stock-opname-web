import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

type Product = {
  barcode: string
  product_name: string
  uom: string
  selling_price: number
}

export async function POST(request: Request) {
  try {
    const { products } = await request.json()
    const supabase = await createClient()

    if (!products || products.length === 0) {
      return NextResponse.json({ message: "No products to import" }, { status: 400 })
    }

    // Remove duplicates berdasarkan barcode
    const uniqueProducts = Array.from(
      new Map((products as Product[]).map((p: Product) => [p.barcode, p])).values()
    ) as Product[]

    // Insert atau update data
    const { data, error } = await supabase
      .from("master_products")
      .upsert(
        uniqueProducts.map((p: Product) => ({
          barcode: p.barcode,
          product_name: p.product_name,
          uom: p.uom,
          selling_price: p.selling_price,
        })),
        { onConflict: "barcode" }
      )
      .select()

    if (error) {
      console.error("[v0] Error importing products:", error)
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `${data.length} produk berhasil diimport`,
      data,
    })
  } catch (error) {
    console.error("[v0] Error processing import:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
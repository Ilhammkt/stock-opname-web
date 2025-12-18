import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { products } = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase.from("master_products").upsert(
      products.map((p: any) => ({
        barcode: p.barcode,
        product_name: p.product_name,
        uom: p.uom,
        selling_price: p.selling_price,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "barcode" },
    )

    if (error) {
      console.error("[v0] Error importing products:", error)
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error processing import:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

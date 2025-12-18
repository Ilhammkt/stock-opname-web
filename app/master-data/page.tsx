import { createClient } from "@/lib/supabase/server"
import { MasterDataClient } from "@/components/master-data-client"

export default async function MasterDataPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from("master_products")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Master Data Produk</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <MasterDataClient initialProducts={products || []} />
      </main>
    </div>
  )
}

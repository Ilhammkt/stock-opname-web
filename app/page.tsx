import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, FolderOpen, FileSpreadsheet } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Stock Opname System</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Master Data
              </CardTitle>
              <CardDescription>Import dan kelola data master produk</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/master-data">
                <Button className="w-full">Kelola Master Data</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Stock Count
              </CardTitle>
              <CardDescription>Hitung stok berdasarkan lokasi</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stock-count">
                <Button className="w-full">Mulai Hitung Stok</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Export Data
              </CardTitle>
              <CardDescription>Export hasil perhitungan stok</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/export">
                <Button className="w-full">Export Data</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

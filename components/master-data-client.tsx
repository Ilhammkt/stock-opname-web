"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Upload, ArrowLeft, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Product = {
  id: string
  barcode: string
  product_name: string
  uom: string
  selling_price: number
  created_at: string
}

const ITEMS_PER_PAGE = 50

export function MasterDataClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isUploading, setIsUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const router = useRouter()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        alert("File CSV kosong atau tidak valid")
        setIsUploading(false)
        return
      }

      const headers = lines[0].toLowerCase().split(",").map((h) => h.trim())

      const barcodeIndex = headers.findIndex((h) => h.includes("barcode"))
      const productNameIndex = headers.findIndex((h) => h.includes("productname") || h.includes("product_name"))
      const uomIndex = headers.findIndex((h) => h.includes("uom"))
      const priceIndex = headers.findIndex((h) => h.includes("sellingprice") || h.includes("selling_price") || h.includes("price"))

      if (barcodeIndex === -1 || productNameIndex === -1 || uomIndex === -1 || priceIndex === -1) {
        alert(`Format CSV tidak valid. Ditemukan headers: ${headers.join(", ")}`)
        setIsUploading(false)
        return
      }

      const productsToImport = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))

        return {
          barcode: values[barcodeIndex],
          product_name: values[productNameIndex],
          uom: values[uomIndex],
          selling_price: parseInt(values[priceIndex], 10),
        }
      })

      const response = await fetch("/api/master-data/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: productsToImport }),
      })

      if (response.ok) {
        alert("Data berhasil diimport!")
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error("[v0] Error importing file:", error)
      alert("Gagal mengimport file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return

    const response = await fetch(`/api/master-data/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProducts = products.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Data Master</CardTitle>
          <CardDescription>
            Upload file CSV atau Excel dengan kolom: Barcode, ProductName, UOM, Selling Price
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="max-w-md"
            />
            <Button disabled={isUploading} style={{ backgroundColor: "#0db04b", color: "white" }}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Produk ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Belum ada data produk. Silakan import data master.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono">{product.barcode}</TableCell>
                      <TableCell>{product.product_name}</TableCell>
                      <TableCell>{product.uom}</TableCell>
                      <TableCell className="text-right">Rp {product.selling_price.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} style={{ color: "#EF4444" }} className="hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Halaman {currentPage + 1} dari {totalPages} (Total: {products.length} produk)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
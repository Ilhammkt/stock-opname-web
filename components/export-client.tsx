"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type StockCount = {
  id: string
  location_id: string
  barcode: string
  product_name: string
  uom: string
  selling_price: number
  count: number
  counted_at: string
}

type LocationWithCounts = {
  id: string
  name: string
  description: string | null
  pic_name: string | null
  created_at: string
  stockCounts: StockCount[]
  totalItems: number
}

const ITEMS_PER_PAGE = 5

export function ExportClient({ locations }: { locations: LocationWithCounts[] }) {
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({})

  const getCurrentPage = (locationId: string) => {
    return currentPage[locationId] || 0
  }

  const setCurrentPageForLocation = (locationId: string, page: number) => {
    setCurrentPage((prev) => ({
      ...prev,
      [locationId]: page,
    }))
  }

  const getPaginatedItems = (locationId: string, items: StockCount[]) => {
    const page = getCurrentPage(locationId)
    const start = page * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return items.slice(start, end)
  }

  const getTotalPages = (itemsLength: number) => {
    return Math.ceil(itemsLength / ITEMS_PER_PAGE)
  }

  const exportToCSV = (location: LocationWithCounts) => {
    if (location.stockCounts.length === 0) {
      alert("Tidak ada data untuk diexport")
      return
    }

    // CSV Header
    const headers = ["Barcode", "Product Name", "UOM", "Selling Price", "Count", "Counted At"]
    const csvRows = [headers.join(",")]

    // CSV Data (semua data, bukan hanya yang ditampilkan)
    location.stockCounts.forEach((sc) => {
      const row = [
        sc.barcode,
        `"${sc.product_name}"`,
        sc.uom,
        sc.selling_price,
        sc.count,
        new Date(sc.counted_at).toLocaleString("id-ID"),
      ]
      csvRows.push(row.join(","))
    })

    // Add summary row
    csvRows.push("")
    csvRows.push(`PIC Name,${location.pic_name || "-"}`)
    csvRows.push(`Location,${location.name}`)
    csvRows.push(`Total Products,${location.stockCounts.length}`)
    csvRows.push(`Total Items,${location.totalItems}`)

    // Create and download file
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `stock-count-${location.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportAllToCSV = () => {
    const allCounts = locations.flatMap((loc) => loc.stockCounts)

    if (allCounts.length === 0) {
      alert("Tidak ada data untuk diexport")
      return
    }

    // CSV Header
    const headers = ["Location", "PIC Name", "Barcode", "Product Name", "UOM", "Selling Price", "Count", "Counted At"]
    const csvRows = [headers.join(",")]

    // CSV Data
    locations.forEach((location) => {
      location.stockCounts.forEach((sc) => {
        const row = [
          `"${location.name}"`,
          location.pic_name || "-",
          sc.barcode,
          `"${sc.product_name}"`,
          sc.uom,
          sc.selling_price,
          sc.count,
          new Date(sc.counted_at).toLocaleString("id-ID"),
        ]
        csvRows.push(row.join(","))
      })
    })

    // Add summary
    csvRows.push("")
    csvRows.push("Summary by Location")
    locations.forEach((location) => {
      csvRows.push(
        `"${location.name}","${location.pic_name || "-"}",${location.stockCounts.length} products,${location.totalItems} items`,
      )
    })

    const totalProducts = locations.reduce((sum, loc) => sum + loc.stockCounts.length, 0)
    const totalItems = locations.reduce((sum, loc) => sum + loc.totalItems, 0)
    csvRows.push("")
    csvRows.push(`Grand Total,${totalProducts} products,${totalItems} items`)

    // Create and download file
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `stock-count-all-locations-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalAllProducts = locations.reduce((sum, loc) => sum + loc.stockCounts.length, 0)
  const totalAllItems = locations.reduce((sum, loc) => sum + loc.totalItems, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>

        {locations.length > 0 && (
          <Button onClick={exportAllToCSV} size="lg" style={{ backgroundColor: "#0db04b", color: "white" }}>
            <Download className="mr-2 h-4 w-4" />
            Export Semua Lokasi
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Total perhitungan stok dari semua lokasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Badge variant="secondary" className="text-base px-2 py-2">
              Total Produk: {totalAllProducts}
            </Badge>
            <Badge variant="secondary" className="text-base px-2 py-2">
              Total Item: {totalAllItems}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {locations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileSpreadsheet className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Belum ada data stock count untuk diexport.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {locations.map((location) => {
            const totalPages = getTotalPages(location.stockCounts.length)
            const currentPageNum = getCurrentPage(location.id)
            const paginatedItems = getPaginatedItems(location.id, location.stockCounts)

            return (
              <Card key={location.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{location.name}</CardTitle>
                      {location.pic_name && (
                        <CardDescription className="mt-2">PIC: {location.pic_name}</CardDescription>
                      )}
                      {location.description && <CardDescription>{location.description}</CardDescription>}
                    </div>
                    <Button onClick={() => exportToCSV(location)} disabled={location.stockCounts.length === 0} style={{ backgroundColor: "#0db04b", color: "white" }}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Lokasi Ini
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-4">
                    <Badge variant="secondary">Produk: {location.stockCounts.length}</Badge>
                    <Badge variant="secondary">Total Item: {location.totalItems}</Badge>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Barcode</TableHead>
                          <TableHead>Nama Produk</TableHead>
                          <TableHead>UOM</TableHead>
                          <TableHead className="text-right">Harga</TableHead>
                          <TableHead className="text-center">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              Belum ada data stock count
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedItems.map((sc) => (
                            <TableRow key={sc.id}>
                              <TableCell className="font-mono">{sc.barcode}</TableCell>
                              <TableCell>{sc.product_name}</TableCell>
                              <TableCell>{sc.uom}</TableCell>
                              <TableCell className="text-right">Rp {sc.selling_price.toLocaleString("id-ID")}</TableCell>
                              <TableCell className="text-center font-semibold">{sc.count}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Halaman {currentPageNum + 1} dari {totalPages} (Total: {location.stockCounts.length} item)
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageForLocation(location.id, currentPageNum - 1)}
                          disabled={currentPageNum === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageForLocation(location.id, currentPageNum + 1)}
                          disabled={currentPageNum === totalPages - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
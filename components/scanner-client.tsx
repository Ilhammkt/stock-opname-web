"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Minus, Scan } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type Location = {
  id: string
  name: string
  description: string | null
}

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

export function ScannerClient({
  location,
  initialStockCounts,
}: {
  location: Location
  initialStockCounts: StockCount[]
}) {
  const [stockCounts, setStockCounts] = useState<StockCount[]>(initialStockCounts)
  const [barcode, setBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto focus on input when component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcode.trim() || isScanning) return

    setIsScanning(true)

    try {
      const response = await fetch("/api/stock-count/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: location.id,
          barcode: barcode.trim(),
        }),
      })

      if (response.ok) {
        const { data } = await response.json()

        // Update or add the stock count
        const existingIndex = stockCounts.findIndex((sc) => sc.barcode === data.barcode)
        if (existingIndex >= 0) {
          const updated = [...stockCounts]
          updated[existingIndex] = data
          setStockCounts(updated)
        } else {
          setStockCounts([data, ...stockCounts])
        }

        setBarcode("")
        setIsScanning(false)
        // Focus input dengan delay yang lebih lama
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.select()
        }, 100)
      } else {
        const error = await response.json()
        setBarcode("")
        setIsScanning(false)
        
        // Tampilkan alert dan auto-focus setelah ditutup
        alert(error.message || "Produk tidak ditemukan di master data")
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.select()
        }, 100)
      }
    } catch (error) {
      console.error("Error scanning barcode:", error)
      setBarcode("")
      setIsScanning(false)
      
      // Tampilkan alert dan auto-focus setelah ditutup
      alert("Terjadi kesalahan saat scanning")
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }

  const handleUpdateCount = async (stockCountId: string, newCount: number) => {
    if (newCount < 0) return

    try {
      const response = await fetch("/api/stock-count/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockCountId,
          count: newCount,
        }),
      })

      if (response.ok) {
        const { data } = await response.json()
        setStockCounts(stockCounts.map((sc) => (sc.id === stockCountId ? data : sc)))
      }
    } catch (error) {
      console.error("Error updating count:", error)
    }
  }

  const totalItems = stockCounts.reduce((sum, sc) => sum + sc.count, 0)
  const uniqueProducts = stockCounts.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/stock-count">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scan Barcode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="flex gap-4">
            <Input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan barcode atau ketik manual..."
              disabled={isScanning}
              className="font-mono text-lg"
            />
            <Button type="submit" disabled={isScanning || !barcode.trim()}>
              {isScanning ? "Scanning..." : "Scan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hasil Stock Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <Badge variant="secondary">
              Produk: {uniqueProducts}
            </Badge>
            <Badge variant="secondary">
              Total Item: {totalItems}
            </Badge>
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
                {stockCounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Belum ada produk yang discan
                    </TableCell>
                  </TableRow>
                ) : (
                  stockCounts.map((sc) => (
                    <TableRow key={sc.id}>
                      <TableCell className="font-mono">{sc.barcode}</TableCell>
                      <TableCell>{sc.product_name}</TableCell>
                      <TableCell>{sc.uom}</TableCell>
                      <TableCell className="text-right">Rp {sc.selling_price.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => handleUpdateCount(sc.id, sc.count - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-12 text-center font-semibold">{sc.count}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => handleUpdateCount(sc.id, sc.count + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

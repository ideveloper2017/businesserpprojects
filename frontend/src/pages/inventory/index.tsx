import { useEffect, useMemo, useState } from "react";
import { Plus, FileDown, FileUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { InventoryItem } from "@/types";
import { useApi } from "@/hooks/useApi";

export function Inventory() {
  const { get } = useApi();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError("");
        // Adjust endpoint if your backend differs
        const data = await get<InventoryItem[]>("/inventory");
        setInventory(data || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [get]);

  // Filter inventory based on search term
  const filteredInventory = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return inventory.filter((item) => item.productName.toLowerCase().includes(term));
  }, [inventory, searchTerm]);

  // Summary stats
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(
    (item) => item.available <= item.lowStockThreshold
  ).length;
  const outOfStockItems = inventory.filter((item) => item.available === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-md">
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="text-lg font-medium">Inventory Items</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search items..."
              className="pl-10 pr-4 py-2 text-sm rounded-md w-full border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {loading && (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        )}
        {error && !loading && (
          <div className="p-4 text-sm text-red-600">{error}</div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>In Stock</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Low Stock Threshold</TableHead>
              <TableHead>Last Restocked</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productId}</TableCell>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.inStock}</TableCell>
                  <TableCell>{item.reserved}</TableCell>
                  <TableCell>{item.available}</TableCell>
                  <TableCell>{item.lowStockThreshold}</TableCell>
                  <TableCell>{item.lastRestocked}</TableCell>
                  <TableCell>
                    {item.available === 0 ? (
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    ) : item.available <= item.lowStockThreshold ? (
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-yellow-100 text-yellow-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">
                        In Stock
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

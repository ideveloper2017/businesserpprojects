import { useRef, useState, useEffect, forwardRef, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product.types";
import { PrintLabel } from "./PrintLabelComponent";
import BarcodePrintPreview from "./BarcodePrintPreview";
import { useProducts } from "@/hooks/useProducts";
import { ProductFormModal } from "@/components/product/ProductFormModal";
import { 
  Pencil, 
  PlusCircle, 
  Trash2, 
  Image as ImageIcon, 
  Barcode, 
  X, 
  Search,
  Loader2,
  Filter,
  Printer,
  Eye
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PrintBarcode } from "./PrintBarcodeComponent";
import { BarcodePreviewModal } from "./BarcodePreviewModal";

// Simple print function
const printElement = (element: HTMLElement | null) => {
  if (!element) return;
  
  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) return;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
        <style>
          @media print {
            @page { margin: 0; }
            body { margin: 1.6cm; }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 100);
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

// Print content component for selected products
const PrintContent = forwardRef<HTMLDivElement, { products: Product[] }>(({ products }, ref) => (
  <div ref={ref} className="p-8">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className="flex flex-col items-center">
              <PrintLabel 
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  barcode: product.barcode,
                  sku: product.sku,
                  // Use the first image if available
                  imageUrl: product.images && product.images[0] ? product.images[0] : undefined
                }} 
              />
        </div>
      ))}
    </div>
  </div>
));

PrintContent.displayName = 'PrintContent';

interface Filters {
  search: string;
  category: string;
  status: 'all' | 'active' | 'inactive';
  priceRange: [number, number];
  stockStatus: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
  minPrice: number;
  maxPrice: number;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [previewBarcode, setPreviewBarcode] = useState<{code: string; name: string} | null>(null);
  const [showBarcodePrint, setShowBarcodePrint] = useState(false);
  const [printContent, setPrintContent] = useState<{ type: 'details' | 'label' | 'barcode', data: any } | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: 'all',
    status: 'all',
    priceRange: [0, 1000000],
    stockStatus: 'all',
    minPrice: 0,
    maxPrice: 1000000
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const productsHook = useProducts();

  // Get selected products
  const selectedProducts = useMemo(() => 
    products.filter(p => selectedRows.includes(p.id)),
    [products, selectedRows]
  );
  
  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      // Search filter (name or SKU)
      const matchesSearch = 
        !filters.search || 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(filters.search.toLowerCase()));
      
      // Category filter
      const matchesCategory = 
        filters.category === 'all' || 
        product.categoryId?.toString() === filters.category;
      
      // Status filter - use 'active' property instead of 'isActive'
      const matchesStatus = 
        filters.status === 'all' || 
        (filters.status === 'active' && product.active) ||
        (filters.status === 'inactive' && !product.active);
      
      // Price range filter
      const [minPrice, maxPrice] = filters.priceRange;
      const matchesPrice = 
        product.price >= minPrice && 
        product.price <= maxPrice;
      
      // Stock status filter
      let matchesStock = true;
      if (filters.stockStatus !== 'all') {
        const inStock = product.quantityInStock || 0;
        matchesStock = 
          (filters.stockStatus === 'inStock' && inStock > 10) ||
          (filters.stockStatus === 'lowStock' && inStock > 0 && inStock <= 10) ||
          (filters.stockStatus === 'outOfStock' && inStock === 0);
      }
      
      return matchesSearch && matchesCategory && matchesStatus && matchesPrice && matchesStock;
    });
  }, [products, filters]);
  
  // Check if any filter is active
  const isAnyFilterActive = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.category !== 'all' ||
      filters.status !== 'all' ||
      filters.stockStatus !== 'all' ||
      filters.priceRange[0] !== filters.minPrice ||
      filters.priceRange[1] !== filters.maxPrice
    );
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters(prev => ({
      ...prev,
      search: '',
      category: 'all',
      status: 'all',
      stockStatus: 'all',
      priceRange: [prev.minPrice, prev.maxPrice]
    }));
  };
  
  // Create refs for print content
  const printContentRef = useRef<HTMLDivElement>(null);
  const bulkPrintRef = useRef<HTMLDivElement>(null);
  const printRef = printContentRef; // Alias for compatibility with existing code
  
  // Handle print action
  const handlePrint = (type: 'bulk' | 'single' = 'single') => {
    const element = type === 'bulk' ? bulkPrintRef.current : printContentRef.current;
    printElement(element);
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productsHook.fetchProducts();
      if (!Array.isArray(data)) {
        console.error('Expected an array of products but got:', data);
        setError("Mahsulotlar formati noto'g'ri");
        return;
      }

      // Transform and set products
      const productsWithImages = data.map((product: Product) => ({
        ...product,
        // Ensure images is always an array
        images: Array.isArray(product.images) ? product.images : []
      }));
      
      setProducts(productsWithImages);
      
      // Extract unique categories from products
      const categoriesMap = new Map<string, {id: string, name: string}>();
      
      data.forEach((product: Product) => {
        if (product.categoryId && product.category) {
          categoriesMap.set(product.categoryId.toString(), {
            id: product.categoryId.toString(),
            name: typeof product.category === 'object' ? product.category.name : 'Noma\'lum'
          });
        }
      });
      
      setCategories(Array.from(categoriesMap.values()));
      
      // Calculate price range if we have products
      if (data.length > 0) {
        const prices = data.map((p: Product) => p.price);
        const minPrice = Math.max(0, Math.floor(Math.min(...prices) * 0.9));
        const maxPrice = Math.ceil(Math.max(...prices) * 1.1);
        
        setFilters(prev => ({
          ...prev,
          minPrice,
          maxPrice,
          priceRange: [minPrice, maxPrice]
        }));
      } else {
        // Reset to default range if no products
        setFilters(prev => ({
          ...prev,
          minPrice: 0,
          maxPrice: 100000,
          priceRange: [0, 100000]
        }));
      }
      setError(null);
    } catch (err) {
      setError("Mahsulotlarni yuklashda xatolik yuz berdi");
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts()
  }, [])

  // Commented out unused delete handler
  // const handleDelete = async (id: number) => {
  //   if (window.confirm('Are you sure you want to delete this product?')) {
  //     try {
  //       await productsHook.deleteProduct(id);
  //       fetchProducts();
  //       toast({
  //         title: 'Success',
  //         description: 'Product deleted successfully',
  //         variant: 'default',
  //       });
  //     } catch (error) {
  //       console.error('Error deleting product:', error);
  //       toast({
  //         title: 'Error',
  //         description: 'Failed to delete product',
  //         variant: 'destructive',
  //       });
  //     }
  //   }
  // };

  // Commented out unused functions to clean up the code
  // const toggleRowSelection = (productId: number) => {
  //   setSelectedRows(prev => 
  //     prev.includes(productId) 
  //       ? prev.filter(id => id !== productId)
  //       : [...prev, productId]
  //   );
  // };

  // const toggleSelectAll = () => {
  //   if (selectedRows.length === filteredProducts.length) {
  //     setSelectedRows([]);
  //   } else {
  //     setSelectedRows(filteredProducts.map(p => p.id));
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={fetchProducts}
            className="mt-4"
          >
            Qayta yuklash
          </Button>
        </div>
      </div>
    )
  }

  // Handle bulk print
// Handle print selected products
  return (
    <div className="flex flex-col mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mahsulotlar</h1>
          <p className="text-sm text-muted-foreground">
            Jami {filteredProducts.length} ta mahsulot topildi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={isFilterOpen ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtrlar
            {isAnyFilterActive && (
              <span className="h-2 w-2 rounded-full bg-primary"></span>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowBarcodePrint(selectedProducts.length > 0)}
            disabled={selectedProducts.length === 0}
            className="gap-2"
          >
            <Barcode className="h-4 w-4" />
            Barkod chop etish
            {selectedProducts.length > 0 && (
              <span className="h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {selectedProducts.length}
              </span>
            )}
          </Button>
          <ProductFormModal
            trigger={
              <Button size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Yangi mahsulot
              </Button>
            }
            onSuccess={fetchProducts}
          />
        </div>
      </div>
      
      {/* Search and filter bar */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Mahsulot nomi yoki SKU bo'yicha qidirish..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => handleFilterChange('search', '')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Filter panel */}
        {isFilterOpen && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Filtrlar</CardTitle>
                <div className="flex items-center gap-2">
                  {isAnyFilterActive && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters}
                      className="text-muted-foreground h-8 px-2"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Tozalash
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategoriya</label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Barcha toifalar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha toifalar</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Holati</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Barcha holatlar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha holatlar</SelectItem>
                      <SelectItem value="active">Faol</SelectItem>
                      <SelectItem value="inactive">Nofaol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sotuv holati</label>
                  <Select
                    value={filters.stockStatus}
                    onValueChange={(value) => handleFilterChange('stockStatus', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Barcha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha mahsulotlar</SelectItem>
                      <SelectItem value="inStock">Sotuvda bor</SelectItem>
                      <SelectItem value="lowStock">Qolmagan</SelectItem>
                      <SelectItem value="outOfStock">Tugab qolgan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-full">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Narx oraligi</label>
                    <span className="text-sm text-muted-foreground">
                      {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} UZS
                    </span>
                  </div>
                  <Slider
                    value={filters.priceRange}
                    min={filters.minPrice}
                    max={filters.maxPrice}
                    step={1000}
                    onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                    minStepsBetweenThumbs={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Active filters */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Qidiruv: {filters.search}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.category !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Kategoriya: {categories.find(c => c.id === filters.category)?.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('category', 'all')} 
                />
              </Badge>
            )}
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Holat: {filters.status === 'active' ? 'Faol' : 'Nofaol'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('status', 'all')} 
                />
              </Badge>
            )}
            {filters.stockStatus !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Sotuv holati: {
                  filters.stockStatus === 'inStock' ? 'Sotuvda bor' :
                  filters.stockStatus === 'lowStock' ? 'Qolmagan' : 'Tugab qolgan'
                }
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('stockStatus', 'all')} 
                />
              </Badge>
            )}
            {(filters.priceRange[0] > filters.minPrice || filters.priceRange[1] < filters.maxPrice) && (
              <Badge variant="secondary" className="gap-1">
                Narx: {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} UZS
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('priceRange', [filters.minPrice, filters.maxPrice])} 
                />
              </Badge>
            )}
          </div>
        )}
      </div>
      {/* Barcode Print Preview Modal */}
      {showBarcodePrint && selectedProducts.length > 0 && (
        <BarcodePrintPreview
          products={selectedProducts}
          onClose={() => setShowBarcodePrint(false)}
        />
      )}

      {/* Barcode Preview Modal */}
      {previewBarcode && (
        <BarcodePreviewModal
          barcode={previewBarcode.code}
          productName={previewBarcode.name}
          onClose={() => setPreviewBarcode(null)}
        />
      )}
      
      {/* Barcode Preview Modal */}
      {previewBarcode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Barkod ko'rish</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewBarcode(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md">
              <PrintBarcode
                barcode={previewBarcode.code}
                productName={previewBarcode.name}
                size="medium"
                showValue={true}
                className="w-full"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setPreviewBarcode(null)}>Yopish</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Barcode Preview Modal */}
      {previewBarcode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Barkod ko'rish</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewBarcode(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md">
              <PrintBarcode
                barcode={previewBarcode.code}
                productName={previewBarcode.name}
                size="medium"
                showValue={true}
                className="w-full"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setPreviewBarcode(null)}>Yopish</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Barcode Preview Modal */}
      {previewBarcode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Barkod ko'rish</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewBarcode(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md">
              <PrintBarcode
                barcode={previewBarcode.code}
                productName={previewBarcode.name}
                size="medium"
                showValue={true}
                className="w-full"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setPreviewBarcode(null)}>Yopish</Button>
            </div>
          </div>
        </div>
      )}

      {/* Single Print Modal */}
      {printContent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Chop etish uchun ko'rish</h3>
              <div className="flex gap-2">
                <Button onClick={() => handlePrint('single')}>
                  <Printer className="mr-2 h-4 w-4" /> Chop etish
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPrintContent(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <PrintContent
                products={printContent.data}
                ref={printRef}
              />
            </div>
          </div>
        </div>
      )}


      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedRows.length > 0 && selectedRows.length === filteredProducts.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRows(filteredProducts.map(p => p.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Rasm</TableHead>
              <TableHead>Nomi</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Kategoriya</TableHead>
              <TableHead>Narxi</TableHead>
              <TableHead>Miqdori</TableHead>
              <TableHead>Birlik</TableHead>
              <TableHead>Barkod</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead className="text-right">Harakatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Yuklanmoqda...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Hech qanday mahsulot topilmadi
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(product.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRows([...selectedRows, product.id]);
                        } else {
                          setSelectedRows(selectedRows.filter(id => id !== product.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {product.images?.[0] ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden border">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>{
                    typeof product.category === 'object' ? 
                    product.category?.name : 
                    product.categoryId ? String(product.categoryId) : '—'
                  }</TableCell>
                  <TableCell className="font-medium">{product.price.toLocaleString()} UZS</TableCell>
                  <TableCell className={cn(
                    "font-medium",
                    (product.quantityInStock || 0) === 0 ? "text-destructive" : "",
                    (product.quantityInStock || 0) > 0 && (product.quantityInStock || 0) <= 10 ? "text-amber-600" : ""
                  )}>
                    {product.quantityInStock}
                  </TableCell>
                  <TableCell>
                    {product.units?.code || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewBarcode({ 
                            code: product.barcode || product.id.toString(), 
                            name: product.name 
                          });
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground truncate max-w-[100px] block">
                        {product.barcode || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewBarcode({ 
                            code: product.barcode || product.id.toString(), 
                            name: product.name 
                          });
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground truncate max-w-[100px] block">
                        {product.barcode || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {product.active ? 'Faol' : 'Nofaol'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRows([product.id]);
                              setShowBarcodePrint(true);
                            }}
                          >
                            <Barcode className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Shtrix-kod chop etish</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <ProductFormModal
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              }
                              initialData={product}
                              onSuccess={fetchProducts}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tahrirlash</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              if (window.confirm(`"${product.name}" mahsulotini o'chirishni istaysizmi?`)) {
                                try {
                                  await productsHook.deleteProduct(product.id);
                                  fetchProducts();
                                  toast({
                                    title: 'Muvaffaqiyatli',
                                    description: 'Mahsulot muvaffaqiyatli o\'chirildi',
                                    variant: 'default',
                                  });
                                } catch (error) {
                                  console.error('Error deleting product:', error);
                                  toast({
                                    variant: 'destructive',
                                    title: 'Xatolik',
                                    description: 'Mahsulotni o\'chirishda xatolik yuz berdi',
                                  });
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>O'chirish</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

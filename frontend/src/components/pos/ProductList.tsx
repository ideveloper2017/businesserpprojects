import { useEffect, useState, useMemo } from 'react';
import { ProductCard } from '@/components/pos/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import type { ProductCategory } from '@/types/product.types';

type ProductListProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

type FilterState = {
  categories: Set<number>;
  priceRange: [number, number];
};

export function ProductList({ searchQuery, onSearchChange }: ProductListProps) {
  const { products, isLoading, error, fetchProducts } = useProducts();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: new Set<number>(),
    priceRange: [0, 1000000]
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts().catch(console.error);
  }, [fetchProducts]);

  // Extract unique categories
  const categories = useMemo(() => {
    const categoryMap = new Map<number, ProductCategory>();
    
    products?.forEach(product => {
      if (product.category && !categoryMap.has(product.category.id)) {
        categoryMap.set(product.category.id, product.category);
      }
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }, [products]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    const searchLower = searchQuery.toLowerCase().trim();
    const { categories: selectedCategories, priceRange } = filters;
    
    return products.filter(product => {
      // Search filter
      const matchesSearch = 
        (product.name || '').toLowerCase().includes(searchLower) ||
        (product.barcode || '').toLowerCase().includes(searchLower) ||
        (product.sku || '').toLowerCase().includes(searchLower);
      
      // Category filter
      const matchesCategory = selectedCategories.size === 0 || 
        (product.categoryId && selectedCategories.has(product.categoryId));
      
      // Price range filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, filters]);

  // Toggle category selection
  const toggleCategory = (categoryId: number) => {
    const newCategories = new Set(filters.categories);
    if (newCategories.has(categoryId)) {
      newCategories.delete(categoryId);
    } else {
      newCategories.add(categoryId);
    }
    setFilters(prev => ({
      ...prev,
      categories: newCategories
    }));
  };

  // Update price range
  const updatePriceRange = (range: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      categories: new Set(),
      priceRange: [0, 1000000]
    });
    onSearchChange('');
  };

  // Handle error state
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка загрузки товаров</AlertTitle>
          <AlertDescription>
            {error.message || 'Не удалось загрузить список товаров. Пожалуйста, попробуйте снова.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <button 
            onClick={() => fetchProducts()}
            className="text-sm text-blue-600 hover:underline"
          >
            Обновить список
          </button>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  // Count active filters
  const activeFilterCount = 
    (searchQuery ? 1 : 0) + 
    filters.categories.size + 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000 ? 1 : 0);

  // Toggle filters panel
  const toggleFilters = () => setShowFilters(!showFilters);

  // Handle empty state
  if (!products?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Нет доступных товаров
      </div>
    );
  }

  // Handle no search results
  if (searchQuery && !filteredProducts.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Товары по запросу "{searchQuery}" не найдены
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter controls */}
      <div className="border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFilters}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Фильтры
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Filters panel */}
        {showFilters && (
          <div className="w-64 border-r p-4 overflow-y-auto">
            <h3 className="font-medium mb-4">Категории</h3>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={filters.categories.has(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {category.name}
                      {category.productCount !== undefined && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({category.productCount})
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <h3 className="font-medium mt-6 mb-4">Цена</h3>
            <div className="px-2">
              <Slider
                min={0}
                max={1000000}
                step={1000}
                value={filters.priceRange}
                onValueChange={(value) => updatePriceRange(value as [number, number])}
                minStepsBetweenThumbs={1}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.priceRange[0].toLocaleString()} UZS</span>
                <span>{filters.priceRange[1].toLocaleString()} UZS</span>
              </div>
            </div>
          </div>
        )}

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Товары не найдены. Попробуйте изменить параметры фильтрации.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/types/product.types';
import { Plus, Package } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const inStock = (product.quantityInStock || 0) > 0;
  const price = product.price || 0;
  const costPrice = product.costPrice || 0;
  
  // Use the first image if available, or a placeholder
  const imageUrl = product.images?.[0]?.url || '';
  const hasImage = !!imageUrl;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: price,
      quantity: 1,
      product: product
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Product Image */}
      <div className="aspect-square bg-muted/50 flex items-center justify-center relative">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/placeholder-product.svg';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <Package className="h-8 w-8 mb-2 opacity-30" />
            <span className="text-xs">Нет изображения</span>
          </div>
        )}
        
        {/* Stock status badge */}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={inStock ? 'default' : 'destructive'} 
            className={cn("text-xs", !inStock && 'bg-destructive/80')}
          >
            {inStock ? 'В наличии' : 'Нет в наличии'}
          </Badge>
        </div>
      </div>
      
      {/* Product Info */}
      <CardContent className="p-3 flex-grow">
        <h3 className="font-medium text-sm line-clamp-2 mb-1 h-10 flex items-center">
          {product.name}
        </h3>
        
        {/* Price and SKU */}
        <div className="space-y-1 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-base">
              {price.toLocaleString()} UZS
            </span>
            {product.sku && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {product.sku}
              </span>
            )}
          </div>
          
          {/* Stock quantity */}
          {inStock && (
            <div className="text-xs text-muted-foreground">
              В наличии: {product.quantityInStock} шт.
            </div>
          )}
          
          {/* Barcode */}
          {product.barcode && (
            <div className="text-xs text-muted-foreground truncate">
              Штрих-код: {product.barcode}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Add to Cart Button */}
      <CardFooter className="p-3 pt-0">
        <Button
          size="sm"
          className="w-full"
          onClick={handleAddToCart}
          disabled={!inStock}
          variant={inStock ? 'default' : 'outline'}
        >
          <Plus className="h-4 w-4 mr-1" />
          {inStock ? 'Добавить' : 'Нет в наличии'}
        </Button>
      </CardFooter>
    </Card>
  );
}

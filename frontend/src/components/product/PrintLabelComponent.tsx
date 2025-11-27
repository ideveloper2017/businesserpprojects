import React, { forwardRef } from "react";
import Barcode from "react-barcode";

interface PrintLabelProduct {
  id?: number;
  name: string;
  price?: number;
  barcode?: string;
  sku?: string;
  imageUrl?: string;
}

interface PrintLabelProps {
  product: PrintLabelProduct;
}

const PrintLabel = forwardRef<HTMLDivElement, PrintLabelProps>(({ product }, ref) => {
  if (!product) {
    return (
      <div ref={ref} className="p-4 border rounded text-center bg-gray-50" style={{ width: "200px" }}>
        <div className="text-red-500">Mahsulot ma'lumotlari topilmadi</div>
      </div>
    );
  }

  return (
    <div 
      ref={ref} 
      className="p-4 border rounded text-center bg-white shadow-sm" 
      style={{ 
        width: "200px",
        minHeight: "120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      {/* Product Image */}
      {product.imageUrl && (
        <div className="mb-2 flex justify-center">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="h-16 w-16 object-contain"
            onError={(e) => {
              // Hide the image if it fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Product Name */}
      <div className="mb-1">
        <div 
          className="font-bold text-sm line-clamp-2" 
          style={{ minHeight: "2.5rem" }}
        >
          {product.name}
        </div>
        
        {/* Price */}
        {product.price !== undefined && (
          <div className="text-md font-semibold text-blue-600">
            {product.price.toLocaleString()} UZS
          </div>
        )}
      </div>
      
      {/* Barcode */}
      {product.barcode ? (
        <div className="mt-1">
          <Barcode 
            value={product.barcode} 
            width={1.2} 
            height={30} 
            displayValue={false}
            margin={0}
          />
          <div className="text-2xs font-mono mt-0.5">{product.barcode}</div>
        </div>
      ) : (
        <div className="text-2xs text-gray-400 mt-1">Barkod mavjud emas</div>
      )}
      
      {/* SKU */}
      {product.sku && (
        <div className="text-2xs text-gray-500 mt-0.5">SKU: {product.sku}</div>
      )}
    </div>
  );
});

PrintLabel.displayName = "PrintLabel";
export { PrintLabel };

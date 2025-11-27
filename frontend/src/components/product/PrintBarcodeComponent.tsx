import { forwardRef } from "react";
import Barcode from "react-barcode";

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC' | 'CODE39';

export interface PrintBarcodeProps {
  barcode: string;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  className?: string;
  productName?: string;
  price?: number;
  format?: BarcodeFormat;
  showPrice?: boolean;
  showName?: boolean;
  showBorder?: boolean;
  labelSize?: 'small' | 'medium' | 'large';
  labelType?: 'label' | 'barcode' | 'both';
}

const PrintBarcode = forwardRef<HTMLDivElement, PrintBarcodeProps>(({ 
  barcode, 
  size = 'medium',
  showValue = true,
  className = '',
  productName,
  price,
  format = 'CODE128',
  showPrice = true,
  showName = true,
  showBorder = true,
  labelSize = 'medium',
  labelType = 'both',
}, ref) => {
  if (!barcode) {
    return (
      <div 
        ref={ref} 
        className={`p-2 text-center text-red-500 text-xs bg-gray-50 rounded ${className}`}
      >
        Barkod kiritilmagan
      </div>
    );
  }


  const sizeMap = {
    small: { 
      width: 1, 
      height: 30, 
      fontSize: '0.625rem',
      padding: '0.25rem',
      barcodeHeight: 30,
    },
    medium: { 
      width: 1.2, 
      height: 40, 
      fontSize: '0.75rem',
      padding: '0.5rem',
      barcodeHeight: 45,
    },
    large: { 
      width: 1.5, 
      height: 60, 
      fontSize: '0.875rem',
      padding: '0.75rem',
      barcodeHeight: 60,
    },
  };

  const { width, barcodeHeight } = sizeMap[size];
  const labelSizeMap = {
    small: '0.75rem',
    medium: '0.875rem',
    large: '1rem'
  };

  const renderBarcode = () => (
    <Barcode
      value={barcode}
      width={width}
      height={barcodeHeight}
      displayValue={false}
      margin={0}
      format={format}
      font="monospace"
      lineColor="#000"
      background="transparent"
    />
  );

  const renderLabel = () => (
    <div className="text-center w-full">
      {showName && productName && (
        <div 
          className="font-medium text-center mb-1 line-clamp-2"
          style={{ fontSize: labelSizeMap[labelSize] }}
        >
          {productName}
        </div>
      )}
      
      {showPrice && price !== undefined && (
        <div 
          className="font-bold text-center"
          style={{ fontSize: labelSizeMap[labelSize] }}
        >
          {price.toLocaleString()} UZS
        </div>
      )}
      
      {showValue && (
        <div 
          className="font-mono mt-1 text-center break-all select-none"
          style={{ fontSize: `calc(${labelSizeMap[labelSize]} - 0.125rem)` }}
        >
          {barcode}
        </div>
      )}
    </div>
  );

  return (
    <div 
      ref={ref} 
      className={`bg-white rounded flex flex-col items-center justify-center ${showBorder ? 'border p-1' : ''} ${className}`}
      style={{ 
        minWidth: '80px',
        maxWidth: '100%',
        width: '100%',
        height: '100%',
      }}
    >
      {labelType === 'both' && (
        <div className="flex flex-col items-center w-full">
          {renderLabel()}
          <div className="my-1 w-full flex justify-center">
            {renderBarcode()}
          </div>
        </div>
      )}
      
      {labelType === 'barcode' && renderBarcode()}
      {labelType === 'label' && renderLabel()}
    </div>
  );
});

PrintBarcode.displayName = "PrintBarcode";

export { PrintBarcode };

export interface BarcodePrintOptions {
  format: BarcodeFormat;
  labelType: 'barcode' | 'label' | 'both';
  labelSize: 'small' | 'medium' | 'large';
  paperSize: 'a4' | 'a5' | 'a6' | 'letter';
  orientation: 'portrait' | 'landscape';
  columns: number;
  rows: number;
  showBorder: boolean;
  showName: boolean;
  showPrice: boolean;
  showGrid: boolean;
  margin: number;
  copies: number;
}

export const defaultBarcodeOptions: BarcodePrintOptions = {
  format: 'CODE128',
  labelType: 'both',
  labelSize: 'medium',
  paperSize: 'a4',
  orientation: 'portrait',
  columns: 4,
  rows: 10,
  showBorder: true,
  showName: true,
  showPrice: true,
  showGrid: false,
  margin: 10,
  copies: 1,
};

export const getPaperDimensions = (paperSize: string, orientation: string) => {
  
  const sizes = {
    a4: { width: 210, height: 297 },
    a5: { width: 148, height: 210 },
    a6: { width: 105, height: 148 },
    letter: { width: 215.9, height: 279.4 },
  };

  const size = sizes[paperSize as keyof typeof sizes] || sizes.a4;
  
  return orientation === 'landscape' 
    ? { width: size.height, height: size.width }
    : { width: size.width, height: size.height };
};

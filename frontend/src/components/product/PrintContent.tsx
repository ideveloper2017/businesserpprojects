import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import ReactToPrint from "react-to-print";
import { PrintLabel } from "./PrintLabelComponent";
import { PrintBarcode } from "./PrintBarcodeComponent";

interface PrintContentProps {
  type: string;
  data: any;
  onClose: () => void;
}

export const PrintContent = ({ type, data, onClose }: PrintContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chop etish uchun ko'rish</h3>
          <div className="flex gap-2">
            <ReactToPrint
              trigger={() => (
                <Button>
                  <Printer className="mr-2 h-4 w-4" /> Chop etish
                </Button>
              )}
              content={() => contentRef.current}
            />
            <Button variant="outline" onClick={onClose}>
              Yopish
            </Button>
          </div>
        </div>
        <div ref={contentRef} className="p-4 bg-white">
          {type === 'details' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{data.name}</h2>
              <p><strong>Narx:</strong> {data.price} UZS</p>
              <p><strong>SKU:</strong> {data.sku || '-'}</p>
              <p><strong>Barkod:</strong> {data.barcode || '-'}</p>
              {data.description && (
                <p><strong>Tavsif:</strong> {data.description}</p>
              )}
            </div>
          )}
          {type === 'label' && (
            <div className="flex justify-center">
              <PrintLabel product={data} />
            </div>
          )}
          {type === 'barcode' && data.barcode && (
            <div className="flex justify-center">
              <PrintBarcode barcode={data.barcode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

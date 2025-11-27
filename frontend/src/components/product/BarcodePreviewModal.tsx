import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PrintBarcode } from "./PrintBarcodeComponent";

interface BarcodePreviewModalProps {
  barcode: string;
  productName: string;
  onClose: () => void;
}

export function BarcodePreviewModal({ barcode, productName, onClose }: BarcodePreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Barkod ko'rish</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center p-4 border rounded-md">
          <PrintBarcode
            barcode={barcode}
            productName={productName}
            size="medium"
            showValue={true}
            className="w-full"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Yopish</Button>
        </div>
      </div>
    </div>
  );
}

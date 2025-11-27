import { useRef } from "react";
import { PrintLabel } from "./PrintLabelComponent";
import { PrintBarcode } from "./PrintBarcodeComponent";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";

type Product = {
  name: string;
  price: number;
  barcode: string;
};

// Demo ma’lumot
const products: Product[] = [
  { name: "Mahsulot 1", price: 12000, barcode: "123456789012" },
  { name: "Mahsulot 2", price: 25000, barcode: "987654321098" },
];

export default function ProductPrintPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Product Labels',
    onAfterPrint: () => {
      // Add any post-print logic here if needed
    }
  });

  return (
    <div className="p-6">
      <Button onClick={handlePrint}>Chop Etish</Button>
      <div ref={printRef}>
        {products.map((product, idx) => (
          <div key={idx} className="my-6">
            <PrintLabel product={product} />
            <div className="mt-2">
              <PrintBarcode barcode={product.barcode} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

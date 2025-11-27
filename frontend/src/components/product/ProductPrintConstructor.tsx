import React, { useState, useRef } from "react";
import { PrintLabel } from "@/components/ui/PrintLabel";
import { PrintBarcode } from "@/components/ui/PrintBarcode";
import { Button } from "@/components/ui/button";
import ReactToPrint from "react-to-print";

interface ProductFormValues {
  name: string;
  price: number;
  barcode: string;
}

export function ProductPrintConstructor() {
  const [form, setForm] = useState<ProductFormValues>({
    name: "",
    price: 0,
    barcode: "",
  });
  const [readyToPrint, setReadyToPrint] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReadyToPrint(true);
  };

  const handleEdit = () => setReadyToPrint(false);

  return (
    <div className="max-w-md mx-auto">
      {!readyToPrint ? (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
          <div>
            <label className="block text-sm mb-1" htmlFor="name">Mahsulot nomi</label>
            <input
              required
              id="name"
              name="name"
              type="text"
              className="border rounded p-2 w-full"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="price">Narxi</label>
            <input
              required
              id="price"
              name="price"
              type="number"
              className="border rounded p-2 w-full"
              value={form.price}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="barcode">Barcode</label>
            <input
              required
              id="barcode"
              name="barcode"
              type="text"
              className="border rounded p-2 w-full"
              value={form.barcode}
              onChange={handleChange}
            />
          </div>
          <Button type="submit">Ko‘rish va Chop Etish</Button>
        </form>
      ) : (
        <div>
          <ReactToPrint
            trigger={() => <Button>Chop Etish</Button>}
            content={() => printRef.current}
          />
          <Button className="ml-2" variant="outline" onClick={handleEdit}>
            Tahrirlash
          </Button>
          <div ref={printRef} className="mt-6 space-y-4">
            <PrintLabel product={form} />
            <PrintBarcode barcode={form.barcode} />
          </div>
        </div>
      )}
    </div>
  );
}

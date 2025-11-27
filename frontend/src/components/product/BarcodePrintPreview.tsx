import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Printer, Settings, RotateCw, FileSpreadsheet, FileText, Hash, X } from "lucide-react";
import { PrintBarcode, BarcodePrintOptions, defaultBarcodeOptions, BarcodeFormat, getPaperDimensions } from "./PrintBarcodeComponent";
import { Product } from "@/types/product.types";
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
//import 'jspdf-autotable';

interface BarcodePrintPreviewProps {
  products: Product[];
  onClose: () => void;
}

const BarcodePrintPreview: React.FC<BarcodePrintPreviewProps> = ({ products, onClose }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [sequentialMode, setSequentialMode] = useState(false);
  const [startNumber, setStartNumber] = useState(1);
  const [endNumber, setEndNumber] = useState(10);
  const [options, setOptions] = useState<BarcodePrintOptions>({
    ...defaultBarcodeOptions,
  });
  
  // Generate sequential or duplicate products based on mode
  const displayProducts = React.useMemo(() => {
    if (!products.length) return [];
    
    if (sequentialMode) {
      return Array.from({ length: endNumber - startNumber + 1 }, (_, i) => ({
        ...products[0],
        barcode: (parseInt(products[0]?.barcode || '1000000000000') + startNumber - 1 + i).toString().padStart(13, '0'),
        name: `${products[0]?.name || 'Item'} #${startNumber + i}`
      }));
    }
    
    return products.flatMap(product => 
      Array(options.copies).fill(product)
    );
  }, [products, sequentialMode, startNumber, endNumber, options.copies]);
  
  const printRef = useRef<HTMLDivElement>(null);
  
  const handleOptionChange = (key: keyof BarcodePrintOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handlePrint = useReactToPrint({
    // @ts-ignore - content is a valid property in the latest version
    content: () => printRef.current,
    pageStyle: `
      @page {
        size: ${options.paperSize} ${options.orientation};
        margin: 0;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  const handleExportPDF = () => {
    if (!printRef.current) return;
    
    const doc = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.paperSize,
    });
    
    // Add content to PDF
    doc.html(printRef.current, {
      callback: (pdfDoc) => {
        pdfDoc.save('barcodes.pdf');
      },
      x: options.margin,
      y: options.margin,
      width: getPaperDimensions(options.paperSize, options.orientation).width - (options.margin * 2),
      windowWidth: 800,
    });
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      products.map(p => ({
        'Nomi': p.name,
        'Barkod': p.barcode,
        'SKU': p.sku,
        'Narxi': p.price,
        'Miqdor': p.quantityInStock,
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Barkodlar');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'barcodes.xlsx');
  };

  const resetOptions = () => {
    setOptions({
      ...defaultBarcodeOptions,
    });
  };

  const paperDimensions = React.useMemo(
    () => getPaperDimensions(options.paperSize, options.orientation),
    [options.paperSize, options.orientation]
  );
  
  // Calculate grid layout
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${options.columns}, 1fr)`,
    gap: '10px',
    padding: `${options.margin}mm`,
    width: '100%',
    minHeight: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            {products.length} ta mahsulot uchun barkod chop etish
          </h3>
          <div className="flex items-center gap-2">
            <Button 
              variant={sequentialMode ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSequentialMode(!sequentialMode)}
              className="gap-2"
            >
              <Hash className="h-4 w-4" />
              Ketma-ketlik
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Chop etish
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" /> PDF ga yuklash
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel ga yuklash
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={resetOptions}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Settings Panel */}
          <div className="w-80 border-r p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Sozlamalar
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetOptions}
                  className="text-xs h-7"
                >
                  <RotateCw className="h-3 w-3 mr-1" /> Tiklash
                </Button>
              </div>
              
              {showSettings && (
                <div className="p-4 border-t">
                  <h4 className="text-sm font-medium mb-4">Chop etish sozlamalari</h4>
                  
                  {sequentialMode && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="startNumber">Boshlang'ich raqam</Label>
                        <input
                          id="startNumber"
                          type="number"
                          min="1"
                          value={startNumber}
                          onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endNumber">Yakuniy raqam</Label>
                        <input
                          id="endNumber"
                          type="number"
                          min={startNumber}
                          value={endNumber}
                          onChange={(e) => setEndNumber(Math.max(parseInt(e.target.value) || startNumber, startNumber))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        Jami {endNumber - startNumber + 1} ta mahsulot yaratiladi
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Barkod formati</Label>
                    <Select
                      value={options.format}
                      onValueChange={(value) => handleOptionChange('format', value as BarcodeFormat)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Barkod formati" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CODE128">CODE128</SelectItem>
                        <SelectItem value="EAN13">EAN-13</SelectItem>
                        <SelectItem value="UPC">UPC</SelectItem>
                        <SelectItem value="CODE39">CODE39</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Yorliq turi</Label>
                    <Select
                      value={options.labelType}
                      onValueChange={(value) => handleOptionChange('labelType', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Yorliq turi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Barkod va matn</SelectItem>
                        <SelectItem value="barcode">Faqat barkod</SelectItem>
                        <SelectItem value="label">Faqat matn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Yorliq o'lchami</Label>
                    <Select
                      value={options.labelSize}
                      onValueChange={(value) => handleOptionChange('labelSize', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Yorliq o'lchami" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Kichik</SelectItem>
                        <SelectItem value="medium">O'rtacha</SelectItem>
                        <SelectItem value="large">Katta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Qog'oz o'lchami</Label>
                      <span className="text-xs text-muted-foreground">
                        {options.paperSize.toUpperCase()} {options.orientation}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={options.paperSize}
                        onValueChange={(value) => handleOptionChange('paperSize', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Qog'oz o'lchami" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a4">A4</SelectItem>
                          <SelectItem value="a5">A5</SelectItem>
                          <SelectItem value="a6">A6</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={options.orientation}
                        onValueChange={(value) => handleOptionChange('orientation', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Yo'nalish" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portret</SelectItem>
                          <SelectItem value="landscape">Landshaft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Ustunlar</Label>
                      <span className="text-xs text-muted-foreground">{options.columns} ta</span>
                    </div>
                    <Slider
                      value={[options.columns]}
                      min={1}
                      max={6}
                      step={1}
                      onValueChange={([value]) => handleOptionChange('columns', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Qatorlar</Label>
                      <span className="text-xs text-muted-foreground">{options.rows} ta</span>
                    </div>
                    <Slider
                      value={[options.rows]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={([value]) => handleOptionChange('rows', value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Chegara</Label>
                      <Switch
                        checked={options.showBorder}
                        onCheckedChange={(checked) => handleOptionChange('showBorder', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Nomi</Label>
                      <Switch
                        checked={options.showName}
                        onCheckedChange={(checked) => handleOptionChange('showName', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Narx</Label>
                      <Switch
                        checked={options.showPrice}
                        onCheckedChange={(checked) => handleOptionChange('showPrice', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>To'r ko'rinishi</Label>
                      <Switch
                        checked={options.showGrid}
                        onCheckedChange={(checked) => handleOptionChange('showGrid', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Preview */}
          <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
            <div 
              ref={printRef}
              className="bg-white shadow-md"
              style={{
                ...gridStyle,
                background: options.showGrid ? '#f8fafc' : 'white',
                border: options.showGrid ? '1px dashed #e2e8f0' : 'none',
                width: paperDimensions.width,
                minHeight: paperDimensions.height,
              }}
            >
              {Array.from({ length: options.rows * options.columns }).map((_, index) => {
                const product = displayProducts[index % displayProducts.length];
                if (!product) return null;
                
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-center p-2"
                    style={{
                      border: options.showGrid ? '1px dashed #e2e8f0' : 'none',
                      background: 'white',
                    }}
                  >
                    <PrintBarcode
                      barcode={product.barcode || product.id.toString()}
                      productName={options.showName ? product.name : undefined}
                      price={options.showPrice ? product.price : undefined}
                      format={options.format}
                      showValue={true}
                      showBorder={options.showBorder}
                      labelSize={options.labelSize}
                      labelType={options.labelType}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrintPreview;

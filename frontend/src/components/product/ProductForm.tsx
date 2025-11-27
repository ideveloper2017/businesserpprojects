import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProducts } from '@/hooks/useProducts';
import { useUnits } from '@/hooks/useUnits';
import { Button } from '@/components/ui/button';
import { CategoryTreeSelect } from '@/components/category/CategoryTreeSelect';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCategory, Product } from '@/types/product.types';
import {useCategories} from "@/hooks/useCategories";
import { useToast } from "@/components/ui/toast";
import { Loader2, Image as ImageIcon, X, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Image upload component
const ImageUpload = ({ value, onChange, disabled }: { value?: string; onChange: (file: File | null) => void; disabled?: boolean }) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setIsLoading(true);
    reader.onload = () => {
      setPreview(reader.result as string);
      onChange(file);
      setIsLoading(false);
    };
    reader.onerror = () => {
      console.error('File reading failed');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="relative group">
        <div className={cn(
          "border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center h-40 bg-muted/30",
          !preview && "hover:border-primary/50 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
            </div>
          ) : preview ? (
            <div className="relative w-full h-full">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain rounded-md"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-2">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Rasm yuklash uchun bosing
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG yoki WEBP (maks. 5MB)
              </p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={disabled || isLoading}
          />
        </div>
      </div>
    </div>
  );
};



// Validation schema
const productSchema = z.object({
  name: z.string({
    required_error: "Nom kiritilishi shart",
    invalid_type_error: "Nom matn ko'rinishida bo'lishi kerak"
  })
  .min(2, { message: "Nomi kamida 2 ta belgidan iborat bo'lishi kerak" })
  .max(100, { message: "Nomi 100 ta belgidan oshmasligi kerak" })
  .trim(),
  
  description: z.string()
    .max(1000, { message: "Tavsif 1000 ta belgidan oshmasligi kerak" })
    .optional()
    .or(z.literal('')),
  
  price: z.coerce.number({
    required_error: "Narx kiritilishi shart",
    invalid_type_error: "Narx raqam bo'lishi kerak"
  })
  .positive({ message: "Narx 0 dan katta bo'lishi kerak" })
  .max(1000000000, { message: "Narx juda katta" })
  .transform(val => parseFloat(val.toFixed(2))),
  
  quantityInStock: z.coerce.number({
    required_error: "Miqdor kiritilishi shart",
    invalid_type_error: "Miqdor raqam bo'lishi kerak"
  })
  .min(0, { message: "Miqdor 0 dan kichik bo'lishi mumkin emas" })
  .int({ message: "Miqdor butun son bo'lishi kerak" })
  .max(1000000, { message: "Miqdor juda katta" }),
  
  categoryId: z.coerce.number({
    invalid_type_error: "Kategoriya noto'g'ri formatda"
  })
  .positive({ message: "Iltimos, kategoriyani tanlang" })
  .optional(),

  unit_id: z.coerce.number({
    invalid_type_error: "Birlik noto'g'ri formatda"
  })
  .positive({ message: "Iltimos, birlikni tanlang" })
  .optional(),
  
  sku: z.string({
    required_error: "SKU kiritilishi shart"
  })
  .min(3, { message: "SKU kamida 3 ta belgidan iborat bo'lishi kerak" })
  .max(50, { message: "SKU 50 ta belgidan oshmasligi kerak" })
  .regex(/^[a-zA-Z0-9-]+$/, { 
    message: "SKU faqat harflar, raqamlar va chiziqcha (-) belgisini o'z ichiga olishi mumkin"
  })
  .transform(val => val.trim().toUpperCase()),
  
  costPrice: z.coerce.number({
    required_error: "Xarajat narxi kiritilishi shart",
    invalid_type_error: "Xarajat narxi raqam bo'lishi kerak"
  })
  .min(0.01, { message: "Xarajat narxi 0 dan katta bo'lishi kerak" })
  .max(1000000000, { message: "Xarajat narxi juda katta" })
  .transform(val => parseFloat(val.toFixed(2))),
  
  barcode: z.string()
    .max(100, { message: "Shtrix kod juda uzun" })
    .optional()
    .or(z.literal(''))
    .transform(val => val ? val.trim() : undefined),
  
  active: z.boolean({
    required_error: "Faollik holati kiritilishi shart"
  }).default(true),
  
  // For image upload
  image: z.any().optional(),
  images: z.array(z.string()).optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<Product> & { images?: string[] };
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function ProductForm({ 
  initialData, 
  onSuccess, 
  onCancel, 
  onError,
  onLoadingChange 
}: ProductFormProps) {
  const { toast } = useToast();

  const { createProduct, updateProduct, isLoading: isSubmitting } = useProducts();
  const { getCategories, createCategory, isLoading: isCategoriesLoading, error: categoryError } = useCategories();
  // State declarations
  const [searchQuery, setSearchQuery] = useState('');
  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  
  const { units, loading: unitsLoading, fetchUnits } = useUnits();
  
  // Fetch units on mount
  useEffect(() => {
    fetchUnits().catch(console.error);
  }, [fetchUnits]);

  // Filter and search active units
  const filteredActiveUnits = Array.isArray(units) 
    ? units.filter(unit => 
        unit?.active && 
        (unit.name?.toLowerCase().includes(unitSearchQuery.toLowerCase()) ||
         unit.code?.toLowerCase().includes(unitSearchQuery.toLowerCase()))
      )
    : [];
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.images?.[0] || null
  );

  // Initialize form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      costPrice: initialData?.costPrice || 0,
      quantityInStock: initialData?.quantityInStock || 0,
      sku: initialData?.sku || '',
      barcode: initialData?.barcode || '',
      categoryId: initialData?.categoryId,
      unit_id: initialData?.unit_id,
      active: initialData?.active !== undefined ? initialData.active : true,
      images: initialData?.images || []
    }
  });

  // Set initial unit if editing
  useEffect(() => {
    if (initialData?.unit_id) {
      form.setValue('unit_id', initialData.unit_id);
    }
  }, [initialData, form]);

  // Load categories
  useEffect(() => {
    const loadCategoryTree = async () => {
      try {
        const response = await getCategories();
        // The API returns the tree structure directly
        const data = response?.data?.data || [];
        // Flatten the category tree for the select component
        const flattenCategories = (categories: ProductCategory[]): ProductCategory[] => {
          return categories.reduce((acc: ProductCategory[], category) => {
            return [
              ...acc,
              { ...category, subCategories: [] }, // Add category without children to prevent infinite recursion
              ...(category.subCategories ? flattenCategories(category.subCategories) : [])
            ];
          }, []);
        };

        const flattenedCategories = Array.isArray(data) ? flattenCategories(data) : [];
        setCategories(flattenedCategories);

      } catch (error) {
        console.error('Kategoriyalar daraxtini yuklashda xatolik:', error);
        toast({
          variant: 'destructive',
          title: 'Xatolik',
          description: 'Kategoriyalar daraxtini yuklashda xatolik yuz berdi',
        });
      }
    };

    const debounceTimer = setTimeout(() => {
      loadCategoryTree();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, toast, getCategories]);

  // Handle category search
  const handleCategorySearch = (query: string) => {
    setSearchQuery(query);
  };


  const handleCreateCategory = async (name: string) => {
    try {
      const response = await createCategory({ name });
      // The useCategories hook already handles showing success/error toasts
      const newCategory = response?.data;
      if (newCategory) {
        // Add the new category to the list
        setCategories(prev => [{
          ...newCategory,
          subCategories: [],
          productCount: 0,
          description: null
        }, ...prev]);
        form.setValue('categoryId', newCategory.id);
        return newCategory;
      }
    } catch (error) {
      console.error('Kategoriya yaratishda xatolik:', error);
      throw error; // Let the CategoryTreeSelect handle the error
    }
  };

  // Handle image upload
  const handleImageUpload = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Form submit handler
  const onSubmit = async (formData: ProductFormValues) => {
    try {
      onLoadingChange?.(true);
      
      // Prepare form data for API
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        price: formData.price,
        quantityInStock: formData.quantityInStock,
        categoryId: formData.categoryId,
        unit_id: formData.unit_id,
        sku: formData.sku,
        costPrice: formData.costPrice,
        barcode: formData.barcode,
        active: formData.active
      };

      // Handle image upload if exists
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        // If this is an update and there was a previous image, include the old image URL
        if (initialData?.id && initialData.images?.[0]) {
          imageFormData.append('oldImage', initialData.images[0]);
        }
        // Merge image data with product data
        productData.image = imageFile;
      } else if (initialData?.images?.[0] && !imagePreview) {
        // If there was an image but it was removed
        productData.removeImage = true;
      }

      // Save product
      if (initialData?.id) {
        // For updates, include the ID in the product data
        const response = await updateProduct(initialData.id, productData);
        if (response) {
          toast({
            title: 'Muvaffaqiyatli yangilandi',
            description: 'Mahsulot muvaffaqiyatli yangilandi',
          });
          onSuccess?.();
        }
      } else {
        await createProduct(productData);
        toast({
          title: 'Muvaffaqiyatli yaratildi',
          description: 'Yangi mahsulot muvaffaqiyatli yaratildi',
        });
        form.reset();
        setImageFile(null);
        setImagePreview(null);
      }
      
      onSuccess?.();

    } catch (error: any) {
      console.error('Mahsulot saqlashda xatolik:', error);

      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Mahsulotni saqlashda xatolik yuz berdi';
      
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: errorMessage,
      });
      
      onError?.(error);
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Image upload */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Mahsulot rasmi</h3>
                <p className="text-xs text-gray-500">
                  Mahsulot uchun asosiy rasm yuklang (ixtiyoriy)
                </p>
                <ImageUpload 
                  value={imagePreview || ''} 
                  onChange={handleImageUpload} 
                  disabled={isSubmitting} 
                />
              </div>
            </div>

            {/* Right column - Form fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Asosiy ma'lumotlar</h3>
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomi</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Mahsulot nomi" 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategoriya</FormLabel>
                        <FormControl>
                          <CategoryTreeSelect
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            categories={categories}
                            isLoading={isCategoriesLoading}
                            onSearch={handleCategorySearch}
                            onCreateCategory={handleCreateCategory}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-xs">
                          Mahsulot qaysi kategoriyaga tegishli ekanligini belgilang
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* Unit */}
                  <FormField
                    control={form.control}
                    name="unit_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birlik</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={isSubmitting || unitsLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Birlikni tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <div className="px-3 py-2">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Qidirish..."
                                    className="pl-8 h-9"
                                    value={unitSearchQuery}
                                    onChange={(e) => setUnitSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            {filteredActiveUnits.length > 0 ? filteredActiveUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id?.toString()}>
                                {unit.name} ({unit.code})
                              </SelectItem>
                            )) : (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                {unitSearchQuery ? 'Natija topilmadi' : 'Birliklar mavjud emas'}
                              </div>
                            )}
                            {unitsLoading && (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Yuklanmoqda...
                              </div>
                            )}
                            {/*{!unitsLoading && activeUnits.length === 0 && (*/}
                            {/*  <div className="px-2 py-1.5 text-sm text-muted-foreground">*/}
                            {/*    Birliklar topilmadi*/}
                            {/*  </div>*/}
                            {/*)}*/}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        <FormDescription className="text-xs">
                          Mahsulot birligini tanlang (dona, kg, litr, ...)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SKU */}
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Mahsulot SKU" 
                            {...field} 
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-xs">
                          Mahsulotning yagona identifikator kodi
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* Barcode */}
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barkod</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Barkod raqami" 
                            {...field} 
                            value={field.value || ''} 
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-xs">
                          Skaner orqali skanerlash uchun
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tavsif</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Mahsulot haqida qisqacha ma'lumot" 
                          {...field} 
                          rows={3}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Narx va inventarizatsiya</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sotuv narxi</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              className="pl-7"
                              disabled={isSubmitting}
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cost Price */}
                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Xarajat narxi</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="ml-1.5 text-gray-400 hover:text-gray-500">
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p>Mahsulotning sotib olish narxi. Bu maydon faqat boshqaruv uchun ko'rsatiladi.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              className="pl-7"
                              disabled={isSubmitting}
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantity */}
                  <FormField
                    control={form.control}
                    name="quantityInStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qolgan miqdori</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            disabled={isSubmitting}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Category section removed as it's now at the top */}

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Holati</h3>
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            id="active"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel htmlFor="active" className="font-medium text-gray-900">
                          Faol
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {field.value 
                            ? "Ushbu mahsulot foydalanuvchilar uchun ko'rinadi" 
                            : "Ushbu mahsulot foydalanuvchilar uchun yashirin"}
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6"
            >
              Bekor qilish
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                'Saqlash'
              )}
            </Button>
          </div>
        </form>
      </Form>
        </div>
    );
}

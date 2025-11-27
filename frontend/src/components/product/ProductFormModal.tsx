import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactNode, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ProductForm from './ProductForm';
import { Product } from '@/types';
import { useToast } from '@/components/ui/toast';

interface ProductFormModalProps {
  trigger: ReactNode;
  title?: string;
  description?: string;
  initialData?: Product;
  onSuccess?: () => void;
}

export function ProductFormModal({
  trigger,
  title = 'Mahsulot',
  description = 'Yangi mahsulot qo\'shish yoki mavjud mahsulotni tahrirlash.',
  initialData,
  onSuccess
}: ProductFormModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    toast({
      title: 'Muvaffaqiyatli',
      description: initialData ? 'Mahsulot muvaffaqiyatli yangilandi' : 'Yangi mahsulot qo\'shildi',
      variant: 'default',
    });
    onSuccess?.();
  };

  const handleError = (error: unknown) => {
    console.error('Xatolik yuz berdi:', error);
    toast({
      title: 'Xatolik',
      description: error instanceof Error ? error.message : 'Xatolik yuz berdi',
      variant: 'destructive',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {initialData ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="relative">
          {isSubmitting && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <ProductForm 
            initialData={initialData} 
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={() => setOpen(false)}
            onLoadingChange={setIsSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

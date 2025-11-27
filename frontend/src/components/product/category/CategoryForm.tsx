import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { ProductCategory } from '@/types/product.types.ts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import useCategories from "@/hooks/useCategories";

// interface CategoryTreeItem extends ProductCategory {
//   children?: CategoryTreeItem[];
//   level?: number;
// }

interface TreeNode extends ProductCategory {
  key: string;
  children?: TreeNode[];
  level?: number;
  isExpanded?: boolean;
}

const buildCategoryTree = (
    categories: ProductCategory[],
    parentId: number | null = null,
    level = 0
): TreeNode[] => {
  if (!Array.isArray(categories)) {
    console.error('Invalid categories array in buildCategoryTree:', categories);
    return [];
  }

  try {
    const tree = categories
        .filter(category => {
          if (!category) return false;

          // parentId ni oddiy number formatga o‘tkazamiz
          const catParentId =
              category.parentId && typeof category.parentId === 'object'
                  ? category.parentId
                  : category.parentId ?? null;

          return catParentId === parentId;
        })
        .map(category => {
          const children = buildCategoryTree(categories, category.id, level + 1);
          return {
            ...category,
            level,
            children: children.length > 0 ? children : undefined,
          };
        });

    return tree;
  } catch (error) {
    console.error('Error in buildCategoryTree:', error);
    return [];
  }
};


const isDescendant = (categories: TreeNode[], childId: number, parentId: number): boolean => {
  console.log(`Checking if ${childId} is descendant of ${parentId}`);
  try {
    let current = categories.find(c => c.id === childId);
    while (current?.parentId) {
      const currentParentId = typeof current.parentId === 'object' ? current?.parentId?.id : current.parentId;
      console.log(`Current category ${current.id}, parentId: ${currentParentId}`);
      if (currentParentId === parentId) {
        console.log(`${childId} is a descendant of ${parentId}`);
        return true;
      }
      current = categories.find(c => c.id === currentParentId);
    }
    console.log(`${childId} is not a descendant of ${parentId}`);
    return false;
  } catch (error) {
    console.error('Error in isDescendant:', error);
    return false;
  }
};

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Nomi kiritilishi shart'),
  description: z.string().optional(),
  parentId: z.number().nullable().default(null),
  active: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ProductCategory | null;
  categories: TreeNode[];
  onSubmit: (data: CategoryFormValues) => Promise<void>;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
                                                            open,
                                                            onOpenChange,
                                                            category,
                                                            categories,
                                                            onSubmit,
                                                          }) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      parentId: category?.parentId ?? null,
      active: category?.active ?? true,
    },
  });


  const categoryTree = React.useMemo(() => {
    if (!Array.isArray(categories)) {
      console.error('Invalid categories array:', categories);
      return [];
    }

    // O'zini va avlodlarini chiqarib tashlaymiz
    const filteredCategories = categories.filter(cat => {
      if (!cat) return false;

      const isCurrent = category?.id === cat.id;
      const isChild = category?.id && isDescendant(categories, cat.id, category.id);

      return !isCurrent && !isChild;
    });
    console.log(buildCategoryTree(filteredCategories))
    return buildCategoryTree(filteredCategories);
  }, [categories, category]);




  const renderCategoryOptions = (categories: TreeNode[]) => {
    console.log('renderCategoryOptions: categories=', categories);
    if (!categories?.length) {
      console.warn('renderCategoryOptions: No categories to render');
      return null;
    }

    return categories.map(cat => {
      if (!cat?.id || !cat?.name) {
        console.warn('Invalid category:', cat);
        return null;
      }
      return (
          <React.Fragment key={`category-${cat.id}`}>
            <SelectItem
                value={cat.id.toString()}
                style={{ paddingLeft: `${(cat.level || 0) * 16 + 16}px` }}
            >
              {(cat.level || 0) > 0 ? '—'.repeat(cat.level as number) + ' ' + cat.name : cat.name}
            </SelectItem>
            {cat.children?.length ? renderCategoryOptions(cat.children) : null}
          </React.Fragment>
      );
    }).filter(Boolean); // Null elementlarni olib tashlash
  };

  React.useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || '',
        parentId: typeof category.parentId === 'object' ? category.parentId?.id : category.parentId ?? null,
        active: category.active ?? true,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        parentId: null,
        active: true,
      });
    }
  }, [category, open, form]);

  const handleSubmit = async (formData: CategoryFormValues) => {
    await onSubmit(formData);
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {category ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya qo\'shish'}
            </DialogTitle>
            <DialogDescription>
              {category
                  ? 'Kategoriya ma\'lumotlarini tahrirlang'
                  : 'Yangi kategoriya qo\'shish uchun ma\'lumotlarni kiriting'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomi</FormLabel>
                        <FormControl>
                          <Input placeholder="Kategoriya nomi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tavsif (ixtiyoriy)</FormLabel>
                        <FormControl>
                          <Textarea
                              placeholder="Kategoriya haqida qisqacha..."
                              className="min-h-[100px]"
                              {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ota-kategoriya (ixtiyoriy)</FormLabel>
                        <Select
                            onValueChange={(value) => field.onChange(value === '0' ? null : Number(value))}
                            value={field.value?.toString() || '0'}
                            disabled={!!category?.id && categories.some(c => c.parentId === category.id)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ota-kategoriyani tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectContent>
                              <SelectItem value="0">Asosiy kategoriya</SelectItem>
                              {renderCategoryOptions(categoryTree)}
                            </SelectContent>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Faol</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? 'Kategoriya faol' : 'Kategoriya nofaol'}
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                  )}
              />
              <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                      ? 'Saqlanmoqda...'
                      : category
                          ? 'Saqlash'
                          : 'Qo\'shish'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  );
};
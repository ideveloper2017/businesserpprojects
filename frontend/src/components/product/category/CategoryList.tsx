import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, Folder, FolderOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { ProductCategory } from '@/types/product.types';
import { toast } from 'sonner';
import { CategoryForm } from './CategoryForm';
import { Badge } from '@/components/ui/badge';

interface TreeNode extends ProductCategory {
  level: number;
  isExpanded: boolean;
  currentPath: string;
  children: TreeNode[];
}

export const CategoryList = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const categoryApi = useCategories();

  // Build tree structure from flat categories array
  const buildTree = (items: ProductCategory[], parentId: number | null = null, level = 0, path: number[] = []): TreeNode[] => {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => {
        const currentPath = [...path, item.id].join('-');
        const children = buildTree(items, item.id, level + 1, [...path, item.id]);
        const isExpanded = expanded[currentPath] ?? true;
        
        return {
          ...item,
          level,
          isExpanded,
          currentPath,
          children: isExpanded ? children : []
        };
      });
  };

  // Flatten tree for table rendering with proper indentation
  const flattenTree = (items: TreeNode[]): TreeNode[] => {
    return items.reduce((acc: TreeNode[], item) => {
      acc.push(item);
      if (item.children && item.isExpanded) {
        acc.push(...flattenTree(item.children));
      }
      return acc;
    }, []);
  };

  const treeData = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    return flattenTree(buildTree([...categories]));
  }, [categories, expanded]);
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoryApi.getCategories();
      
      if (response?.data) {
        // Handle both response formats: direct array or { data: [] }
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);
        
        setCategories(categoriesData);
        
        // Auto-expand all categories by default
        const allIds = categoriesData.reduce<string[]>((acc, category) => {
          if (category.id) {
            acc.push(String(category.id));
          }
          return acc;
        }, []);
        
        const expandedObj = allIds.reduce((acc, id) => ({
          ...acc,
          [id]: true
        }), {});
        
        setExpanded(expandedObj);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriyalarni yuklashda xatolik yuz berdi');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = (parentId?: number) => {
    setSelectedCategory(parentId ? { parentId } as ProductCategory : null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Ushbu kategoriyani o\'chirishni tasdiqlaysizmi?')) {
      try {
        await categoryApi.deleteCategory(id);
        toast.success('Kategoriya muvaffaqiyatli o\'chirildi');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Kategoriyani o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedCategory) {
        await categoryApi.updateCategory(selectedCategory.id, data);
        toast.success('Kategoriya muvaffaqiyatli yangilandi');
      } else {
        await categoryApi.createCategory(data);
        toast.success('Yangi kategoriya muvaffaqiyatli qo\'shildi');
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(selectedCategory ? 'Kategoriyani yangilashda xatolik' : 'Yangi kategoriya qo\'shishda xatolik');
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return treeData;
    
    const searchLower = searchTerm.toLowerCase();
    const filterCategory = (items: TreeNode[]): TreeNode[] => {
      return items.filter(item => {
        const matches = item.name.toLowerCase().includes(searchLower) ||
                      (item.description?.toLowerCase()?.includes(searchLower) ?? false);
        
        if (matches) return true;
        
        if (item.children?.length) {
          const matchingChildren = filterCategory(item.children);
          if (matchingChildren.length > 0) return true;
        }
        
        return false;
      }).map(item => ({
        ...item,
        children: item.children ? filterCategory(item.children) : []
      }));
    };
    
    if (!categories || !Array.isArray(categories)) return [];
    const filteredTree = filterCategory(buildTree([...categories]));
    return flattenTree(filteredTree);
  }, [treeData, searchTerm, categories, expanded]);
  console.log(filteredCategories);
  const toggleExpand = (path: string) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mahsulot Kategoriyalari</h1>
        <Button onClick={() => handleCreate()}>
          <Plus className="mr-2 h-4 w-4" /> Yangi Kategoriya
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Kategoriya nomi yoki tavsifi bo'yicha qidirish..."
          className="w-full bg-background pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomi</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead>Tavsif</TableHead>
              <TableHead className="w-[180px] text-right">Harakatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Kategoriyalar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={`${category.id}-${category.level}`}>
                  <TableCell className="font-medium" style={{ paddingLeft: `${20 * category.level + 12}px` }}>
                    <div className="flex items-center">
                      {category.children && category.children.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 mr-1"
                          onClick={() => toggleExpand(category.currentPath)}
                        >
                          {category.isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <div className="w-6 h-6 mr-1" />
                      )}
                      <span className="flex items-center">
                        {category.isExpanded ? (
                          <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                        ) : (
                          <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                        )}
                        {category.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.active ? 'default' : 'secondary'}>
                      {category.active ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.description || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(category)}
                        title="Tahrirlash"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(category.id)}
                        title="O'chirish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCreate(category.id)}
                        title="Quyi kategoriya qo'shish"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSubmit={handleFormSubmit}
        categories={categories}
      />
    </div>
  );
};

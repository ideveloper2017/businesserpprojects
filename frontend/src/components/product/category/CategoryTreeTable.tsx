import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { ProductCategory } from '@/types/product.types';
import { toast } from 'sonner';
import { CategoryForm } from './CategoryForm';
import { Badge } from '@/components/ui/badge';
//import {confirmDialog, ConfirmDialog} from 'primereact/confirmdialog';
// import 'primereact/resources/themes/lara-light-indigo/theme.css';

interface TreeNode extends ProductCategory {
  key: string;
  children?: TreeNode[];
  level?: number;
  isExpanded?: boolean;
}

export const CategoryTreeTable = () => {
  const [categories, setCategories] = useState<TreeNode[]>([]);
  const { getCategories, createCategory, isLoading: isCategoriesLoading, error: categoryError } = useCategories();
  const [flattenedNodes, setFlattenedNodes] = useState<TreeNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const categoryApi = useCategories();

  // Flatten the tree for table display
  const flattenTree = (nodes: TreeNode[] = [], level = 0, parentPath: string = ''): TreeNode[] => {
    return nodes.reduce((acc: TreeNode[], node) => {
      const path = parentPath ? `${parentPath}.${node.id}` : String(node.id);
      const newNode = {
        ...node,
        key: path,
        level,
        isExpanded: true
      };
      
      return [
        ...acc,
        newNode,
        ...(node.isExpanded && node.subCategories ? flattenTree(node.subCategories, level + 1, path) : [])
      ];
    }, []);
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      // Use getCategoryTree to fetch the hierarchical category data
      const response = await getCategories();
      // The response should be an array of root categories with nested children
      const categoriesData = Array.isArray(response?.data?.data) ? response?.data?.data : [];
      console.log(categoriesData);
      // Add default expanded state
      const addExpandedState = (nodes: any[]): any[] => {
        return nodes.map(node => ({
          ...node,
          isExpanded: true,
          subCategories: node.subCategories ? addExpandedState(node.subCategories) : []
        }));
      };
      
      const categoriesWithExpanded = addExpandedState(categoriesData);
      
      setCategories(categoriesWithExpanded);
      setFlattenedNodes(flattenTree(categoriesWithExpanded));
    } catch (error) {
      console.error('Error fetching category tree:', error);
      toast.error('Kategoriyalarni yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [getCategories]);

  // Update flattened nodes when categories or expanded state changes
  useEffect(() => {
    if (categories && categories.length > 0) {
      setFlattenedNodes(flattenTree(categories));
    }
  }, [categories]);
  
  // Toggle node expansion
  const toggleExpand = (node: TreeNode) => {
    const updatedCategories = [...categories];
    const updateNode = (nodes: TreeNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === node.id) {
          nodes[i].isExpanded = !nodes[i].isExpanded;
          return true;
        }
        if (nodes[i].subCategories && updateNode(nodes[i].subCategories as TreeNode[])) {
          return true;
        }
      }
      return false;
    };
    
    updateNode(updatedCategories);
    setCategories(updatedCategories);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const confirmDelete = (category: ProductCategory) => {
    // confirmDialog({
    //   message: `"${category.name}" kategoriyasini o'chirishni tasdiqlaysizmi?`,
    //   header: 'Tasdiqlash',
    //   icon: 'pi pi-exclamation-triangle',
    //   acceptLabel: 'Ha',
    //   rejectLabel: 'Yo\'q',
    //   accept: () => deleteCategory(category.id)
    // });
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoryApi.deleteCategory(id);
      toast.success('Kategoriya muvaffaqiyatli o\'chirildi');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Kategoriyani o\'chirishda xatolik yuz berdi');
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const categoryData = {
        ...data,
        active: data.active ?? true // Default to true if not provided
      };
      
      if (selectedCategory) {
        await categoryApi.updateCategory(selectedCategory.id, categoryData);
        toast.success('Kategoriya muvaffaqiyatli yangilandi');
      } else {
        await categoryApi.createCategory(categoryData);
        toast.success('Yangi kategoriya muvaffaqiyatli qo\'shildi');
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(selectedCategory ? 'Kategoriyani yangilashda xatolik' : 'Yangi kategoriya qo\'shishda xatolik');
    }
  };
  
  const toggleActiveStatus = async (category: ProductCategory) => {
    try {
      await categoryApi.updateCategory(category.id, {
        ...category,
        active: !category.active
      });
      toast.success(`Kategoriya ${!category.active ? 'faollashtirildi' : 'nofaol qilindi'}`);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Statusni o\'zgartirishda xatolik');
    }
  };

  // Filter categories based on search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return flattenedNodes;
    
    const searchLower = searchTerm.toLowerCase();
    
    return flattenedNodes.filter(node => {
      const nameMatch = node.name?.toLowerCase().includes(searchLower) || false;
      const descMatch = node.description?.toLowerCase().includes(searchLower) || false;
      return nameMatch || descMatch;
    });
  }, [flattenedNodes, searchTerm]);

  // Render expand/collapse icon
  const renderExpandIcon = (node: TreeNode) => {
    if (!node.subCategories || node.subCategories.length === 0) {
      return <span className="inline-block w-6"></span>;
    }
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleExpand(node);
        }}
        className="p-1 rounded hover:bg-gray-100"
      >
        {node.isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    );
  };

  // Render the table rows
  const renderTableRows = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-4 text-center">
            Yuklanmoqda...
          </td>
        </tr>
      );
    }

    if (filteredNodes.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-4 text-center">
            Kategoriyalar topilmadi
          </td>
        </tr>
      );
    }

    return filteredNodes.map((node) => (
      <tr 
        key={node.key} 
        className="bg-white border-b hover:bg-gray-50"
      >
        <td 
          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
          style={{ paddingLeft: `${(node.level || 0) * 24 + 12}px` }}
        >
          <div className="flex items-center">
            {renderExpandIcon(node)}
            <div className="ml-2 flex items-center">
              {node.subCategories?.length ? (
                node.isExpanded ? (
                  <FolderOpen className="h-4 w-4 mr-2 text-yellow-500" />
                ) : (
                  <Folder className="h-4 w-4 mr-2 text-yellow-500" />
                )
              ) : (
                <File className="h-4 w-4 mr-2 text-blue-500" />
              )}
              <span>{node.name}</span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          {node.description || '-'}
        </td>
        <td className="px-6 py-4">
          <Badge variant={node.active ? 'default' : 'destructive'}>
            {node.active ? 'Faol' : 'Nofaol'}
          </Badge>
        </td>
        <td className="px-6 py-4">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleActiveStatus(node)}
              title={node.active ? 'Nofaol qilish' : 'Faollashtirish'}
              className={node.active ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
            >
              {node.active ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(node)}
              title="Tahrirlash"
              className="text-blue-600 hover:text-blue-700"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => confirmDelete(node)}
              title="O'chirish"
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mahsulot Kategoriyalari</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Yangi Kategoriya
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Kategoriya nomi bo'yicha qidirish..."
          className="w-full bg-background pl-8 max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Nomi</th>
                <th scope="col" className="px-6 py-3">Tavsif</th>
                <th scope="col" className="px-6 py-3">Holati</th>
                <th scope="col" className="px-6 py-3">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={selectedCategory}
        categories={categories}
        onSubmit={handleFormSubmit}
      />
      {/*<ConfirmDialog />*/}
    </div>
  );
};

export default CategoryTreeTable;

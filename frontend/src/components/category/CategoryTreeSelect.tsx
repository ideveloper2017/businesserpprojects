import { ChevronDown, ChevronRight, Loader2, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductCategory } from '@/types/product.types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CategoryTreeItemProps {
  category: ProductCategory;
  level?: number;
  selectedId?: number;
  onSelect: (id: number) => void;
}

const CategoryTreeItem = ({
                            category,
                            level = 0,
                            selectedId,
                            onSelect
                          }: CategoryTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.subCategories && category.subCategories.length > 0;
  const isSelected = selectedId === category.id;

  return (
      <div className="space-y-1">
        <div
            className={`flex items-center cursor-pointer hover:bg-accent p-1 rounded ${level > 0 ? 'pl-4' : ''} ${
                isSelected ? 'bg-accent' : ''
            }`}
            onClick={() => onSelect(category.id!)}
        >
          {hasChildren ? (
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
              >
                {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                ) : (
                    <ChevronRight className="h-3 w-3" />
                )}
              </Button>
          ) : (
              <div className="w-4 mr-1" />
          )}
          <span className={`text-sm ${isSelected ? 'font-medium text-primary' : ''}`}>
          {category.name}
        </span>
        </div>
        {hasChildren && isExpanded && (
            <div key={`category-${category.id}-children`} className="ml-4">
              {category.subCategories?.map((child) => (
                  <CategoryTreeItem
                      key={child.id}
                      category={child}
                      level={level + 1}
                      selectedId={selectedId}
                      onSelect={onSelect}
                  />
              ))}
            </div>
        )}
      </div>
  );
};

interface CategoryTreeSelectProps {
  value?: number;
  onChange: (value: number) => void;
  categories: ProductCategory[];
  isLoading: boolean;
  onSearch: (query: string) => void;
  onCreateCategory: (name: string) => Promise<void>;
  disabled?: boolean;
}

export const CategoryTreeSelect = ({
                                     value,
                                     onChange,
                                     categories,
                                     isLoading,
                                     onSearch,
                                     onCreateCategory,
                                     disabled,
                                   }: CategoryTreeSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategory = categories.find((cat) => cat.id === value);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setIsCreating(true);
      await onCreateCategory(newCategoryName);
      setNewCategoryName('');
      setIsCreatingNew(false);
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
          <div className="py-2 px-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Yuklanmoqda...
            </div>
          </div>
      );
    }

    if (categories.length === 0) {
      return (
          <div className="py-2 px-3 text-sm text-muted-foreground">
            Kategoriya topilmadi
          </div>
      );
    }

    return (
        <>
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Qidirish..."
                  className="pl-8 h-8 text-sm"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <ScrollArea className="max-h-60 overflow-y-auto p-1">
            {categories.map((category) => (
                <CategoryTreeItem
                    key={`category-${category.id}`}
                    category={category}
                    selectedId={value}
                    onSelect={(id) => {
                      onChange(id);
                      setIsOpen(false);
                    }}
                />
            ))}
          </ScrollArea>

          {!isCreatingNew && searchQuery && !categories.some(c => c.name.toLowerCase() === searchQuery.toLowerCase()) && (
              <div
                  className="mt-1 p-2 cursor-pointer text-sm text-primary hover:bg-accent rounded-md flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatingNew(true);
                  }}
              >
                <Plus className="h-4 w-4 mr-2" />
                "{searchQuery}" yaratish
              </div>
          )}

          {isCreatingNew && (
              <div className="mt-1 p-2 border-t">
                <p className="text-xs font-medium mb-1 text-muted-foreground">Yangi kategoriya</p>
                <div className="flex gap-1">
                  <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nomi"
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCategoryName.trim()) {
                          handleCreateCategory();
                        }
                      }}
                  />
                  <Button
                      type="button"
                      size="sm"
                      className="h-8"
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim() || isCreating}
                  >
                    {isCreating ? '...' : 'OK'}
                  </Button>
                </div>
              </div>
          )}
        </>
    );
  };

  return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
              disabled={disabled || isCreating}
          >
          <span className="truncate">
            {selectedCategory?.name || 'Kategoriyani tanlang'}
          </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          {renderContent()}
        </PopoverContent>
      </Popover>
  );
};

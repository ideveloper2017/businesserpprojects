import { useState } from 'react';
import { ProductList } from '@/components/pos/ProductList';
import { Cart } from '@/components/pos/Cart';
import { CustomerInfo } from '@/components/pos/CustomerInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Save, CreditCard, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { usePosOrders } from '@/hooks/usePosOrders';
import { useCart } from '@/hooks/useCart';

export function PosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [notes, setNotes] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>();
  const { toast } = useToast();
  const { items: cartItems } = useCart();
  const { createOrder, saveAsDraft, isLoading } = usePosOrders();

  const handleCreateOrder = async (isDraft = false) => {
    try {
      if (isDraft) {
        await saveAsDraft(selectedCustomerId, notes);
        toast({
          title: 'Черновик сохранен',
          description: 'Черновик заказа успешно сохранен.',
        });
      } else {
        await createOrder(selectedCustomerId, notes);
        toast({
          title: 'Заказ создан',
          description: 'Заказ успешно создан и готов к оплате.',
        });
      }
      // Сбрасываем заметки после создания заказа
      setNotes('');
    } catch (err) {
      console.error('Error creating order:', err);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Не удалось создать заказ. Пожалуйста, попробуйте снова.',
      });
    }
  };

  const handleCustomerSelect = (customer: { id: number } | null) => {
    setSelectedCustomerId(customer?.id);
  };

  return (

      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-64px)] p-4">
        {/* Левая панель - Товары */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="products">Товары</TabsTrigger>
                  <TabsTrigger value="categories">Категории</TabsTrigger>
                  <TabsTrigger value="favorites">Избранное</TabsTrigger>
                </TabsList>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Поиск по названию, артикулу, штрих-коду..."
                    className="pl-8 pr-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <X 
                      className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => setSearchQuery('')}
                    />
                  )}
                </div>
              </div>
              
              <TabsContent value="products" className="mt-4">
                <ProductList 
                  searchQuery={searchQuery} 
                  onSearchChange={setSearchQuery}
                />
              </TabsContent>
              <TabsContent value="categories">
                <div className="text-center py-8 text-muted-foreground">
                  Выберите категорию
                </div>
              </TabsContent>
              <TabsContent value="favorites">
                <div className="text-center py-8 text-muted-foreground">
                  Избранные товары появятся здесь
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Правая панель - Корзина и информация о клиенте */}
        <div className="col-span-1 flex flex-col gap-4">
          <CustomerInfo onCustomerSelect={handleCustomerSelect} />
          <Cart />
          <div className="p-4 border-t">
            <div className="mb-4">
              <label htmlFor="order-notes" className="block text-sm font-medium text-muted-foreground mb-2">
                Примечания к заказу
              </label>
              <textarea
                id="order-notes"
                className="w-full p-2 border rounded-md text-sm min-h-[80px]"
                placeholder="Добавьте примечания к заказу..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleCreateOrder(true)}
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Сохранить черновик
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleCreateOrder(false)}
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Оплатить
              </Button>
            </div>
          </div>
        </div>
      </div>

  );
}

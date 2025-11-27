import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, Percent } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

export function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const [discount, setDiscount] = useState(0);
  const [taxRate] = useState(12); // Default 12% tax

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const grandTotal = subtotal - discountAmount + taxAmount;

  if (items.length === 0) {
    return (
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Корзина</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Корзина пуста
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Корзина</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            Очистить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.price} UZS × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value) || 1)
                    }
                    className="w-12 text-center h-8"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-right font-medium">
                {item.price * item.quantity} UZS
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="border-t p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Подытог:</span>
          <span>{subtotal.toLocaleString()} UZS</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span>Скидка:</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              className="w-16 text-right"
            />
            <span>%</span>
            <span className="ml-2">-{discountAmount.toFixed(2)} UZS</span>
          </div>

          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span>НДС:</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              disabled
              className="w-16 text-right"
            />
            <span>%</span>
            <span className="ml-2">+{taxAmount.toFixed(2)} UZS</span>
          </div>
        </div>
        <div className="border-t pt-2 mt-2 flex justify-between font-medium">
          <span>Итого:</span>
          <span>{grandTotal.toLocaleString()} UZS</span>
        </div>
        <Button className="w-full gap-2">
          Оформить заказ
        </Button>
      </div>
    </Card>
  );
}

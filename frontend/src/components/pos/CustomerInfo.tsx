import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Customer } from '@/lib/api';
import { useCustomers } from '@/hooks/useCustomers';

type CustomerInfoProps = {
  onCustomerSelect?: (customer: Customer | null) => void;
};

export function CustomerInfo({ onCustomerSelect }: CustomerInfoProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchForCustomers } = useCustomers();

  const searchCustomers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchForCustomers(searchQuery);

      if (results) {
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchCustomers();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchResults([]);
    setSearchQuery('');
    onCustomerSelect?.(customer);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setSearchQuery('');
  };

  if (selectedCustomer) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Клиент</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearCustomer}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
            <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
            {selectedCustomer.email && (
              <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
            )}
            {selectedCustomer.address && (
              <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Клиент</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск клиента по имени или телефону..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCustomers()}
            />
            {isSearching && (
              <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border">
              <div className="max-h-60 overflow-auto">
                {searchResults.map((customer) => (
                  <div
                    key={customer.id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => {
              // TODO: Implement add new customer modal
              const newCustomer = {
                id: 0, // Will be set by the backend
                firstName: 'Новый',
                lastName: 'Клиент',
                phone: '',
                address: ''
              };
              handleCustomerSelect(newCustomer);
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Новый клиент
          </Button>
        </div>
        
        {isSearching && !searchResults.length && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Поиск клиентов...
          </div>
        )}
        
        {!isSearching && searchQuery && !searchResults.length && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Клиенты не найдены
          </div>
        )}
      </CardContent>
    </Card>
  );
}

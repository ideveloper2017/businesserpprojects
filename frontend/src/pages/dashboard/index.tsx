import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export function Dashboard() {
  // Mocked dashboard data
  const dashboardData = {
    totalSales: 15680.45,
    totalOrders: 156,
    totalProducts: 64,
    totalCustomers: 1204,
    recentOrders: [
      { id: 1, customer: "John Doe", amount: 125.99, status: "completed" },
      { id: 2, customer: "Sarah Johnson", amount: 89.50, status: "pending" },
      { id: 3, customer: "Michael Brown", amount: 210.75, status: "completed" },
      { id: 4, customer: "Emily Davis", amount: 45.25, status: "pending" },
    ],
    lowStockItems: [
      { id: 1, name: "Smartphone XS", stock: 3, threshold: 5 },
      { id: 2, name: "Wireless Headphones", stock: 2, threshold: 10 },
      { id: 3, name: "Smart Watch", stock: 4, threshold: 5 },
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your store's performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalSales}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+12.4% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+4 new products added</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {dashboardData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                  </div>
                  <div className="ml-auto font-medium">
                    {order.amount}
                  </div>
                  <div className={`ml-4 rounded-full px-2 py-1 text-xs ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {dashboardData.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>Stock: {item.stock}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span>
                      <span>Threshold: {item.threshold}</span>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${item.stock <= item.threshold / 2 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.stock <= item.threshold / 2 ? 'Critical' : 'Low'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

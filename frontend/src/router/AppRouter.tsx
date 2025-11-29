import { Route, Routes } from 'react-router-dom';
import Login from "@/pages/login/Login";
import {AuthGuard} from "@/components/Auth/Auth-guard";
import {AdminDashboard} from "@/components/layout/AdminDashboard";
import {Dashboard} from "@/pages/dashboard";
import AuditLogsPage from "@/pages/audit/AuditLogsPage";
import RolesPage from "@/pages/user/RolesPage";
import {UserManagement} from "@/pages/user";
import PermissionsPage from "@/pages/user/PermissionsPage";
import {ProductPage} from "@/pages/product";
import {CategoryTreeTable} from "@/components/product/category";
import { Inventory } from "@/pages/inventory";
import { Customers } from "@/pages/customers";
import MediaLibraryPage from "@/pages/media-library/media-library";
import { OrdersPage } from "@/pages/orders/OrdersPage";
import { CreateOrderPage } from "@/pages/orders/CreateOrderPage";
import { OrderDetailPage } from "@/pages/orders/OrderDetailPage";
import { EditOrderPage } from "@/pages/orders/EditOrderPage";
import { UnitsPage } from "@/pages/units";
import { PosPage } from "@/pages/pos/PosPage";
import { PaymentsPage } from "@/pages/payments/PaymentsPage";
import { CreatePaymentPage } from "@/pages/payments/CreatePaymentPage";
import { EditPaymentPage } from "@/pages/payments/EditPaymentPage";
import { PaymentDetailPage } from "@/pages/payments/PaymentDetailPage";
import { WarehouseRoutes } from "@/pages/warehouses/WarehouseRoutes";
import RecipesPage from "@/pages/manufacturing/RecipesPage";


const AppRouter = () => {

    return (
     <Routes>
         <Route path="/login" element={<Login />} />

         <Route
            path="/"
            element={
                <AuthGuard>
                    <AdminDashboard>
                         <Dashboard />
                     </AdminDashboard>
                 </AuthGuard>
             }
         />
         <Route
            path="/products"
            element={
                <AuthGuard>
                    <AdminDashboard>
                         <ProductPage />
                     </AdminDashboard>
                 </AuthGuard>
             }
         />
         <Route
            path="/categories"
            element={
                <AuthGuard>
                    <AdminDashboard>
                         <CategoryTreeTable />
                     </AdminDashboard>
                 </AuthGuard>
             }
         />
         <Route
            path="/inventory"
            element={
                <AuthGuard>
                    <AdminDashboard>
                         <Inventory />
                     </AdminDashboard>
                 </AuthGuard>
             }
         />
         <Route
            path="/customers"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <Customers />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/media-library"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <MediaLibraryPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/units"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <UnitsPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/pos"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <PosPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/orders"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <OrdersPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/orders/new"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <CreateOrderPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/orders/:id"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <OrderDetailPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/orders/:id/edit"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <EditOrderPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/payments"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <PaymentsPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/payments/new"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <CreatePaymentPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/payments/:id"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <PaymentDetailPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/payments/:id/edit"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <EditPaymentPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/audit"
            element={
                <AuthGuard>
                     <AdminDashboard>
                         <AuditLogsPage />
                     </AdminDashboard>
                 </AuthGuard>
             }
         />
         <Route
            path="/users"
            element={
                <AuthGuard>
                     <AdminDashboard>
                         <UserManagement />
                     </AdminDashboard>
                 </AuthGuard>
             }
         />
         <Route
            path="/roles"
            element={
                <AuthGuard>
                     <AdminDashboard>
                         <RolesPage />
                     </AdminDashboard>
                 </AuthGuard>
             }
         />
         <Route
            path="/permissions"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <PermissionsPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/warehouses/*"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <WarehouseRoutes />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/manufacturing/recipes"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <RecipesPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/manufacturing/orders"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <OrdersPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
        <Route
            path="/manufacturing/orders/:id"
            element={
                <AuthGuard>
                    <AdminDashboard>
                        <OrderDetailPage />
                    </AdminDashboard>
                </AuthGuard>
            }
        />
     </Routes>
    )
}

export default AppRouter;
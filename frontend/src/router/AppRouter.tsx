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
     </Routes>
    )
}
export default AppRouter;
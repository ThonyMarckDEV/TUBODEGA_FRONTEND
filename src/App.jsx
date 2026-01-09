//import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

//Contextos


//Componentes Globales
import { ToastContainer } from 'react-toastify';

// Layout
import SidebarLayout from 'layouts/SidebarLayout';

// UIS AUTH
import ErrorPage404 from 'components/ErrorPage404';
import ErrorPage401 from 'components/ErrorPage401';
import Login from 'ui/auth/Login/Login';

//UI HOME
import Home from 'ui/home/Home';


// UIS ADMIN
import ListarRoles from 'ui/Administrador/roles/listarRoles/ListarRoles';

import AgregarCliente from 'ui/Administrador/clientes/agregarCliente/AgregarCliente';
import ListarClientes from 'ui/Administrador/clientes/listarClientes/ListarClientes';
import EditarCliente from 'ui/Administrador/clientes/editarCliente/EditarCliente';

import AgregarCategoria from 'ui/Administrador/categorias/agregarCategoria/AgregarCategoria';
import ListarCategorias from 'ui/Administrador/categorias/listarCategorias/ListarCategorias';
import Editarategoria from 'ui/Administrador/categorias/editarCategoria/EditarCategoria';

import AgregarProveedor from 'ui/Administrador/proveedores/agregarProveedor/AgregarProveedor';
import ListarProveedores from 'ui/Administrador/proveedores/listarProveedores/ListarProveedores';
import EditarProveedor from 'ui/Administrador/proveedores/editarProveedor/EditarProveedor'; 

import AgregarProducto from 'ui/Administrador/Productos/agregarProducto/AgregarProducto';
import ListarProductos from 'ui/Administrador/Productos/listarProductos/ListarProductos';
import EditarProducto from 'ui/Administrador/Productos/editarProducto/EditarProducto';

import AgregarCompra from 'ui/Administrador/compras/agregarCompra/AgregarCompra';
import ListarCompras from 'ui/Administrador/compras/listarCompras/ListarCompras';
import EditarCompra from 'ui/Administrador/compras/editarCompra/EditarCompra';

import AgregarReposicion from 'ui/Administrador/reposiciones/agregarReposicion/AgregarReposicion';
import ListarReposiciones from 'ui/Administrador/reposiciones/listarReposiciones/ListarReposiciones';
import EditarReposicion from 'ui/Administrador/reposiciones/editarReposicion/EditarReposicion';

import ReporteKardex from 'ui/Administrador/kardex/reporteKardex/ReporteKardex';

// UIS USUARIO


// Utilities
import ProtectedRouteHome from 'utilities/ProtectedRoutes/ProtectedRouteHome';
import ProtectedRouteCajero from 'utilities/ProtectedRoutes/ProtectedRouteCajero';
import ProtectedRouteAdmin from 'utilities/ProtectedRoutes/ProtectedRouteAdmin';


function AppContent() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/"
        element={<ProtectedRouteHome element={<Login />} />}
      />

      {/* RUTAS ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRouteAdmin element={<SidebarLayout />} />
        }
      >
        {/* Ruta Home (cuando solo pones /admin) */}
        <Route index element={<Home />} />

        {/* Ruta Listar Roles */}
        <Route path="listar-roles" element={<ListarRoles />} />

        {/* RUTAS CLIENTE */}
          {/* Ruta Agregar Cliente */}
          <Route path="agregar-cliente" element={<AgregarCliente />} />
          {/* Ruta Listar Cliente */}
          <Route path="listar-clientes" element={<ListarClientes />} />
          {/* Ruta Editar Cliente */}
          <Route path="editar-cliente/:id" element={<EditarCliente />} />

        {/* RUTAS CATEGORIAS */}
          {/* Ruta Agregar Categoria */}
          <Route path="agregar-categoria" element={<AgregarCategoria />} />
          {/* Ruta Listar Categoria */}
          <Route path="listar-categorias" element={<ListarCategorias />} />
          {/* Ruta Editar Categoria */}
          <Route path="editar-categoria/:id" element={<Editarategoria />} />

        {/* RUTAS PROVEEDORES */}
          {/* Ruta Agregar Proveedor */}
          <Route path="agregar-proveedor" element={<AgregarProveedor />} />
          {/* Ruta Listar Proveedor */}
          <Route path="listar-proveedores" element={<ListarProveedores />} />
          {/* Ruta Editar Proveedor */}
          <Route path="editar-proveedor/:id" element={<EditarProveedor />} />

        {/* RUTAS PRODUCTOS */}
          {/* Ruta Agregar Producto */}
          <Route path="agregar-producto" element={<AgregarProducto />} />
          {/* Ruta Listar Producto */}
          <Route path="listar-productos" element={<ListarProductos />} />
          {/* Ruta Editar Producto */}
          <Route path="editar-producto/:id" element={<EditarProducto />} />

        {/* RUTAS COMPRA */}
          {/* Ruta Agregar Compra */}
          <Route path="agregar-compra" element={<AgregarCompra />} />
          {/* Ruta Listar Compra */}
          <Route path="listar-compras" element={<ListarCompras />} />
          {/* Ruta Editar Compra */}
          <Route path="editar-compra/:id" element={<EditarCompra />} />

        {/* RUTAS REPOSICIONES */}
          {/* Ruta Agregar Reposición */}
          <Route path="agregar-reposicion" element={<AgregarReposicion />} />
          {/* Ruta Listar Reposición */}
          <Route path="listar-reposiciones" element={<ListarReposiciones />} />
          {/* Ruta Editar Reposición */}
          <Route path="editar-reposicion/:id" element={<EditarReposicion />} />

         {/* RUTAS KARDEX */}
          {/* Ruta Reporte Kardex */}
          <Route path="reporte-kardex" element={<ReporteKardex />} />


      </Route>



      {/* RUTAS CAJERO */}
      <Route
        path="/cajero"
        element={
          <ProtectedRouteCajero element={<SidebarLayout />} />
        }
      >
        {/* Ruta Home (cuando solo pones /cajero) */}
        <Route index element={<Home />} />

        {/* Aquí agregas más módulos */}

      </Route>





      {/* Ruta de error */}
      <Route path="/*" element={<ErrorPage404 />} />
      <Route path="/401" element={<ErrorPage401 />} />
    </Routes>
  );
}


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <AppContent />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
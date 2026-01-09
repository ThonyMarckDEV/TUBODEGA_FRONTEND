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
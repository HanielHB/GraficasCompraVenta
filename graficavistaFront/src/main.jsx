import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Importamos Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

// Componentes
import Dashboard from './pages/usuario/Dashboard.jsx';
import ListUsuario from './pages/usuario/ListUsuario.jsx';
import FormUsuario from './pages/usuario/FormUsuario.jsx';
import Login from './pages/usuario/Login.jsx';
import ListProducto from './pages/producto/ListProducto.jsx';
import FormProducto from './pages/producto/FormProducto.jsx';
import ListCompra from './pages/compra/ListCompra.jsx';
import FormCompra from './pages/compra/FormCompra.jsx';
import ListVenta from './pages/venta/ListVenta.jsx';
import FormVenta from './pages/venta/FormVenta.jsx';
import VentasGrafico from './pages/venta/VentasGrafico.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/dashboard/usuarios",  
    element: <Dashboard><ListUsuario /></Dashboard>,
  },
  {
    path: "/dashboard/usuarios/form/:id",
    element: <Dashboard><FormUsuario /></Dashboard>,
  },
  {
    path: "dashboard/usuarios/form",
    element: <Dashboard><FormUsuario /></Dashboard>,
  },
  // En tu archivo de rutas principal
{
  path: "/dashboard/productos",
  element: <Dashboard><ListProducto /></Dashboard>
},
{
  path: "/dashboard/productos/form",
  element: <Dashboard><FormProducto /></Dashboard>
},
{
  path: "/dashboard/productos/form/:id",
  element: <Dashboard><FormProducto /></Dashboard>
},
{
  path: "/dashboard/compras",
  element: <Dashboard><ListCompra /></Dashboard>
},
{
  path: "/dashboard/compras/form",
  element: <Dashboard><FormCompra /></Dashboard>
},
{
  path: "/dashboard/compras/form/:id",
  element: <Dashboard><FormCompra /></Dashboard>
},
{
  path: "/dashboard/ventas",
  element: <Dashboard><ListVenta /></Dashboard>
},
{
  path: "/dashboard/ventas/form",
  element: <Dashboard><FormVenta /></Dashboard>
},
{
  path: "/dashboard/ventas/form/:id",
  element: <Dashboard><FormVenta /></Dashboard>
},
{
  path: "/dashboard/ventas/grafico",
  element: <Dashboard><VentasGrafico /></Dashboard>
},
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

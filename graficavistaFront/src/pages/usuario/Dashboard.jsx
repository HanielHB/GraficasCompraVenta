import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListUsuario from "./ListUsuario";
import FormUsuario from "./FormUsuario";
import ListCompra from "../compra/ListCompra"; // Importar ListCompra
import FormCompra from "../compra/FormCompra"; // Importar FormCompra
import ListVenta from "../venta/ListVenta";
import FormVenta from "../venta/FormVenta";
import VentasGrafico from "../venta/VentasGrafico"; // Importar el gráfico de ventas
import ComprasGrafico from "../compra/ComprasGrafico"; 

import "./Dashboard.css"; 
import { FiHome, FiUsers, FiDollarSign, FiLogOut, FiChevronLeft, FiChevronRight,FiPackage,FiShoppingCart   } from "react-icons/fi";
import { Container, Button, Row, Col } from 'react-bootstrap';  

const Dashboard = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isVendedor, setIsVendedor] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showUsuarios, setShowUsuarios] = useState(true);
    const [showProductos, setShowProductos] = useState(false); // Nuevo estado
    const [showForm, setShowForm] = useState(false);

    const [showFormProduct, setShowFormProduct] = useState(false);
    const [usuarioId, setUsuarioId] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [showCompras, setShowCompras] = useState(false);
    const [showFormCompra, setShowFormCompra] = useState(false);
    const [selectedCompraId, setSelectedCompraId] = useState(null);

    const [showVentas, setShowVentas] = useState(false);
    const [showFormVenta, setShowFormVenta] = useState(false);
    const [selectedVentaId, setSelectedVentaId] = useState(null);

    const [showVentasGraf, setShowVentasGraf] = useState(false);  // Estado para ventas
    const [showComprasGraf, setShowComprasGraf] = useState(false); // Nuevo estado para compras gráficas


    const [ventas, setVentas] = useState([]); // Estado para almacenar las ventas
    const [compras, setCompras] = useState([]); // Estado para almacenar las ventas

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        nombre: '',
        apellido: '',
        tipo: ''
    });

    useEffect(() => {
        verificarRol();
        fetchVentas();
        fetchCompras(); // Llamar la función para cargar las compras
        document.title = "Dashboard";
    
        
    }, []); 

    const verificarRol = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
    
        axios.get("http://localhost:3000/usuarios/rol", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(rolRes => {
            axios.get("http://localhost:3000/usuarios/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(userRes => {
                setUserData({
                    nombre: userRes.data.nombre,
                    apellido: userRes.data.apellido,
                    tipo: rolRes.data.tipo
                });
    
                if (rolRes.data.tipo === "admin") {
                    setIsAdmin(true);
                } else if (rolRes.data.tipo === "vendedor" || rolRes.data.tipo === "cliente") {
                    setIsVendedor(true); // También activamos esto para clientes
                    setShowUsuarios(false);
                    setShowVentasGraf(true);
                    navigate('/dashboard/ventas/grafico');
                }
            })
            .catch(() => {
                alert("Error cargando datos del usuario");
                navigate("/");
            });
        })
        .catch(() => {
            localStorage.removeItem("token");
            navigate("/");
        });
    };
    
    const fetchVentas = () => {
        const token = localStorage.getItem("token"); // Asegúrate de obtener el token desde localStorage
        if (!token) {
            alert("Token no disponible. Redirigiendo a login.");
            navigate("/login");
            return;
        }
    
        axios.get("http://localhost:3000/ventas", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
            setVentas(response.data); // Establece las ventas cuando se obtienen
        })
        .catch(error => {
            console.error("Error al cargar las ventas:", error);
        });
    };

    const fetchCompras = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Token no disponible. Redirigiendo a login.");
            navigate("/login");
            return;
        }
    
        setIsLoading(true);
        axios.get("http://localhost:3000/compras", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
            setCompras(response.data);
            setIsLoading(false);
        })
        .catch(error => {
            console.error("Error al cargar las compras:", error);
            setError("Hubo un problema al cargar las compras.");
            setIsLoading(false);
        });
    };
    

    const handleShowUsuarios = () => {
        setShowUsuarios(true);
        setShowComprasGraf(false);
        setShowProductos(false);
        setShowFormProduct(false);
        setShowCompras(false);
        setShowFormCompra(false);
        setShowForm(false);
        setShowProductos(false);
        setShowVentas(false);
        setShowFormVenta(false);
        setShowVentasGraf(false);
        setUsuarioId(null);
        navigate('/dashboard/usuarios');
    };

    const handleShowForm = (id = null) => {
        setShowUsuarios(false);
        setShowComprasGraf(false);
        setShowForm(true);
        setShowProductos(false);
        setShowVentas(false);
        setShowFormVenta(false);
        setShowVentasGraf(false);
        setUsuarioId(id);
        navigate(id ? `/dashboard/usuarios/form/${id}` : '/dashboard/usuarios/form');
    };
    
    const handleShowCompras = () => {
        setShowCompras(true);
        setShowComprasGraf(false);
        setShowUsuarios(false);
        setShowFormCompra(false);
        setShowProductos(false);
        setShowForm(false);
        setShowFormProduct(false);
        setShowVentas(false);
        setShowFormVenta(false);
        setShowVentasGraf(false);
        setSelectedCompraId(null);
        navigate('/dashboard/compras');
    };

    // Handler para mostrar formulario de compras
    const handleShowFormCompra = (id = null) => {
        setShowFormCompra(true);
        setShowComprasGraf(false);
        setShowUsuarios(false);
        setShowCompras(false);
        setShowProductos(false);
        setShowForm(false);
        setShowVentas(false);
        setShowFormVenta(false);
        setShowVentasGraf(false);
        setSelectedCompraId(id);
        navigate(id ? `/dashboard/compras/form/${id}` : '/dashboard/compras/form');
    };

    const handleShowVentas = () => {
        setShowVentas(true);
        setShowComprasGraf(false);
        setShowUsuarios(false);
        setShowProductos(false);
        setShowCompras(false);
        setShowForm(false);
        setShowFormProduct(false);
        setShowFormCompra(false);
        setShowFormVenta(false);
        setShowVentasGraf(false);
        setSelectedVentaId(null);
        navigate('/dashboard/ventas');
    };
    
    const handleShowFormVenta = (id = null) => {
        setShowVentas(false);
        setShowComprasGraf(false);
        setShowFormVenta(true);
        setShowUsuarios(false);
        setShowProductos(false);
        setShowCompras(false);
        setShowForm(false);
        setShowFormProduct(false);
        setShowFormCompra(false);
        setShowVentasGraf(false);
        setSelectedVentaId(id);
        navigate(id ? `/dashboard/ventas/form/${id}` : '/dashboard/ventas/form');
    };

    const handleShowVentasGraf = () => {
        setShowVentasGraf(true);
        setShowComprasGraf(false);
        setShowVentas(false);
        setShowUsuarios(false);
        setShowProductos(false);
        setShowCompras(false);
        setShowForm(false);
        setShowFormProduct(false);
        setShowFormCompra(false);
        setShowFormVenta(false);
        setSelectedVentaId(null);
        navigate('/dashboard/ventas/grafico');
    };

    const handleShowComprasGraf = () => {
        setShowComprasGraf(true);
        setShowVentasGraf(false); // Asegurar que la gráfica de ventas no esté activa
        setShowVentas(false);
        setShowUsuarios(false);
        setShowCompras(false);
        setShowForm(false);
        setShowFormVenta(false);
        setShowFormCompra(false);
        setShowFormProduct(false);
        setSelectedCompraId(null);
        navigate('/dashboard/compras/grafico'); // Asegurar la navegación correcta
    };
    
    
    

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
                <div className="sidebar-header">
                    <Button 
                        className="toggle-btn" 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        variant="link"
                    >
                        {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    </Button>
                    {!sidebarCollapsed && <h3 className="sidebar-title">Admin Panel</h3>}
                </div>

                <div className="sidebar-menu">
                    <div className="user-profile">
                        <div className="avatar">
                            {userData.nombre.charAt(0)}
                            {userData.apellido.charAt(0)}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="user-info">
                                <h6>{`${userData.nombre} ${userData.apellido}`}</h6>
                                <small>{userData.tipo === 'admin' ? 'Administrador' : 'Vendedor'}</small>
                            </div>
                        )}
                    </div>

                    {isAdmin && (
                        <>
                            <Button 
                                variant="link" 
                                className="menu-item"
                                onClick={handleShowUsuarios}
                            >
                                <FiUsers className="menu-icon" />
                                {!sidebarCollapsed && "Usuarios"}
                            </Button>

                            {/* Nuevo botón para Compras */}
                            <Button 
                                variant="link" 
                                className="menu-item"
                                onClick={handleShowCompras}
                            >
                                <FiShoppingCart className="menu-icon" />
                                {!sidebarCollapsed && "Compras"}
                            </Button>
                            <Button 
                                variant="link" 
                                className="menu-item"
                                onClick={handleShowVentas}
                            >
                                <FiDollarSign className="menu-icon" />
                                {!sidebarCollapsed && "Ventas"}
                            </Button>
                            {/* Botón para mostrar gráficos de ventas */}
                            <Button 
                                variant="link" 
                                className="menu-item"
                                onClick={handleShowVentasGraf}
                            >
                                <FiDollarSign className="menu-icon" />
                                {!sidebarCollapsed && "Ventas Graficos"}
                            </Button>

                            <Button 
                                variant="link" 
                                className="menu-item"
                                onClick={handleShowComprasGraf}
                            >
                                <FiShoppingCart className="menu-icon" />
                                {!sidebarCollapsed && "Compras Graficos"}
                            </Button>

                        </> 
                    )}

                    {(isVendedor || userData.tipo === "cliente") && (
                        <>
                            <Button 
                                variant="link" 
                                className="menu-item"
                                onClick={handleShowCompras}
                            >
                                <FiShoppingCart className="menu-icon" />
                                {!sidebarCollapsed && "Compras"}
                            </Button>
                            <Button 
                                variant="link" 
                                className="menu-item"
                                onClick={handleShowVentas}
                            >
                                <FiDollarSign className="menu-icon" />
                                {!sidebarCollapsed && "Ventas"}
                            </Button>
                            {/* Botón para mostrar gráficos de ventas */}
                            <Button 
                                variant="link" 
                                className="menu-item"
                                onClick={handleShowVentasGraf}
                            >
                                <FiDollarSign className="menu-icon" />
                                {!sidebarCollapsed && "Ventas Graficos"}
                            </Button>

                            {/* Botón para mostrar gráficos de compras */}
                            <Button 
                                variant="link" 
                                className="menu-item"
                                onClick={handleShowComprasGraf}
                            >
                                <FiShoppingCart className="menu-icon" />
                                {!sidebarCollapsed && "Compras Gráficos"}
                            </Button>

                        </>
                        
                    )}

                    <div className="logout-section">
                        <Button 
                            variant="link" 
                            className="menu-item" 
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/");
                            }}
                        >
                            <FiLogOut className="menu-icon" />
                            {!sidebarCollapsed && "Cerrar Sesión"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <Container className={`content ${sidebarCollapsed ? "content-collapsed" : "content-expanded"}`}>
                <Row className="justify-content-center">
                    <Col md={sidebarCollapsed ? 11 : 10}>
                        {showUsuarios && (
                            <ListUsuario 
                                handleShowForm={handleShowForm}
                                handleRefresh={handleShowUsuarios}
                            />
                        )}
                        
                        {showForm && (
                            <FormUsuario 
                                id={usuarioId}
                                handleShowUsuarios={handleShowUsuarios}
                            />
                        )}
                        {/* Componente ListCompra */}
                        {showCompras && (
                            <ListCompra 
                                handleShowFormCompra={handleShowFormCompra}
                                handleRefresh={handleShowCompras}
                            />
                        )}

                        {/* Componente FormCompra */}
                        {showFormCompra && (
                            <FormCompra 
                                id={selectedCompraId}
                                handleShowCompras={handleShowCompras}
                            />
                        )}
                       
                        {showVentas && (
                            <ListVenta 
                                handleShowFormVenta={handleShowFormVenta}
                                handleRefresh={handleShowVentas}
                            />
                        )}
                        {/* Componente VentasGrafico */}
                        {showVentasGraf && (
                            <VentasGrafico ventas={ventas} />
                        )}

                        {showFormVenta && (
                            <FormVenta 
                                id={selectedVentaId}
                                handleShowVentas={handleShowVentas}
                            />
                        )}
                        {/* Componente VentasGrafico */}
                        {showComprasGraf && (
                            <ComprasGrafico compras={compras} />
                        )}


                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Dashboard;

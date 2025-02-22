import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Spinner, Modal, Card, ButtonGroup, Stack } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiInfo } from "react-icons/fi";
import { useMediaQuery } from 'react-responsive';

const ListCompra = ({ handleShowFormCompra, handleRefresh }) => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [compras, setCompras] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModalDetalles, setShowModalDetalles] = useState(false);
    const [showModalEliminar, setShowModalEliminar] = useState(false);
    const [compraDetalles, setcompraDetalles] = useState(null);
    const [tipoUsuario, setTipoUsuario] = useState("");

    useEffect(() => {
        getListaCompras();
        obtenerTipoUsuario();
        document.title = "Lista de compras";
    }, []);

    const obtenerTipoUsuario = () => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const user = JSON.parse(userData);
            setTipoUsuario(user.tipo); // Asignamos el tipo de usuario
        }
    };

    const getListaCompras = async () => {
        try {
            const res = await axios.get("http://localhost:3000/compras", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const comprasConProductos = res.data.map(compra => ({
                ...compra,
                productos: JSON.parse(compra.productos) // Convertimos el string JSON en un array de objetos
            }));
            setCompras(comprasConProductos); // Actualizamos el estado con los datos procesados
        } catch (error) {
            alert("Error al cargar las compras");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/compras/${selectedId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            getListaCompras();
            alert("compra eliminada correctamente");
        } catch (error) {
            alert("Error al eliminar la compra");
        } finally {
            setShowModalEliminar(false);
        }
    };

    const editarCompra = (id) => {
        handleShowFormCompra(id);
        navigate(`/dashboard/compras/form/${id}`);
    };

    const crearNuevaCompra = () => {
        handleShowFormCompra();
    };

    const formatFecha = (fechaString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaString).toLocaleDateString('es-ES', options);
    };

    const calcularMontoTotal = (productos) => {
        if (Array.isArray(productos)) {
            return productos.reduce((total, producto) => {
                if (producto.precio && producto.cantidad) {
                    return total + (producto.precio * producto.cantidad);
                }
                return total;
            }, 0).toFixed(2);
        }
        return 0;
    };

    const handleVerDetalles = (compra) => {
        setcompraDetalles(compra);
        setShowModalDetalles(true);
    };

    return (
        <div className="container p-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <h2 className="h5 mb-0">Gestión de Compras</h2>
                {tipoUsuario !== "cliente" && (
                    <Button variant="primary" size="sm" onClick={crearNuevaCompra}>
                        <FiPlus /> {!isMobile && "Nueva Compra"}
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : compras.length === 0 ? (
                <p className="text-center">No se encontraron compras</p>
            ) : isMobile ? (
                // Vista móvil
                <div className="row g-3">
                    {compras.map(compra => {
                        const montoTotal = calcularMontoTotal(compra.productos);
                        return (
                            <div key={compra.id} className="col-12">
                                <Card className="shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="badge bg-primary">#{compra.id}</span>
                                            <small className="text-muted">{formatFecha(compra.fecha)}</small>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <div className="row g-1">
                                                <div className="col-4 text-muted">Total:</div>
                                                <div className="col-8 fw-bold">Bs {montoTotal}</div>
                                            </div>
                                            <div className="row g-1">
                                                <div className="col-4 text-muted">Vendedor:</div>
                                                <div className="col-8 text-truncate">
                                                    {compra.vendedorCompra?.nombre || `Usuario #${compra.usuarioId}`}
                                                </div>
                                            </div>
                                            <div className="row g-1">
                                                <div className="col-4 text-muted">Cliente:</div>
                                                <div className="col-8 text-truncate">
                                                    {compra.clienteCompra?.nombre || `Usuario #${compra.clienteId}`}
                                                </div>
                                            </div>
                                        </div>

                                        <ButtonGroup size="sm" className="w-100">
                                            <Button 
                                                variant="outline-info"
                                                onClick={() => handleVerDetalles(compra)}
                                            >
                                                <FiInfo />
                                            </Button>
                                            {tipoUsuario !== "cliente" && (
                                                <>
                                                    <Button 
                                                        variant="outline-primary"
                                                        onClick={() => editarCompra(compra.id)}
                                                    >
                                                        <FiEdit />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger"
                                                        onClick={() => {
                                                            setSelectedId(compra.id);
                                                            setShowModalEliminar(true);
                                                        }}
                                                    >
                                                        <FiTrash2 />
                                                    </Button>
                                                </>
                                            )}
                                        </ButtonGroup>
                                    </Card.Body>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Vista desktop
                <div style={{ overflowX: "auto" }}>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Total</th>
                                <th>Fecha</th>
                                <th>Vendedor</th>
                                <th>Cliente</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compras.map(compra => {
                                const montoTotal = calcularMontoTotal(compra.productos);
                                return (
                                    <tr key={compra.id}>
                                        <td>{compra.id}</td>
                                        <td>Bs {montoTotal}</td>
                                        <td>{formatFecha(compra.fecha)}</td>
                                        <td className="text-truncate" style={{ maxWidth: '150px' }}>
                                            {compra.vendedorCompra?.nombre || `Usuario #${compra.usuarioId}`}
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: '150px' }}>
                                            {compra.clienteCompra?.nombre || `Usuario #${compra.clienteId}`}
                                        </td>
                                        <td>
                                            <Stack direction="horizontal" gap={2}>
                                                <Button 
                                                    variant="outline-info"
                                                    size="sm" 
                                                    onClick={() => handleVerDetalles(compra)}
                                                >
                                                    <FiInfo /> Detalles
                                                </Button>
                                                {tipoUsuario !== "cliente" && (
                                                    <>
                                                        <Button 
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => editarCompra(compra.id)}
                                                        >
                                                            <FiEdit /> Editar
                                                        </Button>
                                                        <Button 
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedId(compra.id);
                                                                setShowModalEliminar(true);
                                                            }}
                                                        >
                                                            <FiTrash2 />
                                                        </Button>
                                                    </>
                                                )}
                                            </Stack>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Modal para ver detalles de la compra */}
            <Modal show={showModalDetalles} onHide={() => setShowModalDetalles(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Factura de compra</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {compraDetalles ? (
                        <div>
                            <h5><strong>Detalles de la compra</strong></h5>
                            <p><strong>Fecha:</strong> {formatFecha(compraDetalles.fecha)}</p>
                            <p><strong>Vendedor:</strong> {compraDetalles.vendedorCompra?.nombre} {compraDetalles.vendedorCompra?.apellido}</p>
                            <p><strong>Cliente:</strong> {compraDetalles.clienteCompra?.nombre} {compraDetalles.clienteCompra?.apellido}</p>

                            <h6><strong>Productos Vendidos</strong></h6>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unitario</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compraDetalles.productos.map((producto, index) => (
                                        <tr key={index}>
                                            <td>{producto.nombre}</td>
                                            <td>{producto.cantidad}</td>
                                            <td>Bs {producto.precio}</td>
                                            <td>Bs {(producto.cantidad * producto.precio).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <p><strong>Total:</strong> Bs {calcularMontoTotal(compraDetalles.productos)}</p>
                        </div>
                    ) : (
                        <p>Cargando detalles...</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalDetalles(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmación de eliminación */}
            <Modal show={showModalEliminar} onHide={() => setShowModalEliminar(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar compra</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro que deseas eliminar esta compra? Esta acción no se puede deshacer.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalEliminar(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ListCompra;

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Spinner, Modal } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

const ListVenta = ({ handleShowFormVenta, handleRefresh }) => {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModalDetalles, setShowModalDetalles] = useState(false); // Modal para detalles de venta
    const [showModalEliminar, setShowModalEliminar] = useState(false); // Modal para confirmación de eliminación
    const [ventaDetalles, setVentaDetalles] = useState(null); // Para almacenar los detalles de la venta seleccionada

    useEffect(() => {
        getListaVentas();
        document.title = "Lista de Ventas";
    }, []);

    const getListaVentas = async () => {
        try {
            const res = await axios.get("http://localhost:3000/ventas", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const ventasConProductos = res.data.map(venta => ({
                ...venta,
                productos: JSON.parse(venta.productos) // Convertimos el string JSON en un array de objetos
            }));
            setVentas(ventasConProductos); // Actualizamos el estado con los datos procesados
        } catch (error) {
            alert("Error al cargar las ventas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/ventas/${selectedId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            getListaVentas();
            alert("Venta eliminada correctamente");
        } catch (error) {
            alert("Error al eliminar la venta");
        } finally {
            setShowModalEliminar(false);
        }
    };

    const editarVenta = (id) => {
        handleShowFormVenta(id);
        navigate(`/dashboard/ventas/form/${id}`);
    };

    const crearNuevaVenta = () => {
        handleShowFormVenta();
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

    const handleVerDetalles = (venta) => {
        setVentaDetalles(venta);
        setShowModalDetalles(true);
    };

    return (
        <div className="container p-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Gestión de Ventas</h2>
                <Button variant="primary" onClick={crearNuevaVenta}>
                    <FiPlus /> Nueva Venta
                </Button>
            </div>

            {isLoading ? (
                <Spinner animation="border" variant="primary" />
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Monto Total</th>
                            <th>Fecha</th>
                            <th>Vendedor</th>
                            <th>Cliente</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventas.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">No se encontraron ventas</td>
                            </tr>
                        ) : (
                            ventas.map(venta => {
                                const montoTotal = calcularMontoTotal(venta.productos);
                                return (
                                    <tr key={venta.id}>
                                        <td>{venta.id}</td>
                                        <td>Bs {montoTotal}</td>
                                        <td>{formatFecha(venta.fecha)}</td>
                                        <td>{venta.vendedorVenta?.nombre || `Usuario #${venta.usuarioId}`}</td>
                                        <td>{venta.clienteVenta?.nombre || `Usuario #${venta.clienteId}`}</td>
                                        <td className="d-flex justify-content-center align-items-center">
                                            <Button 
                                                variant="info" 
                                                onClick={() => editarVenta(venta.id)} 
                                                className="me-2"
                                            >
                                                <FiEdit /> Editar
                                            </Button>
                                            <Button 
                                                variant="secondary"
                                                onClick={() => handleVerDetalles(venta)}
                                                className="me-2"
                                            >
                                                Ver detalles
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                onClick={() => {
                                                    setSelectedId(venta.id);
                                                    setShowModalEliminar(true);
                                                }}
                                            >
                                                <FiTrash2 /> Eliminar
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            )}

            {/* Modal para ver detalles de la venta */}
            <Modal show={showModalDetalles} onHide={() => setShowModalDetalles(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Factura de Venta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {ventaDetalles ? (
                        <div>
                            <h5><strong>Detalles de la Venta</strong></h5>
                            <p><strong>Fecha:</strong> {formatFecha(ventaDetalles.fecha)}</p>
                            <p><strong>Vendedor:</strong> {ventaDetalles.vendedorVenta?.nombre} {ventaDetalles.vendedorVenta?.apellido}</p>
                            <p><strong>Cliente:</strong> {ventaDetalles.clienteVenta?.nombre} {ventaDetalles.clienteVenta?.apellido}</p>

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
                                    {ventaDetalles.productos.map((producto, index) => (
                                        <tr key={index}>
                                            <td>{producto.nombre}</td>
                                            <td>{producto.cantidad}</td>
                                            <td>Bs {producto.precio}</td>
                                            <td>Bs {(producto.cantidad * producto.precio).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <p><strong>Total:</strong> Bs {calcularMontoTotal(ventaDetalles.productos)}</p>
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
                    <Modal.Title>Eliminar Venta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro que deseas eliminar esta venta? Esta acción no se puede deshacer.
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

export default ListVenta;

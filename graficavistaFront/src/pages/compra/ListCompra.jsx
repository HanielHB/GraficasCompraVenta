import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Spinner, Modal } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

const ListCompra = ({ handleShowFormCompra, handleRefresh }) => {
    const navigate = useNavigate();
    const [compras, setCompras] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModalDetalles, setShowModalDetalles] = useState(false); // Modal para detalles de compra
    const [showModalEliminar, setShowModalEliminar] = useState(false); // Modal para confirmación de eliminación
    const [compraDetalles, setcompraDetalles] = useState(null); // Para almacenar los detalles de la compra seleccionada

    useEffect(() => {
        getListaCompras();
        document.title = "Lista de compras";
    }, []);

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
        <div className="container p-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Gestión de compras</h2>
                <Button variant="primary" onClick={crearNuevaCompra}>
                    <FiPlus /> Nueva compra
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
                        {compras.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">No se encontraron compras</td>
                            </tr>
                        ) : (
                            compras.map(compra => {
                                const montoTotal = calcularMontoTotal(compra.productos);
                                return (
                                    <tr key={compra.id}>
                                        <td>{compra.id}</td>
                                        <td>Bs {montoTotal}</td>
                                        <td>{formatFecha(compra.fecha)}</td>
                                        <td>{compra.vendedorCompra?.nombre || `Usuario #${compra.usuarioId}`}</td>
                                        <td>{compra.clienteCompra?.nombre || `Usuario #${compra.clienteId}`}</td>
                                        <td className="d-flex justify-content-center align-items-center">
                                            <Button 
                                                variant="info" 
                                                onClick={() => editarCompra(compra.id)} 
                                                className="me-2"
                                            >
                                                <FiEdit /> Editar
                                            </Button>
                                            <Button 
                                                variant="secondary"
                                                onClick={() => handleVerDetalles(compra)}
                                                className="me-2"
                                            >
                                                Ver detalles
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                onClick={() => {
                                                    setSelectedId(compra.id);
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

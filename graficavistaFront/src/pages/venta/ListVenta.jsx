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
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        getListaVentas();
        document.title = "Lista de Ventas";
    }, []);

    const getListaVentas = async () => {
        try {
            const res = await axios.get("http://localhost:3000/ventas", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setVentas(res.data);
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
            setShowModal(false);
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
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Monto Total</th>
                            <th>Fecha</th>
                            <th>Vendedor</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventas.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">No se encontraron ventas</td>
                            </tr>
                        ) : (
                            ventas.map(venta => (
                                <tr key={venta.id}>
                                    <td>{venta.id}</td>
                                    <td>{venta.productoName}</td>
                                    <td>{venta.cantidad}</td>
                                    <td>Bs {Number(venta.precio || 0).toFixed(2)}</td>
                                    <td>Bs {(venta.cantidad * Number(venta.precio || 0)).toFixed(2)}</td>
                                    <td>{formatFecha(venta.fecha)}</td>
                                    <td>{venta.vendedorVenta?.nombre || `Usuario #${venta.usuarioId}`}</td>
                                    <td className="d-flex justify-content-center align-items-center">
                                        <Button 
                                            variant="info" 
                                            onClick={() => editarVenta(venta.id)} 
                                            className="me-2"
                                        >
                                            <FiEdit /> Editar
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => {
                                                setSelectedId(venta.id);
                                                setShowModal(true);
                                            }}
                                        >
                                            <FiTrash2 /> Eliminar
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar Venta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro que deseas eliminar esta venta? Esta acción no se puede deshacer.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
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
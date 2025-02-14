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
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        getListaCompras();
        document.title = "Lista de Compras";
    }, []);

    const getListaCompras = async () => {
        try {
            const res = await axios.get("http://localhost:3000/compras", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setCompras(res.data);
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
            alert("Compra eliminada correctamente");
        } catch (error) {
            alert("Error al eliminar la compra");
        } finally {
            setShowModal(false);
        }
    };

    const editarCompra = (id) => {
        handleShowFormCompra(id);
        navigate(`/dashboard/compras/form/${id}`);
    };

    const crearNuevaCompra = () => {
        handleShowFormCompra();
    };

    // Función para formatear la fecha
    const formatFecha = (fechaString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaString).toLocaleDateString('es-ES', options);
    };

    return (
        <div className="container p-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Gestión de Compras</h2>
                <Button variant="primary" onClick={crearNuevaCompra}>
                    <FiPlus /> Nueva Compra
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
                        <th>Usuario</th>
                        <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {compras.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">No se encontraron compras</td>
                            </tr>
                        ) : (
                            compras.map(compra => (
                                <tr key={compra.id}>
                                    <td>{compra.id}</td>
                                    <td>{compra.productoName}</td>
                                    <td>{compra.cantidad}</td>
                                    <td>Bs {Number(compra.precio || 0).toFixed(2)}</td>
                                    <td>Bs {(compra.cantidad * Number(compra.precio || 0)).toFixed(2)}</td>
                                    <td>{formatFecha(compra.fecha)}</td>
                                    <td>{compra.vendedorCompra?.nombre || `Usuario #${compra.usuarioId}`}</td>
                                    <td className="d-flex justify-content-center align-items-center">
                                        <Button 
                                            variant="info" 
                                            onClick={() => editarCompra(compra.id)} 
                                            className="me-2"
                                        >
                                            <FiEdit /> Editar
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => {
                                                setSelectedId(compra.id);
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
                    <Modal.Title>Eliminar Compra</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro que deseas eliminar esta compra? Esta acción no se puede deshacer.
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

export default ListCompra;
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Spinner, Modal } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
//import './ListProducto.css'; // Crea este archivo para estilos específicos

const ListProducto = ({ handleShowFormProduct, handleRefresh }) => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        getListaProductos();
        document.title = "Lista de Productos";
    }, []);

    const getListaProductos = async () => {
        try {
            const res = await axios.get("http://localhost:3000/productos", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setProductos(res.data);
        } catch (error) {
            alert("Error al cargar los productos");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/productos/${selectedId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            getListaProductos();
            alert("Producto eliminado correctamente");
        } catch (error) {
            alert("Error al eliminar el producto");
        } finally {
            setShowModal(false);
        }
    };

    const editarProducto = (id) => {
        handleShowFormProduct(id);
        navigate(`/dashboard/productos/form/${id}`);
    };

    const crearNuevoProducto = () => {
        handleShowFormProduct(); // Solo llama a la prop
    };

    return (
        <div className="container p-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Gestión de Productos</h2>
                <Button variant="primary" onClick={crearNuevoProducto}>
                    <FiPlus /> Nuevo Producto
                </Button>
            </div>

            {isLoading ? (
                <Spinner animation="border" variant="primary" />
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No se encontraron productos</td>
                            </tr>
                        ) : (
                            productos.map(producto => (
                                <tr key={producto.id}>
                                    <td>{producto.id}</td>
                                    <td>{producto.nombre}</td>
                                    <td>Bs {Number(producto.precio).toFixed(2)}</td>
                                    <td className="d-flex justify-content-center align-items-center">
                                        <Button 
                                            variant="info" 
                                            onClick={() => editarProducto(producto.id)} 
                                            className="me-2"
                                        >
                                            <FiEdit /> Editar
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => {
                                                setSelectedId(producto.id);
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
                    <Modal.Title>Eliminar Producto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer.
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

export default ListProducto;
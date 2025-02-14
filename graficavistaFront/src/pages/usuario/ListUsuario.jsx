import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Badge, Spinner, Modal } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import './ListUsuario.css';

const ListUsuario = ({ handleShowForm }) => {  // Recibimos la función handleShowForm como prop
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        getListaUsuarios();
        document.title = "Lista de Usuarios";
    }, []);

    const getListaUsuarios = async () => {
        try {
            const res = await axios.get("http://localhost:3000/usuarios", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setUsuarios(res.data);
        } catch (error) {
            alert("Error al cargar los usuarios");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/usuarios/${selectedId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            getListaUsuarios();
            alert("Usuario eliminado correctamente");
        } catch (error) {
            alert("Error al eliminar el usuario");
        } finally {
            setShowModal(false);
        }
    };

    const editarUsuario = (id) => {
        handleShowForm(id);
        navigate(`/dashboard/usuarios/form/${id}`);
    };

    const crearNuevoUsuario = () => {
        handleShowForm();
    };

    return (
        <div className="container p-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Gestión de Usuarios</h2>
                <Button variant="primary" onClick={crearNuevoUsuario}>
                    <FiPlus /> Nuevo Usuario
                </Button>
            </div>

            {isLoading ? (
                <Spinner animation="border" variant="primary" />
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Tipo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No se encontraron usuarios</td>
                            </tr>
                        ) : (
                            usuarios.map(usuario => (
                                <tr key={usuario.id}>
                                    <td>{usuario.id}</td>
                                    <td>{usuario.email}</td>
                                    <td>
                                        <Badge bg={
                                            usuario.tipo === "admin" ? "primary" :
                                            usuario.tipo === "vendedor" ? "success" :
                                            usuario.tipo === "cliente" ? "warning" : "secondary"
                                        }>
                                            {usuario.tipo?.toUpperCase() || 'SIN TIPO'}
                                        </Badge>
                                    </td>
                                    <td className="d-flex justify-content-center align-items-center">
                                        <Button 
                                            variant="info" 
                                            onClick={() => editarUsuario(usuario.id)} 
                                            className="me-2"
                                        >
                                            <FiEdit /> Editar
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => {
                                                setSelectedId(usuario.id);
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
                    <Modal.Title>Eliminar Usuario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.
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

export default ListUsuario;
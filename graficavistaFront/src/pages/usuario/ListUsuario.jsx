import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Badge, Spinner, Modal, Card, ButtonGroup, Stack } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { useMediaQuery } from 'react-responsive';
import './ListUsuario.css';

const ListUsuario = ({ handleShowForm }) => {  // Recibimos la función handleShowForm como prop
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ maxWidth: 768 });
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

    const getBadgeColor = (tipo) => {
        return tipo === "admin" ? "primary" :
            tipo === "vendedor" ? "success" :
            tipo === "cliente" ? "warning" : "secondary";
    };

    return (
        <div className="container p-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <h2 className="h5 mb-0">Gestión de Usuarios</h2>
                <Button variant="primary" size="sm" onClick={crearNuevoUsuario}>
                    <FiPlus /> {!isMobile && "Nuevo Usuario"}
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : usuarios.length === 0 ? (
                <p className="text-center">No se encontraron usuarios</p>
            ) : isMobile ? (
                // Vista móvil
                <div className="row g-3">
                    {usuarios.map(usuario => (
                        <div key={usuario.id} className="col-12">
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold">#{usuario.id}</span>
                                        <Badge bg={getBadgeColor(usuario.tipo)}>
                                            {usuario.tipo?.toUpperCase() || 'SIN TIPO'}
                                        </Badge>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <div className="text-truncate">
                                            <small className="text-muted">Email:</small><br/>
                                            {usuario.email}
                                        </div>
                                    </div>

                                    <ButtonGroup size="sm" className="w-100">
                                        <Button 
                                            variant="outline-primary"
                                            onClick={() => editarUsuario(usuario.id)}
                                        >
                                            <FiEdit />
                                        </Button>
                                        <Button 
                                            variant="outline-danger"
                                            onClick={() => {
                                                setSelectedId(usuario.id);
                                                setShowModal(true);
                                            }}
                                        >
                                            <FiTrash2 />
                                        </Button>
                                    </ButtonGroup>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </div>
            ) : (
                // Vista desktop
                <div style={{ overflowX: "auto" }}>
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
                            {usuarios.map(usuario => (
                                <tr key={usuario.id}>
                                    <td>{usuario.id}</td>
                                    <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                        {usuario.email}
                                    </td>
                                    <td>
                                        <Badge bg={getBadgeColor(usuario.tipo)}>
                                            {usuario.tipo?.toUpperCase() || 'SIN TIPO'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Stack direction="horizontal" gap={2}>
                                            <Button 
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => editarUsuario(usuario.id)}
                                            >
                                                <FiEdit /> Editar
                                            </Button>
                                            <Button 
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedId(usuario.id);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <FiTrash2 /> Eliminar
                                            </Button>
                                        </Stack>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
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
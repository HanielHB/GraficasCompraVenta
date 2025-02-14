import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { 
    Button,
    Container,
    Row,
    Col,
    Card,
    Form,
    Modal
} from 'react-bootstrap';

const FormProducto = ({ handleShowProductos }) => { 
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [validated, setValidated] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (id) {
            getProductoById();
        }
    }, [id]);

    useEffect(() => {
        const validateForm = () => {
            const isValid = Boolean(
                nombre.trim() &&
                precio > 0
            );
            setFormValid(isValid);
        };
        
        validateForm();
    }, [nombre, precio]);

    const getProductoById = () => {
        axios.get(`http://localhost:3000/productos/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => {
            const producto = res.data;
            setNombre(producto.nombre);
            setPrecio(producto.precio);
        })
        .catch(error => {
            console.error("Error al obtener el producto:", error);
        });
    };

    const onGuardarClick = (e) => {
        const form = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();

        setValidated(true);

        if (!formValid || form.checkValidity() === false) {
            return;
        }

        if (id) {
            editarProducto();
        } else {
            crearProducto();
        }
    };

    const editarProducto = () => {
        const producto = { 
            nombre, 
            precio: parseFloat(precio)
        };
        
        axios.put(`http://localhost:3000/productos/${id}`, producto, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => {
            setShowSuccessModal(true);
        })
        .catch(error => {
            console.error("Error al editar el producto:", error.response?.data);
        });
    };

    const crearProducto = () => {
        const producto = { 
            nombre, 
            precio: parseFloat(precio)
        };
        
        axios.post(`http://localhost:3000/productos`, producto, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => {
            setShowSuccessModal(true);
        })
        .catch(error => {
            console.error("Error al crear el producto:", error.response?.data);
        });
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        handleShowProductos();
    };

    return (
        <Container>
            <Row className="mt-5 justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <h2>
                                    {id ? "Editar Producto" : "Crear Producto"}
                                </h2>
                            </Card.Title>
                            <Form noValidate validated={validated} onSubmit={onGuardarClick}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre:</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        isInvalid={validated && !nombre}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Ingrese el nombre del producto
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Precio:</Form.Label>
                                    <Form.Control
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={precio}
                                        onChange={(e) => setPrecio(e.target.value)}
                                        isInvalid={validated && (!precio || precio <= 0)}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Ingrese un precio válido (mayor a 0)
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="primary" 
                                        type="submit"
                                        disabled={!formValid}
                                    >
                                        Guardar
                                    </Button>
                                    
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => handleShowProductos()}
                                    >
                                        Volver a la lista
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal de éxito */}
            <Modal show={showSuccessModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>✅ Operación exitosa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {id 
                        ? "¡Producto actualizado exitosamente!"
                        : "¡Producto creado exitosamente!"}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseModal}>
                        Aceptar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default FormProducto;
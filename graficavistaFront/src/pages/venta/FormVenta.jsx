import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    Button,
    Container,
    Row,
    Col,
    Card,
    Form,
    Modal
} from 'react-bootstrap';

const FormVenta = ({ handleShowVentas }) => { 
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [cantidad, setCantidad] = useState('');
    const [fecha, setFecha] = useState('');
    const [productoName, setProductoName] = useState('');
    const [precio, setPrecio] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState('');
    const [validated, setValidated] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        // Obtener usuario logueado
        axios.get("http://localhost:3000/usuarios/me", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => setCurrentUser(res.data))
        .catch(error => console.error("Error al obtener usuario:", error));

        // Obtener lista de clientes
        axios.get("http://localhost:3000/usuarios?tipo=cliente", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => setClientes(res.data))
        .catch(error => console.error("Error al obtener clientes:", error));

        if (id) {
            getVentaById();
        }
    }, [id]);

    useEffect(() => {
        const validateForm = () => {
            const isValid = Boolean(
                cantidad > 0 &&
                fecha &&
                productoName.trim() &&
                precio > 0 &&
                currentUser?.id &&
                clienteId
            );
            setFormValid(isValid);
        };
        
        validateForm();
    }, [cantidad, fecha, productoName, precio, currentUser, clienteId]);

    const getVentaById = () => {
        axios.get(`http://localhost:3000/ventas/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => {
            const venta = res.data;
            setCantidad(venta.cantidad);
            setFecha(new Date(venta.fecha).toISOString().split('T')[0]);
            setProductoName(venta.productoName);
            setPrecio(venta.precio);
            setClienteId(venta.clienteId);
        })
        .catch(error => {
            console.error("Error al obtener la venta:", error);
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

        const ventaData = {
            cantidad: parseInt(cantidad),
            fecha: new Date(fecha).toISOString(),
            productoName: productoName,
            precio: parseFloat(precio),
            usuarioId: currentUser.id,
            clienteId: clienteId
        };

        if (id) {
            editarVenta(ventaData);
        } else {
            crearVenta(ventaData);
        }
    };

    const editarVenta = (ventaData) => {
        axios.put(`http://localhost:3000/ventas/${id}`, ventaData, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => setShowSuccessModal(true))
        .catch(error => {
            console.error("Error al editar la venta:", error.response?.data);
        });
    };

    const crearVenta = (ventaData) => {
        axios.post(`http://localhost:3000/ventas`, ventaData, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => setShowSuccessModal(true))
        .catch(error => {
            console.error("Error al crear la venta:", error.response?.data);
        });
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        handleShowVentas();
    };

    return (
        <Container>
            <Row className="mt-5 justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <h2>{id ? "Editar Venta" : "Crear Venta"}</h2>
                            </Card.Title>
                            <Form noValidate validated={validated} onSubmit={onGuardarClick}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cantidad:</Form.Label>
                                    <Form.Control
                                        required
                                        type="number"
                                        min="1"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(e.target.value)}
                                        isInvalid={validated && !cantidad}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Ingrese una cantidad válida
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Precio Unitario:</Form.Label>
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

                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha:</Form.Label>
                                    <Form.Control
                                        required
                                        type="date"
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                        isInvalid={validated && !fecha}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Seleccione una fecha
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Producto:</Form.Label>
                                    <Form.Control
                                        required
                                        value={productoName}
                                        onChange={(e) => setProductoName(e.target.value)}
                                        isInvalid={validated && !productoName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Ingrese un producto
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Cliente:</Form.Label>
                                    <Form.Select
                                        value={clienteId}
                                        onChange={(e) => setClienteId(e.target.value)}
                                        required
                                        isInvalid={validated && !clienteId}
                                    >
                                        <option value="">Seleccione un cliente</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>
                                                {cliente.nombre} {cliente.apellido}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        Seleccione un cliente
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Vendedor:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentUser ? 
                                            `${currentUser.nombre} ${currentUser.apellido}` 
                                            : "Cargando usuario..."
                                        }
                                        readOnly
                                    />
                                    <small className="text-muted">
                                        (Usuario actual - no editable)
                                    </small>
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
                                        onClick={handleShowVentas}
                                    >
                                        Volver a la lista
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showSuccessModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>✅ Operación exitosa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {id 
                        ? "¡Venta actualizada exitosamente!"
                        : "¡Venta creada exitosamente!"}
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

export default FormVenta;
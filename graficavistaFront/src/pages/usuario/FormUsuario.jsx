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

const FormUsuario = ({ handleShowUsuarios }) => { 
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const isPasswordMode = location.pathname.includes("password"); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tipo, setTipo] = useState('vendedor');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [fechaIngreso, setFechaIngreso] = useState('');
    const [validated, setValidated] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (id) {
            getUsuarioById();
        }
    }, [id]);

    useEffect(() => {
        const validateForm = () => {
            let isValid = true;
            
            if (!isPasswordMode) {
                isValid = Boolean(
                    email.trim() &&
                    tipo &&
                    nombre.trim() &&
                    apellido.trim() &&
                    fechaIngreso &&
                    (id ? true : password.trim())
                );
            } else {
                isValid = Boolean(password.trim());
            }
            
            setFormValid(isValid);
        };
        
        validateForm();
    }, [email, tipo, nombre, apellido, fechaIngreso, password, isPasswordMode, id]);

    const getUsuarioById = () => {
        axios.get(`http://localhost:3000/usuarios/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => {
            const usuario = res.data;
            setEmail(usuario.email);
            setTipo(usuario.tipo);
            setNombre(usuario.nombre);
            setApellido(usuario.apellido);
            
            // Formatear la fecha a YYYY-MM-DD
            const fecha = new Date(usuario.fecha_ingreso);
            const fechaFormateada = fecha.toISOString().split('T')[0];
            setFechaIngreso(fechaFormateada);
        })
        .catch(error => {
            console.error("Error al obtener el usuario:", error);
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

        if (isPasswordMode) {
            actualizarPassword();
        } else if (id) {
            editarUsuario();
        } else {
            crearUsuario();
        }
    };

    const editarUsuario = () => {
        const usuario = { 
            email, 
            password: password || undefined,
            tipo, 
            nombre, 
            apellido, 
            fecha_ingreso: fechaIngreso 
        };
        
        axios.put(`http://localhost:3000/usuarios/${id}`, usuario, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => {
            setShowSuccessModal(true);
        })
        .catch(error => {
            console.error("Error al editar el usuario:", error.response?.data);
        });
    };

    const actualizarPassword = () => {
        axios.put(`http://localhost:3000/usuarios/${id}`, { password }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => {
            setShowSuccessModal(true);
        })
        .catch(error => {
            console.error("Error al actualizar la contraseña:", error.response?.data);
        });
    };

    const crearUsuario = () => {
        const usuario = { 
            email, 
            password, 
            tipo, 
            nombre, 
            apellido, 
            fecha_ingreso: fechaIngreso 
        };
        
        axios.post(`http://localhost:3000/usuarios`, usuario, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => {
            setShowSuccessModal(true);
        })
        .catch(error => {
            console.error("Error al crear el usuario:", error.response?.data);
        });
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        handleShowUsuarios();
    };

    return (
        <Container>
            <Row className="mt-5 justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                <h2>
                                    {isPasswordMode ? "Cambiar Contraseña" : id ? "Editar Usuario" : "Crear Usuario"}
                                </h2>
                            </Card.Title>
                            <Form noValidate validated={validated} onSubmit={onGuardarClick}>
                                {!isPasswordMode && (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email:</Form.Label>
                                            <Form.Control
                                                required
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isPasswordMode}
                                                isInvalid={validated && !email}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Por favor ingrese un email válido
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Tipo de usuario:</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={tipo}
                                                onChange={(e) => setTipo(e.target.value)}
                                                required
                                                isInvalid={validated && !tipo}
                                            >
                                                <option value="admin">Administrador</option>
                                                <option value="vendedor">Vendedor</option>
                                                <option value="cliente">Cliente</option>
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                Seleccione un tipo de usuario
                                            </Form.Control.Feedback>
                                        </Form.Group>

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
                                                Ingrese el nombre del usuario
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Apellido:</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                value={apellido}
                                                onChange={(e) => setApellido(e.target.value)}
                                                isInvalid={validated && !apellido}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Ingrese el apellido del usuario
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Fecha de ingreso:</Form.Label>
                                            <Form.Control
                                                required
                                                type="date"
                                                value={fechaIngreso}
                                                onChange={(e) => setFechaIngreso(e.target.value)}
                                                isInvalid={validated && !fechaIngreso}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Seleccione una fecha de ingreso
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        {isPasswordMode ? "Nueva contraseña" : "Contraseña"}
                                    </Form.Label>
                                    <Form.Control
                                        required={isPasswordMode || !id}
                                        type="password"
                                        placeholder={id && !isPasswordMode ? "Dejar en blanco para no cambiar" : ""}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        isInvalid={validated && ((isPasswordMode || !id) && !password)}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {isPasswordMode ? "La contraseña es obligatoria" : "Ingrese una contraseña para el nuevo usuario"}
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
                                        onClick={() => handleShowUsuarios()}
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
                    {isPasswordMode 
                        ? "¡Contraseña actualizada correctamente!" 
                        : id 
                            ? "¡Usuario actualizado exitosamente!"
                            : "¡Usuario creado exitosamente!"}
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

export default FormUsuario;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Button, Form , Row , Col , Card , Alert} from 'react-bootstrap';  


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("http://localhost:3000/usuarios/login", {
                email,
                password,
            });

            // Guardar el token en localStorage
            localStorage.setItem("token", response.data.token);

            // Redirigir al dashboard
            navigate("/dashboard");
        } catch (error) {
            setError(error.response?.data?.msg || "Error al iniciar sesión. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <Row>
                <Col>
                    <Card className="shadow-sm p-4" style={{ width: "450px", borderRadius: "10px" }}>
                        <Card.Body>
                            <h2 className="text-center mb-4 text-dark">Iniciar sesión</h2>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleLogin}>
                                {/* Campo de correo electrónico */}
                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Control
                                        type="email"
                                        placeholder="Correo electrónico"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="py-2 px-3"
                                        style={{
                                            backgroundColor: "#F8F9FA",
                                            borderRadius: "6px",
                                            border: "1px solid #CED4DA",
                                        }}
                                    />
                                </Form.Group>

                                {/* Campo de contraseña */}
                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Control
                                        type="password"
                                        placeholder="Contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="py-2 px-3"
                                        style={{
                                            backgroundColor: "#F8F9FA",
                                            borderRadius: "6px",
                                            border: "1px solid #CED4DA",
                                        }}
                                    />
                                </Form.Group>

                                {/* Botón de inicio de sesión */}
                                <Button
                                    type="submit"
                                    className="w-100 py-2"
                                    style={{
                                        backgroundColor: "#6C89F5",
                                        border: "none",
                                        borderRadius: "6px",
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? "Iniciando..." : "Iniciar sesión"}
                                </Button>
                            </Form>

                            {/* Link de recuperación de contraseña */}
                            <div className="text-center mt-3">
                                <a href="#" className="text-decoration-none text-secondary">
                                    ¿Olvidó su contraseña?
                                </a>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;

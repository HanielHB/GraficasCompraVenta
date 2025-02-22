import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Spinner, Modal, Form, Card, ButtonGroup, Stack } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiImage, FiInfo } from "react-icons/fi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useMediaQuery } from 'react-responsive';

const ListVenta = ({ handleShowFormVenta, handleRefresh }) => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [ventas, setVentas] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModalDetalles, setShowModalDetalles] = useState(false);
    const [showModalEliminar, setShowModalEliminar] = useState(false);
    const [ventaDetalles, setVentaDetalles] = useState(null);
    const [tipoUsuario, setTipoUsuario] = useState("");

    const [showModalUpload, setShowModalUpload] = useState(false);
    const [selectedVentaId, setSelectedVentaId] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        getListaVentas();
        obtenerTipoUsuario();
        document.title = "Lista de Ventas";
    }, []);

    const obtenerTipoUsuario = () => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const user = JSON.parse(userData);
            setTipoUsuario(user.tipo);
        }
    };

    const getListaVentas = async () => {
        try {
            const res = await axios.get("http://localhost:3000/ventas", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const ventasConProductos = res.data.map(venta => ({
                ...venta,
                productos: JSON.parse(venta.productos)
            }));
            setVentas(ventasConProductos);
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
            setShowModalEliminar(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUploadImage = async () => {
        if (!file) {
            alert("Por favor, selecciona una imagen para subir.");
            return;
        }

        const formData = new FormData();
        formData.append("archivo", file);

        try {
            await axios.post(`http://localhost:3000/ventas/upload/${selectedVentaId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            alert("Imagen subida correctamente");
            getListaVentas();
            setShowModalUpload(false);
        } catch (error) {
            alert("Error al subir la imagen");
        }
    };

    const handleShowUploadModal = (ventaId) => {
        setSelectedVentaId(ventaId);
        setShowModalUpload(true);
    };

    const editarVenta = (id) => {
        handleShowFormVenta(id);
        navigate(`/dashboard/ventas/form/${id}`);
    };

    const crearNuevaVenta = () => {
        handleShowFormVenta();
    };

    const formatFecha = (fechaString) => {
        const options = isMobile 
            ? { day: '2-digit', month: '2-digit', year: 'numeric' } 
            : { year: 'numeric', month: 'long', day: 'numeric' };
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

    const handleVerDetalles = (venta) => {
        setVentaDetalles(venta);
        setShowModalDetalles(true);
    };

    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.text("Lista de Ventas", 14, 10);

        const columnas = [
            "ID", "Fecha", "Vendedor", "Cliente", "Producto", "Cantidad", "Precio Unitario", "Subtotal"
        ];

        const filas = [];

        ventas.forEach((venta) => {
            venta.productos.forEach((producto) => {
                filas.push([
                    venta.id,
                    formatFecha(venta.fecha),
                    `${venta.vendedorVenta?.nombre || `Usuario #${venta.usuarioId}`}`,
                    `${venta.clienteVenta?.nombre || `Usuario #${venta.clienteId}`}`,
                    producto.nombre,
                    producto.cantidad,
                    `Bs ${producto.precio}`,
                    `Bs ${(producto.cantidad * producto.precio).toFixed(2)}`
                ]);
            });
        });

        autoTable(doc, {
            head: [columnas],
            body: filas,
            startY: 20,
            theme: "striped",
            styles: { fontSize: 8 },
        });

        doc.save("Lista_Ventas.pdf");
    };

    return (
        <div className="container p-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <h2 className="h5 mb-0">Gestión de Ventas</h2>
                {tipoUsuario !== "cliente" && (
                    <div className="d-flex gap-2">
                        <Button variant="primary" size="sm" onClick={crearNuevaVenta}>
                            <FiPlus /> {!isMobile && "Nueva Venta"}
                        </Button>
                        <Button variant="success" size="sm" onClick={exportarPDF}>
                            📄 {!isMobile && "Exportar PDF"}
                        </Button>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : ventas.length === 0 ? (
                <p className="text-center">No se encontraron ventas</p>
            ) : isMobile ? (
                // Vista móvil
                <div className="row g-3">
                    {ventas.map(venta => {
                        const montoTotal = calcularMontoTotal(venta.productos);
                        return (
                            <div key={venta.id} className="col-12">
                                <Card className="shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="badge bg-primary">#{venta.id}</span>
                                            <small className="text-muted">{formatFecha(venta.fecha)}</small>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <div className="row g-1">
                                                <div className="col-4 text-muted">Total:</div>
                                                <div className="col-8 fw-bold">Bs {montoTotal}</div>
                                            </div>
                                            <div className="row g-1">
                                                <div className="col-4 text-muted">Vendedor:</div>
                                                <div className="col-8 text-truncate">
                                                    {venta.vendedorVenta?.nombre || `Usuario #${venta.usuarioId}`}
                                                </div>
                                            </div>
                                            <div className="row g-1">
                                                <div className="col-4 text-muted">Cliente:</div>
                                                <div className="col-8 text-truncate">
                                                    {venta.clienteVenta?.nombre || `Usuario #${venta.clienteId}`}
                                                </div>
                                            </div>
                                        </div>

                                        <ButtonGroup size="sm" className="w-100">
                                            <Button 
                                                variant="outline-info"
                                                onClick={() => handleVerDetalles(venta)}
                                            >
                                                <FiInfo />
                                            </Button>
                                            {tipoUsuario !== "cliente" && (
                                                <>
                                                    <Button 
                                                        variant="outline-primary"
                                                        onClick={() => editarVenta(venta.id)}
                                                    >
                                                        <FiEdit />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger"
                                                        onClick={() => {
                                                            setSelectedId(venta.id);
                                                            setShowModalEliminar(true);
                                                        }}
                                                    >
                                                        <FiTrash2 />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-secondary"
                                                        onClick={() => handleShowUploadModal(venta.id)}
                                                    >
                                                        <FiImage />
                                                    </Button>
                                                </>
                                            )}
                                        </ButtonGroup>
                                    </Card.Body>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Vista desktop
                <div style={{ overflowX: "auto" }}>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Total</th>
                                <th>Fecha</th>
                                <th>Vendedor</th>
                                <th>Cliente</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventas.map(venta => {
                                const montoTotal = calcularMontoTotal(venta.productos);
                                return (
                                    <tr key={venta.id}>
                                        <td>{venta.id}</td>
                                        <td>Bs {montoTotal}</td>
                                        <td>{formatFecha(venta.fecha)}</td>
                                        <td className="text-truncate" style={{ maxWidth: '150px' }}>
                                            {venta.vendedorVenta?.nombre || `Usuario #${venta.usuarioId}`}
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: '150px' }}>
                                            {venta.clienteVenta?.nombre || `Usuario #${venta.clienteId}`}
                                        </td>
                                        <td>
                                            <Stack direction="horizontal" gap={2}>
                                                <Button 
                                                    variant="outline-info"
                                                    size="sm" 
                                                    onClick={() => handleVerDetalles(venta)}
                                                >
                                                    <FiInfo /> Detalles
                                                </Button>
                                                {tipoUsuario !== "cliente" && (
                                                    <>
                                                        <Button 
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => editarVenta(venta.id)}
                                                        >
                                                            <FiEdit /> Editar
                                                        </Button>
                                                        <Button 
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedId(venta.id);
                                                                setShowModalEliminar(true);
                                                            }}
                                                        >
                                                            <FiTrash2 />
                                                        </Button>
                                                        <Button 
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => handleShowUploadModal(venta.id)}
                                                        >
                                                            <FiImage /> Imagen
                                                        </Button>
                                                    </>
                                                )}
                                            </Stack>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Modal para subir imagen */}
            <Modal show={showModalUpload} onHide={() => setShowModalUpload(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Subir Imagen para Venta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Seleccionar Imagen</Form.Label>
                            <Form.Control 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalUpload(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleUploadImage}>
                        Subir Imagen
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModalDetalles} onHide={() => setShowModalDetalles(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Factura de Venta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {ventaDetalles ? (
                        <div>
                            <h5><strong>Detalles de la Venta</strong></h5>
                            <p><strong>Fecha:</strong> {formatFecha(ventaDetalles.fecha)}</p>
                            <p><strong>Vendedor:</strong> {ventaDetalles.vendedorVenta?.nombre} {ventaDetalles.vendedorVenta?.apellido}</p>
                            <p><strong>Cliente:</strong> {ventaDetalles.clienteVenta?.nombre} {ventaDetalles.clienteVenta?.apellido}</p>

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
                                    {ventaDetalles.productos.map((producto, index) => (
                                        <tr key={index}>
                                            <td>{producto.nombre}</td>
                                            <td>{producto.cantidad}</td>
                                            <td>Bs {producto.precio}</td>
                                            <td>Bs {(producto.cantidad * producto.precio).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <p><strong>Total:</strong> Bs {calcularMontoTotal(ventaDetalles.productos)}</p>

                           
                            <img 
                                src={`http://localhost:3000${ventaDetalles.imagen}`} 
                                alt="Imagen de la venta" 
                                style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} 
                            />
                                
                            
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

            <Modal show={showModalEliminar} onHide={() => setShowModalEliminar(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar Venta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro que deseas eliminar esta venta? Esta acción no se puede deshacer.
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

export default ListVenta;
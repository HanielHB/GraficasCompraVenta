import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Spinner, Modal, Form } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ListVenta = ({ handleShowFormVenta, handleRefresh }) => {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModalDetalles, setShowModalDetalles] = useState(false); 
    const [showModalEliminar, setShowModalEliminar] = useState(false); 
    const [ventaDetalles, setVentaDetalles] = useState(null); 
    const [tipoUsuario, setTipoUsuario] = useState(""); 

    const [showModalUpload, setShowModalUpload] = useState(false); // Modal para subir imagen
    const [selectedVentaId, setSelectedVentaId] = useState(null); // Para saber qué venta fue seleccionada
    const [file, setFile] = useState(null); // Para almacenar el archivo seleccionado

    useEffect(() => {
        getListaVentas();
        obtenerTipoUsuario();
        document.title = "Lista de Ventas";
    }, []);

    const obtenerTipoUsuario = () => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const user = JSON.parse(userData);
            setTipoUsuario(user.tipo); // Asignamos el tipo de usuario
        }
    };

    const getListaVentas = async () => {
        try {
            const res = await axios.get("http://localhost:3000/ventas", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const ventasConProductos = res.data.map(venta => ({
                ...venta,
                productos: JSON.parse(venta.productos) // Convertimos el string JSON en un array de objetos
            }));
            setVentas(ventasConProductos); // Actualizamos el estado con los datos procesados
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
        formData.append("archivo", file);  // Cambiar 'imagen' por 'archivo'
    
        try {
            await axios.post(`http://localhost:3000/ventas/upload/${selectedVentaId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            alert("Imagen subida correctamente");
            getListaVentas();  // Recargar la lista de ventas para mostrar la imagen subida
            setShowModalUpload(false); // Cerrar el modal
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
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
    
        // Definir las columnas de la tabla
        const columnas = [
            "ID", "Fecha", "Vendedor", "Cliente", "Producto", "Cantidad", "Precio Unitario", "Subtotal"
        ];
    
        // Extraer datos de ventas en un formato adecuado
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
    
        // Generar la tabla
        autoTable(doc, {
            head: [columnas],
            body: filas,
            startY: 20,
            theme: "striped",
            styles: { fontSize: 8 },
        });
    
        // Guardar el PDF
        doc.save("Lista_Ventas.pdf");
    };

    return (
        <div className="container p-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Gestión de Ventas</h2>
                {tipoUsuario !== "cliente" && (
                    <>
                        <Button variant="primary" onClick={crearNuevaVenta}>
                        <FiPlus /> Nueva Venta
                        </Button>
                        <Button variant="success" onClick={exportarPDF}>
                        📄 Exportar PDF
                        </Button>
                    </>
                    
                )}
            </div>

            {isLoading ? (
                <Spinner animation="border" variant="primary" />
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Monto Total</th>
                            <th>Fecha</th>
                            <th>Vendedor</th>
                            <th>Cliente</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventas.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">No se encontraron ventas</td>
                            </tr>
                        ) : (
                            ventas.map(venta => {
                                const montoTotal = calcularMontoTotal(venta.productos);
                                return (
                                    <tr key={venta.id}>
                                        <td>{venta.id}</td>
                                        <td>Bs {montoTotal}</td>
                                        <td>{formatFecha(venta.fecha)}</td>
                                        <td>{venta.vendedorVenta?.nombre || `Usuario #${venta.usuarioId}`}</td>
                                        <td>{venta.clienteVenta?.nombre || `Usuario #${venta.clienteId}`}</td>
                                        <td className="d-flex justify-content-center align-items-center">
                                            {tipoUsuario !== "cliente" && (
                                                <>
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
                                                            setShowModalEliminar(true);
                                                        }}
                                                    >
                                                        <FiTrash2 /> Eliminar
                                                    </Button>

                                                    <Button 
                                                        variant="secondary" 
                                                        onClick={() => handleShowUploadModal(venta.id)} 
                                                        className="me-2"
                                                    >
                                                        Subir Imagen
                                                    </Button>
                                                </>
                                            )}
                                            
                                            <Button 
                                                variant="secondary"
                                                onClick={() => handleVerDetalles(venta)}
                                                className="me-2"
                                            >
                                                Ver detalles
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
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

            {/* Modal para ver detalles de la venta */}
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

            {/* Modal de confirmación de eliminación */}
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

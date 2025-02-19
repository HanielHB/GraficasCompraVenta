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
    Modal,
    Table
} from 'react-bootstrap';

const FormVenta = ({ handleShowVentas }) => { 
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [productos, setProductos] = useState([]);
    const [productoName, setProductoName] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [fecha, setFecha] = useState('');
    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState('');
    const [validated, setValidated] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [precio, setPrecio] = useState('');

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [error, setError] = useState(null);
    const [loadingClientes, setLoadingClientes] = useState(true);
    
    useEffect(() => {
        // Cargar clientes
        axios.get("http://localhost:3000/usuarios?tipo=cliente", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(res => {
            setClientes(res.data);
            setLoadingClientes(false);
            if (res.data.length === 0) {
                setError("No hay clientes registrados en el sistema");
            }
        })
        .catch(error => {
            console.error("Error al obtener clientes:", error);
            setError("Error al cargar la lista de clientes");
            setLoadingClientes(false);
        });
        
       if (id) {
    axios.get(`http://localhost:3000/ventas/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then(res => {
        // Extraer solo la parte de la fecha (YYYY-MM-DD)
        const fechaFormateada = res.data.fecha.split("T")[0]; // Si viene en formato ISO
        // Si viene en otro formato, usa: res.data.fecha.substring(0, 10);

        setFecha(fechaFormateada);
        setClienteId(res.data.clienteId);
        
        const productosParseados = typeof res.data.productos === "string" 
            ? JSON.parse(res.data.productos) 
            : res.data.productos;

        const productosConNombreCorrecto = productosParseados.map(p => ({
            productoName: p.nombre,
            cantidad: p.cantidad,
            precio: p.precio
        }));

        setProductosSeleccionados(productosConNombreCorrecto);
    }).catch(error => {
        console.error("Error al obtener la venta:", error);
    });
}

        
    }, [id]);
    
    const agregarProducto = () => {
        if (!productoName || !cantidad || !precio) return;
    
        setProductosSeleccionados([...productosSeleccionados, { 
            productoName: productoName,
            cantidad: parseInt(cantidad),
            precio: parseFloat(precio)
        }]);
    
        setProductoName('');
        setCantidad('');
        setPrecio('');
    };
    
    const eliminarProducto = (index) => {
        const nuevosProductos = productosSeleccionados.filter((_, i) => i !== index);
        setProductosSeleccionados(nuevosProductos);
    };
    
    const onGuardarClick = (e) => {
        e.preventDefault();
    
        const usuarioId = localStorage.getItem("usuarioId");
    
        if (!usuarioId) {
            console.error("Error: usuarioId no está definido en localStorage");
            setError("Hubo un problema con la sesión, intenta iniciar sesión de nuevo.");
            return;
        }
    
        if (!productosSeleccionados.length) {
            setError("Debe agregar al menos un producto.");
            return;
        }
    
        if (!clienteId) {
            setError("Debe seleccionar un cliente.");
            return;
        }
    
        const ventaData = {
            usuarioId,
            fecha,
            clienteId,
            productos: JSON.stringify(productosSeleccionados.map(producto => ({
                nombre: producto.productoName,
                cantidad: producto.cantidad,
                precio: producto.precio
            })))
        };
        
    
        console.log("Datos enviados:", JSON.stringify(ventaData, null, 2));
    
        // Si estamos editando, hacemos PUT en lugar de POST
        const request = id 
            ? axios.put(`http://localhost:3000/ventas/${id}`, ventaData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            : axios.post("http://localhost:3000/ventas", ventaData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

        request
            .then(() => setShowSuccessModal(true))
            .catch(error => {
                console.error("Error al guardar la venta:", error);
                setError("Error al guardar la venta");
            });
    };
    
    // Calcular el total de todos los productos
    const calcularTotal = () => {
        return productosSeleccionados.reduce((total, producto) => total + (producto.cantidad * producto.precio), 0).toFixed(2);
    };

    return (
        <Container>
           <Row className="mt-5 justify-content-center">
               <Col md={8}>
                   <Card>
                       <Card.Body>
                           <h2>{id ? "Editar Venta" : "Crear Venta"}</h2>
                           <Form onSubmit={onGuardarClick}>
                               <Form.Group className="mb-3">
                                   <Form.Label>Fecha:</Form.Label>
                                   <Form.Control type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                               </Form.Group>

                               <Form.Group className="mb-3">
                                   <Form.Label>Cliente:</Form.Label>
                                   {loadingClientes ? (
                                       <Form.Control
                                           as="div"
                                           className="text-muted"
                                       >
                                           Cargando lista de clientes...
                                       </Form.Control>
                                   ) : (
                                       <Form.Select
                                           value={clienteId}
                                           onChange={(e) => setClienteId(e.target.value)}
                                           required
                                           isInvalid={validated && !clienteId}
                                           disabled={clientes.length === 0}
                                       >
                                           <option value="">Seleccione un cliente</option>
                                           {clientes.map(cliente => (
                                               <option key={cliente.id} value={cliente.id}>
                                                   {cliente.nombre} {cliente.apellido}
                                               </option>
                                           ))}
                                       </Form.Select>
                                   )}
                                   <Form.Control.Feedback type="invalid">
                                       Seleccione un cliente
                                   </Form.Control.Feedback>
                               </Form.Group>

                               {/* Eliminar los 'required' de estos campos */}
                               <Form.Group className="mb-3">
                                   <Form.Label>Producto:</Form.Label>
                                   <Form.Control
                                       value={productoName}
                                       onChange={(e) => setProductoName(e.target.value)}
                                   />
                               </Form.Group>
                               <Form.Group className="mb-3">
                                   <Form.Label>Precio Unitario:</Form.Label>
                                   <Form.Control type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} />
                               </Form.Group>

                               <Form.Group className="mb-3">
                                   <Form.Label>Cantidad:</Form.Label>
                                   <Form.Control type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                               </Form.Group>

                               <Button variant="primary" onClick={agregarProducto} className="mb-3">Agregar Producto</Button>

                               <Table striped bordered>
                                   <thead>
                                       <tr>
                                           <th>Producto</th>
                                           <th>Cantidad</th>
                                           <th>Precio Unitario</th>
                                           <th>Sub Total</th>
                                           <th>Acciones</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {productosSeleccionados.map((p, index) => (
                                           <tr key={index}>
                                               <td>{p.productoName}</td>
                                               <td>{p.cantidad}</td>
                                               <td>Bs {p.precio.toFixed(2)}</td>
                                               <td>Bs {(p.cantidad * p.precio).toFixed(2)}</td>
                                               <td>
                                                   <Button variant="danger" onClick={() => eliminarProducto(index)}>
                                                       Eliminar
                                                   </Button>
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </Table>

                               {/* Mostrar el total de todos los productos */}
                               <h4 className="text-end">Total: Bs {calcularTotal()}</h4>

                               <Button 
                                   variant="success" 
                                   type="submit" 
                                   disabled={!productosSeleccionados.length || !clienteId}
                               >
                                   Guardar Venta
                               </Button>
                           </Form>
                       </Card.Body>
                   </Card>
               </Col>
           </Row>

           <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
               <Modal.Header closeButton>
                   <Modal.Title>Venta Guardada</Modal.Title>
               </Modal.Header>
               <Modal.Body>¡Venta registrada con éxito!</Modal.Body>
               <Modal.Footer>
                   <Button variant="primary" onClick={() => handleShowVentas()}>Aceptar</Button>
               </Modal.Footer>
           </Modal>
       </Container>
   );
};
export default FormVenta;

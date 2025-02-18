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
                setFecha(res.data.fecha);
                setClienteId(res.data.clienteId);
                setProductosSeleccionados(res.data.productos);
            });
        }
    }, [id]);
    
    const agregarProducto = () => {
        // Evitar agregar si los campos están vacíos
        if (!productoName || !cantidad || !precio) return;
    
        setProductosSeleccionados([...productosSeleccionados, { 
            nombre: productoName,
            cantidad: parseInt(cantidad),
            precio: parseFloat(precio)
        }]);
    
        setProductoName('');
        setCantidad('');
        setPrecio('');
    };
    
    
    const onGuardarClick = (e) => {
        e.preventDefault();
    
        // Validar si los productos están seleccionados y si el cliente está seleccionado
        if (!productosSeleccionados.length) {
            setError("Debe agregar al menos un producto.");
            return;
        }
    
        if (!clienteId) {
            setError("Debe seleccionar un cliente.");
            return;
        }
    
        const ventaData = {
            fecha,
            clienteId,
            productos: productosSeleccionados.map(producto => ({
                nombre: producto.nombre,
                cantidad: producto.cantidad,
                precio: producto.precio
            }))
        };
        
    
        if (id) {
            // Actualizar venta existente
            axios.put(`http://localhost:3000/ventas/${id}`, ventaData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }).then(() => setShowSuccessModal(true))
              .catch(error => setError("Error al guardar la venta"));
        } else {
            // Crear nueva venta
            axios.post("http://localhost:3000/ventas", ventaData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            
            .then(() => setShowSuccessModal(true))
            
            .catch(error => {
                console.error("Error al guardar la venta:", error);
                setError("Error al guardar la venta");
            });
            
        }
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
                                       <>
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
                                           {clientes.length === 0 && (
                                               <Form.Text className="text-danger">
                                                   No hay clientes disponibles
                                               </Form.Text>
                                           )}
                                       </>
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
                                           <th>Total</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {productosSeleccionados.map((p, index) => (
                                           <tr key={index}>
                                               <td>{p.nombre}</td>
                                               <td>{p.cantidad}</td>
                                               <td>Bs {p.precio.toFixed(2)}</td>
                                               <td>Bs {(p.cantidad * p.precio).toFixed(2)}</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </Table>

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
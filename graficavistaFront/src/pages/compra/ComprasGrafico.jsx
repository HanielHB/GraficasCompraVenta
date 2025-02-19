import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

const ComprasGrafico = ({ compras }) => {
    const [timeRange, setTimeRange] = useState('semana');
    const [selectedVendedorId, setselectedVendedorId] = useState('todos');
    const [selectedProducto, setSelectedProducto] = useState('todos');
    const [vendedores, setvendedores] = useState([]);
    const [productos, setProductos] = useState([]);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    // Obtener lista de vendedores y productos únicos
    useEffect(() => {
        if (compras) {
            const uniquevendedores = compras.reduce((acc, compra) => {
                const comprador = compra.vendedorCompra;
                if (comprador && !acc.find(v => v.id === comprador.id)) {
                    acc.push({
                        id: comprador.id,
                        nombre: `${comprador.nombre} ${comprador.apellido}`
                    });
                }
                return acc;
            }, []);
            
            const uniqueProductos = compras.reduce((acc, compra) => {
                let productos = [];
                try {
                    productos = JSON.parse(compra.productos);  // Asegúrate de que 'productos' está en el formato correcto
                } catch (error) {
                    console.error("Error al parsear productos:", error);
                    return acc;
                }
                productos.forEach(producto => {
                    if (producto.nombre && !acc.includes(producto.nombre)) {
                        acc.push(producto.nombre);
                    }
                });
                return acc;
            }, []);

            setvendedores(uniquevendedores);
            setProductos(uniqueProductos);
        }
    }, [compras]);

    const agruparComprasPorFecha = (comprasFiltradas, rango) => {
        const comprasAgrupadas = {};
    
        comprasFiltradas.forEach(compra => {
            let productos = [];
            try {
                productos = JSON.parse(compra.productos);  // Asegúrate de que 'productos' está en el formato correcto
            } catch (error) {
                console.error("Error al parsear productos:", error);
                return;
            }

            productos.forEach(producto => {
                if (selectedProducto !== 'todos' && producto.nombre !== selectedProducto) {
                    return; // Si el producto no coincide con el seleccionado, lo ignoramos
                }
    
                const fecha = new Date(compra.fecha);
                let key;
    
                // Agrupamos las ventas según el rango de tiempo seleccionado
                switch (rango) {
                    case 'dia':
                        key = format(fecha, 'yyyy-MM-dd');
                        break;
                    case 'semana':
                        key = `${format(startOfWeek(fecha), 'yyyy-MM-dd')} a ${format(endOfWeek(fecha), 'yyyy-MM-dd')}`;
                        break;
                    case 'mes':
                        key = format(fecha, 'MMMM yyyy');
                        break;
                    case 'año':
                        key = format(fecha, 'yyyy');
                        break;
                    default:
                        key = format(fecha, 'yyyy-MM-dd');
                }
    
                const monto = parseFloat(producto.precio) * producto.cantidad;
    
                // Sumar el monto por fecha
                comprasAgrupadas[key] = (comprasAgrupadas[key] || 0) + monto;
            });
        });
        console.log(comprasAgrupadas);  // Verifica si hay datos agrupados.

        return comprasAgrupadas;
    };
    

    const getChartLabel = (compradorId, producto, rango) => {
        const comprador = vendedores.find(v => v.id === parseInt(compradorId));
        const tipoRango = rango.charAt(0).toUpperCase() + rango.slice(1);
        
        let labelParts = [];
        if (compradorId !== 'todos') labelParts.push(`Comprador: ${comprador?.nombre}`);
        if (producto !== 'todos') labelParts.push(`Producto: ${producto}`);
        
        return `${labelParts.join(' - ')} - Compras por ${tipoRango}`;
    };

    const getFilterDescription = (compradorId, producto) => {
        const descripciones = [];
        if (compradorId !== 'todos') {
            const comprador = vendedores.find(v => v.id === parseInt(compradorId));
            descripciones.push(`comprador: ${comprador?.nombre}`);
        }
        if (producto !== 'todos') {
            descripciones.push(`Producto: ${producto}`);
        }
        return descripciones.join(' - ') || 'Todas las compras';
    };

    useEffect(() => {
        if (compras && compras.length > 0) {
            const comprasFiltradas = compras.filter(compra => {
                const filtroVendedor = selectedVendedorId === 'todos' || compra.vendedorCompra.id === parseInt(selectedVendedorId);
                
                // Filtrar por producto seleccionado, verificando si el producto está dentro de la venta
                const filtroProducto = selectedProducto === 'todos' || 
                    JSON.parse(compra.productos).some(producto => producto.nombre === selectedProducto);

                return filtroVendedor && filtroProducto;
            });
    
            const comprasAgrupadas = agruparComprasPorFecha(comprasFiltradas, timeRange);
    
            const labels = Object.keys(comprasAgrupadas);
            const data = Object.values(comprasAgrupadas);
    
            setChartData({
                labels,
                datasets: [
                    {
                        label: getChartLabel(selectedVendedorId, selectedProducto, timeRange),
                        data,
                        borderColor: '#4bc0c0',
                        backgroundColor: '#4bc0c040',
                        tension: 0.4,
                        fill: true
                    }
                ]
            });
        }
    }, [compras, timeRange, selectedVendedorId, selectedProducto]);

    const options = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Fecha'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Monto (Bs)'
                },
                beginAtZero: true
            }
        }
    };

    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h3 className="mb-0">Análisis de Compras</h3>
                <div className="d-flex gap-2 flex-wrap">
                    <select 
                        className="form-select"
                        value={selectedVendedorId}
                        onChange={(e) => setselectedVendedorId(e.target.value)}
                    >
                        <option value="todos">Todos los vendedores</option>
                        {vendedores.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.nombre} ({compras.filter(compra => compra.vendedorCompra.id === v.id).length} compras)
                            </option>
                        ))}
                    </select>
                    
                    <select 
                        className="form-select"
                        value={selectedProducto}
                        onChange={(e) => setSelectedProducto(e.target.value)}
                    >
                        <option value="todos">Todos los productos</option>
                        {productos.map(producto => (
                            <option key={producto} value={producto}>
                                {producto} ({compras.filter(compra => JSON.parse(compra.productos).some(p => p.nombre === producto)).length} compras)
                            </option>
                        ))}
                    </select>

                    
                    <select 
                        className="form-select"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="dia">Diario</option>
                        <option value="semana">Semanal</option>
                        <option value="mes">Mensual</option>
                        <option value="año">Anual</option>
                    </select>
                </div>
            </div>
            
            <Line data={chartData} options={options} />
            
            <div className="mt-3 text-muted small">
                <span className="me-3">
                    <span className="color-indicator bg-primary"></span> 
                    {getFilterDescription(selectedVendedorId, selectedProducto)}
                </span>
                <span>Última actualización: {new Date().toLocaleTimeString()}</span>
            </div>
        </div>
    );
};

export default ComprasGrafico;

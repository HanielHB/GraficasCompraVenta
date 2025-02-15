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

const VentasGrafico = ({ ventas }) => {
    const [timeRange, setTimeRange] = useState('semana');
    const [selectedVendedorId, setSelectedVendedorId] = useState('todos');
    const [selectedProducto, setSelectedProducto] = useState('todos');
    const [vendedores, setVendedores] = useState([]);
    const [productos, setProductos] = useState([]);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    // Obtener lista de vendedores y productos únicos
    useEffect(() => {
        if (ventas) {
            const uniqueVendedores = ventas.reduce((acc, venta) => {
                const vendedor = venta.vendedorVenta;
                if (vendedor && !acc.find(v => v.id === vendedor.id)) {
                    acc.push({
                        id: vendedor.id,
                        nombre: `${vendedor.nombre} ${vendedor.apellido}`
                    });
                }
                return acc;
            }, []);
            
            const uniqueProductos = ventas.reduce((acc, venta) => {
                const producto = venta.productoName;
                if (producto && !acc.includes(producto)) {
                    acc.push(producto);
                }
                return acc;
            }, []);

            setVendedores(uniqueVendedores);
            setProductos(uniqueProductos);
        }
    }, [ventas]);

    const agruparVentasPorFecha = (ventasFiltradas, rango) => {
        const ventasAgrupadas = {};
        
        ventasFiltradas.forEach(venta => {
            const fecha = new Date(venta.fecha);
            let key;
            
            switch(rango) {
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
            
            const monto = parseFloat(venta.precio) * venta.cantidad;
            
            ventasAgrupadas[key] = (ventasAgrupadas[key] || 0) + monto;
        });

        return ventasAgrupadas;
    };

    const getChartLabel = (vendedorId, producto, rango) => {
        const vendedor = vendedores.find(v => v.id === parseInt(vendedorId));
        const tipoRango = rango.charAt(0).toUpperCase() + rango.slice(1);
        
        let labelParts = [];
        if (vendedorId !== 'todos') labelParts.push(`Vendedor: ${vendedor?.nombre}`);
        if (producto !== 'todos') labelParts.push(`Producto: ${producto}`);
        
        return `${labelParts.join(' - ')} - Ventas por ${tipoRango}`;
    };

    const getFilterDescription = (vendedorId, producto) => {
        const descripciones = [];
        if (vendedorId !== 'todos') {
            const vendedor = vendedores.find(v => v.id === parseInt(vendedorId));
            descripciones.push(`Vendedor: ${vendedor?.nombre}`);
        }
        if (producto !== 'todos') {
            descripciones.push(`Producto: ${producto}`);
        }
        return descripciones.join(' - ') || 'Todas las ventas';
    };

    useEffect(() => {
        if (ventas && ventas.length > 0) {
            const ventasFiltradas = ventas.filter(venta => {
                const filtroVendedor = selectedVendedorId === 'todos' || 
                    venta.vendedorVenta.id === parseInt(selectedVendedorId);
                
                const filtroProducto = selectedProducto === 'todos' || 
                    venta.productoName === selectedProducto;
                
                return filtroVendedor && filtroProducto;
            });

            const ventasAgrupadas = agruparVentasPorFecha(ventasFiltradas, timeRange);
            
            const labels = Object.keys(ventasAgrupadas);
            const data = Object.values(ventasAgrupadas);

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
    }, [ventas, timeRange, selectedVendedorId, selectedProducto]);

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
                <h3 className="mb-0">Análisis de Ventas</h3>
                <div className="d-flex gap-2 flex-wrap">
                    <select 
                        className="form-select"
                        value={selectedVendedorId}
                        onChange={(e) => setSelectedVendedorId(e.target.value)}
                    >
                        <option value="todos">Todos los vendedores</option>
                        {vendedores.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.nombre} ({ventas.filter(venta => venta.vendedorVenta.id === v.id).length} ventas)
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
                                {producto} ({ventas.filter(venta => venta.productoName === producto).length} ventas)
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

export default VentasGrafico;
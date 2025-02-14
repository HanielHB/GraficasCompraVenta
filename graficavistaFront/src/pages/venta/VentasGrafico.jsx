import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const VentasGrafico = ({ ventas }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: 'Ventas por Vendedor',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
        }]
    });

    useEffect(() => {
        if (ventas && ventas.length > 0) {
            // Agrupar las ventas por vendedor
            const ventasPorVendedor = ventas.reduce((acc, venta) => {
                const vendedor = venta.vendedorVenta.nombre; // Nombre del vendedor
                const montoVenta = parseFloat(venta.precio) * venta.cantidad; // Precio * cantidad

                if (!acc[vendedor]) {
                    acc[vendedor] = 0;
                }
                acc[vendedor] += montoVenta; // Sumar el monto de la venta al vendedor correspondiente
                return acc;
            }, {});

            // Generar las etiquetas (vendedores) y los datos para el gráfico
            const vendedores = Object.keys(ventasPorVendedor);
            const data = vendedores.map(vendedor => ventasPorVendedor[vendedor]);

            // Configuración del gráfico
            setChartData({
                labels: vendedores, // Los nombres de los vendedores en el eje X
                datasets: [
                    {
                        label: 'Ventas por Vendedor',
                        data: data, // Las sumas de las ventas de cada vendedor
                        borderColor: 'rgba(75, 192, 192, 1)', // Color de la línea
                        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color de fondo de la línea
                        fill: true,
                    }
                ]
            });
        }
    }, [ventas]); // Solo se vuelve a ejecutar cuando 'ventas' cambia

    return (
        <div>
            <h3>Gráfico de Ventas por Vendedor</h3>
            <Line data={chartData} />
        </div>
    );
};

export default VentasGrafico;

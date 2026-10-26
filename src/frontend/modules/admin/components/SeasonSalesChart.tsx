'use client';

import React, { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from 'chart.js';
import { WeeklySalesPoint } from '@/types/admin-dashboard.types';

// Registrar los módulos necesarios de Chart.js
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

interface SeasonSalesChartProps {
  dataPoints?: WeeklySalesPoint[];
  weeklySales?: WeeklySalesPoint[];
}

export function SeasonSalesChart({ dataPoints, weeklySales }: SeasonSalesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectivePoints = weeklySales || dataPoints;

  const defaultPoints: WeeklySalesPoint[] = [
    { weekLabel: 'Oct S1', amountMillionsCOP: 4.2 },
    { weekLabel: 'Oct S2', amountMillionsCOP: 6.8 },
    { weekLabel: 'Oct S3', amountMillionsCOP: 11.5 },
    { weekLabel: 'Oct S4', amountMillionsCOP: 18.2 },
    { weekLabel: 'Nov S1', amountMillionsCOP: 24.5 },
    { weekLabel: 'Nov S2', amountMillionsCOP: 29.8 },
    { weekLabel: 'Nov S3 (Black)', amountMillionsCOP: 48.6 },
    { weekLabel: 'Nov S4', amountMillionsCOP: 52.4 },
    { weekLabel: 'Dic S1', amountMillionsCOP: 45.1 },
    { weekLabel: 'Dic S2 (Pico)', amountMillionsCOP: 62.4 },
    { weekLabel: 'Dic S3', amountMillionsCOP: 38.2 },
    { weekLabel: 'Dic S4', amountMillionsCOP: 19.5 },
  ];

  const points = effectivePoints && effectivePoints.length > 0 ? effectivePoints : defaultPoints;
  const labels = points.map((p) => p.weekLabel);
  const values = points.map((p) => p.amountMillionsCOP);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crear degradado verde esmeralda
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.45)');
    gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.12)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Ventas de Temporada (Millones COP)',
            backgroundColor: gradient,
            pointBackgroundColor: '#22c55e',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
            pointRadius: 4,
            pointHoverRadius: 7,
            borderWidth: 2.5,
            borderColor: '#22c55e',
            fill: true,
            tension: 0.38,
            data: values,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          easing: 'easeInOutQuad',
          duration: 700,
        },
        scales: {
          y: {
            ticks: {
              color: '#8ca398',
              font: { family: 'Plus Jakarta Sans', size: 11 },
              callback: function (val) {
                return '$' + val + 'M';
              },
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            border: { display: false },
          },
          x: {
            ticks: {
              color: '#8ca398',
              font: { family: 'Plus Jakarta Sans', size: 10.5 },
              maxRotation: 45,
            },
            grid: {
              display: false,
            },
            border: { display: false },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleFont: { family: 'Plus Jakarta Sans', size: 12 },
            bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
            backgroundColor: '#081a13',
            borderColor: '#22c55e',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function (context) {
                return 'Facturado: $' + context.parsed.y + ' Millones COP';
              },
            },
          },
        },
      },
    });

    // Cleanup obligatorio en React 19 para evitar canvas duplicates y memory leaks
    return () => {
      chartInstance.destroy();
    };
  }, [labels, values]);

  // Mini KPIs dinámicos calculados a partir de los puntos reales de venta
  const maxPoint = points.reduce(
    (max, curr) => (curr.amountMillionsCOP > max.amountMillionsCOP ? curr : max),
    points[0] || { weekLabel: 'Oct S3', amountMillionsCOP: 0 }
  );

  const recordWeekLabel =
    maxPoint.amountMillionsCOP > 0
      ? `${maxPoint.weekLabel} ($${maxPoint.amountMillionsCOP}M)`
      : 'Oct S3 ($2.6M)';

  const totalCurveMillions = points.reduce((acc, curr) => acc + curr.amountMillionsCOP, 0);
  const averageTicketFormatted =
    totalCurveMillions > 0
      ? `$${Math.round((totalCurveMillions * 1000000) / 9).toLocaleString('es-CO')} COP`
      : '$466.000 COP';

  const projectionFormatted =
    totalCurveMillions > 0
      ? `$${(totalCurveMillions * 3.5).toFixed(1)}M COP`
      : '$25.0M COP';

  return (
    <div className="rounded-2xl bg-[#081a13] border border-white/5 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] p-5 flex flex-col justify-between h-full">
      {/* HEADER DE LA GRÁFICA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="font-['Cinzel'] text-sm sm:text-base font-bold text-white tracking-wide">
            Curva de Ventas de Árboles de Navidad 2026
          </h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Evolución por semanas de hiperestacionalidad (Picos Octubre - Diciembre)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#22c55e]/10 text-[#4ade80] px-2.5 py-1 rounded-md border border-[#22c55e]/30 font-semibold">
            Venta Pico Activa
          </span>
        </div>
      </div>

      {/* CANVAS DE CHART.JS */}
      <div className="w-full h-56 sm:h-64 relative my-1">
        <canvas ref={canvasRef} />
      </div>

      {/* MINI KPIS INFERIORES */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 mt-2 border-t border-white/5 text-center text-xs">
        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
          <p className="text-[#94a3b8] text-[11px] m-0">Semana Récord</p>
          <p className="text-white font-bold text-xs sm:text-sm mt-0.5">{recordWeekLabel}</p>
        </div>
        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
          <p className="text-[#94a3b8] text-[11px] m-0">Ticket Promedio Árbol</p>
          <p className="text-[#22c55e] font-bold text-xs sm:text-sm mt-0.5">{averageTicketFormatted}</p>
        </div>
        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
          <p className="text-[#94a3b8] text-[11px] m-0">Proyección Cierre Dic</p>
          <p className="text-[#eab308] font-bold text-xs sm:text-sm mt-0.5">{projectionFormatted}</p>
        </div>
      </div>
    </div>
  );
}

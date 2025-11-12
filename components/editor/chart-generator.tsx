"use client";

import { useState } from "react";
import { BarChart3, LineChart as LineChartIcon, PieChart, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChartGeneratorProps {
  onInsert: (chartHtml: string) => void;
  onClose: () => void;
}

type ChartType = "bar" | "line" | "pie" | "table";

export function ChartGenerator({ onInsert, onClose }: ChartGeneratorProps) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [chartData, setChartData] = useState<string>("");
  const [chartTitle, setChartTitle] = useState<string>("");

  const parseChartData = () => {
    try {
      // Parse format: "Label1: 10, Label2: 20, Label3: 30"
      const pairs = chartData.split(",").map(p => p.trim());
      const data: { label: string; value: number }[] = [];
      
      for (const pair of pairs) {
        const [label, valueStr] = pair.split(":").map(s => s.trim());
        const value = parseFloat(valueStr);
        if (label && !isNaN(value)) {
          data.push({ label, value });
        }
      }
      
      return data;
    } catch (error) {
      return [];
    }
  };

  const generateBarChart = (data: { label: string; value: number }[]) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const rows = data.map(d => {
      const percentage = (d.value / maxValue) * 100;
      return `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 13px; font-weight: 600; color: #374151;">${d.label}</span>
            <span style="font-size: 13px; font-weight: 700; color: #8b5cf6;">${d.value}</span>
          </div>
          <div style="width: 100%; height: 24px; background: #f3f4f6; border-radius: 6px; overflow: hidden;">
            <div style="height: 100%; width: ${percentage}%; background: linear-gradient(90deg, #8b5cf6, #a78bfa); transition: width 0.3s;"></div>
          </div>
        </div>
      `;
    }).join("");
    
    return `
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 16px 0; max-width: 600px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px;">${chartTitle || "Bar Chart"}</h3>
        ${rows}
      </div>
    `;
  };

  const generateLineChart = (data: { label: string; value: number }[]) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.value / maxValue) * 80);
      return `${x},${y}`;
    }).join(" ");
    
    return `
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 16px 0; max-width: 600px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">${chartTitle || "Line Chart"}</h3>
        <svg viewBox="0 0 100 100" style="width: 100%; height: 200px; background: #f9fafb; border-radius: 8px; padding: 10px;">
          <polyline points="${points}" fill="none" stroke="#10b981" stroke-width="2" />
          ${data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.value / maxValue) * 80);
            return `<circle cx="${x}" cy="${y}" r="3" fill="#059669" />`;
          }).join("")}
        </svg>
        <div style="display: flex; justify-content: space-around; margin-top: 12px;">
          ${data.map(d => `<span style="font-size: 11px; color: #6b7280;">${d.label}</span>`).join("")}
        </div>
      </div>
    `;
  };

  const generatePieChart = (data: { label: string; value: number }[]) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = 0;
    
    const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
    
    const slices = data.map((d, i) => {
      const percentage = (d.value / total) * 100;
      const angle = (d.value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
      const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
      const x2 = 50 + 40 * Math.cos((currentAngle - 90) * Math.PI / 180);
      const y2 = 50 + 40 * Math.sin((currentAngle - 90) * Math.PI / 180);
      const largeArc = angle > 180 ? 1 : 0;
      
      return {
        path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: colors[i % colors.length],
        label: d.label,
        value: d.value,
        percentage: percentage.toFixed(1)
      };
    });
    
    return `
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 16px 0; max-width: 600px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px; border-bottom: 2px solid #ec4899; padding-bottom: 8px;">${chartTitle || "Pie Chart"}</h3>
        <div style="display: flex; align-items: center; gap: 20px;">
          <svg viewBox="0 0 100 100" style="width: 200px; height: 200px;">
            ${slices.map(s => `<path d="${s.path}" fill="${s.color}" />`).join("")}
          </svg>
          <div style="flex: 1;">
            ${slices.map(s => `
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 16px; height: 16px; background: ${s.color}; border-radius: 4px;"></div>
                <span style="font-size: 13px; color: #374151;">${s.label}: <strong>${s.value}</strong> (${s.percentage}%)</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  };

  const generateTable = (data: { label: string; value: number }[]) => {
    const rows = data.map((d, i) => `
      <tr style="border-bottom: 1px solid #e5e7eb; ${i % 2 === 0 ? 'background: #f9fafb;' : ''}">
        <td style="padding: 12px; font-size: 13px; color: #374151;">${d.label}</td>
        <td style="padding: 12px; font-size: 13px; font-weight: 700; color: #8b5cf6; text-align: right;">${d.value}</td>
      </tr>
    `).join("");
    
    return `
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 16px 0; max-width: 600px; overflow-x: auto;">
        <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">${chartTitle || "Data Table"}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6; border-bottom: 2px solid #d1d5db;">
              <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 700; color: #111827;">Category</th>
              <th style="padding: 12px; text-align: right; font-size: 13px; font-weight: 700; color: #111827;">Value</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  };

  const handleInsert = () => {
    const data = parseChartData();
    
    if (data.length === 0) {
      toast.error("Please enter valid data (e.g., 'Sales: 100, Marketing: 50')");
      return;
    }
    
    let chartHtml = "";
    
    switch (chartType) {
      case "bar":
        chartHtml = generateBarChart(data);
        break;
      case "line":
        chartHtml = generateLineChart(data);
        break;
      case "pie":
        chartHtml = generatePieChart(data);
        break;
      case "table":
        chartHtml = generateTable(data);
        break;
    }
    
    onInsert(chartHtml);
    toast.success("Chart inserted successfully!");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold">Insert Chart/Graph</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Chart Type */}
          <div>
            <label className="text-sm font-bold text-gray-900 mb-3 block">Chart Type</label>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setChartType("bar")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  chartType === "bar"
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-violet-300"
                }`}
              >
                <BarChart3 className={`w-8 h-8 mx-auto mb-2 ${chartType === "bar" ? "text-violet-600" : "text-gray-500"}`} />
                <p className="text-xs font-semibold">Bar</p>
              </button>
              
              <button
                onClick={() => setChartType("line")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  chartType === "line"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <LineChartIcon className={`w-8 h-8 mx-auto mb-2 ${chartType === "line" ? "text-green-600" : "text-gray-500"}`} />
                <p className="text-xs font-semibold">Line</p>
              </button>
              
              <button
                onClick={() => setChartType("pie")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  chartType === "pie"
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-pink-300"
                }`}
              >
                <PieChart className={`w-8 h-8 mx-auto mb-2 ${chartType === "pie" ? "text-pink-600" : "text-gray-500"}`} />
                <p className="text-xs font-semibold">Pie</p>
              </button>
              
              <button
                onClick={() => setChartType("table")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  chartType === "table"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${chartType === "table" ? "text-blue-600" : "text-gray-500"}`} />
                <p className="text-xs font-semibold">Table</p>
              </button>
            </div>
          </div>

          {/* Chart Title */}
          <div>
            <label className="text-sm font-bold text-gray-900 mb-2 block">Chart Title</label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="e.g., Quarterly Sales Report"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm"
            />
          </div>

          {/* Chart Data */}
          <div>
            <label className="text-sm font-bold text-gray-900 mb-2 block">Data</label>
            <textarea
              value={chartData}
              onChange={(e) => setChartData(e.target.value)}
              placeholder="Enter data: Label1: 100, Label2: 75, Label3: 120"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-sm resize-none h-24"
            />
            <p className="text-xs text-gray-500 mt-2">
              Format: <code className="bg-gray-100 px-2 py-1 rounded">Label: Value, Label: Value</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex gap-3 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInsert}
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            Insert Chart
          </Button>
        </div>
      </div>
    </div>
  );
}

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
    
    // Generate as table for better Tiptap compatibility
    const rows = data.map(d => {
      const percentage = (d.value / maxValue) * 100;
      const barWidth = Math.round(percentage);
      const emptyWidth = 100 - barWidth;
      return `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>${d.label}</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong style="color: #8b5cf6;">${d.value}</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; width: 200px;">
          <span style="display: inline-block; height: 20px; background: linear-gradient(90deg, #8b5cf6, #a78bfa); width: ${barWidth}%;"></span>
        </td>
      </tr>`;
    }).join("");
    
    return `<blockquote style="border-left: 4px solid #8b5cf6; padding-left: 16px; margin: 20px 0;">
<p><strong style="font-size: 18px; color: #111827;">${chartTitle || "Bar Chart"}</strong></p>
<table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
  <thead>
    <tr style="background: #f9fafb;">
      <th style="padding: 8px; text-align: left; border-bottom: 2px solid #8b5cf6;">Label</th>
      <th style="padding: 8px; text-align: right; border-bottom: 2px solid #8b5cf6;">Value</th>
      <th style="padding: 8px; border-bottom: 2px solid #8b5cf6;">Chart</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
</blockquote>`;
  };

  const generateLineChart = (data: { label: string; value: number }[]) => {
    const rows = data.map((d, i) => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>${d.label}</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong style="color: #10b981;">${d.value}</strong></td>
      </tr>`
    ).join("");
    
    return `<blockquote style="border-left: 4px solid #10b981; padding-left: 16px; margin: 20px 0;">
<p><strong style="font-size: 18px; color: #111827;">${chartTitle || "Line Chart / Data"}</strong></p>
<table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
  <thead>
    <tr style="background: #f0fdf4;">
      <th style="padding: 8px; text-align: left; border-bottom: 2px solid #10b981;">Label</th>
      <th style="padding: 8px; text-align: right; border-bottom: 2px solid #10b981;">Value</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
</blockquote>`;
  };

  const generatePieChart = (data: { label: string; value: number }[]) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
    
    const rows = data.map((d, i) => {
      const percentage = ((d.value / total) * 100).toFixed(1);
      return `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
          <span style="display: inline-block; width: 12px; height: 12px; background: ${colors[i % colors.length]}; border-radius: 3px; margin-right: 8px;"></span>
          <strong>${d.label}</strong>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong style="color: ${colors[i % colors.length]};">${d.value}</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;"><em>${percentage}%</em></td>
      </tr>`;
    }).join("");
    
    return `<blockquote style="border-left: 4px solid #ec4899; padding-left: 16px; margin: 20px 0;">
<p><strong style="font-size: 18px; color: #111827;">${chartTitle || "Pie Chart / Distribution"}</strong></p>
<table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
  <thead>
    <tr style="background: #fdf2f8;">
      <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ec4899;">Category</th>
      <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ec4899;">Value</th>
      <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ec4899;">Percentage</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
</blockquote>`;
  };

  const generateTable = (data: { label: string; value: number }[]) => {
    const rows = data.map((d, i) => 
      `<tr style="${i % 2 === 0 ? 'background: #f9fafb;' : ''}">
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${d.label}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong style="color: #3b82f6;">${d.value}</strong></td>
      </tr>`
    ).join("");
    
    return `<blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 20px 0;">
<p><strong style="font-size: 18px; color: #111827;">${chartTitle || "Data Table"}</strong></p>
<table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
  <thead>
    <tr style="background: #eff6ff;">
      <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #3b82f6;">Category</th>
      <th style="padding: 12px; text-align: right; font-weight: 700; border-bottom: 2px solid #3b82f6;">Value</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
</blockquote>`;
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
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Charts are rendered as formatted tables and blockquotes for better compatibility. 
              For complex visualizations, consider using markdown tables in your content.
            </p>
          </div>

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

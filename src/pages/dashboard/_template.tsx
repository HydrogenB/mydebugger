import React, { useState } from 'react';

// Simple Chart Components Template (standalone, no external deps)
interface BarData {
  name: string;
  value: number;
  color: string;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

const SimpleBarChart: React.FC<{ data: BarData[]; width: number; height: number }> = ({ 
  data, width, height 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 120) / data.length;
  const chartHeight = height - 80;
  
  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Y-axis */}
        <line x1="50" y1="20" x2="50" y2={height - 60} stroke="#ccc" strokeWidth="1" />
        {/* X-axis */}
        <line x1="50" y1={height - 60} x2={width - 20} y2={height - 60} stroke="#ccc" strokeWidth="1" />
        
        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((tick, i) => (
          <g key={tick}>
            <line x1="45" y1={height - 60 - (chartHeight * tick / 100)} x2="50" y2={height - 60 - (chartHeight * tick / 100)} stroke="#ccc" strokeWidth="1" />
            <text x="40" y={height - 60 - (chartHeight * tick / 100) + 5} textAnchor="end" fontSize="12" fill="#666">
              {tick}
            </text>
          </g>
        ))}
        
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / 100) * chartHeight;
          const x = 60 + index * barWidth + (barWidth * 0.1);
          const y = height - 60 - barHeight;
          
          return (
            <g key={item.name}>
              <rect
                x={x}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill={item.color}
                rx="3"
              />
              <text
                x={x + (barWidth * 0.4)}
                y={height - 45}
                textAnchor="middle"
                fontSize="10"
                fill="#666"
                transform={`rotate(-45 ${x + (barWidth * 0.4)} ${height - 45})`}
              >
                {item.name.substring(0, 10)}...
              </text>
              <text
                x={x + (barWidth * 0.4)}
                y={y - 5}
                textAnchor="middle"
                fontSize="12"
                fill="#333"
                fontWeight="bold"
              >
                {item.value}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const SimplePieChart: React.FC<{ data: PieData[]; width: number; height: number }> = ({ 
  data, width, height 
}) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 40;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let currentAngle = 0;
  
  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height}>
        {data.map((item, index) => {
          const percentage = item.value / total;
          const angle = percentage * 2 * Math.PI;
          
          const x1 = centerX + radius * Math.cos(currentAngle);
          const y1 = centerY + radius * Math.sin(currentAngle);
          const x2 = centerX + radius * Math.cos(currentAngle + angle);
          const y2 = centerY + radius * Math.sin(currentAngle + angle);
          
          const largeArcFlag = angle > Math.PI ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          const labelAngle = currentAngle + angle / 2;
          const labelRadius = radius + 20;
          const labelX = centerX + labelRadius * Math.cos(labelAngle);
          const labelY = centerY + labelRadius * Math.sin(labelAngle);
          
          currentAngle += angle;
          
          return (
            <g key={item.name}>
              <path d={pathData} fill={item.color} stroke="white" strokeWidth="2" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fontSize="11"
                fill="#333"
                fontWeight="500"
              >
                {item.name}
              </text>
              <text
                x={labelX}
                y={labelY + 12}
                textAnchor="middle"
                fontSize="10"
                fill="#666"
              >
                {Math.round(percentage * 100)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default function DashboardTemplate() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // TODO: Replace with your data
  const sampleData = [
    { name: 'Sample 1', value: 85, color: '#10b981' },
    { name: 'Sample 2', value: 40, color: '#f59e0b' },
    { name: 'Sample 3', value: 50, color: '#f59e0b' },
    { name: 'Sample 4', value: 75, color: '#10b981' }
  ];
  
  const pieData = [
    { name: 'Category A', value: 5, color: '#10b981' },
    { name: 'Category B', value: 5, color: '#f59e0b' },
    { name: 'Category C', value: 5, color: '#3b82f6' }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Standalone styles */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .transition-colors {
          transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
        }
        
        .hover\\:bg-gray-100:hover {
          background-color: #f3f4f6;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div 
          className="rounded-xl p-6 text-white mb-6 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)'
          }}
        >
          <h1 className="text-3xl font-bold mb-2">🚀 Dashboard Template</h1>
          <div className="flex items-center justify-between">
            <p className="text-lg opacity-90">Your Project Name | Description</p>
            <div 
              className="rounded-lg px-6 py-3"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <span className="text-2xl font-bold">⭐ 8.5/10</span>
              <p className="text-sm">Rating</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={activeTab === 'overview' ? { backgroundColor: '#9333ea' } : {}}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'details' 
                ? 'text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            style={activeTab === 'details' ? { backgroundColor: '#9333ea' } : {}}
          >
            Details
          </button>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-800">📊 Bar Chart</h3>
              <SimpleBarChart data={sampleData} width={400} height={300} />
            </div>
            
            {/* Chart 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-800">📈 Pie Chart</h3>
              <SimplePieChart data={pieData} width={400} height={300} />
            </div>
            
            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-white rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#10b981' }}>
                <div className="text-3xl font-bold mb-2">85%</div>
                <p className="text-lg">Metric 1</p>
              </div>
              <div className="text-white rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#f59e0b' }}>
                <div className="text-3xl font-bold mb-2">40%</div>
                <p className="text-lg">Metric 2</p>
              </div>
              <div className="text-white rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#3b82f6' }}>
                <div className="text-3xl font-bold mb-2">3</div>
                <p className="text-lg">Metric 3</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'details' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Detail View</h3>
            <p className="text-gray-600">
              Replace this content with your specific dashboard details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

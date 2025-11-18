import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { clsx } from 'clsx';

// Color palettes for charts
const CHART_COLORS = {
  primary: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
  success: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
  warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FEF3C7'],
  error: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
  mixed: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{`${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {entry.name}: {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Line Chart Component
export const AttendanceLineChart = ({ 
  data, 
  title, 
  description,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  showGrid = true,
  color = 'primary'
}) => {
  const colors = CHART_COLORS[color] || CHART_COLORS.primary;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />}
              <XAxis 
                dataKey={nameKey} 
                className="text-xs fill-gray-600 dark:fill-gray-400"
              />
              <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={colors[0]} 
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Area Chart Component
export const AttendanceAreaChart = ({ 
  data, 
  title, 
  description,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  showGrid = true,
  color = 'primary'
}) => {
  const colors = CHART_COLORS[color] || CHART_COLORS.primary;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />}
              <XAxis 
                dataKey={nameKey} 
                className="text-xs fill-gray-600 dark:fill-gray-400"
              />
              <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={colors[0]} 
                fill={colors[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Bar Chart Component
export const AttendanceBarChart = ({ 
  data, 
  title, 
  description,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  showGrid = true,
  color = 'primary'
}) => {
  const colors = CHART_COLORS[color] || CHART_COLORS.primary;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />}
              <XAxis 
                dataKey={nameKey} 
                className="text-xs fill-gray-600 dark:fill-gray-400"
              />
              <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Pie Chart Component
export const AttendancePieChart = ({ 
  data, 
  title, 
  description,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  showLegend = true,
  colors = CHART_COLORS.mixed
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Multi-line Chart Component
export const MultiLineChart = ({ 
  data, 
  title, 
  description,
  lines = [],
  height = 300,
  showGrid = true
}) => {
  const colors = CHART_COLORS.mixed;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />}
              <XAxis 
                dataKey="name" 
                className="text-xs fill-gray-600 dark:fill-gray-400"
              />
              <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {lines.map((line, index) => (
                <Line 
                  key={line.dataKey}
                  type="monotone" 
                  dataKey={line.dataKey} 
                  stroke={colors[index % colors.length]} 
                  strokeWidth={2}
                  name={line.name}
                  dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Stats Card Component
export const StatsCard = ({ 
  title, 
  value, 
  description, 
  trend, 
  trendValue, 
  icon: Icon,
  color = 'primary',
  className 
}) => {
  const colorClasses = {
    primary: 'text-blue-600 bg-blue-50 dark:bg-blue-900/10 dark:text-blue-400',
    success: 'text-green-600 bg-green-50 dark:bg-green-900/10 dark:text-green-400',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 dark:text-yellow-400',
    error: 'text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400',
  };

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <Card className={clsx('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{description}</p>
            )}
            {trend && trendValue && (
              <div className={clsx('flex items-center mt-2', trendColors[trend])}>
                <span className="text-sm font-medium">{trendValue}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={clsx('p-3 rounded-full', colorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  AttendanceLineChart,
  AttendanceAreaChart,
  AttendanceBarChart,
  AttendancePieChart,
  MultiLineChart,
  StatsCard,
};

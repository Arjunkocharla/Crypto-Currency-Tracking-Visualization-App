/**
 * Modern portfolio visualization - Vibrant, professional charts
 */
import React from 'react';
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const COLORS = [
  '#3b82f6', // brand blue
  '#a855f7', // purple
  '#22c55e', // success green
  '#f59e0b', // amber
  '#ef4444', // danger red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
];

export default function Visualization({ rollups }) {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'gray.800');
  const borderColor = useColorModeValue('rgba(99, 102, 241, 0.2)', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const gridColor = useColorModeValue('#e2e8f0', '#4a5568');
  const axisColor = useColorModeValue('#718096', '#a0aec0');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.8)');

  if (!rollups || rollups.length === 0) {
    return (
      <Box
        p={8}
        bg={cardBg}
        borderRadius="2xl"
        border="2px"
        borderColor={borderColor}
        shadow="lg"
        textAlign="center"
      >
        <Text color="gray.500">No portfolio data to visualize</Text>
      </Box>
    );
  }

  // Prepare data for charts
  // API returns: cost, value (not total_value, total_equity)
  // Normalize the data structure for charts
  const normalizedRollups = rollups.map((item) => ({
    symbol: item.symbol,
    cost: item.cost || item.total_value || 0,
    value: item.value || item.total_equity || 0,
    total_value: item.cost || item.total_value || 0, // For pie chart compatibility
    total_equity: item.value || item.total_equity || 0, // For pie chart compatibility
  }));

  const barChartData = normalizedRollups.map((item) => ({
    symbol: item.symbol,
    cost: item.cost,
    equity: item.value,
    gain: item.value - item.cost,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={cardBg}
          p={4}
          borderRadius="lg"
          shadow="xl"
          border="2px"
          borderColor={borderColor}
        >
          <Text fontWeight="bold" mb={2} fontSize="sm">
            {payload[0].payload.symbol}
          </Text>
          {payload.map((entry, index) => (
            <Text key={index} color={entry.color} fontSize="sm" fontWeight="medium">
              {entry.name}: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(entry.value)}
            </Text>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Bar Chart */}
      <Box
        p={8}
        bg={glassBg}
        backdropFilter="blur(10px)"
        borderRadius="2xl"
        border="2px"
        borderColor={borderColor}
        shadow="lg"
        _hover={{ shadow: 'xl', borderColor: 'rgba(99, 102, 241, 0.4)' }}
        transition="all 0.3s"
      >
        <Text fontSize="lg" fontWeight="bold" mb={5} color={textColor}>
          Cost vs Equity by Asset
        </Text>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} />
            <XAxis
              dataKey="symbol"
              stroke={axisColor}
              fontSize={12}
            />
            <YAxis
              stroke={axisColor}
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="cost" fill="#3b82f6" name="Total Cost" radius={[8, 8, 0, 0]} />
            <Bar dataKey="equity" fill="#22c55e" name="Current Equity" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Pie Charts */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box
          p={8}
          bg={cardBg}
          borderRadius="2xl"
          border="2px"
          borderColor={borderColor}
          shadow="lg"
          _hover={{ shadow: 'xl' }}
          transition="all 0.3s"
        >
          <Text fontSize="lg" fontWeight="bold" mb={5} color={textColor} textAlign="center">
            Cost Distribution
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={normalizedRollups}
                dataKey="total_value"
                nameKey="symbol"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={20}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {normalizedRollups.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value} (${((entry.payload.total_value / normalizedRollups.reduce((sum, item) => sum + item.total_value, 0)) * 100).toFixed(1)}%)`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Box
          p={8}
          bg={cardBg}
          borderRadius="2xl"
          border="2px"
          borderColor={borderColor}
          shadow="lg"
          _hover={{ shadow: 'xl' }}
          transition="all 0.3s"
        >
          <Text fontSize="lg" fontWeight="bold" mb={5} color={textColor} textAlign="center">
            Equity Distribution
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={normalizedRollups}
                dataKey="total_equity"
                nameKey="symbol"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={20}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {normalizedRollups.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value} (${((entry.payload.total_equity / normalizedRollups.reduce((sum, item) => sum + item.total_equity, 0)) * 100).toFixed(1)}%)`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>
    </VStack>
  );
}

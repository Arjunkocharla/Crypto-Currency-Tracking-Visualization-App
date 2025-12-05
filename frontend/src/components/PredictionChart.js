/**
 * Bitcoin price prediction chart - Vibrant design
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  useToast,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import api from '../services/api';

export default function PredictionChart() {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const gridColor = useColorModeValue('#e2e8f0', '#4a5568');
  const axisColor = useColorModeValue('#718096', '#a0aec0');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      
      const data = await api.getPrediction();
      const chartData = data.predictions.map((price, index) => ({
        day: index + 1,
        price: price,
      }));
      setPredictions(chartData);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error loading predictions',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        p={8}
        bg={cardBg}
        borderRadius="2xl"
        border="2px"
        borderColor={borderColor}
        shadow="lg"
      >
        <Center minH="300px">
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.500" thickness="4px" />
            <Text color="gray.500" fontWeight="medium">Loading predictions...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Box
        p={8}
        bg={cardBg}
        borderRadius="2xl"
        border="2px"
        borderColor={borderColor}
        shadow="lg"
      >
        <VStack spacing={4}>
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            Bitcoin Price Forecast
          </Text>
          <Text color="gray.500">No prediction data available</Text>
          <Button onClick={fetchPredictions} colorScheme="brand" size="md">
            Retry
          </Button>
        </VStack>
      </Box>
    );
  }

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
          <Text fontWeight="bold" fontSize="sm" mb={1}>
            Day {payload[0].payload.day}
          </Text>
          <Text color="brand.500" fontSize="sm" fontWeight="semibold">
            Price: {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(payload[0].value)}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
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
      <VStack spacing={5} align="stretch">
        <VStack align="flex-start" spacing={2}>
          <HStack spacing={2}>
            <Box
              w="8px"
              h="8px"
              bgGradient="linear(to-r, brand.400, purple.400)"
              borderRadius="full"
            />
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Bitcoin Price Forecast
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            LSTM Neural Network Prediction
          </Text>
        </VStack>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={predictions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} />
            <XAxis
              dataKey="day"
              label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
              stroke={axisColor}
              fontSize={12}
            />
            <YAxis
              label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              stroke={axisColor}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorPrice)"
              name="Predicted Price"
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <Text fontSize="xs" color="gray.500" textAlign="center" fontWeight="medium">
          Forecast generated using LSTM neural network model trained on historical Bitcoin data
        </Text>
      </VStack>
    </Box>
  );
}

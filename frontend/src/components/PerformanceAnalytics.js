/**
 * Performance Analytics Component with Time Period Filtering
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Select,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
  Badge,
  Button,
  useToast,
  Spinner,
  Center,
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
} from 'recharts';
import api from '../services/api';

const PERIODS = [
  { value: '1d', label: '1 Day' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

export default function PerformanceAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [performance, setPerformance] = useState(null);
  const [history, setHistory] = useState([]);
  const [performers, setPerformers] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'gray.800');
  const borderColor = useColorModeValue('rgba(99, 102, 241, 0.2)', 'gray.700');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.8)');
  const successGradient = useColorModeValue(
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
  );
  const dangerGradient = useColorModeValue(
    'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
    'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
  );

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [perfData, historyData, performersData] = await Promise.all([
        api.getPerformance(null, selectedPeriod),
        api.getPortfolioHistory(null, selectedPeriod === 'all' ? 365 : parseInt(selectedPeriod) || 30),
        api.getPerformers(null, 5),
      ]);
      setPerformance(perfData);
      setHistory(historyData);
      setPerformers(performersData);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error loading analytics',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color="gray.500" fontWeight="medium">Loading analytics...</Text>
        </VStack>
      </Center>
    );
  }

  if (!performance) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.500">No performance data available</Text>
      </Box>
    );
  }

  const isPositive = performance.period_gain >= 0;

  return (
    <VStack spacing={6} align="stretch">
      {/* Time Period Selector */}
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Heading size="lg" fontWeight="bold" bgGradient="linear(to-r, #667eea, #764ba2)" bgClip="text">
          Performance Analytics
        </Heading>
        <HStack>
          <Text fontSize="sm" fontWeight="medium" color="gray.600">
            Period:
          </Text>
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            size="md"
            width="150px"
            borderRadius="lg"
            borderWidth="2px"
            borderColor="gray.300"
            _hover={{ borderColor: 'brand.400' }}
            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
          >
            {PERIODS.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </Select>
        </HStack>
      </HStack>

      {/* Performance Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Box
          bg={glassBg}
          backdropFilter="blur(10px)"
          p={6}
          borderRadius="xl"
          border="2px"
          borderColor={borderColor}
          shadow="md"
          _hover={{ shadow: 'lg', transform: 'translateY(-2px)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
          transition="all 0.3s"
        >
          <Stat>
            <StatLabel fontSize="sm" color="gray.600" mb={2}>
              Period Gain/Loss
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color={isPositive ? 'green.500' : 'red.500'}>
              {formatCurrency(performance.period_gain)}
            </StatNumber>
            <StatHelpText fontSize="md" mt={2} color={isPositive ? 'green.500' : 'red.500'}>
              {formatPercent(performance.period_gain_percent)}
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          bg={glassBg}
          backdropFilter="blur(10px)"
          p={6}
          borderRadius="xl"
          border="2px"
          borderColor={borderColor}
          shadow="md"
          _hover={{ shadow: 'lg', transform: 'translateY(-2px)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
          transition="all 0.3s"
        >
          <Stat>
            <StatLabel fontSize="sm" color="gray.600" mb={2}>
              Current Value
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">
              {formatCurrency(performance.current_value)}
            </StatNumber>
            <StatHelpText fontSize="sm" mt={2} color="gray.500">
              Portfolio value
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          bg={glassBg}
          backdropFilter="blur(10px)"
          p={6}
          borderRadius="xl"
          border="2px"
          borderColor={borderColor}
          shadow="md"
          _hover={{ shadow: 'lg', transform: 'translateY(-2px)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
          transition="all 0.3s"
        >
          <Stat>
            <StatLabel fontSize="sm" color="gray.600" mb={2}>
              Total Gain/Loss
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color={performance.total_gain >= 0 ? 'green.500' : 'red.500'}>
              {formatCurrency(performance.total_gain)}
            </StatNumber>
            <StatHelpText fontSize="md" mt={2} color={performance.total_gain >= 0 ? 'green.500' : 'red.500'}>
              {formatPercent(performance.total_gain_percent)}
            </StatHelpText>
          </Stat>
        </Box>

        <Box
          bg={glassBg}
          backdropFilter="blur(10px)"
          p={6}
          borderRadius="xl"
          border="2px"
          borderColor={borderColor}
          shadow="md"
          _hover={{ shadow: 'lg', transform: 'translateY(-2px)', borderColor: 'rgba(99, 102, 241, 0.4)' }}
          transition="all 0.3s"
        >
          <Stat>
            <StatLabel fontSize="sm" color="gray.600" mb={2}>
              Transactions
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">
              {performance.transactions_count || 0}
            </StatNumber>
            <StatHelpText fontSize="sm" mt={2} color="gray.500">
              {performance.buys_count || 0} buys, {performance.sells_count || 0} sells
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Portfolio History Chart */}
      {history && history.length > 0 && (
        <Box
          bg={glassBg}
          backdropFilter="blur(10px)"
          p={6}
          borderRadius="xl"
          border="2px"
          borderColor={borderColor}
          shadow="md"
          _hover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
          transition="all 0.3s"
        >
          <Heading size="md" mb={4} color="gray.700">
            Portfolio Value Over Time
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#667eea"
                strokeWidth={2}
                name="Portfolio Value"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#f093fb"
                strokeWidth={2}
                name="Cost Basis"
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Best/Worst Performers */}
      {performers && (performers.best?.length > 0 || performers.worst?.length > 0) && (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Best Performers */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            border="2px"
            borderColor={borderColor}
            shadow="md"
          >
            <Heading size="md" mb={4} color="green.600">
              🚀 Best Performers
            </Heading>
            <VStack spacing={3} align="stretch">
              {performers.best.map((asset, index) => (
                <HStack
                  key={asset.symbol}
                  justify="space-between"
                  p={3}
                  bg="green.50"
                  borderRadius="lg"
                  border="1px"
                  borderColor="green.200"
                >
                  <HStack>
                    <Badge colorScheme="green" fontSize="md" px={2} py={1}>
                      #{index + 1}
                    </Badge>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">
                        {asset.symbol}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {asset.coins.toFixed(4)} coins
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={0}>
                    <Text fontWeight="bold" color="green.600" fontSize="lg">
                      {formatPercent(asset.gain_percent)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {formatCurrency(asset.gain)}
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Worst Performers */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            border="2px"
            borderColor={borderColor}
            shadow="md"
          >
            <Heading size="md" mb={4} color="red.600">
              📉 Worst Performers
            </Heading>
            <VStack spacing={3} align="stretch">
              {performers.worst.map((asset, index) => (
                <HStack
                  key={asset.symbol}
                  justify="space-between"
                  p={3}
                  bg="red.50"
                  borderRadius="lg"
                  border="1px"
                  borderColor="red.200"
                >
                  <HStack>
                    <Badge colorScheme="red" fontSize="md" px={2} py={1}>
                      #{index + 1}
                    </Badge>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">
                        {asset.symbol}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {asset.coins.toFixed(4)} coins
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={0}>
                    <Text fontWeight="bold" color="red.600" fontSize="lg">
                      {formatPercent(asset.gain_percent)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {formatCurrency(asset.gain)}
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        </SimpleGrid>
      )}
    </VStack>
  );
}


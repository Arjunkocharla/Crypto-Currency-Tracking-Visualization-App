/**
 * Modern portfolio summary - Experimental vibrant gradients
 */
import React from 'react';
import {
  SimpleGrid,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Text,
  HStack,
} from '@chakra-ui/react';

// Custom arrow component to replace StatArrow
const ArrowIcon = ({ type, color = 'currentColor' }) => {
  if (type === 'increase') {
    return (
      <Box as="span" color={color} fontSize="lg" fontWeight="bold">
        ↑
      </Box>
    );
  }
  return (
    <Box as="span" color={color} fontSize="lg" fontWeight="bold">
      ↓
    </Box>
  );
};

export default function Summary({
  portfolioCost,
  portfolioValue,
  absoluteGain,
  totalGainPercent,
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isPositive = absoluteGain >= 0;

  // Experimental gradient combinations
  const gradient1 = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
  );
  
  const gradient2 = useColorModeValue(
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  );
  
  const gradient3 = useColorModeValue(
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
  );
  
  const successGradient = useColorModeValue(
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
  );
  
  const dangerGradient = useColorModeValue(
    'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
    'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
      <Box
        bgGradient={gradient1}
        color="white"
        p={7}
        borderRadius="2xl"
        shadow="xl"
        _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
        transition="all 0.3s"
        position="relative"
        overflow="hidden"
        border="2px solid"
        borderColor="whiteAlpha.200"
      >
        <Box
          position="absolute"
          top={0}
          right={0}
          w="120px"
          h="120px"
          bg="whiteAlpha.200"
          borderRadius="full"
          transform="translate(30%, -30%)"
          filter="blur(20px)"
        />
        <Stat position="relative" zIndex={1}>
          <StatLabel fontSize="sm" fontWeight="medium" mb={3} opacity={0.9}>
            Total Invested
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" textShadow="0 2px 8px rgba(0,0,0,0.2)">
            {formatCurrency(portfolioCost)}
          </StatNumber>
        </Stat>
      </Box>

      <Box
        bgGradient={gradient2}
        color="white"
        p={7}
        borderRadius="2xl"
        shadow="xl"
        _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
        transition="all 0.3s"
        position="relative"
        overflow="hidden"
        border="2px solid"
        borderColor="whiteAlpha.200"
      >
        <Box
          position="absolute"
          top={0}
          right={0}
          w="120px"
          h="120px"
          bg="whiteAlpha.200"
          borderRadius="full"
          transform="translate(30%, -30%)"
          filter="blur(20px)"
        />
        <Stat position="relative" zIndex={1}>
          <StatLabel fontSize="sm" fontWeight="medium" mb={3} opacity={0.9}>
            Current Value
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" textShadow="0 2px 8px rgba(0,0,0,0.2)">
            {formatCurrency(portfolioValue)}
          </StatNumber>
        </Stat>
      </Box>

      <Box
        bgGradient={isPositive ? successGradient : dangerGradient}
        color="white"
        p={7}
        borderRadius="2xl"
        shadow="xl"
        _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
        transition="all 0.3s"
        position="relative"
        overflow="hidden"
        border="2px solid"
        borderColor="whiteAlpha.200"
      >
        <Box
          position="absolute"
          top={0}
          right={0}
          w="120px"
          h="120px"
          bg="whiteAlpha.200"
          borderRadius="full"
          transform="translate(30%, -30%)"
          filter="blur(20px)"
        />
        <Stat position="relative" zIndex={1}>
          <StatLabel fontSize="sm" fontWeight="medium" mb={3} opacity={0.9}>
            Total Gain/Loss
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" textShadow="0 2px 8px rgba(0,0,0,0.2)">
            <HStack spacing={1} display="inline-flex">
              <ArrowIcon type={isPositive ? 'increase' : 'decrease'} color="white" />
              <Text as="span" color="white">
                {formatCurrency(Math.abs(absoluteGain))}
              </Text>
            </HStack>
          </StatNumber>
        </Stat>
      </Box>

      <Box
        bgGradient={gradient3}
        color="white"
        p={7}
        borderRadius="2xl"
        shadow="xl"
        _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
        transition="all 0.3s"
        position="relative"
        overflow="hidden"
        border="2px solid"
        borderColor="whiteAlpha.200"
      >
        <Box
          position="absolute"
          top={0}
          right={0}
          w="120px"
          h="120px"
          bg="whiteAlpha.200"
          borderRadius="full"
          transform="translate(30%, -30%)"
          filter="blur(20px)"
        />
        <Stat position="relative" zIndex={1}>
          <StatLabel fontSize="sm" fontWeight="medium" mb={3} opacity={0.9}>
            Gain/Loss %
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" textShadow="0 2px 8px rgba(0,0,0,0.2)">
            {totalGainPercent.toFixed(2)}%
          </StatNumber>
          <StatHelpText fontSize="md" mt={2} fontWeight="semibold" opacity={0.9}>
            {isPositive ? '📈 Profit' : '📉 Loss'}
          </StatHelpText>
        </Stat>
      </Box>
    </SimpleGrid>
  );
}

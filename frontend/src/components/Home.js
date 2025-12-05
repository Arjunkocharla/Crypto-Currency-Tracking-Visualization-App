/**
 * Modern Home/Dashboard - Experimental vibrant gradients
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Heading,
  useDisclosure,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Spinner,
  Center,
  Badge,
  Flex,
  SimpleGrid,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import TransactionsTable from './TransactionsTable';
import AddTransactionModal from './AddTransactionModal';
import EditTransactionModal from './EditTransactionModal';
import ImportBrokerModal from './ImportBrokerModal';
import api from '../services/api';
import { exportTransactionsToCSV } from '../utils/exportUtils';

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


export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInitialLoadRef = useRef(true);
  const hasDataRef = useRef(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isImportOpen, onOpen: onImportOpen, onClose: onImportClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();
  const location = useLocation();
  
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'gray.800');
  const borderColor = useColorModeValue('rgba(99, 102, 241, 0.2)', 'gray.700');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.8)');
  
  // Experimental gradient combinations
  const heroGradient = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
    'linear-gradient(135deg, #1e3a8a 0%, #312e81 25%, #581c87 50%, #0e7490 75%, #0891b2 100%)'
  );
  
  const cardGradient1 = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
  );
  
  const cardGradient2 = useColorModeValue(
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  );
  
  const cardGradient3 = useColorModeValue(
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

  const fetchData = async (showLoading = false) => {
    try {
      const isInitialLoad = isInitialLoadRef.current;
      
      // Try to restore from sessionStorage first (for quick display)
      const cachedSummary = sessionStorage.getItem('portfolioSummary');
      if (cachedSummary && !portfolioSummary) {
        try {
          const parsed = JSON.parse(cachedSummary);
          if (parsed && typeof parsed.total_equity === 'number') {
            setPortfolioSummary(parsed);
            hasDataRef.current = true;
          }
        } catch (e) {
          console.warn('Failed to parse cached portfolio summary:', e);
        }
      }
      
      // Only show loading spinner on initial load or if explicitly requested
      if (showLoading || isInitialLoad) {
        setLoading(true);
      }
      
      const [transactionsData, portfolioData] = await Promise.all([
        api.getTransactions(),
        api.getPortfolio(),
      ]);
        
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        
        // Handle portfolio data structure - check for summary property
        if (portfolioData && portfolioData.summary) {
          // Ensure we have valid numeric values
          const summary = portfolioData.summary;
          if (typeof summary.total_equity === 'number' && !isNaN(summary.total_equity)) {
            // If API returns 0, check if we have a cached value that's not 0
            // This handles cases where the API temporarily returns 0 due to price fetching issues
            if (summary.total_equity === 0) {
              // Check cached value first
              let useCached = false;
              if (cachedSummary) {
                try {
                  const parsed = JSON.parse(cachedSummary);
                  if (parsed && typeof parsed.total_equity === 'number' && parsed.total_equity > 0) {
                    setPortfolioSummary(parsed);
                    hasDataRef.current = true;
                    useCached = true;
                  }
                } catch (e) {
                  // Parse error, continue
                }
              }
              
              // If no cached value or cache is also 0, check current state
              if (!useCached && portfolioSummary && portfolioSummary.total_equity > 0) {
                // Don't update - keep existing state
                hasDataRef.current = true;
              } else if (!useCached) {
                // No cached value and no existing state, use API value (even if 0)
                setPortfolioSummary(summary);
                // Don't cache 0 values - this prevents overwriting future good values
                // hasDataRef.current = true; // Don't mark as having data if it's 0
              }
            } else {
              // Normal case - API returned valid non-zero data
              setPortfolioSummary(summary);
              // Only update cache if the value is not 0 (to prevent overwriting good data with bad data)
              if (summary.total_equity > 0) {
                sessionStorage.setItem('portfolioSummary', JSON.stringify(summary));
              } else {
              }
              hasDataRef.current = true;
            }
          } else {
            // Try to use cached data if available
            if (!hasDataRef.current && cachedSummary) {
              try {
                const parsed = JSON.parse(cachedSummary);
                if (parsed && typeof parsed.total_equity === 'number') {
                  setPortfolioSummary(parsed);
                  hasDataRef.current = true;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        } else if (portfolioData && typeof portfolioData.total_equity === 'number' && !isNaN(portfolioData.total_equity)) {
          // If portfolioData is already the summary object
          // Same logic - preserve existing value if API returns 0
          if (portfolioData.total_equity === 0) {
            // Check cached value first
            let useCached = false;
            if (cachedSummary) {
              try {
                const parsed = JSON.parse(cachedSummary);
                if (parsed && typeof parsed.total_equity === 'number' && parsed.total_equity > 0) {
                  console.warn('API returned total_equity: 0, using cached value:', parsed.total_equity);
                  setPortfolioSummary(parsed);
                  hasDataRef.current = true;
                  useCached = true;
                }
              } catch (e) {
                // Parse error, continue
              }
            }
            
            // If no cached value, check current state
            if (!useCached && portfolioSummary && portfolioSummary.total_equity > 0) {
              console.warn('API returned total_equity: 0, preserving existing state value:', portfolioSummary.total_equity);
              // Don't update - keep existing state
              hasDataRef.current = true;
            } else if (!useCached) {
              // No cached value and no existing state, use API value (even if 0)
              setPortfolioSummary(portfolioData);
              // Don't cache 0 values
              hasDataRef.current = true;
            }
          } else {
            // Normal case - API returned valid non-zero data
            setPortfolioSummary(portfolioData);
            // Only update cache if the value is not 0
            if (portfolioData.total_equity > 0) {
              sessionStorage.setItem('portfolioSummary', JSON.stringify(portfolioData));
            }
            hasDataRef.current = true;
          }
        } else {
          // Try to use cached data if available
          if (!hasDataRef.current && cachedSummary) {
            try {
              const parsed = JSON.parse(cachedSummary);
              if (parsed && typeof parsed.total_equity === 'number') {
                setPortfolioSummary(parsed);
                hasDataRef.current = true;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
        setLoading(false);
        isInitialLoadRef.current = false;
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error loading data',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      isInitialLoadRef.current = false;
      // Try to use cached data on error
      if (!hasDataRef.current) {
        const cachedSummary = sessionStorage.getItem('portfolioSummary');
        if (cachedSummary) {
          try {
            const parsed = JSON.parse(cachedSummary);
            if (parsed && typeof parsed.total_equity === 'number') {
              setPortfolioSummary(parsed);
              hasDataRef.current = true;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  };

  useEffect(() => {
    // Always fetch when component mounts or route changes to home
    if (location.pathname === '/') {
      // On initial mount, show loading. On subsequent navigations, don't show loading
      fetchData(isInitialLoadRef.current);
    }
  }, [location.pathname]);
  
  // Also refetch when component becomes visible (handles browser tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && location.pathname === '/') {
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);

  const handleTransactionAdded = () => {
    fetchData();
    onClose();
  };

  const handleImportComplete = () => {
    fetchData();
    onImportClose();
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    onEditOpen();
  };

  const handleEditComplete = () => {
    fetchData();
    setEditingTransaction(null);
    onEditClose();
  };

  if (loading) {
  return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color="gray.500" fontWeight="medium">Loading portfolio...</Text>
        </VStack>
      </Center>
    );
  }

  const isPositive = portfolioSummary?.absolute_gain >= 0;

  return (
    <VStack spacing={8} align="stretch">
      {/* Hero Section - Portfolio Overview */}
      <Box>
        <VStack spacing={6} align="stretch">
          <Heading 
            size="2xl" 
            fontWeight="bold" 
            bgGradient="linear(to-r, #667eea, #764ba2, #f093fb, #4facfe)"
            bgClip="text"
            letterSpacing="tight"
          >
            Portfolio Overview
          </Heading>
          
          {/* Main Portfolio Value Card - Experimental Multi-Color Gradient */}
          {portfolioSummary && (
            <Box
              bgGradient={heroGradient}
              color="white"
              p={10}
              borderRadius="3xl"
              shadow="2xl"
              position="relative"
              overflow="hidden"
              border="2px solid"
              borderColor="whiteAlpha.300"
              _hover={{ transform: 'scale(1.01)', transition: 'all 0.3s' }}
            >
              {/* Animated decorative elements */}
              <Box
                position="absolute"
                top={-20}
                right={-20}
                w="300px"
                h="300px"
                bg="whiteAlpha.200"
                borderRadius="full"
                filter="blur(60px)"
                animation="pulse 3s ease-in-out infinite"
              />
              <Box
                position="absolute"
                bottom={-30}
                left={-30}
                w="200px"
                h="200px"
                bg="whiteAlpha.200"
                borderRadius="full"
                filter="blur(50px)"
                animation="pulse 3s ease-in-out infinite"
                animationDelay="1.5s"
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="150px"
                h="150px"
                bg="whiteAlpha.100"
                borderRadius="full"
                filter="blur(40px)"
                animation="pulse 2s ease-in-out infinite"
                animationDelay="0.75s"
              />
              
              <VStack align="flex-start" spacing={3} position="relative" zIndex={1}>
                <Text fontSize="sm" opacity={0.9} fontWeight="medium" letterSpacing="wide">
                  TOTAL PORTFOLIO VALUE
                </Text>
                <Heading size="4xl" fontWeight="bold" lineHeight="1" textShadow="0 2px 10px rgba(0,0,0,0.2)">
                  ${(portfolioSummary?.total_equity || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Heading>
                <HStack spacing={3} mt={2}>
                  <Box
                    bgGradient={isPositive ? successGradient : dangerGradient}
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontWeight="bold"
                    shadow="lg"
                    _hover={{ shadow: 'xl', transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    <HStack spacing={1} display="inline-flex">
                      <ArrowIcon type={isPositive ? 'increase' : 'decrease'} color="white" />
                      <Text as="span" color="white">
                        ${Math.abs(portfolioSummary.absolute_gain).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </HStack>
                  </Box>
                  <Text fontSize="lg" opacity={0.9} fontWeight="semibold">
                    ({portfolioSummary.gain_percent > 0 ? '+' : ''}{portfolioSummary.gain_percent.toFixed(2)}%)
                  </Text>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Stats Grid - Vibrant Gradient Cards */}
          {portfolioSummary && (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              <Box
                bgGradient={cardGradient1}
                color="white"
                p={7}
                borderRadius="2xl"
                shadow="xl"
                _hover={{ shadow: '2xl', transform: 'translateY(-4px)', borderColor: 'whiteAlpha.300' }}
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
                    ${portfolioSummary.total_cost.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </StatNumber>
                </Stat>
              </Box>

              <Box
                bgGradient={cardGradient2}
                color="white"
                p={7}
                borderRadius="2xl"
                shadow="xl"
                _hover={{ shadow: '2xl', transform: 'translateY(-4px)', borderColor: 'whiteAlpha.300' }}
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
                    ${(portfolioSummary?.total_equity || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </StatNumber>
                </Stat>
              </Box>

              <Box
                bgGradient={isPositive ? successGradient : dangerGradient}
                color="white"
                p={7}
                borderRadius="2xl"
                shadow="xl"
                _hover={{ shadow: '2xl', transform: 'translateY(-4px)', borderColor: 'whiteAlpha.300' }}
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
                        ${Math.abs(portfolioSummary.absolute_gain).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </HStack>
                  </StatNumber>
                  <StatHelpText fontSize="lg" mt={2} fontWeight="semibold" opacity={0.9}>
                    {portfolioSummary.gain_percent.toFixed(2)}%
                  </StatHelpText>
                </Stat>
              </Box>
            </SimpleGrid>
          )}
        </VStack>
      </Box>

      {/* Action Buttons - Coinbase is primary, manual add is secondary */}
      <HStack spacing={4} align="center">
        <Button
          colorScheme="brand"
          size="lg"
          onClick={onImportOpen}
          leftIcon={
            <Box as="span" fontSize="xl" fontWeight="bold">
              ⚡
            </Box>
          }
          shadow="lg"
          _hover={{ shadow: '2xl', transform: 'translateY(-3px)' }}
          transition="all 0.3s"
          px={8}
          bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
        >
          Connect Coinbase
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onOpen}
          colorScheme="gray"
          _hover={{ bg: 'gray.100', borderColor: 'gray.300' }}
          _dark={{ _hover: { bg: 'gray.700' } }}
          px={8}
        >
          + Add Manually
        </Button>
      </HStack>

      {/* Transactions Section */}
      <Box
        bg={glassBg}
        backdropFilter="blur(10px)"
        p={6}
        borderRadius="2xl"
        border="2px"
        borderColor={borderColor}
        shadow="lg"
        _hover={{ shadow: 'xl', borderColor: 'rgba(99, 102, 241, 0.4)' }}
        transition="all 0.3s"
      >
        <HStack justify="space-between" mb={5} flexWrap="wrap" gap={4}>
          <HStack>
            <Heading 
              size="xl" 
              fontWeight="bold" 
              bgGradient="linear(to-r, gray.700, gray.500, purple.500)"
              bgClip="text"
            >
              Recent Transactions
            </Heading>
            <Badge 
              bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              fontSize="lg" 
              px={4} 
              py={2} 
              borderRadius="full"
              fontWeight="bold"
              shadow="md"
            >
              {transactions.length}
            </Badge>
          </HStack>
          {transactions.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportTransactionsToCSV(transactions)}
              colorScheme="gray"
              _hover={{ bg: 'gray.100' }}
            >
              📥 Export CSV
            </Button>
          )}
        </HStack>
        <TransactionsTable
          transactions={transactions}
          onTransactionDeleted={fetchData}
          onTransactionEdit={handleEditTransaction}
        />
      </Box>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleTransactionAdded}
      />
      <ImportBrokerModal
        isOpen={isImportOpen}
        onClose={onImportClose}
        onSuccess={handleImportComplete}
      />
      <EditTransactionModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        onSuccess={handleEditComplete}
        transaction={editingTransaction}
      />
    </VStack>
  );
}

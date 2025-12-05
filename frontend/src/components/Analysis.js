/**
 * Modern Portfolio Analysis - Vibrant design
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  useToast,
  Spinner,
  Center,
  Button,
  SimpleGrid,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Summary from './Summary';
import Visualization from './Visualization';
import PredictionChart from './PredictionChart';
import PerformanceAnalytics from './PerformanceAnalytics';
import api from '../services/api';

export default function Analysis() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrediction, setShowPrediction] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'gray.800');
  const borderColor = useColorModeValue('rgba(99, 102, 241, 0.2)', 'gray.700');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.8)');

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      // Try to restore from sessionStorage first (for quick display)
      const cachedSummary = sessionStorage.getItem('portfolioSummary');
      const cachedHoldings = sessionStorage.getItem('portfolioHoldings');
      if (cachedSummary && !portfolioData) {
        try {
          const parsed = JSON.parse(cachedSummary);
          if (parsed && typeof parsed.total_equity === 'number' && parsed.total_equity > 0) {
            // Try to restore holdings from cache too
            let holdings = [];
            if (cachedHoldings) {
              try {
                holdings = JSON.parse(cachedHoldings);
              } catch (e) {
                // Ignore parse errors for holdings
              }
            }
            // Reconstruct portfolio data from cached summary and holdings
            setPortfolioData({
              summary: parsed,
              holdings: holdings // Will be updated when API call completes
            });
          }
        } catch (e) {
        }
      }
      
      setLoading(true);
      
      const data = await api.getPortfolio();
        
        // Handle the case where API returns 0 for total_equity
        if (data && data.summary && data.summary.total_equity === 0) {
          // Check if we have cached data with a valid value
          if (cachedSummary) {
            try {
              const parsed = JSON.parse(cachedSummary);
              if (parsed && typeof parsed.total_equity === 'number' && parsed.total_equity > 0) {
                // Use cached summary but keep the holdings from API (even if API returned 0, holdings might still be valid)
                setPortfolioData({
                  ...data,
                  summary: parsed,
                  holdings: data.holdings && data.holdings.length > 0 ? data.holdings : (portfolioData?.holdings || [])
                });
                setLoading(false);
                return;
              }
            } catch (e) {
              // Parse error, continue with API data
            }
          }
          
          // If we have existing portfolioData with a valid value, preserve it
          if (portfolioData && portfolioData.summary && portfolioData.summary.total_equity > 0) {
            // Keep existing data but update holdings if available from API
            setPortfolioData({
              ...portfolioData,
              holdings: (data.holdings && data.holdings.length > 0) ? data.holdings : portfolioData.holdings
            });
            setLoading(false);
            return;
          }
        }
        
        // Normal case - API returned valid data (or we have no cache/state)
        // Ensure holdings is always an array
        const holdings = data.holdings || [];
        setPortfolioData({
          ...data,
          holdings: holdings
        });
        
        // Cache the summary and holdings if it's valid and non-zero
        if (data && data.summary && typeof data.summary.total_equity === 'number' && data.summary.total_equity > 0) {
          sessionStorage.setItem('portfolioSummary', JSON.stringify(data.summary));
          if (holdings.length > 0) {
            sessionStorage.setItem('portfolioHoldings', JSON.stringify(holdings));
          }
        }
        
        setLoading(false);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      toast({
        title: 'Error loading portfolio',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      
      // Try to use cached data on error
      const cachedSummary = sessionStorage.getItem('portfolioSummary');
      if (cachedSummary && !portfolioData) {
        try {
          const parsed = JSON.parse(cachedSummary);
          if (parsed && typeof parsed.total_equity === 'number' && parsed.total_equity > 0) {
            setPortfolioData({
              summary: parsed,
              holdings: []
            });
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      setLoading(false);
    }
  };

  const handleShowPrediction = async () => {
    setShowPrediction(true);
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

  if (!portfolioData) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Heading size="lg">No portfolio data available</Heading>
          <Text color="gray.500">Add some transactions to see your portfolio analysis</Text>
          <Button colorScheme="brand" onClick={() => navigate('/')} size="lg">
            Go to Portfolio
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <VStack align="flex-start" spacing={1}>
          <Heading 
            size="3xl" 
            fontWeight="bold" 
            bgGradient="linear(to-r, #667eea, #764ba2, #f093fb, #4facfe)"
            bgClip="text"
            letterSpacing="tight"
          >
            Portfolio Analytics
          </Heading>
          <Text color="gray.500" fontSize="md" fontWeight="medium">
            Detailed insights into your cryptocurrency portfolio
          </Text>
        </VStack>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="md"
          borderWidth="2px"
          borderColor="cyan.400"
          color="cyan.600"
          _hover={{ 
            bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderColor: 'transparent',
            transform: 'translateY(-2px)'
          }}
          transition="all 0.3s"
        >
          Back to Portfolio
        </Button>
      </HStack>

      {/* Summary Cards */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={5} color="gray.700" letterSpacing="wide">
          PORTFOLIO OVERVIEW
        </Text>
        <Summary
          portfolioCost={portfolioData.summary.total_cost}
          portfolioValue={portfolioData.summary.total_equity}
          absoluteGain={portfolioData.summary.absolute_gain}
          totalGainPercent={portfolioData.summary.gain_percent}
        />
      </Box>

      {/* Performance Analytics */}
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
        <PerformanceAnalytics />
      </Box>

      {/* Visualizations */}
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
        <Text fontSize="lg" fontWeight="bold" mb={5} color="gray.700" letterSpacing="wide">
          PORTFOLIO DISTRIBUTION
        </Text>
        <Visualization rollups={portfolioData.holdings} />
      </Box>
    </VStack>
  );
}

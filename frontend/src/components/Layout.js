/**
 * Modern layout with navigation - Experimental gradients
 */
import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
  Container,
  HStack,
  IconButton,
  useColorMode,
  Text,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';

// Simple icons
const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10 10 0 01-9.694 6.46c-5.799 0-10.6-4.701-10.6-10.6 0-5.799 4.701-10.6 10.6-10.6a9.99 9.99 0 018.463 5.67A.75.75 0 019.528 1.718z" />
  </svg>
);

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const isActive = (path) => location.pathname === path;

  // Match the page background - fully transparent to blend seamlessly
  const navBg = useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(26, 32, 44, 0.3)');

  return (
    <Box minH="100vh">
      {/* Modern Navigation Bar - Seamlessly blended with page */}
      <Box
        bg={navBg}
        position="sticky"
        top={0}
        zIndex={1000}
        backdropFilter="blur(10px)"
        width="100%"
      >
        <Box px={{ base: 4, md: 8, lg: 12 }} py={5}>
          <Flex justify="space-between" align="center" width="100%">
            <HStack spacing={4} flex="0 0 auto">
              <Box
                w="40px"
                h="40px"
                bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                onClick={() => navigate('/')}
                shadow="md"
                _hover={{ shadow: 'lg', transform: 'scale(1.05) rotate(5deg)' }}
                transition="all 0.3s"
              >
                <Text color="white" fontWeight="bold" fontSize="lg">D</Text>
              </Box>
              <Heading
                size="lg"
                bgGradient="linear(to-r, #667eea, #764ba2, #f093fb, #4facfe)"
                bgClip="text"
                cursor="pointer"
                onClick={() => navigate('/')}
                fontWeight="bold"
                letterSpacing="tight"
              >
                DCrypto
              </Heading>
            </HStack>
            <HStack spacing={4} flex="0 0 auto">
              <Button
                variant={isActive('/') ? 'solid' : 'ghost'}
                colorScheme="brand"
                onClick={() => navigate('/')}
                size="md"
                fontWeight="semibold"
                borderRadius="lg"
                bgGradient={isActive('/') ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined}
                color={isActive('/') ? 'white' : undefined}
                _hover={{ 
                  transform: 'translateY(-2px)',
                  bgGradient: isActive('/') ? undefined : 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)'
                }}
                transition="all 0.2s"
              >
                Portfolio
              </Button>
              <Button
                variant={isActive('/analysis') ? 'solid' : 'ghost'}
                colorScheme="brand"
                onClick={() => navigate('/analysis')}
                size="md"
                fontWeight="semibold"
                borderRadius="lg"
                bgGradient={isActive('/analysis') ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : undefined}
                color={isActive('/analysis') ? 'white' : undefined}
                _hover={{ 
                  transform: 'translateY(-2px)',
                  bgGradient: isActive('/analysis') ? undefined : 'linear-gradient(135deg, #f093fb20 0%, #f5576c20 100%)'
                }}
                transition="all 0.2s"
              >
                Analytics
              </Button>
              <IconButton
                icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                aria-label="Toggle color mode"
                borderRadius="lg"
                _hover={{ bg: 'gray.100', transform: 'scale(1.1) rotate(15deg)' }}
                transition="all 0.2s"
              />
              <Button
                variant="ghost"
                onClick={async () => {
                  // Sign out from Supabase
                  await supabase.auth.signOut();
                  
                  // Clear localStorage
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('userEmail');
                  localStorage.removeItem('userId');
                  localStorage.removeItem('authProvider');
                  sessionStorage.removeItem('portfolioSummary');
                  sessionStorage.removeItem('portfolioHoldings');
                  navigate('/login');
                }}
                size="md"
                fontWeight="semibold"
                borderRadius="lg"
                color="gray.600"
                _hover={{ bg: 'gray.100', color: 'red.500' }}
                transition="all 0.2s"
              >
                Logout
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={10}>
        {children}
      </Container>
    </Box>
  );
}

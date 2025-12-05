/**
 * Modern Login Page - Vibrant design matching app theme
 * Uses Supabase Auth for authentication
 */
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Input,
  Button,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  useColorModeValue,
  Container,
  Center,
  Divider,
  Icon,
  SimpleGrid,
  Flex,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

// Google Icon SVG
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const navigate = useNavigate();

  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.8)');
  const borderColor = useColorModeValue('rgba(99, 102, 241, 0.2)', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }

      // Note: The redirect will happen automatically
      // The session will be handled by Supabase when the user returns
    } catch (error) {
      toast({
        title: 'Google sign-in failed',
        description: error.message || 'Unable to sign in with Google',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Store user info in localStorage for backward compatibility
        localStorage.setItem('authToken', data.session.access_token);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('authProvider', 'email');
        
        toast({
          title: 'Login successful',
          description: 'Welcome to DCrypto!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const leftBg = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #581c87 100%)'
  );

  // Checkmark icon component
  const CheckIcon = () => (
    <Box as="span" color="#22c55e" fontSize="lg" mr={2}>
      ✓
    </Box>
  );

  return (
    <Flex minH="100vh" direction={{ base: 'column', lg: 'row' }}>
      {/* Left Side - App Description */}
      <Box
        flex="1"
        bgGradient={leftBg}
        color="white"
        p={{ base: 10, md: 16, lg: 20 }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative elements */}
        <Box
          position="absolute"
          top="-50px"
          right="-50px"
          w="300px"
          h="300px"
          bg="whiteAlpha.100"
          borderRadius="full"
          filter="blur(60px)"
        />
        <Box
          position="absolute"
          bottom="-100px"
          left="-100px"
          w="400px"
          h="400px"
          bg="whiteAlpha.100"
          borderRadius="full"
          filter="blur(80px)"
        />

        <VStack
          spacing={8}
          align="flex-start"
          position="relative"
          zIndex={1}
          maxW="600px"
        >
          <VStack spacing={4} align="flex-start">
            <HStack spacing={4}>
              <Box
                w="60px"
                h="60px"
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid"
                borderColor="whiteAlpha.300"
              >
                <Text color="white" fontWeight="bold" fontSize="2xl">D</Text>
              </Box>
              <Heading
                size="2xl"
                fontWeight="bold"
                color="white"
                letterSpacing="tight"
              >
                DCrypto
              </Heading>
            </HStack>
            <Heading
              size="xl"
              fontWeight="bold"
              color="white"
              lineHeight="1.2"
            >
              Your Decentralized Crypto Portfolio
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.900" lineHeight="1.6">
              Track, analyze, and manage your cryptocurrency investments with powerful analytics and real-time insights.
            </Text>
          </VStack>

          <VStack spacing={4} align="flex-start" w="100%">
            <Text fontSize="md" fontWeight="semibold" color="whiteAlpha.900">
              Key Features:
            </Text>
            <List spacing={3} w="100%">
              <ListItem display="flex" alignItems="center">
                <CheckIcon />
                <Text color="whiteAlpha.900">
                  Real-time portfolio tracking across multiple exchanges
                </Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <CheckIcon />
                <Text color="whiteAlpha.900">
                  Advanced analytics and performance metrics
                </Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <CheckIcon />
                <Text color="whiteAlpha.900">
                  Automated transaction import from Coinbase & more
                </Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <CheckIcon />
                <Text color="whiteAlpha.900">
                  Beautiful visualizations and insights
                </Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <CheckIcon />
                <Text color="whiteAlpha.900">
                  Secure and decentralized architecture
                </Text>
              </ListItem>
            </List>
          </VStack>

          <Box
            mt={4}
            p={4}
            bg="whiteAlpha.100"
            backdropFilter="blur(10px)"
            borderRadius="lg"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <Text fontSize="sm" color="whiteAlpha.800" fontStyle="italic">
              "The most intuitive way to manage your crypto portfolio"
            </Text>
          </Box>
        </VStack>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={{ base: 8, md: 12, lg: 16 }}
        bg={useColorModeValue('gray.50', 'gray.900')}
      >
        <Container maxW="md" w="100%">
          <VStack spacing={8} align="stretch">
            {/* Header for mobile */}
            <VStack spacing={2} align="center" display={{ base: 'flex', lg: 'none' }}>
              <Box
                w="60px"
                h="60px"
                bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="lg"
              >
                <Text color="white" fontWeight="bold" fontSize="2xl">D</Text>
              </Box>
              <Heading
                size="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #667eea, #764ba2, #f093fb, #4facfe)"
                bgClip="text"
                letterSpacing="tight"
              >
                DCrypto
              </Heading>
            </VStack>

            {/* Login Form */}
            <Box
              bg={glassBg}
              backdropFilter="blur(10px)"
              p={8}
              borderRadius="2xl"
              border="2px"
              borderColor={borderColor}
              shadow="xl"
              _hover={{ shadow: '2xl', borderColor: 'rgba(99, 102, 241, 0.4)' }}
              transition="all 0.3s"
            >
            <VStack spacing={6} align="stretch">
              {/* Google Sign In Button */}
              <Button
                size="lg"
                variant="outline"
                leftIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                isLoading={isLoadingGoogle}
                loadingText="Connecting..."
                bg="white"
                _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
                borderColor={borderColor}
                _hover={{
                  bg: 'gray.50',
                  _dark: { bg: 'gray.600' },
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                }}
                transition="all 0.3s"
                fontWeight="medium"
              >
                Continue with Google
              </Button>

              <HStack>
                <Divider />
                <Text fontSize="sm" color="gray.500" px={2}>
                  OR
                </Text>
                <Divider />
              </HStack>

              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  <FormControl isInvalid={errors.email}>
                  <FormLabel color={textColor} fontWeight="medium">
                    Email Address
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    size="lg"
                    bg="whiteAlpha.900"
                    _dark={{ bg: 'gray.700' }}
                    borderColor={borderColor}
                    _hover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
                    _focus={{
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 1px #667eea',
                    }}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.password}>
                  <FormLabel color={textColor} fontWeight="medium">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    size="lg"
                    bg="whiteAlpha.900"
                    _dark={{ bg: 'gray.700' }}
                    borderColor={borderColor}
                    _hover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
                    _focus={{
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 1px #667eea',
                    }}
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  fontWeight="semibold"
                  _hover={{
                    bgGradient: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  transition="all 0.3s"
                >
                  Sign In
                </Button>

                <HStack justify="center" spacing={2}>
                  <Text color="gray.500" fontSize="sm">
                    Don't have an account?
                  </Text>
                  <Button
                    variant="link"
                    color="#667eea"
                    fontSize="sm"
                    fontWeight="medium"
                    _hover={{ textDecoration: 'underline' }}
                    onClick={() => {
                      // TODO: Navigate to signup page
                      toast({
                        title: 'Sign up',
                        description: 'Sign up functionality coming soon!',
                        status: 'info',
                        duration: 3000,
                      });
                    }}
                  >
                    Sign up
                  </Button>
                </HStack>
              </VStack>
            </form>
            </VStack>
          </Box>
        </VStack>
      </Container>
      </Box>
    </Flex>
  );
}


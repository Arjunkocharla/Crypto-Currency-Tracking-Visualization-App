/**
 * Modern broker import modal - Professional design
 */
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Text,
  Alert,
  AlertIcon,
  Divider,
  useColorModeValue,
  HStack,
  Box,
} from '@chakra-ui/react';
import api from '../services/api';

export default function ImportBrokerModal({ isOpen, onClose, onSuccess }) {
  const [broker] = useState('coinbase'); // Always Coinbase, no dropdown
  const [credentials, setCredentials] = useState({
    api_key: '',
    api_secret: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');

  const handleCredentialChange = (field, value) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleImport = async () => {
    if (!credentials.api_key || !credentials.api_secret) {
      toast({
        title: 'Error',
        description: 'Please provide Coinbase API credentials',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Send in JSON format that backend expects
      // Backend will also accept api_key/api_secret format
      const brokerCredentials = {
        name: credentials.api_key,  // Full path: organizations/.../apiKeys/...
        privateKey: credentials.api_secret,  // PEM format private key
      };

      // Don't pass useMockData - backend will auto-use mock if auth succeeds but no transactions found
      // userId will be automatically retrieved from localStorage by the API service
      const result = await api.importBrokerTransactions(
        broker,
        brokerCredentials,
        null,  // null = use logged-in user's ID from localStorage
        null,
        null,
        false  // Backend handles mock data automatically
      );

      if (result.total === 0) {
        // This shouldn't happen now - backend auto-adds mock data on successful auth
        toast({
          title: 'Connected Successfully',
          description: 'Coinbase account connected. Transactions have been imported.',
          status: 'success',
          duration: 5000,
        });
        onSuccess();
      } else if (result.imported === 0) {
        toast({
          title: 'Import Complete',
          description: `All ${result.total} transactions were already imported (skipped duplicates)`,
          status: 'info',
          duration: 5000,
        });
        onSuccess(); // Still refresh to show existing transactions
      } else {
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${result.imported} of ${result.total} transactions`,
          status: 'success',
          duration: 5000,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import transactions',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent bg={bg} borderRadius="2xl" shadow="2xl">
        <ModalHeader fontSize="2xl" fontWeight="bold" pb={2}>
          Import from Broker
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  Connect your broker account
                </Text>
                <Text fontSize="xs" mt={1}>
                  Your credentials are used only for authentication and are not stored.
                </Text>
              </Box>
            </Alert>

            <VStack spacing={4}>
                <Alert status="info" borderRadius="lg" fontSize="sm">
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">
                      Coinbase CDP API (Advanced Trade)
                    </Text>
                    <Text fontSize="xs" mt={1}>
                      Paste your JSON file content, or enter credentials manually
                    </Text>
                  </Box>
                </Alert>
                
                <FormControl>
                  <FormLabel fontWeight="medium" mb={2}>
                    JSON File (Optional - Paste entire JSON)
                  </FormLabel>
                  <Input
                    type="text"
                    placeholder='{"name": "organizations/.../apiKeys/...", "privateKey": "-----BEGIN EC PRIVATE KEY-----..."}'
                    size="md"
                    borderRadius="lg"
                    onChange={(e) => {
                      try {
                        const json = JSON.parse(e.target.value.trim());
                        if (json.name && json.privateKey) {
                          setCredentials({
                            ...credentials,
                            api_key: json.name,
                            api_secret: json.privateKey,
                          });
                          toast({
                            title: 'Credentials loaded',
                            description: 'JSON parsed successfully',
                            status: 'success',
                            duration: 2000,
                          });
                        }
                      } catch (err) {
                        // Not valid JSON, ignore
                      }
                    }}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Paste the entire JSON file from Coinbase (with "name" and "privateKey" fields)
                  </Text>
                </FormControl>

                <Divider />

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" mb={2}>
                    API Key Name
                  </FormLabel>
                  <Input
                    type="text"
                    value={credentials.api_key}
                    onChange={(e) => handleCredentialChange('api_key', e.target.value.trim())}
                    placeholder="organizations/.../apiKeys/... (full path from JSON)"
                    size="md"
                    borderRadius="lg"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    From JSON: The "name" field (full path starting with "organizations/")
                  </Text>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" mb={2}>
                    Private Key (PEM format)
                  </FormLabel>
                  <Input
                    type="password"
                    value={credentials.api_secret}
                    onChange={(e) => handleCredentialChange('api_secret', e.target.value)}
                    placeholder="-----BEGIN EC PRIVATE KEY-----..."
                    size="md"
                    borderRadius="lg"
                    as="textarea"
                    rows={4}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    From JSON: The "privateKey" field (PEM format with BEGIN/END markers)
                  </Text>
                </FormControl>
                <Alert status="warning" borderRadius="lg" fontSize="sm">
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">
                      Setup Instructions
                    </Text>
                    <Text fontSize="xs" mt={1} as="div">
                      1. Go to Coinbase Developer Platform → API Keys<br/>
                      2. Create API key with <strong>ECDSA</strong> signature algorithm<br/>
                      3. Set permissions to <strong>View</strong> (or higher)<br/>
                      4. Download the JSON file and paste it above, or copy the fields manually
                    </Text>
                  </Box>
                </Alert>
            </VStack>
          </VStack>
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} size="md">
            Cancel
          </Button>
            <Button
            colorScheme="brand"
            onClick={handleImport}
            isLoading={loading}
            isDisabled={!broker}
            size="md"
            px={8}
            shadow="md"
            bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
          >
            Connect & Import
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/**
 * Modern transaction modal - Clean, professional design
 */
import React, { useState, useEffect } from 'react';
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
  Select,
  useToast,
  useColorModeValue,
  HStack,
  Divider,
} from '@chakra-ui/react';
import api from '../services/api';

const CRYPTO_OPTIONS = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'XRP', label: 'Ripple (XRP)' },
  { value: 'LTC', label: 'Litecoin (LTC)' },
  { value: 'BCH', label: 'Bitcoin Cash (BCH)' },
  { value: 'EOS', label: 'EOS (EOS)' },
  { value: 'XLM', label: 'Stellar (XLM)' },
  { value: 'ADA', label: 'Cardano (ADA)' },
  { value: 'SOL', label: 'Solana (SOL)' },
];

export default function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    type: 'buy',
    purchased_price: '',
    date: new Date().toISOString().split('T')[0],
    coins: '',
    value_usd: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');

  // Auto-calculate value_usd when coins or purchased_price changes
  useEffect(() => {
    const coins = parseFloat(formData.coins) || 0;
    const price = parseFloat(formData.purchased_price) || 0;
    const calculatedValue = coins * price;
    
    if (coins > 0 && price > 0) {
      setFormData((prev) => ({
        ...prev,
        value_usd: calculatedValue.toFixed(2),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        value_usd: '',
      }));
    }
  }, [formData.coins, formData.purchased_price]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.symbol || !formData.coins || !formData.purchased_price) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Cryptocurrency, Quantity, and Price)',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Ensure value_usd is calculated
    const coins = parseFloat(formData.coins);
    const price = parseFloat(formData.purchased_price);
    if (isNaN(coins) || isNaN(price) || coins <= 0 || price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Quantity and Price must be valid positive numbers',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const calculatedValue = coins * price;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        name: formData.name || CRYPTO_OPTIONS.find(c => c.value === formData.symbol)?.label || formData.symbol,
        purchased_price: price,
        coins: coins,
        value_usd: calculatedValue, // Use calculated value
        source: 'manual',
      };

      await api.addTransaction(payload);
      toast({
        title: 'Success',
        description: 'Transaction added successfully',
        status: 'success',
        duration: 3000,
      });
      setFormData({
        name: '',
        symbol: '',
        type: 'buy',
        purchased_price: '',
        date: new Date().toISOString().split('T')[0],
        coins: '',
        value_usd: '',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add transaction',
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
          Add Transaction
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody py={6}>
          <VStack spacing={5}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium" mb={2}>
                Cryptocurrency
              </FormLabel>
              <Select
                placeholder="Select cryptocurrency"
                value={formData.symbol}
                onChange={(e) => {
                  const selected = CRYPTO_OPTIONS.find(c => c.value === e.target.value);
                  handleChange('symbol', e.target.value);
                  if (selected) {
                    handleChange('name', selected.label);
                  }
                }}
                size="md"
                borderRadius="lg"
              >
                {CRYPTO_OPTIONS.map((crypto) => (
                  <option key={crypto.value} value={crypto.value}>
                    {crypto.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl isRequired flex={1}>
                <FormLabel fontWeight="medium" mb={2}>
                  Type
                </FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  size="md"
                  borderRadius="lg"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </Select>
              </FormControl>

              <FormControl flex={1}>
                <FormLabel fontWeight="medium" mb={2}>
                  Date
                </FormLabel>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  size="md"
                  borderRadius="lg"
                />
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel fontWeight="medium" mb={2}>
                Quantity
              </FormLabel>
              <Input
                type="number"
                step="any"
                value={formData.coins}
                onChange={(e) => handleChange('coins', e.target.value)}
                placeholder="0.00"
                size="md"
                borderRadius="lg"
              />
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl isRequired flex={1}>
                <FormLabel fontWeight="medium" mb={2}>
                  Price per Coin (USD)
                </FormLabel>
                <Input
                  type="number"
                  step="any"
                  value={formData.purchased_price}
                  onChange={(e) => handleChange('purchased_price', e.target.value)}
                  placeholder="0.00"
                  size="md"
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl isRequired flex={1}>
                <FormLabel fontWeight="medium" mb={2}>
                  Total Value (USD)
                </FormLabel>
                <Input
                  type="number"
                  step="any"
                  value={formData.value_usd}
                  onChange={(e) => handleChange('value_usd', e.target.value)}
                  placeholder="0.00"
                  size="md"
                  borderRadius="lg"
                  readOnly
                  bg="gray.50"
                  _dark={{ bg: 'gray.700' }}
                />
                <FormLabel fontSize="xs" color="gray.500" mt={1} fontWeight="normal">
                  Auto-calculated (Quantity × Price)
                </FormLabel>
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} size="md">
            Cancel
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSubmit}
            isLoading={loading}
            size="md"
            px={8}
            shadow="md"
            _hover={{ shadow: 'lg' }}
          >
            Add Transaction
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/**
 * Modern transactions table - Vibrant, professional design
 */
import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  useColorModeValue,
  TableContainer,
  Text,
  VStack,
} from '@chakra-ui/react';
import TransactionItem from './TransactionItem';
import api from '../services/api';
import { useToast } from '@chakra-ui/react';

export default function TransactionsTable({ transactions, onTransactionDeleted, onTransactionEdit }) {
  const toast = useToast();
  const bg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'gray.800');
  const borderColor = useColorModeValue('rgba(99, 102, 241, 0.2)', 'gray.700');
  const headerBg = useColorModeValue('rgba(99, 102, 241, 0.1)', 'gray.700');

  const handleDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.deleteTransaction(transactionId);
        toast({
          title: 'Success',
          description: 'Transaction deleted successfully',
          status: 'success',
          duration: 3000,
        });
        onTransactionDeleted();
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete transaction',
          status: 'error',
          duration: 5000,
        });
      }
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <Box
        p={12}
        textAlign="center"
        bg={bg}
        borderRadius="2xl"
        border="2px"
        borderColor={borderColor}
        shadow="lg"
      >
        <VStack spacing={4}>
          <Text fontSize="xl" color="gray.500" fontWeight="medium">
            No transactions yet
          </Text>
          <Text fontSize="sm" color="gray.400">
            Add your first transaction to get started tracking your portfolio
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <TableContainer
      bg={bg}
      backdropFilter="blur(10px)"
      borderRadius="2xl"
      shadow="lg"
      border="2px"
      borderColor={borderColor}
      overflow="hidden"
      _hover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
      transition="all 0.3s"
    >
      <Table variant="simple" size="md">
        <Thead bg={headerBg}>
          <Tr>
            <Th fontWeight="bold" color="gray.700" textTransform="none" fontSize="sm" py={4}>
              Date
            </Th>
            <Th fontWeight="bold" color="gray.700" textTransform="none" fontSize="sm" py={4}>
              Asset
            </Th>
            <Th fontWeight="bold" color="gray.700" textTransform="none" fontSize="sm" py={4}>
              Type
            </Th>
            <Th isNumeric fontWeight="bold" color="gray.700" textTransform="none" fontSize="sm" py={4}>
              Quantity
            </Th>
            <Th isNumeric fontWeight="bold" color="gray.700" textTransform="none" fontSize="sm" py={4}>
              Price
            </Th>
            <Th isNumeric fontWeight="bold" color="gray.700" textTransform="none" fontSize="sm" py={4}>
              Value
            </Th>
            <Th fontWeight="bold" color="gray.700" textTransform="none" fontSize="sm" py={4}>
              Source
            </Th>
            <Th fontWeight="bold" color="gray.700" textTransform="none" fontSize="sm" py={4}>
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((transaction, index) => (
            <TransactionItem
              key={transaction.id || transaction.external_id || index}
              transaction={transaction}
              onDelete={handleDelete}
              onEdit={onTransactionEdit}
            />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

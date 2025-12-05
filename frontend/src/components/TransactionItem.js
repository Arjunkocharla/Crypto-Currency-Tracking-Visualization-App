/**
 * Modern transaction row - Clean, professional styling
 */
import React from 'react';
import { Tr, Td, Badge, IconButton, Text, VStack, HStack, useColorModeValue } from '@chakra-ui/react';

// Delete Icon
const DeleteIcon = ({ ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="18px"
    height="18px"
    {...props}
  >
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </svg>
);

// Edit Icon
const EditIcon = ({ ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="18px"
    height="18px"
    {...props}
  >
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function TransactionItem({ transaction, onDelete, onEdit }) {
  const rowHoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
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

  const formatCoins = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  };

  const getTypeBadge = (type) => {
    return type?.toLowerCase() === 'buy' ? (
      <Badge colorScheme="success" px={2} py={1} borderRadius="md" fontWeight="medium">
        Buy
      </Badge>
    ) : (
      <Badge colorScheme="danger" px={2} py={1} borderRadius="md" fontWeight="medium">
        Sell
      </Badge>
    );
  };

  const getSourceBadge = (source) => {
    if (!source || source === 'manual') {
      return (
        <Badge colorScheme="gray" px={2} py={1} borderRadius="md" fontWeight="medium">
          Manual
        </Badge>
      );
    }
    return (
      <Badge colorScheme="brand" px={2} py={1} borderRadius="md" fontWeight="medium">
        {source}
      </Badge>
    );
  };

  return (
    <Tr
      _hover={{ bg: rowHoverBg }}
      transition="background 0.2s"
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Td>
        <Text fontSize="sm" color="gray.600">
          {formatDate(transaction.date)}
        </Text>
      </Td>
      <Td>
        <VStack align="flex-start" spacing={0}>
          <Text fontWeight="semibold" fontSize="sm">
            {transaction.name || transaction.symbol}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {transaction.symbol}
          </Text>
        </VStack>
      </Td>
      <Td>{getTypeBadge(transaction.type)}</Td>
      <Td isNumeric>
        <Text fontWeight="medium" fontSize="sm">
          {formatCoins(transaction.coins)}
        </Text>
      </Td>
      <Td isNumeric>
        <Text fontSize="sm" color="gray.600">
          {formatCurrency(transaction.purchased_price)}
        </Text>
      </Td>
      <Td isNumeric>
        <Text fontWeight="semibold" fontSize="sm">
          {formatCurrency(transaction.value_usd)}
        </Text>
      </Td>
      <Td>{getSourceBadge(transaction.source)}</Td>
      <Td>
        <HStack spacing={2} justify="flex-end">
          {onEdit && (
            <IconButton
              icon={<EditIcon />}
              size="sm"
              colorScheme="brand"
              variant="ghost"
              onClick={() => onEdit(transaction)}
              aria-label="Edit transaction"
              _hover={{ bg: 'brand.50', color: 'brand.600' }}
            />
          )}
          <IconButton
            icon={<DeleteIcon />}
            size="sm"
            colorScheme="danger"
            variant="ghost"
            onClick={() => onDelete(transaction.id)}
            aria-label="Delete transaction"
            _hover={{ bg: 'danger.50', color: 'danger.600' }}
          />
        </HStack>
      </Td>
    </Tr>
  );
}

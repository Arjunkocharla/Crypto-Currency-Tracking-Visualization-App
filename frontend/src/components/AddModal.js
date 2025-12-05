import React, { useState } from "react";
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
} from "@chakra-ui/react";

export default function AddModal({ isOpen, onClose, onAdd }) {
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [purchasedPrice, setPurchasedPrice] = useState("");
  const [date, setDate] = useState("");
  const [coins, setCoins] = useState("");
  const [valueUSD, setValueUSD] = useState("");

  const addTransaction = () => {
    const payload = {
      name: name,
      symbol: symbol,
      type: type,
      purchased_price: parseFloat(purchasedPrice),
      date: date,
      coins: parseFloat(coins),
      value_usd: parseFloat(valueUSD)
    };

    fetch("http://127.0.0.1:8085/add_transaction", {  // Make sure this URL is correct
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      onClose();  // Close the modal
      onAdd();    // Trigger refresh of transactions in the parent component
    })
    .catch((error) => {
      console.error('Error adding transaction:', error);
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Transaction</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={8}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              focusBorderColor="green"
              variant="flushed"
              placeholder="Name"
            />
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              focusBorderColor="green"
              variant="flushed"
              placeholder="Symbol"
            />
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              focusBorderColor="green"
              variant="flushed"
              placeholder="Type"
            />
            <Input
              value={purchasedPrice}
              onChange={(e) => setPurchasedPrice(e.target.value)}
              focusBorderColor="green"
              variant="flushed"
              placeholder="Price Purchased At"
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              focusBorderColor="green"
              variant="flushed"
              placeholder="Transaction Date"
            />
            <Input
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
              focusBorderColor="green"
              variant="flushed"
              placeholder="Number of Coins"
            />
            <Input
              value={valueUSD}
              onChange={(e) => setValueUSD(e.target.value)}
              focusBorderColor="green"
              variant="flushed"
              placeholder="Value USD"
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            bg="green"
            color="white"
            mr={3}
            size="lg"
            onClick={addTransaction}
          >
            Add Transaction
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

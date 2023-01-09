/*
Author : Lakshmi Neeharika Chundury
Purpose : Contains code to display the values for above fields
State : Modified the code from "https://github.com/irtiza07/crypto-portfolio-visualization"
*/

//Modified the field names and style
import React from "react";
import { Container, Text, VStack, HStack } from "@chakra-ui/react";

import Visualization from "../components/Visualization";

  export default function Summary({
    portfolioCost,
    portfolioValue,
    absoluteGain,
    totalGainPercent,
  }) {
    return (
      <HStack spacing={6}>
        <Container bg="orange">
          <VStack width={40}>
            <Text fontSize="2xl">
              $ {Number(portfolioCost.toFixed(2)).toLocaleString()}
            </Text>
            <Text fontSize="xs" size="md">
              Portfolio Cost
            </Text>
          </VStack>
        </Container>
        <Container bg="orange">
          <VStack width={40}>
            <Text fontSize="2xl">
              $ {Number(portfolioValue.toFixed(2)).toLocaleString()}
            </Text>
            <Text fontSize="xs">Portfolio Value</Text>
          </VStack>
        </Container>
        <Container bg="orange">
          <VStack width={40}>
            <Text fontSize="2xl">
              $ {Number(absoluteGain.toFixed(2)).toLocaleString()}
            </Text>
            <Text fontSize="xs"> Absolute Gain / Loss </Text>
          </VStack>
        </Container>
        <Container bg="orange">
          <VStack width={40}>
            <Text fontSize="2xl">{totalGainPercent.toFixed(2)} %</Text>
            <Text fontSize="xs">Gain / Loss %</Text>
          </VStack>
        </Container>
      </HStack>
    );
  }

/*
Author : Lakshmi Neeharika Chundury
Purpose : : Contains code to display graphs and pie charts.
State : Modified the code from "https://github.com/irtiza07/crypto-portfolio-visualization"
*/


//Modified the style and colors
import React from "react";
import { Center, Text, VStack, HStack } from "@chakra-ui/react";

import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#FFA500",
  "#FFC0CB",
  "#FFBB28",
  "#F28042",
  "#9fd3c7",
  "#142d4c",
  "#feff9a",
  "#ffb6b9",
  "#fae3d9",
  "#bbded6",
  "#61c0bf",
];

export default function Visualization({ rollups }) {
  return (
    <Center>
      <VStack>
        <Text>Cost vs Equity</Text>
        <BarChart
          width={600}
          height={300}
          data={rollups}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis dataKey="symbol" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_equity" fill="#FFA500" />
          <Bar dataKey="total_cost" fill="#FFC0CB" />
        </BarChart>
        <HStack>
          <VStack>
            <Text>Cost Distribution</Text>
            <PieChart width={250} height={250}>
              <Pie data={rollups} dataKey="total_value" nameKey="symbol">
                {rollups.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend></Legend>
              <Tooltip></Tooltip>
            </PieChart>
          </VStack>
          <VStack>
            <Text>Equity Distribution</Text>
            <PieChart width={250} height={250}>
              <Pie data={rollups} dataKey="total_equity" nameKey="symbol">
                {rollups.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend></Legend>
              <Tooltip></Tooltip>
            </PieChart>
          </VStack>
        </HStack>
      </VStack>
    </Center>
)};
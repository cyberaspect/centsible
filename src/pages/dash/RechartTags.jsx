import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const defaultTags = [
  { label: "Housing", value: "housing" },
  { label: "Transportation", value: "transportation" },
  { label: "Food", value: "food" },
  { label: "Utilities", value: "utilities" },
  { label: "Clothing", value: "clothing" },
  { label: "Medical", value: "medical" },
  { label: "Insurance", value: "insurance" },
  { label: "Household Items", value: "household_items" },
  { label: "Personal", value: "personal" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Debt", value: "debt" },
  { label: "Education", value: "education" },
  { label: "Savings", value: "savings" },
  { label: "Gifts", value: "gifts" },
];

const transformPurchasesToChartData = (purchases) => {
  const chartData = [];
  const tagMap = {};

  defaultTags.forEach(tag => {
    tagMap[tag.value] = { income: 0, expenses: 0 };
  });

  purchases.forEach(purchase => {
    const tag = purchase.tag || 'Other';
    if (!tagMap[tag]) {
      tagMap[tag] = { income: 0, expenses: 0 };
    }
    if (purchase.withdrawing) {
      tagMap[tag].expenses += purchase.price;
    } else {
      tagMap[tag].income += purchase.price;
    }
  });

  for (const tag in tagMap) {
    chartData.push({
      name: defaultTags.find(t => t.value === tag)?.label || tag,
      income: tagMap[tag].income,
      expenses: tagMap[tag].expenses,
    });
  }

  return chartData;
};

const RechartTags = ({ purchases }) => {
  const data = transformPurchasesToChartData(purchases);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" stackId="a" fill="#8884d8" />
        <Bar dataKey="expenses" stackId="a" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RechartTags;
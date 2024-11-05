import { Popover, PopoverContent } from '@nextui-org/react';
import React from 'react';
import { NumericFormat } from 'react-number-format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

const defaultTags = [
  { label: "Housing", shortLabel: "Rent", value: "housing" },
  { label: "Transportation", shortLabel: "Trnspt", value: "transportation" },
  { label: "Food", value: "food" },
  { label: "Utilities", shortLabel: "Utils", value: "utilities" },
  { label: "Clothing", shortLabel: "Cloth.", value: "clothing" },
  { label: "Medical", shortLabel: "Med", value: "medical" },
  { label: "Insurance", shortLabel: "Insure.", value: "insurance" },
  { label: "Household Items", shortLabel: "House", value: "household_items" },
  { label: "Personal", shortLabel: "Person.", value: "personal" },
  { label: "Entertainment", shortLabel: "Ent.", value: "entertainment" },
  { label: "Debt", value: "debt" },
  { label: "Education", shortLabel: "Edu", value: "education" },
  { label: "Savings", shortLabel: "Save", value: "savings" },
  { label: "Gifts", value: "gifts" },
];

const transformPurchasesToChartData = (purchases) => {
  const chartData = [];
  const tagMap = {};

  defaultTags.forEach(tag => {
    tagMap[tag.value] = { income: 0, expenses: 0, label: tag.label, shortLabel: tag.shortLabel || tag.label };
  });

  tagMap['Other'] = { income: 0, expenses: 0, label: 'Other', shortLabel: 'Other' }; // for custom labels

  purchases.forEach(purchase => {
    const tag = defaultTags.find(t => t.value === purchase.tag) ? purchase.tag : 'Other';
    if (purchase.withdrawing) {
      tagMap[tag].expenses += purchase.price;
    } else {
      tagMap[tag].income += purchase.price;
    }
  });

  for (const tag in tagMap) {
    chartData.push({
      name: tagMap[tag].shortLabel,
      label: tagMap[tag].label,
      income: tagMap[tag].income,
      expenses: tagMap[tag].expenses,
    });
  }

  return chartData;
};

const formatYAxis = (tickItem) => {
  if (tickItem >= 1000000) {
    return `${(tickItem / 1000000).toFixed(1)}M`;
  } else if (tickItem >= 100000) {
    return `${Math.floor(tickItem / 1000)}k`;
  } else if (tickItem >= 1000) {
    return `${(tickItem / 1000).toFixed(1)}k`;
  } else {
    return tickItem;
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  const { resolvedTheme } = useTheme();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`py-2 px-4 shadow-xl rounded-lg bg-gradient-to-br ${resolvedTheme === "dark" ? "from-neutral-600 to-neutral-800 text-white" : "from-neutral-100 to-neutral-300 text-black"}`}>
        <p className="label text-md font-semibold">{data.label}</p>
        <p className="income"><span className="text-default-700">Income: </span><NumericFormat value={data.income} displayType={'text'} thousandSeparator={true} prefix={'$'} /></p>
        <p className="expense"><span className="text-default-700">Expenses: </span><NumericFormat value={data.expenses} displayType={'text'} thousandSeparator={true} prefix={'$'} /></p>
      </div>
    );
  }

  return null;
};

const RechartTags = ({ purchases }) => {
  const data = transformPurchasesToChartData(purchases);

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={"50vh"} maxHeight={"50vh"}>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{ left: -10, right: 10, }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatYAxis} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="income" stackId="a" fill="#8884d8" />
        <Bar dataKey="expenses" stackId="a" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RechartTags;
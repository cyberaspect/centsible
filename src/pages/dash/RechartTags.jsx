import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMonth, getYear, format } from 'date-fns';

const transformPurchasesToChartData = (purchases) => {
  const tags = ['Entertainment', 'Grocery', 'Food', 'Bills', 'Rent', 'Taxes', 'Income', 'Bonus', 'Other'];
  const chartData = tags.map(tag => {
    const tagPurchases = purchases.filter(purchase => purchase.tag === tag);

    const expenses = tagPurchases
      .filter(purchase => purchase.withdrawing)
      .reduce((total, purchase) => total + purchase.price, 0);

    const income = tagPurchases
      .filter(purchase => !purchase.withdrawing)
      .reduce((total, purchase) => total + purchase.price, 0);

    return {
      name: tag,
      income,
      expenses,
    };
  });

  return chartData;
};

const RechartTags = ({ purchases }) => {
  const data = transformPurchasesToChartData(purchases);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          left: -40,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RechartTags;
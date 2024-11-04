import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMonth, getYear, format } from 'date-fns';

const transformPurchasesToChartData = (purchases) => {
  const chartData = [];
  const currentDate = new Date();
  const currentYear = getYear(currentDate);
  const currentMonth = getMonth(currentDate);

  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const year = getYear(date);
    const month = format(date, 'MMM');

    const monthlyPurchases = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.date);
      return getYear(purchaseDate) === year && getMonth(purchaseDate) === currentMonth - i;
    });

    const expenses = monthlyPurchases
      .filter(purchase => purchase.withdrawing)
      .reduce((total, purchase) => total + purchase.price, 0);

    const income = monthlyPurchases
      .filter(purchase => !purchase.withdrawing)
      .reduce((total, purchase) => total + purchase.price, 0);

    const name = year === currentYear ? month : `${month} ${year}`;

    chartData.push({
      name,
      income,
      expenses,
    });
  }

  return chartData.reverse();
};

const Rechart = ({ purchases }) => {
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

export default Rechart;
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMonth, getYear, format } from 'date-fns';
import { NumericFormat } from 'react-number-format';
import { useTheme } from 'next-themes';

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
    const fullName = year === currentYear ? format(date, 'MMMM') : `${format(date, 'MMMM')} ${year}`;

    chartData.push({
      name,
      income,
      expenses,
      fullName
    });
  }

  return chartData.reverse();
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
        <p className="label text-md font-semibold">{data.fullName}</p>
        <p className="income"><span className="text-default-700">Income: </span><NumericFormat value={data.income} displayType={'text'} thousandSeparator={true} prefix={'$'} /></p>
        <p className="expense"><span className="text-default-700">Expenses: </span><NumericFormat value={data.expenses} displayType={'text'} thousandSeparator={true} prefix={'$'} /></p>
      </div>
    );
  }

  return null;
};

const Rechart = ({ purchases }) => {
  const data = transformPurchasesToChartData(purchases);

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={"50vh"} maxHeight={"50vh"}>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          left: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatYAxis} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Rechart;
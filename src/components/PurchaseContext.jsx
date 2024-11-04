import { createContext, useContext, useState } from 'react';

const PurchaseContext = createContext();

export const usePurchaseContext = () => useContext(PurchaseContext);

export const PurchaseProvider = ({ children }) => {
  const [sessionPurchaseNum, setSessionPurchaseNum] = useState(0);

  const incrementPurchaseNum = () => {
    setSessionPurchaseNum((prev) => prev + 1);
  };

  return (
    <PurchaseContext.Provider value={{ sessionPurchaseNum, incrementPurchaseNum }}>
      {children}
    </PurchaseContext.Provider>
  );
};
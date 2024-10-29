import { DollarSign } from "lucide-react";

export default function TotalBalance() {
  return (
    <div className="bg-default-100 rounded-2xl p-6 flex items-center justify-between">
      <div>
        <p className="text-default-500">Total Balance</p>
        <h2 className="text-2xl font-semibold text-default-900">$3,000.00</h2>
      </div>
      <div className="flex items-center justify-center bg-default-200 rounded-full h-12 w-12">
        <DollarSign />
      </div>
    </div>
  );
}
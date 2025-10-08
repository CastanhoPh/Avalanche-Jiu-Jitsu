import { DollarSign, FileText } from 'lucide-react';

interface FinancialDashboardProps {
  totalTransactions: number;
  totalValue: number;
}

export default function FinancialDashboard({ totalTransactions, totalValue }: FinancialDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Total de Movimentações
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{totalTransactions}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-full">
            <FileText className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Valor Total
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalValue)}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <DollarSign className="text-green-600" size={32} />
          </div>
        </div>
      </div>
    </div>
  );
}

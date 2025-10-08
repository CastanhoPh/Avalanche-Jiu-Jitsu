import { X, Calendar, FileText, Building2, Receipt, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FinancialTransaction, financialService } from '../../lib/financial';
import { generateTransactionPDF } from '../../lib/pdfGenerator';

interface TransactionViewProps {
  transaction: FinancialTransaction;
  onClose: () => void;
}

export default function TransactionView({ transaction, onClose }: TransactionViewProps) {
  const [fullTransaction, setFullTransaction] = useState<FinancialTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const data = await financialService.getTransactionWithItems(transaction.id);
        setFullTransaction(data);
      } catch (error) {
        console.error('Error loading transaction:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [transaction.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!fullTransaction) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Receipt className="text-white" size={28} />
            <h2 className="text-2xl font-bold text-white">
              Movimentação #{fullTransaction.transaction_number}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="text-blue-600" size={20} />
                <span className="text-sm font-semibold text-gray-600 uppercase">Data de Emissão</span>
              </div>
              <p className="text-lg font-bold text-gray-800">
                {formatDate(fullTransaction.issue_date)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="text-blue-600" size={20} />
                <span className="text-sm font-semibold text-gray-600 uppercase">Data de Entrada</span>
              </div>
              <p className="text-lg font-bold text-gray-800">
                {formatDate(fullTransaction.entry_date)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="text-blue-600" size={20} />
                <span className="text-sm font-semibold text-gray-600 uppercase">Empresa</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{fullTransaction.company_name}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="text-blue-600" size={20} />
                <span className="text-sm font-semibold text-gray-600 uppercase">Número da Nota</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{fullTransaction.invoice_number}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2 text-blue-600" size={24} />
              Itens da Movimentação
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Item
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Quantidade
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Valor Unitário
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Valor Final
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fullTransaction.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.item_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {Number(item.quantity).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {formatCurrency(item.unit_value)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(item.final_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Valor Total da Movimentação</span>
              <span className="text-3xl font-bold text-green-700">
                {formatCurrency(fullTransaction.total_value)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => generateTransactionPDF(fullTransaction)}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Download size={18} />
              <span>Baixar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Edit2, Trash2, Eye, Download } from 'lucide-react';
import { FinancialTransaction, financialService } from '../../lib/financial';
import { generateTransactionPDF } from '../../lib/pdfGenerator';

interface TransactionListProps {
  transactions: FinancialTransaction[];
  onEdit: (transaction: FinancialTransaction) => void;
  onDelete: (id: string) => void;
  onView: (transaction: FinancialTransaction) => void;
  searchTerm: string;
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onView,
  searchTerm,
}: TransactionListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_number.includes(searchTerm)
  );

  const handleDelete = (id: string, companyName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a movimentação da empresa "${companyName}"?`)) {
      onDelete(id);
    }
  };

  const handleDownloadPDF = async (transaction: FinancialTransaction) => {
    try {
      const fullTransaction = await financialService.getTransactionWithItems(transaction.id);
      if (fullTransaction) {
        generateTransactionPDF(fullTransaction);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF.');
    }
  };

  if (filteredTransactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <p className="text-gray-500 text-lg">
          {searchTerm
            ? 'Nenhuma movimentação encontrada com os critérios de busca.'
            : 'Nenhuma movimentação cadastrada ainda.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Movimentação
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Data de Emissão
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nº Nota
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Valor Total
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    #{transaction.transaction_number}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatDate(transaction.issue_date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {transaction.company_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {transaction.invoice_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                  {formatCurrency(transaction.total_value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onView(transaction)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(transaction)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Baixar PDF"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id, transaction.company_name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

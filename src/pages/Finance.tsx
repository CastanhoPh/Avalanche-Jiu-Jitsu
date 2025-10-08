import { useState, useEffect } from 'react';
import { Plus, Search, DollarSign } from 'lucide-react';
import { financialService, FinancialTransaction } from '../lib/financial';
import FinancialDashboard from '../components/finance/FinancialDashboard';
import TransactionForm from '../components/finance/TransactionForm';
import TransactionList from '../components/finance/TransactionList';
import TransactionView from '../components/finance/TransactionView';

export default function Finance() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [viewTransaction, setViewTransaction] = useState<FinancialTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalTransactions: 0, totalValue: 0 });

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await financialService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await financialService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await financialService.deleteTransaction(id);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Erro ao excluir movimentação.');
    }
  };

  const handleEdit = async (transaction: FinancialTransaction) => {
    const fullTransaction = await financialService.getTransactionWithItems(transaction.id);
    setSelectedTransaction(fullTransaction);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedTransaction(null);
  };

  const handleSuccess = () => {
    fetchTransactions();
    fetchStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <DollarSign className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Controle Financeiro</h1>
                <p className="text-sm text-gray-600">Projeto Avalanche</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              <span className="font-medium">Cadastrar Movimentação</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FinancialDashboard
          totalTransactions={stats.totalTransactions}
          totalValue={stats.totalValue}
        />

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por empresa, nota ou número de movimentação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={setViewTransaction}
          searchTerm={searchTerm}
        />
      </div>

      {showForm && (
        <TransactionForm
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
          transaction={selectedTransaction}
        />
      )}

      {viewTransaction && (
        <TransactionView
          transaction={viewTransaction}
          onClose={() => setViewTransaction(null)}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { financialService, FinancialTransaction, TransactionItem } from '../../lib/financial';

interface TransactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
  transaction?: FinancialTransaction | null;
}

interface FormItem extends Omit<TransactionItem, 'id' | 'transaction_id' | 'created_at'> {
  tempId: string;
}

export default function TransactionForm({ onClose, onSuccess, transaction }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [issueDate, setIssueDate] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [items, setItems] = useState<FormItem[]>([
    { tempId: '1', item_name: '', quantity: 0, unit_value: 0, final_value: 0 },
  ]);

  useEffect(() => {
    if (transaction) {
      setIssueDate(transaction.issue_date);
      setEntryDate(transaction.entry_date);
      setCompanyName(transaction.company_name);
      setInvoiceNumber(transaction.invoice_number);
      if (transaction.items && transaction.items.length > 0) {
        setItems(
          transaction.items.map((item, index) => ({
            tempId: String(index + 1),
            item_name: item.item_name,
            quantity: item.quantity,
            unit_value: item.unit_value,
            final_value: item.final_value,
          }))
        );
      }
    }
  }, [transaction]);

  const addItem = () => {
    const newTempId = String(items.length + 1);
    setItems([...items, { tempId: newTempId, item_name: '', quantity: 0, unit_value: 0, final_value: 0 }]);
  };

  const removeItem = (tempId: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.tempId !== tempId));
    }
  };

  const updateItem = (tempId: string, field: keyof FormItem, value: string | number) => {
    setItems(
      items.map(item => {
        if (item.tempId === tempId) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unit_value') {
            updated.final_value = Number(updated.quantity) * Number(updated.unit_value);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + Number(item.final_value), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalValue = calculateTotal();
      const transactionData = {
        issue_date: issueDate,
        entry_date: entryDate,
        company_name: companyName,
        invoice_number: invoiceNumber,
        total_value: totalValue,
      };

      const itemsData = items.map(({ tempId, ...item }) => item);

      if (transaction) {
        await financialService.updateTransaction(transaction.id, transactionData, itemsData);
      } else {
        await financialService.createTransaction(transactionData, itemsData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Erro ao salvar movimentação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {transaction ? 'Editar Movimentação' : 'Cadastrar Nova Movimentação'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dados Principais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Emissão *
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Entrada *
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número da Nota *
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Itens</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                <span>Adicionar Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.tempId} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item *
                      </label>
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => updateItem(item.tempId, 'item_name', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantidade *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.tempId, 'quantity', parseFloat(e.target.value) || 0)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor Unitário *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_value}
                        onChange={(e) => updateItem(item.tempId, 'unit_value', parseFloat(e.target.value) || 0)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valor Final
                        </label>
                        <input
                          type="text"
                          value={formatCurrency(item.final_value)}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.tempId)}
                          className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6 mb-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Valor Total da Movimentação</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : transaction ? 'Atualizar' : 'Salvar Movimentação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

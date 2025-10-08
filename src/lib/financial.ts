import { supabase } from './supabase';

export interface TransactionItem {
  id?: string;
  transaction_id?: string;
  item_name: string;
  quantity: number;
  unit_value: number;
  final_value: number;
  created_at?: string;
}

export interface FinancialTransaction {
  id: string;
  transaction_number: string;
  issue_date: string;
  entry_date: string;
  company_name: string;
  invoice_number: string;
  total_value: number;
  created_at: string;
  updated_at: string;
  items?: TransactionItem[];
}

export const financialService = {
  async getNextTransactionNumber(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_transaction_number');
    if (error) throw error;
    return data;
  },

  async createTransaction(
    transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at' | 'transaction_number'>,
    items: Omit<TransactionItem, 'id' | 'transaction_id' | 'created_at'>[]
  ): Promise<FinancialTransaction> {
    const transactionNumber = await this.getNextTransactionNumber();

    const { data: newTransaction, error: transactionError } = await supabase
      .from('financial_transactions')
      .insert({
        transaction_number: transactionNumber,
        issue_date: transaction.issue_date,
        entry_date: transaction.entry_date,
        company_name: transaction.company_name,
        invoice_number: transaction.invoice_number,
        total_value: transaction.total_value,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    const itemsToInsert = items.map(item => ({
      transaction_id: newTransaction.id,
      item_name: item.item_name,
      quantity: item.quantity,
      unit_value: item.unit_value,
      final_value: item.final_value,
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return newTransaction;
  },

  async updateTransaction(
    id: string,
    transaction: Partial<Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at' | 'transaction_number'>>,
    items?: Omit<TransactionItem, 'id' | 'transaction_id' | 'created_at'>[]
  ): Promise<void> {
    const { error: transactionError } = await supabase
      .from('financial_transactions')
      .update(transaction)
      .eq('id', id);

    if (transactionError) throw transactionError;

    if (items) {
      await supabase.from('transaction_items').delete().eq('transaction_id', id);

      const itemsToInsert = items.map(item => ({
        transaction_id: id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_value: item.unit_value,
        final_value: item.final_value,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTransactions(): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTransactionWithItems(id: string): Promise<FinancialTransaction | null> {
    const { data: transaction, error: transactionError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (transactionError) throw transactionError;
    if (!transaction) return null;

    const { data: items, error: itemsError } = await supabase
      .from('transaction_items')
      .select('*')
      .eq('transaction_id', id)
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

    return {
      ...transaction,
      items: items || [],
    };
  },

  async getStatistics(): Promise<{ totalTransactions: number; totalValue: number }> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('total_value');

    if (error) throw error;

    const totalValue = data?.reduce((sum, t) => sum + Number(t.total_value), 0) || 0;

    return {
      totalTransactions: data?.length || 0,
      totalValue,
    };
  },
};

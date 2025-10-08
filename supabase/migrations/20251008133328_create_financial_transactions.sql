/*
  # Controle Financeiro - Projeto Avalanche
  
  Sistema financeiro independente para controle de movimentações do Projeto Avalanche.
  
  1. Novas Tabelas
    - `financial_transactions`
      - `id` (uuid, chave primária)
      - `transaction_number` (text, único) - número sequencial gerado automaticamente (0001, 0002...)
      - `issue_date` (date) - data de emissão
      - `entry_date` (date) - data de entrada
      - `company_name` (text) - nome da empresa
      - `invoice_number` (text) - número da nota
      - `total_value` (numeric) - valor total calculado
      - `created_at` (timestamptz) - data de criação
      - `updated_at` (timestamptz) - data de atualização
    
    - `transaction_items`
      - `id` (uuid, chave primária)
      - `transaction_id` (uuid, chave estrangeira) - referência à transação
      - `item_name` (text) - nome/descrição do item
      - `quantity` (numeric) - quantidade
      - `unit_value` (numeric) - valor unitário
      - `final_value` (numeric) - valor final calculado (quantidade × valor unitário)
      - `created_at` (timestamptz) - data de criação
  
  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas permitem acesso público para leitura e escrita (sistema interno)
    
  3. Notas Importantes
    - Sistema completamente separado do gerenciamento de alunos
    - Números de transação são gerados automaticamente em sequência
    - Valores finais são calculados automaticamente
*/

-- Criar tabela de transações financeiras
CREATE TABLE IF NOT EXISTS financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number text UNIQUE NOT NULL,
  issue_date date NOT NULL,
  entry_date date NOT NULL,
  company_name text NOT NULL,
  invoice_number text NOT NULL,
  total_value numeric(12, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de itens das transações
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES financial_transactions(id) ON DELETE CASCADE NOT NULL,
  item_name text NOT NULL,
  quantity numeric(10, 2) NOT NULL,
  unit_value numeric(12, 2) NOT NULL,
  final_value numeric(12, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_name ON financial_transactions(company_name);
CREATE INDEX IF NOT EXISTS idx_transactions_issue_date ON financial_transactions(issue_date);

-- Habilitar RLS
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (público para sistema interno)
CREATE POLICY "Anyone can read transactions"
  ON financial_transactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert transactions"
  ON financial_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update transactions"
  ON financial_transactions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete transactions"
  ON financial_transactions FOR DELETE
  USING (true);

CREATE POLICY "Anyone can read transaction items"
  ON transaction_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert transaction items"
  ON transaction_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update transaction items"
  ON transaction_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete transaction items"
  ON transaction_items FOR DELETE
  USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON financial_transactions;
CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número sequencial de transação
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS text AS $$
DECLARE
  next_number integer;
  formatted_number text;
BEGIN
  -- Obter o próximo número baseado no maior existente
  SELECT COALESCE(MAX(CAST(transaction_number AS integer)), 0) + 1
  INTO next_number
  FROM financial_transactions;
  
  -- Formatar com zeros à esquerda (0001, 0002, etc)
  formatted_number := LPAD(next_number::text, 4, '0');
  
  RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;
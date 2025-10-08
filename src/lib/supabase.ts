import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Student {
  id?: string;
  matricula: string;
  nome_completo: string;
  genero: 'Masculino' | 'Feminino';
  data_nascimento: string;
  idade?: number;
  rg?: string;
  cpf?: string;
  data_inscricao?: string;
  status: 'Ativo' | 'Inativo';
  nome_mae?: string;
  rg_mae?: string;
  cpf_mae?: string;
  telefone_mae?: string;
  nome_pai?: string;
  rg_pai?: string;
  cpf_pai?: string;
  telefone_pai?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  numero?: string;
  escolaridade?: string;
  escola?: string;
  serie?: string;
  turno?: string;
  doencas?: string[];
  outras_doencas?: string;
  aulas_matriculadas?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface EvolutionRecord {
  id?: string;
  student_id: string;
  data: string;
  descricao: string;
  status: 'Ativo' | 'Inativo';
  tipo?: 'evolucao' | 'mudanca_status';
  created_at?: string;
  updated_at?: string;
}

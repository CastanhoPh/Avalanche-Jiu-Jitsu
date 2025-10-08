import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Student } from '../lib/supabase';

interface StudentFormProps {
  onClose: () => void;
  onSuccess: () => void;
  student?: Student | null;
}

export default function StudentForm({ onClose, onSuccess, student }: StudentFormProps) {
  const [loading, setLoading] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Student>>({
    nome_completo: '',
    genero: 'Masculino',
    data_nascimento: '',
    rg: '',
    cpf: '',
    status: 'Ativo',
    nome_mae: '',
    rg_mae: '',
    cpf_mae: '',
    telefone_mae: '',
    nome_pai: '',
    rg_pai: '',
    cpf_pai: '',
    telefone_pai: '',
    bairro: '',
    cidade: '',
    cep: '',
    numero: '',
    escolaridade: '',
    escola: '',
    serie: '',
    turno: '',
    outras_doencas: '',
    doencas: [],
    aulas_matriculadas: [],
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
      setPreviousStatus(student.status);
    }
  }, [student]);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const generateMatricula = async (): Promise<string> => {
    const { data, error } = await supabase
      .from('students')
      .select('matricula')
      .order('matricula', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching last matricula:', error);
      return '0001';
    }

    if (!data) {
      return '0001';
    }

    const lastNumber = parseInt(data.matricula);
    const nextNumber = lastNumber + 1;
    return nextNumber.toString().padStart(4, '0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const idade = formData.data_nascimento ? calculateAge(formData.data_nascimento) : undefined;

      let matricula = formData.matricula;
      if (!student) {
        matricula = await generateMatricula();
      }

      const studentData = {
        ...formData,
        matricula,
        idade,
        data_inscricao: formData.data_inscricao || new Date().toISOString().split('T')[0],
      };

      if (student) {
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', student.id!);

        if (error) throw error;

        if (previousStatus === 'Ativo' && formData.status === 'Inativo') {
          const { error: evolutionError } = await supabase
            .from('evolution_records')
            .insert([{
              student_id: student.id,
              data: new Date().toISOString().split('T')[0],
              descricao: 'Aluno inativado. Motivo: (Aguardando preenchimento)',
              status: 'Inativo',
              tipo: 'mudanca_status',
            }]);

          if (evolutionError) {
            console.error('Error creating evolution record:', evolutionError);
          }
        }
      } else {
        const { error } = await supabase
          .from('students')
          .insert([studentData]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Erro ao salvar aluno. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (field: 'doencas' | 'aulas_matriculadas', value: string) => {
    const currentArray = formData[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    setFormData({ ...formData, [field]: newArray });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {student ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Dados do Aluno</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gênero *</label>
                <select
                  required
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value as 'Masculino' | 'Feminino' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                <input
                  type="date"
                  required
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Ativo' | 'Inativo' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Dados da Mãe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Mãe</label>
                <input
                  type="text"
                  value={formData.nome_mae}
                  onChange={(e) => setFormData({ ...formData, nome_mae: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RG Mãe</label>
                <input
                  type="text"
                  value={formData.rg_mae}
                  onChange={(e) => setFormData({ ...formData, rg_mae: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF Mãe</label>
                <input
                  type="text"
                  value={formData.cpf_mae}
                  onChange={(e) => setFormData({ ...formData, cpf_mae: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Mãe</label>
                <input
                  type="text"
                  value={formData.telefone_mae}
                  onChange={(e) => setFormData({ ...formData, telefone_mae: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Dados do Pai</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pai</label>
                <input
                  type="text"
                  value={formData.nome_pai}
                  onChange={(e) => setFormData({ ...formData, nome_pai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RG Pai</label>
                <input
                  type="text"
                  value={formData.rg_pai}
                  onChange={(e) => setFormData({ ...formData, rg_pai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF Pai</label>
                <input
                  type="text"
                  value={formData.cpf_pai}
                  onChange={(e) => setFormData({ ...formData, cpf_pai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Pai</label>
                <input
                  type="text"
                  value={formData.telefone_pai}
                  onChange={(e) => setFormData({ ...formData, telefone_pai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Escolaridade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Escolaridade</label>
                <select
                  value={formData.escolaridade}
                  onChange={(e) => setFormData({ ...formData, escolaridade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="Ensino Infantil">Ensino Infantil</option>
                  <option value="Ensino Fundamental">Ensino Fundamental</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                  <option value="Ensino Superior">Ensino Superior</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                <input
                  type="text"
                  value={formData.escola}
                  onChange={(e) => setFormData({ ...formData, escola: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
                <input
                  type="text"
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                <input
                  type="text"
                  value={formData.turno}
                  onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Doenças</h3>
            <div className="space-y-2">
              {['Asma', 'Coração', 'Sinusite', 'Rinite Alérgica', 'Pressão Alta', 'Complicações Respiratórias'].map((doenca) => (
                <label key={doenca} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.doencas?.includes(doenca)}
                    onChange={() => handleCheckboxChange('doencas', doenca)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{doenca}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Outras Doenças</label>
              <textarea
                value={formData.outras_doencas}
                onChange={(e) => setFormData({ ...formData, outras_doencas: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Aulas Matriculadas</h3>
            <div className="space-y-2">
              {['Jiu-jitsu', 'Reforço Escolar', 'Reforço da Vida', 'Inglês'].map((aula) => (
                <label key={aula} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.aulas_matriculadas?.includes(aula)}
                    onChange={() => handleCheckboxChange('aulas_matriculadas', aula)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{aula}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : (student ? 'Atualizar' : 'Cadastrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

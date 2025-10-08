import React from 'react';
import { X } from 'lucide-react';
import { Student } from '../lib/supabase';
import EvolutionRecords from './EvolutionRecords';

interface StudentViewProps {
  student: Student;
  onClose: () => void;
}

export default function StudentView({ student, onClose }: StudentViewProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Detalhes do Aluno</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Dados do Aluno</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Matrícula</label>
                <p className="text-gray-900">{student.matricula}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                <p className="text-gray-900">{student.nome_completo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gênero</label>
                <p className="text-gray-900">{student.genero}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                <p className="text-gray-900">{new Date(student.data_nascimento).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Idade</label>
                <p className="text-gray-900">{student.idade || '-'} anos</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">RG</label>
                <p className="text-gray-900">{student.rg || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CPF</label>
                <p className="text-gray-900">{student.cpf || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Inscrição</label>
                <p className="text-gray-900">
                  {student.data_inscricao ? new Date(student.data_inscricao).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {student.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {(student.nome_mae || student.nome_pai) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Dados dos Responsáveis</h3>
              {student.nome_mae && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-600 mb-2">Mãe</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      <p className="text-gray-900">{student.nome_mae}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">RG</label>
                      <p className="text-gray-900">{student.rg_mae || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">CPF</label>
                      <p className="text-gray-900">{student.cpf_mae || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefone</label>
                      <p className="text-gray-900">{student.telefone_mae || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
              {student.nome_pai && (
                <div>
                  <h4 className="text-md font-medium text-gray-600 mb-2">Pai</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      <p className="text-gray-900">{student.nome_pai}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">RG</label>
                      <p className="text-gray-900">{student.rg_pai || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">CPF</label>
                      <p className="text-gray-900">{student.cpf_pai || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefone</label>
                      <p className="text-gray-900">{student.telefone_pai || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(student.bairro || student.cidade || student.cep) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Bairro</label>
                  <p className="text-gray-900">{student.bairro || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cidade</label>
                  <p className="text-gray-900">{student.cidade || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CEP</label>
                  <p className="text-gray-900">{student.cep || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Número</label>
                  <p className="text-gray-900">{student.numero || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {(student.escolaridade || student.escola) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Escolaridade</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nível</label>
                  <p className="text-gray-900">{student.escolaridade || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Escola</label>
                  <p className="text-gray-900">{student.escola || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Série</label>
                  <p className="text-gray-900">{student.serie || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Turno</label>
                  <p className="text-gray-900">{student.turno || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {(student.doencas && student.doencas.length > 0) || student.outras_doencas ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Doenças</h3>
              {student.doencas && student.doencas.length > 0 && (
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-500">Doenças Registradas</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {student.doencas.map((doenca, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                      >
                        {doenca}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {student.outras_doencas && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Outras Doenças</label>
                  <p className="text-gray-900">{student.outras_doencas}</p>
                </div>
              )}
            </div>
          ) : null}

          {student.aulas_matriculadas && student.aulas_matriculadas.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Aulas Matriculadas</h3>
              <div className="flex flex-wrap gap-2">
                {student.aulas_matriculadas.map((aula, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {aula}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <EvolutionRecords studentId={student.id!} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

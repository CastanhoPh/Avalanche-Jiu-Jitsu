import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { supabase, EvolutionRecord } from '../lib/supabase';
import EvolutionForm from './EvolutionForm';

interface EvolutionRecordsProps {
  studentId: string;
}

export default function EvolutionRecords({ studentId }: EvolutionRecordsProps) {
  const [records, setRecords] = useState<EvolutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EvolutionRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [studentId]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('evolution_records')
        .select('*')
        .eq('student_id', studentId)
        .order('data', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching evolution records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (record: Partial<EvolutionRecord>) => {
    if (selectedRecord) {
      const { error } = await supabase
        .from('evolution_records')
        .update(record)
        .eq('id', selectedRecord.id!);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('evolution_records')
        .insert([record]);

      if (error) throw error;
    }

    fetchRecords();
  };

  const handleEdit = (record: EvolutionRecord) => {
    setSelectedRecord(record);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      try {
        const { error } = await supabase
          .from('evolution_records')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchRecords();
        setConfirmDelete(null);
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Erro ao excluir registro.');
      }
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedRecord(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">Acompanhamento e Evolução</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} />
          <span>Adicionar Registro</span>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-500">Nenhum registro de evolução ainda.</p>
          <p className="text-sm text-gray-400 mt-1">Clique em "Adicionar Registro" para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-1" />
                      {new Date(record.data).toLocaleDateString('pt-BR')}
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        record.status === 'Ativo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.status}
                    </span>
                    {record.tipo === 'mudanca_status' && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        Mudança de Status
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{record.descricao}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(record)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id!)}
                    className={`p-1 ${
                      confirmDelete === record.id
                        ? 'text-red-800 font-bold'
                        : 'text-red-600 hover:text-red-900'
                    }`}
                    title={confirmDelete === record.id ? 'Clique novamente para confirmar' : 'Excluir'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <EvolutionForm
          studentId={studentId}
          record={selectedRecord}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

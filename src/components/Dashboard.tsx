import React from 'react';
import { Users, UserCheck, UserX, UserCircle2 } from 'lucide-react';
import { Student } from '../lib/supabase';

interface DashboardProps {
  students: Student[];
}

export default function Dashboard({ students }: DashboardProps) {
  const totalAtivos = students.filter((s) => s.status === 'Ativo').length;
  const totalInativos = students.filter((s) => s.status === 'Inativo').length;
  const totalMeninos = students.filter((s) => s.genero === 'Masculino').length;
  const totalMeninas = students.filter((s) => s.genero === 'Feminino').length;

  const stats = [
    {
      label: 'Alunos Ativos',
      value: totalAtivos,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      label: 'Alunos Inativos',
      value: totalInativos,
      icon: UserX,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      label: 'Meninos',
      value: totalMeninos,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      label: 'Meninas',
      value: totalMeninas,
      icon: UserCircle2,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-full`}>
              <stat.icon className="text-white" size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

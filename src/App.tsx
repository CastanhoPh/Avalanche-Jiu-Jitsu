import { useState, useEffect } from 'react';
import { Plus, Search, GraduationCap, DollarSign } from 'lucide-react';
import { supabase, Student } from './lib/supabase';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import StudentView from './components/StudentView';
import Dashboard from './components/Dashboard';
import Finance from './pages/Finance';

type View = 'students' | 'finance';

function App() {
  const [currentView, setCurrentView] = useState<View>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Erro ao excluir aluno.');
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedStudent(null);
  };

  const handleSuccess = () => {
    fetchStudents();
  };

  if (loading && currentView === 'students') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'finance') {
    return (
      <div>
        <nav className="bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-4 py-4">
              <button
                onClick={() => setCurrentView('students')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <GraduationCap size={20} />
                <span>Gestão de Alunos</span>
              </button>
              <button
                onClick={() => setCurrentView('finance')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-700 text-white"
              >
                <DollarSign size={20} />
                <span>Controle Financeiro</span>
              </button>
            </div>
          </div>
        </nav>
        <Finance />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4">
            <button
              onClick={() => setCurrentView('students')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-700 text-white"
            >
              <GraduationCap size={20} />
              <span>Gestão de Alunos</span>
            </button>
            <button
              onClick={() => setCurrentView('finance')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <DollarSign size={20} />
              <span>Controle Financeiro</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Sistema de Gestão de Alunos</h1>
                <p className="text-sm text-gray-600">Academia e Centro Educacional</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              <span className="font-medium">Cadastrar Aluno</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard students={students} />

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        <StudentList
          students={students}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={setViewStudent}
          searchTerm={searchTerm}
        />
      </div>

      {showForm && (
        <StudentForm
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
          student={selectedStudent}
        />
      )}

      {viewStudent && (
        <StudentView
          student={viewStudent}
          onClose={() => setViewStudent(null)}
        />
      )}
    </div>
  );
}

export default App;

import { jsPDF } from 'jspdf';
import { FinancialTransaction } from './financial';

export const generateTransactionPDF = (transaction: FinancialTransaction) => {
  const doc = new jsPDF();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Controle Financeiro - Projeto Avalanche', 105, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.text(`Movimentação #${transaction.transaction_number}`, 105, 30, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados da Movimentação', 20, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  let yPosition = 55;

  doc.setFont('helvetica', 'bold');
  doc.text('Data de Emissão:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(transaction.issue_date), 70, yPosition);

  yPosition += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Data de Entrada:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(transaction.entry_date), 70, yPosition);

  yPosition += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Empresa:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.company_name, 70, yPosition);

  yPosition += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Número da Nota:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.invoice_number, 70, yPosition);

  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Itens da Movimentação', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 20, yPosition);
  doc.text('Qtd', 110, yPosition, { align: 'right' });
  doc.text('Valor Unit.', 140, yPosition, { align: 'right' });
  doc.text('Valor Final', 180, yPosition, { align: 'right' });

  yPosition += 2;
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 5;

  doc.setFont('helvetica', 'normal');

  if (transaction.items) {
    for (const item of transaction.items) {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      const itemName = item.item_name.length > 50
        ? item.item_name.substring(0, 47) + '...'
        : item.item_name;

      doc.text(itemName, 20, yPosition);
      doc.text(Number(item.quantity).toLocaleString('pt-BR'), 110, yPosition, { align: 'right' });
      doc.text(formatCurrency(item.unit_value), 140, yPosition, { align: 'right' });
      doc.text(formatCurrency(item.final_value), 180, yPosition, { align: 'right' });

      yPosition += 7;
    }
  }

  yPosition += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, 190, yPosition);

  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR TOTAL:', 110, yPosition);
  doc.setTextColor(0, 128, 0);
  doc.text(formatCurrency(transaction.total_value), 180, yPosition, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount} | Gerado em ${new Date().toLocaleString('pt-BR')}`,
      105,
      290,
      { align: 'center' }
    );
  }

  doc.save(`movimentacao-${transaction.transaction_number}.pdf`);
};

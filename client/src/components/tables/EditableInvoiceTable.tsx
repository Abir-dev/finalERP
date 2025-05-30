import React, { useState } from 'react';
import { Edit, Eye, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EditInvoiceModal from '@/components/modals/EditInvoiceModal';
import ViewInvoiceModal from '@/components/modals/ViewInvoiceModal';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  project: string;
  client: string;
  amount: number;
  status: string;
  dueDate: string;
  sentDate: string;
  paymentMethod: string;
}

const initialInvoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    project: 'Residential Complex A',
    client: 'Green Valley Developers',
    amount: 1550000,
    status: 'Paid',
    dueDate: '2024-05-15',
    sentDate: '2024-04-15',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'INV-2024-002',
    project: 'Office Tower B',
    client: 'Metropolitan Holdings',
    amount: 875000,
    status: 'Pending',
    dueDate: '2024-06-01',
    sentDate: '2024-05-01',
    paymentMethod: 'Cheque'
  },
  {
    id: 'INV-2024-003',
    project: 'Shopping Mall C',
    client: 'City Center Corp',
    amount: 2230000,
    status: 'Overdue',
    dueDate: '2024-05-20',
    sentDate: '2024-04-20',
    paymentMethod: 'RTGS'
  }
];

const EditableInvoiceTable = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return status !== 'Paid' && due < today;
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleSave = (editedInvoice: Invoice) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === editedInvoice.id ? editedInvoice : invoice
    ));
  };

  const handleEmailInvoice = (invoice: Invoice) => {
    toast.success(`Invoice ${invoice.id} has been emailed to ${invoice.client}`, {
      description: "A copy has been sent to the accounts team."
    });
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Define CSV headers and data
    const headers = [
      'Invoice ID',
      'Project',
      'Client',
      'Amount (₹)',
      'Status',
      'Due Date',
      'Sent Date',
      'Payment Method'
    ];

    const data = [
      invoice.id,
      invoice.project,
      invoice.client,
      invoice.amount.toLocaleString('en-IN'),
      invoice.status,
      invoice.dueDate,
      invoice.sentDate,
      invoice.paymentMethod
    ];

    // Create CSV content
    const csvContent = [
      headers.join(','),
      data.join(',')
    ].join('\n');

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.id}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Invoice ${invoice.id} downloaded as CSV`);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-3 text-left">Invoice ID</th>
              <th className="border border-gray-300 p-3 text-left">Project</th>
              <th className="border border-gray-300 p-3 text-left">Client</th>
              <th className="border border-gray-300 p-3 text-left">Amount</th>
              <th className="border border-gray-300 p-3 text-left">Status</th>
              <th className="border border-gray-300 p-3 text-left">Due Date</th>
              <th className="border border-gray-300 p-3 text-left">Payment Method</th>
              <th className="border border-gray-300 p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr 
                key={invoice.id} 
                className={`hover:bg-gray-50 ${
                  isOverdue(invoice.dueDate, invoice.status) ? 'bg-red-50' : ''
                }`}
              >
                <td className="border border-gray-300 p-3">
                  <span className="font-mono text-[16px]">{invoice.id}</span>
                </td>
                
                <td className="border border-gray-300 p-3">
                  <span className="text-[16px]">{invoice.project}</span>
                </td>

                <td className="border border-gray-300 p-3">
                  <span className="text-[16px]">{invoice.client}</span>
                </td>

                <td className="border border-gray-300 p-3">
                  <span className="font-semibold text-[16px]">
                    ₹{invoice.amount.toLocaleString('en-IN')}
                  </span>
                </td>

                <td className="border border-gray-300 p-3">
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </td>

                <td className="border border-gray-300 p-3">
                  <span className={`text-[16px] ${
                    isOverdue(invoice.dueDate, invoice.status) ? 'text-red-600 font-semibold' : ''
                  }`}>
                    {invoice.dueDate}
                  </span>
                </td>

                <td className="border border-gray-300 p-3">
                  <span className="text-[16px]">{invoice.paymentMethod}</span>
                </td>

                <td className="border border-gray-300 p-3">
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline"
                      onClick={() => handleEdit(invoice)}
                      className="h-8 w-8 p-0 [touch-action:manipulation]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleView(invoice)}
                      className="h-8 w-8 p-0 [touch-action:manipulation]"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleEmailInvoice(invoice)}
                      className="h-8 w-8 p-0 [touch-action:manipulation]"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="h-8 w-8 p-0 [touch-action:manipulation]"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditInvoiceModal
        invoice={selectedInvoice}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSave={handleSave}
      />

      <ViewInvoiceModal
        invoice={selectedInvoice}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
      />
    </div>
  );
};

export default EditableInvoiceTable; 
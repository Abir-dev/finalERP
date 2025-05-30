import React, { useState, useRef } from 'react';
import { Plus, FileText, CreditCard, Clock, TrendingUp, DollarSign, Loader2, Download, MoreVertical, Upload, CheckCircle, Mail, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Toaster } from '@/components/ui/toaster';
import InvoiceBuilderModal from '@/components/modals/InvoiceBuilderModal';
import EditableInvoiceTable from '@/components/tables/EditableInvoiceTable';
import { exportBillingReport, exportBillingStatement } from '@/utils/export-utils';
import { toast } from '@/components/ui/use-toast';
import { 
  createProgressInvoice, 
  generateMonthlyReport, 
  followUpOverdue, 
  processPayments,
  sendPaymentReminder
} from '@/utils/billing-actions';
import { downloadProgressInvoice } from '@/utils/invoice-generator';

interface Invoice {
  invoice: string;
  client: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  paidDate: string | null;
  reminderCount: number;
  lastReminderSent: string | null;
}

interface ReminderResponse {
  success: boolean;
  reminderCount: number;
  sentAt: string;
}

interface Document {
  id: string;
  name: string;
  type: 'Invoice' | 'Contract' | 'Receipt' | 'Tax' | 'Audit';
  size: string;
  uploadedBy: string;
  date: string;
  status: 'Verified' | 'Pending Review';
  project?: string;
  amount?: string;
  client?: string;
  method?: string;
}

interface ProgressInvoice {
  projectId: string;
  project: string;
  completed: number;
  billed: number;
  nextBilling: string;
  invoiceDate: string;
  totalAmount: number;
  clientName: string;
  address: string;
}

const BillingManagerDashboard = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    progressInvoice: false,
    monthlyReport: false,
    followUp: false,
    payments: false
  });

  // Add state for reminder loading
  const [reminderLoadingStates, setReminderLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Update invoices state to include reminder history
  const [invoices, setInvoices] = useState<Invoice[]>([
    { 
      invoice: 'INV-2024-001',
      client: 'Green Valley Developers',
      amount: '₹15,50,000',
      status: 'Paid' as const,
      dueDate: '2024-03-15',
      paidDate: '2024-03-14',
      reminderCount: 0,
      lastReminderSent: null
    },
    {
      invoice: 'INV-2024-002',
      client: 'Metropolitan Holdings',
      amount: '₹8,75,000',
      status: 'Pending' as const,
      dueDate: '2024-03-25',
      paidDate: null,
      reminderCount: 0,
      lastReminderSent: null
    },
    {
      invoice: 'INV-2024-003',
      client: 'City Center Corp',
      amount: '₹22,30,000',
      status: 'Overdue' as const,
      dueDate: '2024-03-10',
      paidDate: null,
      reminderCount: 1,
      lastReminderSent: '2024-03-15'
    }
  ]);

  // Add new state for payment summary
  const [paymentSummary, setPaymentSummary] = useState({
    received: { count: 1, amount: '₹15,50,000' },
    pending: { count: 1, amount: '₹8,75,000' },
    overdue: { count: 1, amount: '₹22,30,000' }
  });

  // Add document states
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc1',
      name: 'March_2024_Invoice.pdf',
      type: 'Invoice',
      size: '2.5 MB',
      uploadedBy: 'John Doe',
      date: '2024-03-15',
      status: 'Verified',
      project: 'Residential Complex A',
      amount: '₹15,50,000',
      client: 'Green Valley Developers'
    },
    {
      id: 'doc2',
      name: 'Project_Contract_2024.docx',
      type: 'Contract',
      size: '1.8 MB',
      uploadedBy: 'Sarah Smith',
      date: '2024-03-10',
      status: 'Pending Review',
      client: 'Metropolitan Holdings',
      amount: '₹2.5 Cr'
    },
    {
      id: 'doc3',
      name: 'Payment_Receipt_123.pdf',
      type: 'Receipt',
      size: '500 KB',
      uploadedBy: 'Mike Johnson',
      date: '2024-03-08',
      status: 'Verified',
      method: 'Bank Transfer'
    }
  ]);

  const [documentLoadingStates, setDocumentLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [selectedTab, setSelectedTab] = useState<'all' | 'invoices' | 'contracts' | 'receipts' | 'others'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add progress billing states
  const [progressInvoices, setProgressInvoices] = useState<ProgressInvoice[]>([
    {
      projectId: 'PRJ001',
      project: 'Residential Complex A',
      completed: 65,
      billed: 60,
      nextBilling: '₹5L',
      invoiceDate: '2024-03-15',
      totalAmount: 1550000,
      clientName: 'Green Valley Developers',
      address: '123 Main St, City'
    },
    {
      projectId: 'PRJ002',
      project: 'Office Tower B',
      completed: 30,
      billed: 25,
      nextBilling: '₹8L',
      invoiceDate: '2024-03-10',
      totalAmount: 875000,
      clientName: 'Metropolitan Holdings',
      address: '456 Elm St, City'
    },
    {
      projectId: 'PRJ003',
      project: 'Shopping Mall C',
      completed: 85,
      billed: 80,
      nextBilling: '₹12L',
      invoiceDate: '2024-03-20',
      totalAmount: 2230000,
      clientName: 'City Center Corp',
      address: '789 Oak St, City'
    }
  ]);

  const [generatingInvoice, setGeneratingInvoice] = useState<{ [key: string]: boolean }>({});

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

  const handleExportReport = () => {
    try {
      exportBillingReport();
    } catch (error) {
      console.error('Failed to export report:', error);
      // Here you might want to show a toast notification for error
    }
  };

  const handleProgressInvoice = async () => {
    setLoadingStates(prev => ({ ...prev, progressInvoice: true }));
    try {
      await createProgressInvoice({
        projectId: "PRJ-2024-001",
        completionPercentage: 75,
        amount: "₹12L"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, progressInvoice: false }));
    }
  };

  const handleMonthlyReport = async () => {
    setLoadingStates(prev => ({ ...prev, monthlyReport: true }));
    try {
      await generateMonthlyReport();
    } finally {
      setLoadingStates(prev => ({ ...prev, monthlyReport: false }));
    }
  };

  const handleFollowUp = async () => {
    setLoadingStates(prev => ({ ...prev, followUp: true }));
    try {
      await followUpOverdue();
    } finally {
      setLoadingStates(prev => ({ ...prev, followUp: false }));
    }
  };

  const handleProcessPayments = async () => {
    setLoadingStates(prev => ({ ...prev, payments: true }));
    try {
      await processPayments();
    } finally {
      setLoadingStates(prev => ({ ...prev, payments: false }));
    }
  };

  const handleSendReminder = async (invoice: Invoice) => {
    // Set loading state for this invoice
    setReminderLoadingStates(prev => ({ ...prev, [invoice.invoice]: true }));

    try {
      const result = await sendPaymentReminder({
        invoiceId: invoice.invoice,
        client: invoice.client,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        reminderCount: invoice.reminderCount
      });

      // Update invoice with new reminder count and timestamp
      const updatedInvoices = invoices.map(inv => {
        if (inv.invoice === invoice.invoice) {
          return {
            ...inv,
            reminderCount: (result as ReminderResponse).reminderCount,
            lastReminderSent: (result as ReminderResponse).sentAt
          };
        }
        return inv;
      });
      setInvoices(updatedInvoices);

      toast({
        title: "Reminder Sent Successfully",
        description: `Payment reminder sent to ${invoice.client}`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to Send Reminder",
        description: "There was an error sending the payment reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReminderLoadingStates(prev => ({ ...prev, [invoice.invoice]: false }));
    }
  };

  const handleRecordPayment = (invoiceId: string) => {
    const updatedInvoices = invoices.map(inv => {
      if (inv.invoice === invoiceId) {
        const paidAmount = parseFloat(inv.amount.replace('₹', '').replace(',', ''));
        
        // Update payment summary
        setPaymentSummary(prev => {
          const newReceived = parseFloat(prev.received.amount.replace('₹', '').replace(',', '')) + paidAmount;
          const newPending = parseFloat(prev.pending.amount.replace('₹', '').replace(',', '')) - paidAmount;
          
          return {
            received: {
              count: prev.received.count + 1,
              amount: `₹${newReceived.toLocaleString('en-IN')}`
            },
            pending: {
              count: prev.pending.count - 1,
              amount: `₹${newPending.toLocaleString('en-IN')}`
            },
            overdue: prev.overdue
          };
        });

        toast({
          title: "Payment Recorded",
          description: `Payment recorded for invoice ${invoiceId}`,
        });
        
        return { 
          ...inv, 
          status: 'Paid' as const,
          paidDate: new Date().toISOString().split('T')[0]
        };
      }
      return inv;
    });
    setInvoices(updatedInvoices);
  };

  const handleExportStatement = () => {
    try {
      exportBillingStatement(invoices);
      toast({
        title: "Statement Exported",
        description: "The billing statement has been downloaded successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export billing statement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const file = files[0];
    const newDoc: Document = {
      id: `doc${documents.length + 1}`,
      name: file.name,
      type: getDocumentType(file.name),
      size: formatFileSize(file.size),
      uploadedBy: 'Current User',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Review'
    };

    setDocuments(prev => [newDoc, ...prev]);
    toast({
      title: "Document Uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBulkUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDownload = async (doc: Document) => {
    setDocumentLoadingStates(prev => ({ ...prev, [doc.id]: true }));
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Download Started",
        description: `${doc.name} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `Failed to download ${doc.name}.`,
        variant: "destructive",
      });
    } finally {
      setDocumentLoadingStates(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  const handleVerify = (doc: Document) => {
    setDocuments(prev => prev.map(d => 
      d.id === doc.id ? { ...d, status: 'Verified' as const } : d
    ));
    toast({
      title: "Document Verified",
      description: `${doc.name} has been marked as verified.`,
    });
  };

  const handleDelete = (doc: Document) => {
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    toast({
      title: "Document Deleted",
      description: `${doc.name} has been deleted.`,
      variant: "destructive",
    });
  };

  const getDocumentType = (filename: string): Document['type'] => {
    if (filename.toLowerCase().includes('invoice')) return 'Invoice';
    if (filename.toLowerCase().includes('contract')) return 'Contract';
    if (filename.toLowerCase().includes('receipt')) return 'Receipt';
    if (filename.toLowerCase().includes('tax')) return 'Tax';
    if (filename.toLowerCase().includes('audit')) return 'Audit';
    return 'Invoice';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredDocuments = documents.filter(doc => {
    switch (selectedTab) {
      case 'invoices':
        return doc.type === 'Invoice';
      case 'contracts':
        return doc.type === 'Contract';
      case 'receipts':
        return doc.type === 'Receipt';
      case 'others':
        return doc.type === 'Tax' || doc.type === 'Audit';
      default:
        return true;
    }
  });

  const handleGenerateProgressInvoice = async (invoice: ProgressInvoice) => {
    setGeneratingInvoice(prev => ({ ...prev, [invoice.projectId]: true }));

    try {
      // Generate and download the invoice
      const success = await downloadProgressInvoice(invoice);

      if (success) {
        // Update the invoice data
        setProgressInvoices(prev => prev.map(inv => {
          if (inv.projectId === invoice.projectId) {
            return {
              ...inv,
              billed: inv.completed,
              nextBilling: '₹0',
              invoiceDate: new Date().toISOString().split('T')[0]
            };
          }
          return inv;
        }));

        toast({
          title: "Invoice Generated",
          description: `Progress invoice for ${invoice.project} has been generated and downloaded.`,
        });
      } else {
        throw new Error('Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate progress invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingInvoice(prev => ({ ...prev, [invoice.projectId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
          <p className="text-muted-foreground">Invoice generation and payment tracking</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowInvoiceModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportReport}>
            <FileText className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="progress-billing">Progress Billing</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                    <p className="text-2xl font-bold text-purple-600">₹2.4Cr</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Across 18 invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-green-600">₹1.8Cr</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">+15% vs last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">₹45L</p>
                  </div>
                  <Clock className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">5 invoices overdue</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                    <p className="text-2xl font-bold text-blue-600">92%</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Last 90 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleProgressInvoice}
                    disabled={loadingStates.progressInvoice}
                  >
                    {loadingStates.progressInvoice ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Create Progress Invoice
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleMonthlyReport}
                    disabled={loadingStates.monthlyReport}
                  >
                    {loadingStates.monthlyReport ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Generate Monthly Report
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleFollowUp}
                    disabled={loadingStates.followUp}
                  >
                    {loadingStates.followUp ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Follow Up Overdue
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleProcessPayments}
                    disabled={loadingStates.payments}
                  >
                    {loadingStates.payments ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Process Payments
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'Paid', count: 12, amount: '₹1.8Cr', color: 'bg-green-500' },
                    { status: 'Pending', count: 6, amount: '₹95L', color: 'bg-yellow-500' },
                    { status: 'Overdue', count: 5, amount: '₹45L', color: 'bg-red-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{item.status}</p>
                          <p className="text-sm text-gray-600">{item.count} invoices</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">{item.amount}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: 'March 2024', collection: 88, target: 90 },
                    { month: 'April 2024', collection: 92, target: 90 },
                    { month: 'May 2024', collection: 85, target: 90 }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.month}</span>
                        <span>{item.collection}% / {item.target}%</span>
                      </div>
                      <Progress value={item.collection} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payment Tracking</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Monitor and manage payment status</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportStatement}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export Statement
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((payment) => (
                    <div key={payment.invoice} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{payment.invoice}</p>
                        <p className="text-sm text-muted-foreground">{payment.client}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={
                            payment.status === 'Paid' ? 'default' :
                            payment.status === 'Pending' ? 'secondary' :
                            'destructive'
                          }>
                            {payment.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Due: {payment.dueDate}
                          </span>
                          {payment.reminderCount > 0 && (
                            <Badge variant="outline" className="ml-2">
                              {payment.reminderCount} reminder{payment.reminderCount > 1 ? 's' : ''} sent
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{payment.amount}</p>
                        {payment.status === 'Paid' ? (
                          <p className="text-sm text-green-600">Paid on {payment.paidDate}</p>
                        ) : payment.status === 'Overdue' ? (
                          <div className="flex flex-col items-end gap-1">
                            {payment.lastReminderSent && (
                              <p className="text-xs text-muted-foreground">
                                Last reminder: {new Date(payment.lastReminderSent).toLocaleDateString()}
                              </p>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="mt-2"
                              onClick={() => handleSendReminder(payment)}
                              disabled={reminderLoadingStates[payment.invoice]}
                            >
                              {reminderLoadingStates[payment.invoice] ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Reminder
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="mt-2" onClick={() => handleRecordPayment(payment.invoice)}>
                            Record Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Received</p>
                    <p className="text-2xl font-bold text-green-600">{paymentSummary.received.amount}</p>
                    <p className="text-sm text-muted-foreground mt-1">{paymentSummary.received.count} payment{paymentSummary.received.count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{paymentSummary.pending.amount}</p>
                    <p className="text-sm text-muted-foreground mt-1">{paymentSummary.pending.count} payment{paymentSummary.pending.count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{paymentSummary.overdue.amount}</p>
                    <p className="text-sm text-muted-foreground mt-1">{paymentSummary.overdue.count} payment{paymentSummary.overdue.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Invoice Management</CardTitle>
                <Button size="sm" onClick={() => setShowInvoiceModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </CardHeader>
              <CardContent>
                <EditableInvoiceTable />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 'INV-2024-001', project: 'Residential Complex A', amount: '₹15,50,000', status: 'Sent', date: '2024-03-15' },
                    { id: 'INV-2024-002', project: 'Office Tower B', amount: '₹8,75,000', status: 'Draft', date: '2024-03-18' },
                    { id: 'INV-2024-003', project: 'Shopping Mall C', amount: '₹22,30,000', status: 'Approved', date: '2024-03-20' }
                  ].map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.project}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <Badge variant={
                          invoice.status === 'Sent' ? 'default' :
                          invoice.status === 'Draft' ? 'secondary' :
                          'outline'
                        }>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Monthly Revenue</p>
                      <p className="text-sm text-muted-foreground">Last 6 months</p>
                    </div>
                    <div className="space-y-1">
                      {[
                        { month: 'October', amount: 180, target: 200 },
                        { month: 'November', amount: 220, target: 200 },
                        { month: 'December', amount: 260, target: 200 },
                        { month: 'January', amount: 190, target: 200 },
                        { month: 'February', amount: 240, target: 200 },
                        { month: 'March', amount: 280, target: 200 },
                      ].map((data) => (
                        <div key={data.month} className="flex items-center gap-4">
                          <p className="w-20 text-sm">{data.month}</p>
                          <div className="flex-1 space-y-1">
                            <div className="flex gap-2 items-center">
                              <div 
                                className="h-3 bg-primary rounded"
                                style={{ width: `${(data.amount/300)*100}%` }}
                              />
                              <span className="text-sm font-medium">₹{data.amount}L</span>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div 
                                className="h-1 bg-muted rounded"
                                style={{ width: `${(data.target/300)*100}%` }}
                              />
                              <span className="text-xs text-muted-foreground">Target: ₹{data.target}L</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="text-sm font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold">₹1,370L</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">+15.3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Collection Rate</p>
                      <p className="text-sm text-muted-foreground">By Project Type</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { type: 'Residential', collected: 92, pending: 8, amount: '320L' },
                        { type: 'Commercial', collected: 88, pending: 12, amount: '450L' },
                        { type: 'Industrial', collected: 95, pending: 5, amount: '280L' },
                        { type: 'Infrastructure', collected: 85, pending: 15, amount: '520L' },
                      ].map((data) => (
                        <div key={data.type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{data.type}</span>
                            <span className="text-muted-foreground">₹{data.amount}</span>
                          </div>
                          <div className="flex h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500"
                              style={{ width: `${data.collected}%` }}
                            />
                            <div 
                              className="bg-yellow-500"
                              style={{ width: `${data.pending}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Collected: {data.collected}%</span>
                            <span>Pending: {data.pending}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Collection Rate</p>
                      <p className="text-2xl font-bold text-green-600">90%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Outstanding</p>
                      <p className="text-2xl font-bold text-yellow-600">₹157L</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: 'January', collected: 85, target: 100 },
                    { month: 'February', collected: 92, target: 100 },
                    { month: 'March', collected: 78, target: 100 }
                  ].map((month) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <span>₹{month.collected}L / ₹{month.target}L</span>
                      </div>
                      <Progress value={(month.collected/month.target)*100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Payment Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { client: 'ABC Developers', avgDays: 15, paymentRate: 95 },
                    { client: 'XYZ Properties', avgDays: 22, paymentRate: 88 },
                    { client: 'Government Agency', avgDays: 45, paymentRate: 100 }
                  ].map((client) => (
                    <div key={client.client} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{client.client}</h4>
                      <div className="flex justify-between mt-2 text-xs">
                        <span>Avg Payment: {client.avgDays} days</span>
                        <span>Success Rate: {client.paymentRate}%</span>
                      </div>
                      <Progress value={client.paymentRate} className="h-2 mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress-billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress-Based Billing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressInvoices.map((invoice) => (
                    <div key={invoice.projectId} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{invoice.project}</h4>
                          <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
                        </div>
                        <Badge variant="outline">
                          Next: {invoice.nextBilling}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Work Completed: {invoice.completed}%</span>
                          <span>Billed: {invoice.billed}%</span>
                        </div>
                        <div className="relative">
                          <Progress value={invoice.completed} className="h-3" />
                          <div 
                            className="absolute top-0 h-3 bg-green-600 bg-opacity-50 rounded"
                            style={{ width: `${invoice.billed}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-sm text-muted-foreground">
                            Last Invoice: {invoice.invoiceDate}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleGenerateProgressInvoice(invoice)}
                            disabled={invoice.completed <= invoice.billed || generatingInvoice[invoice.projectId]}
                          >
                            {generatingInvoice[invoice.projectId] ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Progress Invoice
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Billing Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { milestone: 'Foundation Complete', percentage: 25, status: 'Billed', amount: '₹12L' },
                  { milestone: 'Structure Complete', percentage: 50, status: 'Due', amount: '₹18L' },
                  { milestone: 'Finishing Work', percentage: 75, status: 'Upcoming', amount: '₹15L' },
                  { milestone: 'Project Handover', percentage: 100, status: 'Upcoming', amount: '₹8L' }
                ].map((milestone, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{milestone.milestone}</p>
                      <p className="text-sm text-gray-600">{milestone.percentage}% completion</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={milestone.status === 'Billed' ? 'default' : 
                                  milestone.status === 'Due' ? 'destructive' : 'outline'}>
                        {milestone.status}
                      </Badge>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{milestone.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Document Management</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Manage and organize billing-related documents</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <Button variant="outline" size="sm" onClick={handleBulkUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setSelectedTab(value as any)}>
                  <TabsList className="w-full grid grid-cols-5 mb-4">
                    <TabsTrigger value="all">All Documents</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts</TabsTrigger>
                    <TabsTrigger value="receipts">Receipts</TabsTrigger>
                    <TabsTrigger value="others">Others</TabsTrigger>
                  </TabsList>

                  <div className="space-y-4">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded">
                            <FileText className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{doc.type}</Badge>
                              <span className="text-sm text-muted-foreground">{doc.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Uploaded by {doc.uploadedBy}</p>
                            <p className="text-sm">{doc.date}</p>
                          </div>
                          <Badge variant={doc.status === 'Verified' ? 'default' : 'secondary'}>
                            {doc.status}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {doc.status === 'Pending Review' && (
                              <Button variant="ghost" size="icon" onClick={() => handleVerify(doc)}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} disabled={documentLoadingStates[doc.id]}>
                              {documentLoadingStates[doc.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.slice(0, 3).map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${
                          doc.status === 'Verified' ? 'bg-green-100 text-green-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {doc.status === 'Verified' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.status === 'Verified' ? 'Verified' : 'Uploaded'} by {doc.uploadedBy}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(doc.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Builder Modal */}
      {showInvoiceModal && (
        <div className="-top-10 ">
          <InvoiceBuilderModal onClose={() => setShowInvoiceModal(false)} />
        </div>
      )}

      {/* Add Toaster */}
      <Toaster />
    </div>
  );
};

export default BillingManagerDashboard; 
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Plus, ShoppingCart, Package, Users, TrendingUp, Loader2, AlertTriangle, ArrowLeft, Star, Sparkles, FileText } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useUserFilter } from "@/contexts/UserFilterContext";
import { UserFilterComponent } from "@/components/UserFilterComponent";
import { PageUserFilterProvider } from "@/components/PageUserFilterProvider";
import { User } from "@/types/user";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import { PurchaseDashboard } from "@/components/purchase-management/purchase-dashboard";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import { AddVendorModal } from "@/components/modals/AddVendorModal";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Mock low stock items data
const generateLowStockItems = (count: number) => {
  const items = [
    { id: 1, name: "Office Paper A4", currentStock: 5, threshold: 20, category: "Office Supplies" },
    { id: 2, name: "Wireless Mouse", currentStock: 2, threshold: 10, category: "Electronics" },
    { id: 3, name: "Coffee Pods", currentStock: 8, threshold: 25, category: "Beverages" },
    { id: 4, name: "Printer Ink Cartridge", currentStock: 1, threshold: 5, category: "Office Supplies" },
    { id: 5, name: "Hand Sanitizer", currentStock: 3, threshold: 15, category: "Health & Safety" }
  ];
  
  return items.slice(0, count);
};

const AutoStockCheck = ({ 
  lastStockCheck, 
  setLastStockCheck,
  stockAlerts,
  setStockAlerts,
  isCheckingStock,
  setIsCheckingStock,
  navigate
}: {
  lastStockCheck: string | null,
  setLastStockCheck: (value: string | null) => void,
  stockAlerts: number,
  setStockAlerts: (value: number) => void,
  isCheckingStock: boolean,
  setIsCheckingStock: (value: boolean) => void,
  navigate: (path: string) => void
}) => {
  const [lowStockItems, setLowStockItems] = useState<Array<{
    id: number;
    name: string;
    currentStock: number;
    threshold: number;
    category: string;
  }>>([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);

  const handleStockCheck = async () => {
    setIsCheckingStock(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const alerts = Math.floor(Math.random() * 5) + 1;
      const items = generateLowStockItems(alerts);
      
      setStockAlerts(alerts);
      setLowStockItems(items);
      setLastStockCheck(new Date().toLocaleString());
      
      toast({
        title: "Stock check completed",
        description: alerts > 0 
          ? `${alerts} items need replenishment` 
          : "All items at sufficient levels",
      });
    } finally {
      setIsCheckingStock(false);
    }
  };

  const handleViewLowStock = () => {
    setShowLowStockModal(true);
  };

    return (
      <>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Auto Stock Check</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {lastStockCheck ? (
                `Last checked ${lastStockCheck}. ${stockAlerts} items below threshold`
              ) : (
                "Inventory levels not checked yet"
              )}
            </p>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={handleStockCheck}
                disabled={isCheckingStock}
              >
                {isCheckingStock ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : "Check Stock Levels"}
              </Button>
              {stockAlerts > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleViewLowStock}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  View Low Stock Items ({stockAlerts})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
  
        {/* Low Stock Items Modal */}
        <Dialog open={showLowStockModal} onOpenChange={setShowLowStockModal}>
          <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Low Stock Items</DialogTitle>
              <DialogDescription>
                {stockAlerts} items need replenishment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {lowStockItems.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Low Stock Items</h3>
                    <p className="text-gray-600">All inventory items are at sufficient levels.</p>
                  </CardContent>
                </Card>
              ) : (
                lowStockItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Current Stock</p>
                              <p className="font-semibold text-red-600">{item.currentStock}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Threshold</p>
                              <p className="font-semibold text-gray-900">{item.threshold}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Need</p>
                              <p className="font-semibold text-blue-600">
                                {item.threshold - item.currentStock}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Stock Level</span>
                          <span>{Math.round((item.currentStock / item.threshold) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((item.currentStock / item.threshold) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button className="flex-1" onClick={() => {
                          navigate("/purchases/new");
                          setShowLowStockModal(false);
                        }}>
                          Order Now
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Set Reminder
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowLowStockModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

const PurchaseManagementContent = () => {
  const { user } = useUser();
  
  // Use UserFilter Context
  const { 
    targetUserId, 
    selectedUser, 
    currentUser,
    setSelectedUserId 
  } = useUserFilter();
  
  const userID = targetUserId || user?.id || ""
  
  const [showAllContractsModal, setShowAllContractsModal] = useState(false);

  
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [poFormData, setPoFormData] = useState({
    vendor: '',
    amount: '',
    description: '',
    priority: 'medium',
    attachments: null
  });
  
  const navigate = useNavigate();

  // Auto-reset on page change
  useEffect(() => {
    // Reset to current user on page load/change
    setSelectedUserId(null);
  }, []); // Empty dependency - runs once on mount

  // Function to fetch purchase data
  const fetchPurchaseData = async () => {
    if (!userID) return; // Don't fetch if no user ID
    
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log("Fetching purchase data for user:", userID);
      
      // Add any purchase-specific data fetching here
      // Example: fetch purchase orders, vendor data, etc.
      // const purchaseResponse = await fetch(`${API_URL}/purchases?userId=${userID}`, { headers });
      
    } catch (error) {
      console.error('Error fetching purchase data:', error);
    }
  };

  // Use effect to fetch data when targetUserId changes
  useEffect(() => {
    if (userID) {
      fetchPurchaseData();
    }
  }, [userID]); // Refetch when target user changes

  const [isLoading, setIsLoading] = useState({
    export: false,
    newPO: false,
    vendorReport: false,
    emergencyPO: false,
    processRequests: false
  });

  const [pendingRequests, setPendingRequests] = useState(3);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    material: "",
    quantity: "",
    urgency: "normal",
    site: "",
    notes: ""
  });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestHistory, setRequestHistory] = useState<Array<{
    id: number;
    material: string;
    quantity: string;
    urgency: string;
    site: string;
    notes: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    date: string;
  }>>([
    {
      id: 1,
      material: "Steel Rebar",
      quantity: "500 units",
      urgency: "high",
      site: "site-a",
      notes: "For foundation work",
      status: "completed",
      date: "2023-05-15"
    },
    {
      id: 2,
      material: "Cement",
      quantity: "200 bags",
      urgency: "normal",
      site: "site-b",
      notes: "Standard mix",
      status: "approved",
      date: "2023-05-18"
    },
    {
      id: 3,
      material: "Electrical Wiring",
      quantity: "1000m",
      urgency: "critical",
      site: "site-c",
      notes: "Urgent for phase 2",
      status: "pending",
      date: "2023-05-20"
    }
  ]);
  const [showRequestHistory, setShowRequestHistory] = useState(false);

  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [lastStockCheck, setLastStockCheck] = useState<string | null>(null);
  const [stockAlerts, setStockAlerts] = useState(0);
  const [comparisonMaterial, setComparisonMaterial] = useState("");
  const [isAnalyzingBulk, setIsAnalyzingBulk] = useState(false);
  const [bulkOpportunities, setBulkOpportunities] = useState<Array<{
    id: number;
    material: string;
    currentPrice: number;
    bulkPrice: number;
    minQuantity: number;
    savings: number;
  }>>([]);
  const [showBulkOpportunities, setShowBulkOpportunities] = useState(false);
  const [showBulkOrderForm, setShowBulkOrderForm] = useState(false);
  const [bulkOrderMaterial, setBulkOrderMaterial] = useState("");
  const [bulkOrderQuantity, setBulkOrderQuantity] = useState("");
  const [bulkOrderVendor, setBulkOrderVendor] = useState("");
  const [bulkOrderDelivery, setBulkOrderDelivery] = useState("");
  const [isSubmittingBulkOrder, setIsSubmittingBulkOrder] = useState(false);
  const [emergencyOrdersThisMonth, setEmergencyOrdersThisMonth] = useState(2);
  const [activeContracts, setActiveContracts] = useState(5);
  const [expiringSoon, setExpiringSoon] = useState(1);
  const [showContractForm, setShowContractForm] = useState(false);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyOrder, setEmergencyOrder] = useState({
  material: "",
  quantity: "",
  vendor: "",
  deliveryTime: "24h",
  reason: "",
  attachments: null
});

const [selectedVendor, setSelectedVendor] = useState<any>(null);
const [showVendorDetails, setShowVendorDetails] = useState(false);
const [showNewVendorModal, setShowNewVendorModal] = useState(false);
const [newVendor, setNewVendor] = useState({
  name: "",
  category: "",
  contact: "",
  email: "",
  address: "",
  paymentTerms: "",
  documents: [] as File[]
});

  const handleExportReport = () => {
    setIsLoading(prev => ({ ...prev, export: true }));

    const reportData = [
      { id: 1, vendor: 'Steel Corp Ltd', amount: '₹250,000', date: '2023-05-15', status: 'Completed' },
      { id: 2, vendor: 'Cement Industries', amount: '₹180,000', date: '2023-05-18', status: 'Pending' }
    ];

    const headers = "ID\tVendor\tAmount\tDate\tStatus\n";
    const rows = reportData.map(item => 
      `${item.id}\t${item.vendor}\t${item.amount}\t${item.date}\t${item.status}`
    ).join("\n");
    
    const textContent = headers + rows;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported successfully",
      description: "Purchase report has been downloaded as text file",
    });
    setIsLoading(prev => ({ ...prev, export: false }));
  };

  const handleVendorReport = (vendorName: string) => {
    setIsLoading(prev => ({ ...prev, vendorReport: true }));
    
    setTimeout(() => {
      toast({
        title: `${vendorName} report generated`,
        description: "Vendor performance report is ready for download",
      });
      setIsLoading(prev => ({ ...prev, vendorReport: false }));
    }, 1500);
  };

  // Replace your current handleEmergencyPO function with this:
  const handleEmergencyPO = () => {
    setShowEmergencyModal(true);
    setEmergencyOrder({
      material: "",
      quantity: "",
      vendor: "",
      deliveryTime: "24h",
      reason: "",
      attachments: null
    });
  };
  
  const handleEmergencyOrderSubmit = async () => {
    if (!emergencyOrder.material || !emergencyOrder.quantity || !emergencyOrder.vendor || !emergencyOrder.reason) {
      toast({
        title: "Missing required fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
  
    setIsLoading(prev => ({ ...prev, emergencyPO: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmergencyOrdersThisMonth(prev => prev + 1);
      
      toast({
        title: "Emergency order created",
        description: `Your emergency order for ${emergencyOrder.material} has been submitted`,
        variant: "default"
      });
      
      setShowEmergencyModal(false);
    } finally {
      setIsLoading(prev => ({ ...prev, emergencyPO: false }));
    }
  };
  
  const handlePOFormSubmit = async () => {
    if (!poFormData.vendor || !poFormData.amount || !poFormData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
  
    setIsLoading(prev => ({ ...prev, newPO: true }));
  
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Purchase order created successfully",
        description: `PO for ${poFormData.vendor} (₹${poFormData.amount}) has been submitted`,
      });
  
      setPoFormData({
        vendor: '',
        amount: '',
        description: '',
        priority: 'medium',
        attachments: null
      });
      setIsPOModalOpen(false);
    } catch (error) {
      toast({
        title: "Error creating purchase order",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, newPO: false }));
    }
  };

  const handleContactVendor = (vendorName: string) => {
    toast({
      title: `Contacting ${vendorName}`,
      description: "Opening vendor contact information...",
    });
  };

  const handleImplementStrategy = (strategy: string) => {
    toast({
      title: "Strategy implementation started",
      description: `Initiating ${strategy} optimization process...`,
    });
  };

  const handleProcessRequests = async () => {
    if (pendingRequests > 0) {
      setIsLoading(prev => ({ ...prev, processRequests: true }));
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const processedCount = Math.min(3, pendingRequests);
        setPendingRequests(prev => prev - processedCount);
        
        setRequestHistory(prev => 
          prev.map(item => 
            item.status === 'pending' ? { ...item, status: 'approved' } : item
          )
        );
        
        toast({
          title: "Requests processed",
          description: `${processedCount} material requests have been processed`,
        });
      } finally {
        setIsLoading(prev => ({ ...prev, processRequests: false }));
      }
    } else {
      setShowRequestHistory(true);
    }
  };

  const handleSubmitRequest = async () => {
    if (!newRequest.material || !newRequest.quantity || !newRequest.site) {
      toast({
        title: "Missing required fields",
        description: "Please fill out material, quantity, and site",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmittingRequest(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newRequestItem = {
        id: Date.now(),
        material: newRequest.material,
        quantity: newRequest.quantity,
        urgency: newRequest.urgency,
        site: newRequest.site,
        notes: newRequest.notes,
        status: 'pending' as const,
        date: new Date().toLocaleDateString()
      };
      
      setPendingRequests(prev => prev + 1);
      setRequestHistory(prev => [newRequestItem, ...prev]);
      
      toast({
        title: "Request submitted",
        description: `Your request for ${newRequest.material} has been sent`,
      });
      
      setNewRequest({
        material: "",
        quantity: "",
        urgency: "normal",
        site: "",
        notes: ""
      });
      
      setShowRequestForm(false);
    } catch (error) {
      toast({
        title: "Error submitting request",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Add these states at the top of your PurchaseManagement component
const [isComparingVendors, setIsComparingVendors] = useState(false);
const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
const [comparisonData, setComparisonData] = useState<{
  material: string;
  vendors: Array<{
    id: string;
    name: string;
    price: number;
    deliveryTime: string;
    qualityRating: number;
    reliability: number;
  }>;
} | null>(null);

// Add this function to handle vendor comparison
const handleCompareVendors = async (material: string) => {
  setIsComparingVendors(true);
  setComparisonModalOpen(true);
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data based on selected material
    let vendors = [];
    
    if (material === 'steel') {
      vendors = [
        {
          id: 'steel-corp',
          name: 'Steel Corp Ltd',
          price: 85000,
          deliveryTime: '3-5 days',
          qualityRating: 4.5,
          reliability: 95
        },
        {
          id: 'metal-supply',
          name: 'Metal Supply Co',
          price: 82000,
          deliveryTime: '5-7 days',
          qualityRating: 4.2,
          reliability: 90
        },
        {
          id: 'national-steel',
          name: 'National Steel',
          price: 88000,
          deliveryTime: '2-4 days',
          qualityRating: 4.7,
          reliability: 97
        }
      ];
    } else if (material === 'cement') {
      vendors = [
        {
          id: 'cement-ind',
          name: 'Cement Industries',
          price: 400,
          deliveryTime: '2-3 days',
          qualityRating: 4.3,
          reliability: 93
        },
        {
          id: 'build-mart',
          name: 'BuildMart Cement',
          price: 380,
          deliveryTime: '4-6 days',
          qualityRating: 4.0,
          reliability: 88
        }
      ];
    } else {
      vendors = [
        {
          id: 'default-1',
          name: 'General Vendor 1',
          price: 500,
          deliveryTime: '3-5 days',
          qualityRating: 4.0,
          reliability: 85
        },
        {
          id: 'default-2',
          name: 'General Vendor 2',
          price: 480,
          deliveryTime: '4-7 days',
          qualityRating: 3.8,
          reliability: 82
        }
      ];
    }

    setComparisonData({
      material: material.charAt(0).toUpperCase() + material.slice(1),
      vendors
    });
  } finally {
    setIsComparingVendors(false);
  }
};

const [contracts, setContracts] = useState([
  {
    id: 1,
    vendor: "Steel Corp Ltd",
    type: "Material Supply",
    value: "₹5,00,000",
    startDate: "2023-01-15",
    endDate: "2023-12-31",
    status: "active",
    terms: "Monthly deliveries, 5% discount on bulk orders",
    documents: ["contract_steel_2023.pdf"]
  },
  {
    id: 2,
    vendor: "Cement Industries",
    type: "Material Supply",
    value: "₹3,50,000",
    startDate: "2023-03-01",
    endDate: "2023-11-30",
    status: "active",
    terms: "Quarterly deliveries, price locked for 1 year",
    documents: ["contract_cement_2023.pdf"]
  },
  {
    id: 3,
    vendor: "Safety First Co",
    type: "Equipment Lease",
    value: "₹1,20,000",
    startDate: "2023-02-10",
    endDate: "2023-08-09",
    status: "expiring",
    terms: "6-month lease with option to renew",
    documents: ["lease_safety_2023.pdf"]
  }
]);

const [showContractDetails, setShowContractDetails] = useState(false);
const [selectedContract, setSelectedContract] = useState<any>(null);
const [showNewContractModal, setShowNewContractModal] = useState(false);
const [newContract, setNewContract] = useState({
  vendor: "",
  type: "Material Supply",
  value: "",
  startDate: "",
  endDate: "",
  terms: "",
  documents: []
});

// Add these functions to handle contract actions
const handleViewContract = (contract: any) => {
  setSelectedContract(contract);
  setShowContractDetails(true);
};

const handleRenewContract = (contractId: number) => {
  setContracts(prev => 
    prev.map(contract => 
      contract.id === contractId 
        ? { ...contract, status: "active", endDate: "2023-12-31" } 
        : contract
    )
  );
  setExpiringSoon(prev => prev - 1);
  toast({
    title: "Contract Renewed",
    description: "The contract has been extended until December 2023",
  });
};

const handleTerminateContract = (contractId: number) => {
  setContracts(prev => prev.filter(contract => contract.id !== contractId));
  toast({
    title: "Contract Terminated",
    description: "The contract has been successfully terminated",
    variant: "destructive"
  });
};

const handleDownloadContract = (contractId: number) => {
  const contract = contracts.find(c => c.id === contractId);
  if (contract) {
    toast({
      title: "Download Started",
      description: `Downloading ${contract.vendor} contract documents...`,
    });
    // In a real app, this would actually download the file
  }
};

const handleNewContractSubmit = async () => {
  if (!newContract.vendor || !newContract.value || !newContract.startDate || !newContract.endDate) {
    toast({
      title: "Missing required fields",
      description: "Please fill out all required fields",
      variant: "destructive"
    });
    return;
  }

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const contract = {
      id: contracts.length + 1,
      vendor: newContract.vendor,
      type: newContract.type,
      value: `₹${newContract.value}`,
      startDate: newContract.startDate,
      endDate: newContract.endDate,
      status: "active",
      terms: newContract.terms,
      documents: []
    };
    
    setContracts(prev => [...prev, contract]);
    setActiveContracts(prev => prev + 1);
    
    toast({
      title: "Contract Created",
      description: `New contract with ${newContract.vendor} has been created`,
    });
    
    setNewContract({
      vendor: "",
      type: "Material Supply",
      value: "",
      startDate: "",
      endDate: "",
      terms: "",
      documents: []
    });
    
    setShowNewContractModal(false);
  } catch (error) {
    toast({
      title: "Error creating contract",
      description: "Please try again",
      variant: "destructive"
    });
  }
};



  return (
    <div className="space-y-6">
      {/* User Filter Component */}
      <UserFilterComponent />

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Purchase Management
            {selectedUser && selectedUser.id !== currentUser?.id && (
              <span className="text-lg text-muted-foreground ml-2">
                - {selectedUser.name}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">Manage all your purchases</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        {/* <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="procurement">Smart Procurement</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
          <TabsTrigger value="optimization">Cost Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList> */}

       
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <EnhancedStatCard 
              title="Total Orders" 
              value="₹8.5L" 
              icon={ShoppingCart}
              trend={{ value: 12, label: "increase this month" }}
              threshold={{ status: 'good', message: 'Strong procurement activity' }}
            />
            <EnhancedStatCard 
              title="Active Vendors" 
              value="24" 
              icon={Users}
              description="Approved vendor network"
              trend={{ value: 3, label: "new vendors added" }}
              threshold={{ status: 'good', message: 'Diverse vendor base' }}
            />
            <EnhancedStatCard 
              title="Cost Savings" 
              value="₹2.8L" 
              icon={TrendingUp}
              description="This quarter savings"
              trend={{ value: 18, label: "vs last quarter" }}
              threshold={{ status: 'good', message: 'Outstanding cost optimization' }}
            />
            <EnhancedStatCard 
              title="On-Time Delivery" 
              value="92%" 
              icon={Package}
              description="Vendor performance average"
              trend={{ value: 5, label: "improvement" }}
              threshold={{ status: 'good', message: 'Excellent delivery performance' }}
            />
          </div> */}

          <PurchaseDashboard selectedUserId={userID} />
        

        <TabsContent value="procurement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart Procurement System</CardTitle>
              <CardDescription>Intelligent procurement with automated optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">Material Requests</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {pendingRequests > 0 ? (
                        `You have ${pendingRequests} pending material requests awaiting approval`
                      ) : (
                        "No pending material requests at this time"
                      )}
                    </p>
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={handleProcessRequests}
                        disabled={isLoading.processRequests}
                      >
                        {isLoading.processRequests ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : pendingRequests > 0 ? (
                          "Process Requests"
                        ) : (
                          "View Request History"
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setShowRequestForm(true);
                          setNewRequest({
                            material: "",
                            quantity: "",
                            urgency: "normal",
                            site: "",
                            notes: ""
                          });
                        }}
                      >
                        Create New Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <AutoStockCheck 
                  lastStockCheck={lastStockCheck}
                  setLastStockCheck={setLastStockCheck}
                  stockAlerts={stockAlerts}
                  setStockAlerts={setStockAlerts}
                  isCheckingStock={isCheckingStock}
                  setIsCheckingStock={setIsCheckingStock}
                  navigate={navigate}
                />

                {/* Vendor Comparision */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold">Vendor Comparison</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Compare vendors based on price, quality, delivery time, and reliability
                    </p>
                    <div className="space-y-3">
                      <Select
                        value={comparisonMaterial}
                        onValueChange={setComparisonMaterial}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material to compare" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="steel">Steel Rebar</SelectItem>
                          <SelectItem value="cement">Cement</SelectItem>
                          <SelectItem value="bricks">Clay Bricks</SelectItem>
                          <SelectItem value="sand">River Sand</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        className="w-full"
                        onClick={() => comparisonMaterial && handleCompareVendors(comparisonMaterial)}
                        disabled={!comparisonMaterial || isComparingVendors}
                      >
                        {isComparingVendors ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Comparing...
                          </>
                        ) : "Compare Vendors"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Add this modal component anywhere in your main return (at the same level as your other dialogs) */}
                <Dialog open={comparisonModalOpen} onOpenChange={setComparisonModalOpen}>
                  <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {comparisonData ? `Vendor Comparison: ${comparisonData.material}` : 'Comparing Vendors'}
                      </DialogTitle>
                      <DialogDescription>
                        Analyze vendor performance across key metrics
                      </DialogDescription>
                    </DialogHeader>
                    
                    {isComparingVendors ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : comparisonData ? (
                      <div className="space-y-4">
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reliability</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {comparisonData.vendors.map((vendor) => (
                                <tr key={vendor.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ₹{vendor.price.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.deliveryTime}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`h-4 w-4 ${i < Math.floor(vendor.qualityRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                        />
                                      ))}
                                      <span className="ml-1 text-xs text-gray-500">({vendor.qualityRating.toFixed(1)})</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full" 
                                          style={{ width: `${vendor.reliability}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm text-gray-500">{vendor.reliability}%</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {/* <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setPoFormData({
                                          ...poFormData,
                                          vendor: vendor.id,
                                          amount: vendor.price.toString(),
                                          description: `Purchase of ${comparisonData.material} from ${vendor.name}`
                                        });
                                        setComparisonModalOpen(false);
                                        setIsPOModalOpen(true);
                                      }}
                                    >
                                      Create PO
                                    </Button> */}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">Best Price</h4>
                              <p className="text-2xl font-bold text-green-600">
                                ₹{Math.min(...comparisonData.vendors.map(v => v.price)).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {comparisonData.vendors.find(v => v.price === Math.min(...comparisonData.vendors.map(v => v.price)))?.name}
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">Fastest Delivery</h4>
                              <p className="text-2xl font-bold text-blue-600">
                                {comparisonData.vendors.sort((a,b) => 
                                  parseInt(a.deliveryTime) - parseInt(b.deliveryTime))[0].deliveryTime}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {comparisonData.vendors.sort((a,b) => 
                                  parseInt(a.deliveryTime) - parseInt(b.deliveryTime))[0].name}
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-2">Highest Rated</h4>
                              <div className="flex items-center">
                                <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                                <span className="text-2xl font-bold">
                                  {Math.max(...comparisonData.vendors.map(v => v.qualityRating)).toFixed(1)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {comparisonData.vendors.find(v => v.qualityRating === 
                                  Math.max(...comparisonData.vendors.map(v => v.qualityRating)))?.name}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h4 className="font-medium text-gray-900">No comparison data available</h4>
                        <p className="text-sm text-muted-foreground">Please try your comparison again</p>
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setComparisonModalOpen(false)}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          if (comparisonData) {
                            const bestVendor = comparisonData.vendors.reduce((prev, current) => 
                              (prev.qualityRating/prev.price > current.qualityRating/current.price) ? prev : current
                            );
                            setPoFormData({
                              ...poFormData,
                              vendor: bestVendor.id,
                              amount: bestVendor.price.toString(),
                              description: `Purchase of ${comparisonData.material} from ${bestVendor.name} (Recommended)`
                            });
                            setComparisonModalOpen(false);
                            setIsPOModalOpen(true);
                          }
                        }}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Recommended PO
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

        {/* Bulk Optimization Component */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold">Bulk Optimization</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {bulkOpportunities.length > 0 ? (
                `${bulkOpportunities.length} bulk purchase opportunities identified`
              ) : (
                "Analyze purchase patterns for bulk opportunities"
              )}
            </p>
            <div className="space-y-2">
              <Button 
                className="w-full"
                onClick={async () => {
                  setIsAnalyzingBulk(true);
                  try {
                    // Simulate analysis
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Generate random bulk opportunities
                    const newOpportunities = [
                      {
                        id: 1,
                        material: "Steel Rebar",
                        currentPrice: 85000,
                        bulkPrice: 79000,
                        minQuantity: 50,
                        savings: 6000
                      },
                      {
                        id: 2,
                        material: "Cement (50kg bags)",
                        currentPrice: 400,
                        bulkPrice: 370,
                        minQuantity: 1000,
                        savings: 30000
                      }
                    ];
                    
                    setBulkOpportunities(newOpportunities);
                    toast({
                      title: "Analysis complete",
                      description: `${newOpportunities.length} bulk purchase opportunities found`,
                    });
                  } finally {
                    setIsAnalyzingBulk(false);
                  }
                }}
                disabled={isAnalyzingBulk}
              >
                {isAnalyzingBulk ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : "Analyze Purchase Patterns"}
              </Button>
              {bulkOpportunities.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowBulkOpportunities(true)}
                >
                  View Opportunities
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
  <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <span>Emergency Purchase Order</span>
      </DialogTitle>
      <DialogDescription>
        Fast-track procurement for urgent requirements (24-48 hour delivery)
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800">Emergency Order Notice</h4>
            <p className="text-sm text-red-700">
              Emergency orders bypass normal approval workflows and may incur additional costs.
              Please provide justification for the urgent requirement.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="emergencyMaterial" className="text-right">
            Material *
          </Label>
          <Input
            id="emergencyMaterial"
            value={emergencyOrder.material}
            onChange={(e) => setEmergencyOrder({...emergencyOrder, material: e.target.value})}
            className="col-span-3"
            placeholder="e.g., Steel Rebar, Cement, etc."
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="emergencyQuantity" className="text-right">
            Quantity *
          </Label>
          <Input
            id="emergencyQuantity"
            type="number"
            value={emergencyOrder.quantity}
            onChange={(e) => setEmergencyOrder({...emergencyOrder, quantity: e.target.value})}
            className="col-span-3"
            placeholder="Enter quantity with units"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="emergencyVendor" className="text-right">
            Vendor *
          </Label>
          <Select
            value={emergencyOrder.vendor}
            onValueChange={(value) => setEmergencyOrder({...emergencyOrder, vendor: value})}
            required
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steel-corp">Steel Corp Ltd (24h delivery)</SelectItem>
              <SelectItem value="express-supply">Express Supply Co (12h delivery)</SelectItem>
              <SelectItem value="local-urgent">Local Urgent Vendors (6h delivery)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="emergencyDelivery" className="text-right">
            Delivery Time
          </Label>
          <Select
            value={emergencyOrder.deliveryTime}
            onValueChange={(value) => setEmergencyOrder({...emergencyOrder, deliveryTime: value})}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select delivery time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">6 Hours (Highest Priority)</SelectItem>
              <SelectItem value="12h">12 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="48h">48 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="emergencyReason" className="text-right">
            Justification *
          </Label>
          <Textarea
            id="emergencyReason"
            value={emergencyOrder.reason}
            onChange={(e) => setEmergencyOrder({...emergencyOrder, reason: e.target.value})}
            className="col-span-3"
            placeholder="Explain why this is an emergency requirement"
            rows={3}
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="emergencyAttachments" className="text-right">
            Supporting Docs
          </Label>
          <Input
            id="emergencyAttachments"
            type="file"
            onChange={(e) => setEmergencyOrder({...emergencyOrder, attachments: e.target.files?.[0] || null})}
            className="col-span-3"
          />
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-800">Cost Implications</h4>
            <p className="text-sm text-yellow-700">
              Emergency orders typically cost 15-30% more than standard procurement.
              This will be automatically approved but requires post-facto documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <Button 
        variant="outline" 
        onClick={() => setShowEmergencyModal(false)}
        disabled={isLoading.emergencyPO}
      >
        Cancel
      </Button>
      <Button 
        variant="destructive"
        onClick={handleEmergencyOrderSubmit}
        disabled={isLoading.emergencyPO}
      >
        {isLoading.emergencyPO ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Submit Emergency Order"
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

        {/* Emergency Procurement Component */}
        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Package className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="font-semibold">Emergency Procurement</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {emergencyOrdersThisMonth > 0 ? (
                `${emergencyOrdersThisMonth} emergency orders placed this month`
              ) : (
                "Fast-track procurement for urgent requirements"
              )}
            </p>
            <Button 
              className="w-full" 
              onClick={handleEmergencyPO}
              disabled={isLoading.emergencyPO}
            >
              {isLoading.emergencyPO ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : "Create Emergency Order"}
            </Button>
          </CardContent>
        </Card> */}

        {/* Contract Management Component */}
        <Card>
  <CardContent className="p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-teal-100 rounded-lg">
        <ShoppingCart className="h-5 w-5 text-teal-600" />
      </div>
      <h3 className="font-semibold">Contract Management</h3>
    </div>
    <p className="text-sm text-muted-foreground mb-4">
      {activeContracts > 0 ? (
        `${activeContracts} active contracts (${expiringSoon} expiring soon)`
      ) : (
        "Manage long-term contracts with vendors"
      )}
    </p>
    <div className="space-y-2">
       <Button 
        className="w-full" 
        onClick={() => setShowAllContractsModal(true)}
      >
        View All Contracts
      </Button>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => {
          setShowNewContractModal(true);
          setNewContract({
            vendor: "",
            type: "Material Supply",
            value: "",
            startDate: "",
            endDate: "",
            terms: "",
            documents: []
          });
        }}
      >
        Create New Contract
      </Button>
    </div>
  </CardContent>
</Card>

{/* Contract Details Modal */}
<Dialog open={showContractDetails} onOpenChange={setShowContractDetails}>
  <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {selectedContract?.vendor} Contract Details
      </DialogTitle>
      <DialogDescription>
        {selectedContract?.type} agreement
      </DialogDescription>
    </DialogHeader>
    
    {selectedContract && (
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Contract Value</Label>
            <p className="font-medium">{selectedContract.value}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                selectedContract.status === 'active' ? 'bg-green-500' : 
                selectedContract.status === 'expiring' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="capitalize">{selectedContract.status}</span>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Start Date</Label>
            <p className="font-medium">{selectedContract.startDate}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">End Date</Label>
            <p className="font-medium">{selectedContract.endDate}</p>
          </div>
        </div>
        
        <div>
          <Label className="text-muted-foreground">Terms & Conditions</Label>
          <div className="mt-1 p-3 bg-gray-50 rounded-md">
            <p className="text-sm">{selectedContract.terms}</p>
          </div>
        </div>
        
        <div>
          <Label className="text-muted-foreground">Attachments</Label>
          <div className="mt-2 space-y-2">
            {selectedContract.documents.length > 0 ? (
              selectedContract.documents.map((doc: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{doc}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownloadContract(selectedContract.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No documents attached</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          {selectedContract.status === 'expiring' && (
            <Button 
              variant="outline"
              onClick={() => {
                handleRenewContract(selectedContract.id);
                setShowContractDetails(false);
              }}
            >
              Renew Contract
            </Button>
          )}
          <Button 
            variant="destructive"
            onClick={() => {
              handleTerminateContract(selectedContract.id);
              setShowContractDetails(false);
            }}
          >
            Terminate Contract
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

{/* New Contract Modal */}
<Dialog open={showNewContractModal} onOpenChange={setShowNewContractModal}>
  <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Create New Contract</DialogTitle>
      <DialogDescription>
        Set up a new vendor contract or service agreement
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractVendor" className="text-right">
          Vendor *
        </Label>
        <Input
          id="contractVendor"
          value={newContract.vendor}
          onChange={(e) => setNewContract({...newContract, vendor: e.target.value})}
          className="col-span-3"
          placeholder="Enter vendor name"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractType" className="text-right">
          Type *
        </Label>
        <Select
          value={newContract.type}
          onValueChange={(value) => setNewContract({...newContract, type: value})}
          required
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select contract type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Material Supply">Material Supply</SelectItem>
            <SelectItem value="Equipment Lease">Equipment Lease</SelectItem>
            <SelectItem value="Service Agreement">Service Agreement</SelectItem>
            <SelectItem value="Maintenance">Maintenance Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractValue" className="text-right">
          Value (₹) *
        </Label>
        <Input
          id="contractValue"
          type="number"
          value={newContract.value}
          onChange={(e) => setNewContract({...newContract, value: e.target.value})}
          className="col-span-3"
          placeholder="Enter contract value"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractStart" className="text-right">
          Start Date *
        </Label>
        <Input
          id="contractStart"
          type="date"
          value={newContract.startDate}
          onChange={(e) => setNewContract({...newContract, startDate: e.target.value})}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractEnd" className="text-right">
          End Date *
        </Label>
        <Input
          id="contractEnd"
          type="date"
          value={newContract.endDate}
          onChange={(e) => setNewContract({...newContract, endDate: e.target.value})}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractTerms" className="text-right">
          Terms
        </Label>
        <Textarea
          id="contractTerms"
          value={newContract.terms}
          onChange={(e) => setNewContract({...newContract, terms: e.target.value})}
          className="col-span-3"
          placeholder="Key terms and conditions"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractDocs" className="text-right">
          Documents
        </Label>
        <Input
          id="contractDocs"
          type="file"
          className="col-span-3"
          onChange={(e) => {
            if (e.target.files) {
              const files = Array.from(e.target.files).map(file => file.name);
              setNewContract({...newContract, documents: files});
            }
          }}
          multiple
        />
      </div>
    </div>
    
    <DialogFooter>
      <Button 
        variant="outline" 
        onClick={() => setShowNewContractModal(false)}
      >
        Cancel
      </Button>
      <Button 
        onClick={handleNewContractSubmit}
      >
        Create Contract
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Contracts Tab Content */}
<TabsContent value="contracts" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Active Contracts</CardTitle>
      <CardDescription>
        {activeContracts} active contracts ({expiringSoon} expiring soon)
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {contracts.length > 0 ? (
          contracts.map((contract) => (
            <div key={contract.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{contract.vendor}</h4>
                  <p className="text-sm text-muted-foreground">{contract.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    contract.status === 'active' ? 'bg-green-100 text-green-800' :
                    contract.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {contract.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p>{contract.value}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p>{contract.startDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p>{contract.endDate}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewContract(contract)}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadContract(contract.id)}
                >
                  Download
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active contracts found</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</TabsContent>

<Dialog open={showAllContractsModal} onOpenChange={setShowAllContractsModal}>
  <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>All Contracts</DialogTitle>
      <DialogDescription>
        {activeContracts} active contracts ({expiringSoon} expiring soon)
      </DialogDescription>
    </DialogHeader>
    
          <div className="space-y-4">
            {contracts.length > 0 ? (
              contracts.map((contract) => (
                <Card key={contract.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{contract.vendor}</h3>
                        <p className="text-sm text-muted-foreground">{contract.type}</p>
                      </div>
                      <Badge 
                        variant={
                          contract.status === 'active' ? 'default' :
                          contract.status === 'expiring' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Value</p>
                        <p className="font-medium">{contract.value}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium">{contract.startDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p className="font-medium">{contract.endDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowContractDetails(true);
                          setShowAllContractsModal(false);
                        }}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadContract(contract.id)}
                      >
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No contracts found</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowAllContractsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </CardContent>
  </Card>

  {/* New Purchase Order Dialog */}
      <Dialog open={isPOModalOpen} onOpenChange={setIsPOModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Purchase Order</DialogTitle>
            <DialogDescription>
              Fill out the form to create a new purchase order. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handlePOFormSubmit();
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vendor" className="text-right">
                  Vendor
                </Label>
                <Select
                  value={poFormData.vendor}
                  onValueChange={(value) => setPoFormData({...poFormData, vendor: value})}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steel-corp">Steel Corp Ltd</SelectItem>
                    <SelectItem value="cement-ind">Cement Industries</SelectItem>
                    <SelectItem value="hardware-sol">Hardware Solutions</SelectItem>
                    <SelectItem value="safety-co">Safety First Co</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount (₹)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={poFormData.amount}
                  onChange={(e) => setPoFormData({...poFormData, amount: e.target.value})}
                  className="col-span-3"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={poFormData.description}
                  onChange={(e) => setPoFormData({...poFormData, description: e.target.value})}
                  className="col-span-3"
                  placeholder="Describe the materials or services being purchased"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={poFormData.priority}
                  onValueChange={(value) => setPoFormData({...poFormData, priority: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Standard lead time)</SelectItem>
                    <SelectItem value="medium">Medium (Expedited processing)</SelectItem>
                    <SelectItem value="high">High (Priority handling)</SelectItem>
                    <SelectItem value="emergency">Emergency (24hr delivery)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attachments" className="text-right">
                  Attachments
                </Label>
                <Input
                  id="attachments"
                  type="file"
                  onChange={(e) => setPoFormData({...poFormData, attachments: e.target.files?.[0] || null})}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setIsPOModalOpen(false)}
                disabled={isLoading.newPO}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading.newPO}
              >
                {isLoading.newPO ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : "Create Purchase Order"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Material Request Form Dialog */}
      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Material Request</DialogTitle>
            <DialogDescription>
              Submit a request for materials needed at your construction site
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="material" className="text-right">
                Material
              </Label>
              <Input
                id="material"
                value={newRequest.material}
                onChange={(e) => setNewRequest({...newRequest, material: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Steel Rebar, Cement, etc."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={newRequest.quantity}
                onChange={(e) => setNewRequest({...newRequest, quantity: e.target.value})}
                className="col-span-3"
                placeholder="Enter quantity with units"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="site" className="text-right">
                Site
              </Label>
              <Select
                value={newRequest.site}
                onValueChange={(value) => setNewRequest({...newRequest, site: value})}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select construction site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site-a">Site A - Downtown Tower</SelectItem>
                  <SelectItem value="site-b">Site B - Riverside Complex</SelectItem>
                  <SelectItem value="site-c">Site C - Suburban Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="urgency" className="text-right">
                Urgency
              </Label>
              <Select
                value={newRequest.urgency}
                onValueChange={(value) => setNewRequest({...newRequest, urgency: value})}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Can wait 2+ weeks)</SelectItem>
                  <SelectItem value="normal">Normal (Needed in 1-2 weeks)</SelectItem>
                  <SelectItem value="high">High (Needed within 7 days)</SelectItem>
                  <SelectItem value="critical">Critical (Needed within 48 hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={newRequest.notes}
                onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
                className="col-span-3"
                placeholder="Additional details or specifications"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button"
              variant="outline"
              onClick={() => setShowRequestForm(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSubmitRequest}
              disabled={isSubmittingRequest}
            >
              {isSubmittingRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request History Dialog */}
      <Dialog open={showRequestHistory} onOpenChange={setShowRequestHistory}>
  <DialogContent className="sm:max-w-[800px]">
    <DialogHeader>
      <DialogTitle>Material Request History</DialogTitle>
      <DialogDescription>
        View all submitted material requests and their status
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {requestHistory.length > 0 ? (
        <div className="border rounded-lg">
          {/* Header row */}
          <div className="grid grid-cols-11 gap-4 p-4 bg-gray-100 font-medium">
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Material</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-2">Site</div>
            <div className="col-span-2">Urgency</div>
            <div className="col-span-2">Status</div>
          </div>
          
          {/* Data rows */}
          {requestHistory.map((request) => (
            <div key={request.id} className="grid grid-cols-11 gap-4 p-4 border-t items-center">
              <div className="col-span-2 text-sm">{request.date}</div>
              <div className="col-span-2 font-medium">{request.material}</div>
              <div className="col-span-1">{request.quantity}</div>
              <div className="col-span-2 text-sm">
                {request.site === 'site-a' ? 'Downtown Tower' :
                 request.site === 'site-b' ? 'Riverside Complex' :
                 'Suburban Development'}
              </div>
              
              {/* Urgency Badge - centered in column */}
              <div className="col-span-2">
                <Badge 
                  variant={
                    request.urgency === 'critical' ? 'destructive' :
                    request.urgency === 'high' ? 'default' :
                    'outline'
                  }
                  className={`
                    ${request.urgency === 'high' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                    w-full flex justify-center
                  `}
                >
                  {request.urgency}
                </Badge>
              </div>
              
              {/* Status Badge - centered in column */}
              <div className="col-span-2">
                <Badge 
                  variant={
                    request.status === 'approved' ? 'default' :
                    request.status === 'rejected' ? 'destructive' :
                    request.status === 'completed' ? 'default' :
                    'secondary'
                  }
                  className={`
                    ${request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                    ${request.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                    w-full flex justify-center
                  `}
                >
                  {request.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No request history found</p>
        </div>
      )}
    </div>
    <DialogFooter>
      <Button onClick={() => setShowRequestHistory(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Bulk Opportunities Dialog */}
<Dialog open={showBulkOpportunities} onOpenChange={setShowBulkOpportunities}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Bulk Purchase Opportunities</DialogTitle>
      <DialogDescription>
        Potential savings through consolidated or bulk purchases
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {bulkOpportunities.map((opportunity) => (
        <div key={opportunity.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">{opportunity.material}</h4>
            <Badge variant="outline" className="text-green-600">
              Save ₹{opportunity.savings.toLocaleString()}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Current Price</p>
              <p>₹{opportunity.currentPrice.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Bulk Price</p>
              <p className="font-medium text-green-600">
                ₹{opportunity.bulkPrice.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Min Quantity</p>
              <p>{opportunity.minQuantity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Savings</p>
              <p className="font-medium text-green-600">
                {Math.round((opportunity.savings / (opportunity.currentPrice * opportunity.minQuantity)) * 100)}%
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
            onClick={() => {
              setBulkOrderMaterial(opportunity.material);
              setShowBulkOrderForm(true);
            }}
          >
            Initiate Bulk Order
          </Button>
        </div>
      ))}
    </div>
  </DialogContent>
</Dialog>

  {/* Bulk Opportunities Dialog */}
  <Dialog open={showBulkOpportunities} onOpenChange={setShowBulkOpportunities}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Bulk Purchase Opportunities</DialogTitle>
        <DialogDescription>
          Potential savings through consolidated or bulk purchases
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {bulkOpportunities.map((opportunity) => (
          <div key={opportunity.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{opportunity.material}</h4>
              <Badge variant="outline" className="text-green-600">
                Save ₹{opportunity.savings.toLocaleString()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current Price</p>
                <p>₹{opportunity.currentPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bulk Price</p>
                <p className="font-medium text-green-600">
                  ₹{opportunity.bulkPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Min Quantity</p>
                <p>{opportunity.minQuantity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Savings</p>
                <p className="font-medium text-green-600">
                  {Math.round((opportunity.savings / (opportunity.currentPrice * opportunity.minQuantity)) * 100)}%
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => {
                setBulkOrderMaterial(opportunity.material);
                setShowBulkOrderForm(true);
              }}
            >
              Initiate Bulk Order
            </Button>
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>

  {/* Bulk Order Form Dialog */}
  <Dialog open={showBulkOrderForm} onOpenChange={setShowBulkOrderForm}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Create Bulk Order</DialogTitle>
        <DialogDescription>
          {bulkOrderMaterial && `Ordering ${bulkOrderMaterial} in bulk quantities`}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="bulkMaterial" className="text-right">
            Material
          </Label>
          <Input
            id="bulkMaterial"
            value={bulkOrderMaterial || ""}
            className="col-span-3"
            disabled
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="bulkQuantity" className="text-right">
            Quantity
          </Label>
          <Input
            id="bulkQuantity"
            type="number"
            value={bulkOrderQuantity}
            onChange={(e) => setBulkOrderQuantity(e.target.value)}
            className="col-span-3"
            placeholder="Enter quantity"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="bulkVendor" className="text-right">
            Preferred Vendor
          </Label>
          <Select
            value={bulkOrderVendor}
            onValueChange={setBulkOrderVendor}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steel-corp">Steel Corp Ltd</SelectItem>
              <SelectItem value="metal-supply">Metal Supply Co</SelectItem>
              <SelectItem value="national-steel">National Steel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="bulkDelivery" className="text-right">
            Delivery Date
          </Label>
          <Input
            id="bulkDelivery"
            type="date"
            value={bulkOrderDelivery}
            onChange={(e) => setBulkOrderDelivery(e.target.value)}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button 
          type="button"
          variant="outline"
          onClick={() => setShowBulkOrderForm(false)}
        >
          Cancel
        </Button>
        <Button 
          type="button"
          onClick={async () => {
            if (!bulkOrderQuantity || !bulkOrderVendor || !bulkOrderDelivery) {
              toast({
                title: "Missing required fields",
                description: "Please fill out all fields",
                variant: "destructive"
              });
              return;
            }
            
            setIsSubmittingBulkOrder(true);
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              toast({
                title: "Bulk order created",
                description: `Your bulk order for ${bulkOrderMaterial} has been submitted`,
              });
              setShowBulkOrderForm(false);
              setShowBulkOpportunities(false);
            } finally {
              setIsSubmittingBulkOrder(false);
            }
          }}
          disabled={isSubmittingBulkOrder}
        >
          {isSubmittingBulkOrder ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : "Submit Bulk Order"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</TabsContent>

<TabsContent value="vendors" className="space-y-6">
  <Card>
  <CardHeader className="flex flex-row items-center justify-between">
  <div>
    <CardTitle>Vendor Performance Management</CardTitle>
    <CardDescription>Track and evaluate vendor performance across multiple metrics</CardDescription>
  </div>
  <Button 
    onClick={() => setShowNewVendorModal(true)}
    size="sm"
  >
    <Plus className="mr-2 h-4 w-4" />
    Add Vendor
  </Button>
</CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          {
            id: 'steel-corp',
            vendor: 'Steel Corp Ltd',
            category: 'Raw Materials',
            orders: 24,
            onTimeDelivery: 95,
            qualityScore: 4.5,
            priceCompetitiveness: 4.2,
            totalValue: '₹25L',
            status: 'Preferred',
            contact: 'Rajesh Kumar - +91 9876543210',
            contract: 'Active until Dec 2023',
            paymentTerms: 'Net 30',
            performanceNotes: 'Consistent quality, reliable delivery'
          },
          {
            id: 'cement-ind',
            vendor: 'Cement Industries',
            category: 'Building Materials',
            orders: 18,
            onTimeDelivery: 88,
            qualityScore: 4.2,
            priceCompetitiveness: 4.0,
            totalValue: '₹18L',
            status: 'Approved',
            contact: 'Priya Sharma - +91 8765432109',
            contract: 'Active until Nov 2023',
            paymentTerms: 'Net 45',
            performanceNotes: 'Good pricing but occasional delays'
          },
          {
            id: 'hardware-sol',
            vendor: 'Hardware Solutions',
            category: 'Tools & Equipment',
            orders: 32,
            onTimeDelivery: 92,
            qualityScore: 4.3,
            priceCompetitiveness: 4.1,
            totalValue: '₹12L',
            status: 'Preferred',
            contact: 'Vikram Patel - +91 7654321098',
            contract: 'Active until Jan 2024',
            paymentTerms: 'Net 15',
            performanceNotes: 'Excellent customer service'
          },
          {
            id: 'safety-co',
            vendor: 'Safety First Co',
            category: 'Safety Equipment',
            orders: 15,
            onTimeDelivery: 78,
            qualityScore: 3.8,
            priceCompetitiveness: 3.5,
            totalValue: '₹8L',
            status: 'Under Review',
            contact: 'Anjali Gupta - +91 6543210987',
            contract: 'Expiring next month',
            paymentTerms: 'Net 30',
            performanceNotes: 'Quality concerns reported'
          }
        ].map((vendor) => (
          <div key={vendor.id} className="p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-9 gap-4 items-center">
              <div className="md:col-span-2">
                <h4 className="font-medium">{vendor.vendor}</h4>
                <p className="text-sm text-muted-foreground">{vendor.category}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  vendor.status === 'Preferred' ? 'bg-green-100 text-green-800' :
                  vendor.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {vendor.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="font-medium">{vendor.orders}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On-Time</p>
                <p className="font-medium">{vendor.onTimeDelivery}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quality</p>
                <p className="font-medium">{vendor.qualityScore}/5.0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">{vendor.priceCompetitiveness}/5.0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-medium">{vendor.totalValue}</p>
              </div>
              <div className="flex justify-center gap-3 md:col-span-2">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setShowVendorDetails(true);
                  }}
                >
                  Details
                </Button>
                {/* <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleContactVendor(vendor.contact)}
                >
                  Contact
                </Button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>

  {/* Vendor Details Modal */}
  <Dialog open={showVendorDetails} onOpenChange={setShowVendorDetails}>
    <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{selectedVendor?.vendor} Details</DialogTitle>
        <DialogDescription>
          Comprehensive vendor performance and contract information
        </DialogDescription>
      </DialogHeader>
      
      {selectedVendor && (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Category</Label>
              <p className="font-medium">{selectedVendor.category}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  selectedVendor.status === 'Preferred' ? 'bg-green-500' : 
                  selectedVendor.status === 'Approved' ? 'bg-blue-500' : 
                  'bg-yellow-500'
                }`} />
                <span className="capitalize">{selectedVendor.status}</span>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Orders</Label>
              <p className="font-medium">{selectedVendor.orders}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Value</Label>
              <p className="font-medium">{selectedVendor.totalValue}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">On-Time Delivery</Label>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${selectedVendor.onTimeDelivery}%` }}
                  ></div>
                </div>
                <span className="text-sm">{selectedVendor.onTimeDelivery}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Quality Score</Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(selectedVendor.qualityScore) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm">({selectedVendor.qualityScore.toFixed(1)})</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Price Rating</Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(selectedVendor.priceCompetitiveness) ? 'text-blue-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm">({selectedVendor.priceCompetitiveness.toFixed(1)})</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-muted-foreground">Contact Information</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-sm">{selectedVendor.contact}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-muted-foreground">Contract Details</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-sm">{selectedVendor.contract}</p>
              <p className="text-sm mt-2">Payment Terms: {selectedVendor.paymentTerms}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-muted-foreground">Performance Notes</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-sm">{selectedVendor.performanceNotes}</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            {/* <Button 
              variant="outline"
              onClick={() => {
                setPoFormData({
                  ...poFormData,
                  vendor: selectedVendor.id,
                  description: `Purchase order for ${selectedVendor.category} from ${selectedVendor.vendor}`
                });
                setShowVendorDetails(false);
                setIsPOModalOpen(true);
              }}
            >
              Create PO
            </Button> */}
            {/* <Button 
              variant="outline"
              onClick={() => {
                setShowVendorDetails(false);
                handleVendorReport(selectedVendor.vendor);
              }}
            >
              Generate Report
            </Button> */}
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>

  {/* New Vendor Modal */}
  <AddVendorModal open={showNewVendorModal} onOpenChange={setShowNewVendorModal} />
</TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization Opportunities</CardTitle>
              <CardDescription>Identify and implement cost-saving strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Potential Savings</h3>
                  {[
                    {
                      opportunity: 'Bulk Steel Purchase',
                      category: 'Raw Materials',
                      currentCost: '₹4.5L',
                      optimizedCost: '₹3.8L',
                      savings: '₹70K',
                      impact: 'High'
                    },
                    {
                      opportunity: 'Cement Contract Renegotiation',
                      category: 'Building Materials',
                      currentCost: '₹2.2L',
                      optimizedCost: '₹1.9L',
                      savings: '₹30K',
                      impact: 'Medium'
                    },
                    {
                      opportunity: 'Local Vendor Partnership',
                      category: 'Transportation',
                      currentCost: '₹80K',
                      optimizedCost: '₹60K',
                      savings: '₹20K',
                      impact: 'Low'
                    }
                  ].map((opportunity, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{opportunity.opportunity}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          opportunity.impact === 'High' ? 'bg-red-100 text-red-800' :
                          opportunity.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {opportunity.impact} Impact
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{opportunity.category}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current</p>
                          <p className="font-medium">{opportunity.currentCost}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Optimized</p>
                          <p className="font-medium">{opportunity.optimizedCost}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Savings</p>
                          <p className="font-medium text-green-600">{opportunity.savings}</p>
                        </div>
                      </div>
                      {/* <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => handleImplementStrategy(opportunity.opportunity)}
                      >
                        Implement Strategy
                      </Button> */}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Savings Summary</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center mb-4">
                        <p className="text-3xl font-bold text-green-600">₹2.8L</p>
                        <p className="text-sm text-muted-foreground">Total savings this quarter</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Bulk Purchasing</span>
                          <span className="font-medium text-green-600">₹1.2L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Vendor Negotiations</span>
                          <span className="font-medium text-green-600">₹95K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Alternative Sourcing</span>
                          <span className="font-medium text-green-600">₹60K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Process Optimization</span>
                          <span className="font-medium text-green-600">₹45K</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">Cost Reduction Trends</h4>
                      <div className="space-y-2">
                        {[
                          { month: 'Jan', reduction: 15, target: 12 },
                          { month: 'Feb', reduction: 18, target: 15 },
                          { month: 'Mar', reduction: 22, target: 18 }
                        ].map((month) => (
                          <div key={month.month} className="flex items-center gap-3">
                            <span className="text-xs w-8">{month.month}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-green-500"
                                style={{ width: `${(month.reduction / 25) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium w-8">{month.reduction}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Category-wise Spending</h4>
                    <div className="space-y-3">
                      {[
                        { category: 'Raw Materials', amount: 4.5, percentage: 45, color: 'bg-blue-500' },
                        { category: 'Equipment', amount: 2.8, percentage: 28, color: 'bg-green-500' },
                        { category: 'Services', amount: 1.5, percentage: 15, color: 'bg-yellow-500' },
                        { category: 'Consumables', amount: 1.2, percentage: 12, color: 'bg-red-500' }
                      ].map((category) => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category.category}</span>
                            <span>₹{category.amount}L ({category.percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${category.color}`}
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Monthly Trends</h4>
                    <div className="space-y-2">
                      {[
                        { month: 'January', orders: 45, value: 8.5 },
                        { month: 'February', orders: 52, value: 9.2 },
                        { month: 'March', orders: 38, value: 7.8 }
                      ].map((month) => (
                        <div key={month.month} className="flex justify-between items-center">
                          <span className="text-sm">{month.month}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium">₹{month.value}L</p>
                            <p className="text-xs text-muted-foreground">{month.orders} orders</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Key Performance Indicators</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Order Processing Time</span>
                        <span className="font-medium text-green-600">2.3 days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vendor Response Rate</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cost Variance</span>
                        <span className="font-medium text-red-600">+3.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Emergency Orders</span>
                        <span className="font-medium">8%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Vendor Diversity</h4>
                    <div className="space-y-3">
                      {[
                        { type: 'Local Vendors', count: 12, percentage: 50 },
                        { type: 'Regional Vendors', count: 8, percentage: 33 },
                        { type: 'National Vendors', count: 4, percentage: 17 }
                      ].map((type) => (
                        <div key={type.type} className="flex justify-between items-center">
                          <span className="text-sm">{type.type}</span>
                          <span className="font-medium">{type.count} ({type.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isPOModalOpen} onOpenChange={setIsPOModalOpen}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Create New Purchase Order</DialogTitle>
      <DialogDescription>
        Fill out the form to create a new purchase order. All fields are required.
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={(e) => {
      e.preventDefault();
      handlePOFormSubmit();
    }}>
      <div className="grid gap-4 py-4">
        {/* Vendor Select */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vendor" className="text-right">
            Vendor
          </Label>
          <Select
            value={poFormData.vendor}
            onValueChange={(value) => setPoFormData({...poFormData, vendor: value})}
            required
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steel-corp">Steel Corp Ltd</SelectItem>
              <SelectItem value="cement-ind">Cement Industries</SelectItem>
              <SelectItem value="hardware-sol">Hardware Solutions</SelectItem>
              <SelectItem value="safety-co">Safety First Co</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount (₹)
          </Label>
          <Input
            id="amount"
            type="number"
            value={poFormData.amount}
            onChange={(e) => setPoFormData({...poFormData, amount: e.target.value})}
            className="col-span-3"
            placeholder="Enter amount"
            required
          />
        </div>

        {/* Description Textarea */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={poFormData.description}
            onChange={(e) => setPoFormData({...poFormData, description: e.target.value})}
            className="col-span-3"
            placeholder="Describe the materials or services being purchased"
            rows={3}
            required
          />
        </div>

        {/* Priority Select */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="priority" className="text-right">
            Priority
          </Label>
          <Select
            value={poFormData.priority}
            onValueChange={(value) => setPoFormData({...poFormData, priority: value})}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select priority level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Standard lead time)</SelectItem>
              <SelectItem value="medium">Medium (Expedited processing)</SelectItem>
              <SelectItem value="high">High (Priority handling)</SelectItem>
              <SelectItem value="emergency">Emergency (24hr delivery)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Attachments Input */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="attachments" className="text-right">
            Attachments
          </Label>
          <Input
            id="attachments"
            type="file"
            onChange={(e) => setPoFormData({...poFormData, attachments: e.target.files?.[0] || null})}
            className="col-span-3"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          type="button"
          onClick={() => setIsPOModalOpen(false)}
          disabled={isLoading.newPO}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isLoading.newPO}
        >
          {isLoading.newPO ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : "Create Purchase Order"}
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
    </div>
  );
};

const PurchaseManagement = () => {
  return (
    <PageUserFilterProvider allowedRoles={['site', 'store']}>
      <PurchaseManagementContent />
    </PageUserFilterProvider>
  );
};

export default PurchaseManagement;
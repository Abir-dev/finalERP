import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface AddVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VendorData {
  gstin: string;
  name: string;
  supplierType: string;
  gstCategory: string;
  email: string;
  mobile: string;
  preferredBillingAddress: boolean;
  preferredShippingAddress: boolean;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
}

export const AddVendorModal = ({ open, onOpenChange }: AddVendorModalProps) => {
  const [vendorData, setVendorData] = useState<VendorData>({
    gstin: "",
    name: "",
    supplierType: "Company",
    gstCategory: "Unregistered",
    email: "",
    mobile: "",
    preferredBillingAddress: false,
    preferredShippingAddress: false,
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India"
  });

  const handleSave = async () => {
    if (!vendorData.name || !vendorData.supplierType || !vendorData.gstCategory) {
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
      
      toast({
        title: "Supplier added successfully",
        description: `${vendorData.name} has been registered in the system`,
      });
      
      // Reset form
      setVendorData({
        gstin: "",
        name: "",
        supplierType: "Company",
        gstCategory: "Unregistered",
        email: "",
        mobile: "",
        preferredBillingAddress: false,
        preferredShippingAddress: false,
        postalCode: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "India"
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error adding supplier",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    // Reset form
    setVendorData({
      gstin: "",
      name: "",
      supplierType: "Company",
      gstCategory: "Unregistered",
      email: "",
      mobile: "",
      preferredBillingAddress: false,
      preferredShippingAddress: false,
      postalCode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India"
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Supplier</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* GSTIN / UIN Section */}
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN / UIN</Label>
            <Input
              id="gstin"
              value={vendorData.gstin}
              onChange={(e) => setVendorData({...vendorData, gstin: e.target.value})}
              placeholder="Enter GSTIN / UIN"
            />
            <p className="text-sm text-muted-foreground">
              Autofill party information by entering their GSTIN
            </p>
          </div>

          {/* Supplier Name */}
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name *</Label>
            <Input
              id="supplierName"
              value={vendorData.name}
              onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
              placeholder="Enter supplier name"
              required
            />
          </div>

          {/* Supplier Type */}
          <div className="space-y-2">
            <Label htmlFor="supplierType">Supplier Type *</Label>
            <Select
              value={vendorData.supplierType}
              onValueChange={(value) => setVendorData({...vendorData, supplierType: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Company">Company</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Partnership">Partnership</SelectItem>
                <SelectItem value="Proprietorship">Proprietorship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* GST Category */}
          <div className="space-y-2">
            <Label htmlFor="gstCategory">GST Category *</Label>
            <Select
              value={vendorData.gstCategory}
              onValueChange={(value) => setVendorData({...vendorData, gstCategory: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select GST category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unregistered">Unregistered</SelectItem>
                <SelectItem value="Registered">Registered</SelectItem>
                <SelectItem value="Composition">Composition</SelectItem>
                <SelectItem value="SEZ">SEZ</SelectItem>
                <SelectItem value="Deemed Export">Deemed Export</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Contact Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Primary Contact Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email ID</Label>
                <Input
                  id="email"
                  type="email"
                  value={vendorData.email}
                  onChange={(e) => setVendorData({...vendorData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={vendorData.mobile}
                  onChange={(e) => setVendorData({...vendorData, mobile: e.target.value})}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>

          {/* Primary Address Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Primary Address Details</h3>
            <p className="text-sm text-muted-foreground">
              When you enter a GSTIN, the permanent address linked to it is autofilled. Change the Postal Code to autofill other addresses.
            </p>
            
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preferredBillingAddress"
                  checked={vendorData.preferredBillingAddress}
                  onCheckedChange={(checked) => 
                    setVendorData({...vendorData, preferredBillingAddress: checked as boolean})
                  }
                />
                <Label htmlFor="preferredBillingAddress">Preferred Billing Address</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preferredShippingAddress"
                  checked={vendorData.preferredShippingAddress}
                  onCheckedChange={(checked) => 
                    setVendorData({...vendorData, preferredShippingAddress: checked as boolean})
                  }
                />
                <Label htmlFor="preferredShippingAddress">Preferred Shipping Address</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={vendorData.postalCode}
                  onChange={(e) => setVendorData({...vendorData, postalCode: e.target.value})}
                  placeholder="Enter postal code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City/Town</Label>
                <Input
                  id="city"
                  value={vendorData.city}
                  onChange={(e) => setVendorData({...vendorData, city: e.target.value})}
                  placeholder="Enter city/town"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={vendorData.addressLine1}
                onChange={(e) => setVendorData({...vendorData, addressLine1: e.target.value})}
                placeholder="Enter address line 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={vendorData.addressLine2}
                onChange={(e) => setVendorData({...vendorData, addressLine2: e.target.value})}
                placeholder="Enter address line 2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={vendorData.state}
                  onChange={(e) => setVendorData({...vendorData, state: e.target.value})}
                  placeholder="Enter state/province"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={vendorData.country}
                  onChange={(e) => setVendorData({...vendorData, country: e.target.value})}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          {/* <Button 
            variant="outline" 
            onClick={handleCancel}
          >
            Edit Full Form
          </Button> */}
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
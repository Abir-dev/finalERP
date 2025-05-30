import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddVehicleModalProps {
  onClose: () => void;
  onAdd: (vehicle: {
    name: string;
    type: string;
    regNumber: string;
    site: string;
    status: string;
  }) => void;
}

const vehicleTypes = ['Truck', 'Excavator', 'Crane', 'Loader'];
const sites = ['Site A', 'Site B', 'Site C', 'Depot'];
const statuses = ['Active', 'Idle', 'Maintenance'];

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ onClose, onAdd }) => {
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [site, setSite] = useState('');
  const [status, setStatus] = useState('');

  function handleAdd() {
    onAdd({
      name: vehicleName,
      type: vehicleType,
      regNumber,
      site,
      status,
    });
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="vehicleName">Vehicle Name</Label>
            <Input id="vehicleName" value={vehicleName} onChange={e => setVehicleName(e.target.value)} placeholder="e.g. Truck 1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Type</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger id="vehicleType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="regNumber">Registration Number</Label>
            <Input id="regNumber" value={regNumber} onChange={e => setRegNumber(e.target.value)} placeholder="e.g. MH12AB1234" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site">Assigned Site</Label>
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger id="site">
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(st => (
                  <SelectItem key={st} value={st}>{st}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              disabled={!vehicleName || !vehicleType || !regNumber || !site || !status}
              onClick={handleAdd}
            >
              Add Vehicle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleModal; 
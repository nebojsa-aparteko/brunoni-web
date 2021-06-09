interface VesselAllocation {
  carrierId: string;
  carrierCode: string;
  service: string;
  vesselCode: string;
  vesselName: string;
  voyageNumber: string;
  teuAllocation: string;
  teuBooked: string;
  teuPercent: string;
  weightAllocation: string;
  weightBooked: string;
  weightPercent: string;
  requested?: Allocation;
  inProgress?: Allocation;
}

export default VesselAllocation;

interface Allocation {
  count: number;
  weight: number;
  quantity: number;
}

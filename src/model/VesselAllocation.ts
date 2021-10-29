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
  isFullyBooked?: boolean;
}

export interface PrevNextVesselResponse {
  BookingSpace: VesselResponse[];
}

export interface VesselResponse {
  CarrierCode: string;
  CarrierID: string;
  ETS: string;
  Port: string;
  Service: string;
  'TEU-Allocation': string;
  'TEU-Booked': string;
  'TEU-Percent': string;
  VesselCode: string;
  VesselName: string;
  VoyageNr: string;
  'Weight-Allocation': string;
  'Weight-Booked': string;
  'Weight-Percent': string;
}

export default VesselAllocation;

interface Allocation {
  count: number;
  weight: number;
  quantity: number;
}

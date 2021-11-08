interface VesselWithVoyage {
  bookingId: string;
  ets?: Date;
  eta?: Date;
  pol?: string;
  pod?: string;
  vesselWithVoyage?: string;
  erpCarrierId?: string;
  erpServiceId?: string;
  clientId?: string;
  category?: string;
  carrier?: string;
  checklistCheckedCount?: boolean;
  checklistItemCount?: boolean;
}

export default VesselWithVoyage;

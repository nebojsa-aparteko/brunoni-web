export default interface LoadListContainerModel {
  container: string;
  bookingId: string;
  pickUp?: Date;
  gateIn?: Date;
  carrierId: string;
  ets: Date;
  voyage?: string;
  vessel?: string;
  sealNum?: string;
  status?: string;
  pol?: string;
  deliveryRef?: string;
  checklistCheckedCount?: number;
  checklistItemCount?: number;
}

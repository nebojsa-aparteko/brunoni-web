export default interface LoadListContainerModel {
  container: string;
  bookingId: string;
  sealNo: string;
  pickUp?: Date;
  gateIn?: Date;
  carrierId: string;
  ets: Date;
  voyage?: string;
  vessel?: string;
  sealNum?: string;
  status?: string;
  deliveryRef?: string;
  checklistCheckedCount?: number;
  checklistItemCount?: number;
}

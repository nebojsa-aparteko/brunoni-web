export default interface LoadListContainerModel {
  id?: string;
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
  deliveryRef?: string;
}

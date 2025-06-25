export interface DeliveryGroup {
  id: string;
  name: string;
  places?: Place[];
}

export interface Place {
  name?: string;
}

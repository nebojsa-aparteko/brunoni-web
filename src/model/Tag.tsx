export interface Tag {
  id: string;
  text: string;
  color: string;
  category: TagCategory;
}

export enum TagCategory {
  BOOKING = 'BOOKING',
  BOOKING_REQUEST = 'BOOKING_REQUEST',
}

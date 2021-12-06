import Entity from './Entity';
import { Omit } from '@material-ui/core';

export default interface RouteFromCityEntity extends Entity {
  distance: number;
  name: string;
  countryCode: string;
  zipCode: string;
}

export type RouteFromCity = Omit<RouteFromCityEntity, keyof Entity>;

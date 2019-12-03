import IMO from './IMO';
import OOG from './OOG';

export default interface ContainerDetails {
  imo: [false] | [true, IMO[]];
  oog: [false] | [true, OOG[]];
}

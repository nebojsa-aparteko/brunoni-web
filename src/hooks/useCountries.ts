import { useContext } from 'react';
import Countries from '../contexts/Countries';

export default function useCountries() {
  return useContext(Countries);
}

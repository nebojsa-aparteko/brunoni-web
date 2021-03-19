import { CountedValue } from '../model/EquipmentControl';

export default (...args: CountedValue[]) => {
  const result = {} as CountedValue;

  args.forEach(basket => {
    for (let [key, value] of Object.entries(basket || {})) {
      if (result[key]) {
        result[key] += value;
      } else {
        result[key] = value;
      }
    }
  });
  return result;
};

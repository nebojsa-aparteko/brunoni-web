// for European ports system needs Pickup/Drop Off location, if origin or destination is not in Europe,
// this field should not be seen. The following list contains countries that should show PU/DO location field
// these should all stay in lowercase for comparison reasons
export const europeanCountries = [
  'germany',
  'denmark',
  'finland',
  'norway',
  'sweden',
  'spain',
  'netherlands',
  'italy',
  'belgium',
  'france',
  'austria',
  'switzerland',
];

// for some cities there should be only <<CITY_NAME>> PORT displayed as available option and other options filtered
export const doNotShowCities = [
  'antwerp',
  'antwerpen',
  'beveren - verrebroek',
  'doel',
  'rotterdam',
  'hamburg',
  'genoa',
  'schweiz',
  'bremerhaven',
  'le havre',
  "gonfreville l'orcher",
  'jk rotterdam',
  'kt rotterdam',
  'km rotterdam',
  'ld rotterdam',
  'la maasvlakte-rt',
  'lb, maasvlakte rotterdam',
];

export const adrNameToFilterOut = [
  'schweiz',
  'inland',
  'rekingen',
  'port', // this one is dummy placeholder for oversee shipments
];

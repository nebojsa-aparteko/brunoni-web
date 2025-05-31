const quoteDetailFilterList: string[] = [
  'bunker adjustment sur.',
  'seefracht',
  'seafreight',
  'bunker adjust. factor',
  'new bunker factor',
  'environmental fuel fee',
  'environm. compliance ch.',
  'fuel adjustment factor',
  'fuel element contribution',
  'low sulphur surcharge',
  'emergency bunker surchar',
  'emission control area s.',
  'emergency fuel factor',
  'interim fuel charge',
  'inter fuel surcharge',
  'currency adjust. factor',
  'overweight surcharge',
  'panama canal surcharge',
  'suez canal surcharge',
  'aden gulf surcharge',
  'peak season add.',
  'piracy surcharge',
  'war risk surcharge',
  'port additional charge',
  'congestion surcharge',
  'cost recovery charge',
  'emergency risk surcharge',
  'ashdod imbalance surch.',
  'carrier security surch.',
  'haifa imbalance surcharge',
  'low sulphur additional',
  'carrier security fee',
  'special equipment charge',
  'ship security charge',
];

if (import.meta.env.VITE_BRAND === 'allmarine') {
  quoteDetailFilterList.unshift('gfs', 'green fuel surcharge');
}

export default quoteDetailFilterList;

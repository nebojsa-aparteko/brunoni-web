enum TransportModeType {
  TRUCK = 'TRUCK',
  RAIL = 'RAIL',
  BARGE = 'BARGE',
  BARGE_ROAD = 'BARGE ROAD COMBINED',
  BARGE_RAIL = 'BARGE RAIL COMBINED',
  RAIL_ROAD = 'RAIL ROAD COMBINED',
}

enum TransportModeLabels {
  TRUCK = 'TRUCK',
  RAIL = 'RAIL',
  BARGE = 'BARGE',
  'BARGE ROAD COMBINED' = 'BARGE / TRUCK',
  'BARGE RAIL COMBINED' = 'BARGE / RAIL',
  'RAIL ROAD COMBINED' = 'RAIL / TRUCK',
}

export { TransportModeType, TransportModeLabels };

let routesTestData = `{
  "Routes": [
  {
    "TransitTime": "30",
    "ErrorMessage": null,
    "Service": "ECSA - AE",
    "Routing": "1 TRANSSHIPMENT",
    "SpaceInfo": "OK",
    "SpaceInfoColor": "#04aa06",
    "idRequest": null,
    "idRoute": null,
    "OriginInfo": {
      "DepartureDate": "2019-11-14",
      "Port": {
        "ID": "NLRTM",
        "HarbourName": "ROTTERDAM",
        "PortName": "NETHERLANDS / ROTTERDAM<br/> DDE ECT DELTA TERMINAL<br/> EUROPAWEG 875 / PORT NO. 8200<br/> ROTTERDAM, NETHERLANDS",
        "Land": "NETHERLANDS"
      },
      "VoyageInfo": {
        "VesselName": "CAP SAN ARTEMISSIO",
        "VoyageNr": "946S",
        "Carrier": "HAMBURG SÜD"
      }
    },
    "DestinationInfo": {
      "ArrivalDate": "2019-12-14",
      "Port": {
        "ID": "BRSSA",
        "HarbourName": "SALVADOR DE BAHIA",
        "PortName": "BRAZIL / SALVADOR DE BAHIA<br/> TECON SALVADOR SA<br/> AV ENGENHEIRO OSCAR PONTES<br/> POSTCAL CODE 40460-130<br/> SALVADOR DE BAHIA, BRAZIL",
        "Land": "BRAZIL"
      },
      "VoyageInfo": {
        "VesselName": "PEDRO ALVARES CABRAL",
        "VoyageNr": "949N",
        "Carrier": "HAMBURG SÜD"
      }
    },
    "IntermediatePortInfos": [
      {
        "ArrivalDate": "2019-12-07",
        "DepartureDate": "2019-12-10",
        "Port": {
          "ID": "BRSSZ",
          "HarbourName": "SANTOS",
          "PortName": null,
          "Land": "BRAZIL"
        },
        "VoyageInfo": {
          "VesselName": "PEDRO ALVARES CABRAL",
          "VoyageNr": "949N",
          "Carrier": "HAMBURG SÜD"
        }
      }
    ],
    "Deadlines": [
      {
        "Typ": "FCL",
        "Time": "12.11.2019 (DI - 16.00 H)",
        "AdditionalInfo": null
      },
      {
        "Typ": "S/I",
        "Time": "12.11.2019 (DI - 10.00 H)",
        "AdditionalInfo": null
      },
      {
        "Typ": "VGM",
        "Time": "12.11.2019 (DI - 10.00 H)",
        "AdditionalInfo": null
      }
    ]
  },
  {
    "TransitTime": "35",
    "ErrorMessage": null,
    "Service": "ECSA - AE",
    "Routing": "1 TRANSSHIPMENT",
    "SpaceInfo": "OK",
    "SpaceInfoColor": "#04aa06",
    "idRequest": null,
    "idRoute": null,
    "OriginInfo": {
      "DepartureDate": "2019-11-14",
      "Port": {
        "ID": "NLRTM",
        "HarbourName": "ROTTERDAM",
        "PortName": "NETHERLANDS / ROTTERDAM<br/> DDE ECT DELTA TERMINAL<br/> EUROPAWEG 875 / PORT NO. 8200<br/> ROTTERDAM, NETHERLANDS",
        "Land": "NETHERLANDS"
      },
      "VoyageInfo": {
        "VesselName": "CAP SAN ARTEMISSIO",
        "VoyageNr": "946S",
        "Carrier": "HAMBURG SÜD"
      }
    },
    "DestinationInfo": {
      "ArrivalDate": "2019-12-19",
      "Port": {
        "ID": "BRSSA",
        "HarbourName": "SALVADOR DE BAHIA",
        "PortName": "BRAZIL / SALVADOR DE BAHIA<br/> TECON SALVADOR SA<br/> AV ENGENHEIRO OSCAR PONTES<br/> POSTCAL CODE 40460-130<br/> SALVADOR DE BAHIA, BRAZIL",
        "Land": "BRAZIL"
      },
      "VoyageInfo": {
        "VesselName": "MSC FIAMMETTA",
        "VoyageNr": "950N",
        "Carrier": "HAMBURG SÜD"
      }
    },
    "IntermediatePortInfos": [
      {
        "ArrivalDate": "2019-12-07",
        "DepartureDate": "2019-12-14",
        "Port": {
          "ID": "BRSSZ",
          "HarbourName": "SANTOS",
          "PortName": null,
          "Land": "BRAZIL"
        },
        "VoyageInfo": {
          "VesselName": "MSC FIAMMETTA",
          "VoyageNr": "950N",
          "Carrier": "HAMBURG SÜD"
        }
      }
    ],
    "Deadlines": [
      {
        "Typ": "FCL",
        "Time": "12.11.2019 (DI - 16.00 H)",
        "AdditionalInfo": null
      },
      {
        "Typ": "S/I",
        "Time": "12.11.2019 (DI - 10.00 H)",
        "AdditionalInfo": null
      },
      {
        "Typ": "VGM",
        "Time": "12.11.2019 (DI - 10.00 H)",
        "AdditionalInfo": null
      }
    ]
  },
  {
    "TransitTime": "30",
    "ErrorMessage": null,
    "Service": "ECSA - AE",
    "Routing": "1 TRANSSHIPMENT",
    "SpaceInfo": "OK",
    "SpaceInfoColor": "#04aa06",
    "idRequest": null,
    "idRoute": null,
    "OriginInfo": {
      "DepartureDate": "2019-11-21",
      "Port": {
        "ID": "NLRTM",
        "HarbourName": "ROTTERDAM",
        "PortName": "NETHERLANDS / ROTTERDAM<br/> DDE ECT DELTA TERMINAL<br/> EUROPAWEG 875 / PORT NO. 8200<br/> ROTTERDAM, NETHERLANDS",
        "Land": "NETHERLANDS"
      },
      "VoyageInfo": {
        "VesselName": "CAP SAN MARCO",
        "VoyageNr": "947S",
        "Carrier": "HAMBURG SÜD"
      }
    },
    "DestinationInfo": {
      "ArrivalDate": "2019-12-21",
      "Port": {
        "ID": "BRSSA",
        "HarbourName": "SALVADOR DE BAHIA",
        "PortName": "BRAZIL / SALVADOR DE BAHIA<br/> TECON SALVADOR SA<br/> AV ENGENHEIRO OSCAR PONTES<br/> POSTCAL CODE 40460-130<br/> SALVADOR DE BAHIA, BRAZIL",
        "Land": "BRAZIL"
      },
      "VoyageInfo": {
        "VesselName": "MONTE SARMIENTO",
        "VoyageNr": "950N",
        "Carrier": "HAMBURG SÜD"
      }
    },
    "IntermediatePortInfos": [
      {
        "ArrivalDate": "2019-12-14",
        "DepartureDate": "2019-12-17",
        "Port": {
          "ID": "BRSSZ",
          "HarbourName": "SANTOS",
          "PortName": null,
          "Land": "BRAZIL"
        },
        "VoyageInfo": {
          "VesselName": "MONTE SARMIENTO",
          "VoyageNr": "950N",
          "Carrier": "HAMBURG SÜD"
        }
      }
    ],
    "Deadlines": [
      {
        "Typ": "FCL",
        "Time": "19.11.2019 (DI - 16.00 H)",
        "AdditionalInfo": null
      },
      {
        "Typ": "S/I",
        "Time": "19.11.2019 (DI - 10.00 H)",
        "AdditionalInfo": null
      },
      {
        "Typ": "VGM",
        "Time": "19.11.2019 (DI - 10.00 H)",
        "AdditionalInfo": null
      }
    ]
  },
  {
    "TransitTime": "34",
    "ErrorMessage": null,
    "Service": "ECSA - AE",
    "Routing": "1 TRANSSHIPMENT",
    "SpaceInfo": "OK",
    "SpaceInfoColor": "#04aa06",
    "idRequest": null,
    "idRoute": null,
    "OriginInfo": {
      "DepartureDate": "2019-11-21",
      "Port": {
        "ID": "NLRTM",
        "HarbourName": "ROTTERDAM",
        "PortName": "NETHERLANDS / ROTTERDAM<br/> DDE ECT DELTA TERMINAL<br/> EUROPAWEG 875 / PORT NO. 8200<br/> ROTTERDAM, NETHERLANDS",
        "Land": "NETHERLANDS"
      },
      "VoyageInfo": {
        "VesselName": "CAP SAN MARCO",
        "VoyageNr": "947S",
        "Carrier": "HAMBURG SÜD"
      }
    },
    "DestinationInfo": {
      "ArrivalDate": "2019-12-25",
      "Port": {
        "ID": "BRSSA",
        "HarbourName": "SALVADOR DE BAHIA",
        "PortName": "BRAZIL / SALVADOR DE BAHIA<br/> TECON SALVADOR SA<br/> AV ENGENHEIRO OSCAR PONTES<br/> POSTCAL CODE 40460-130<br/> SALVADOR DE BAHIA, BRAZIL",
        "Land": "BRAZIL"
      },
      "VoyageInfo": {
        "VesselName": "MONTE ACONCAGUA",
        "VoyageNr": "951N",
        "Carrier": "HAMBURG SÜD"
      }
    },
    "IntermediatePortInfos": [
      {
        "ArrivalDate": "2019-12-14",
        "DepartureDate": "2019-12-20",
        "Port": {
          "ID": "BRSSZ",
          "HarbourName": "SANTOS",
          "PortName": null,
          "Land": "BRAZIL"
        },
        "VoyageInfo": {
          "VesselName": "MONTE ACONCAGUA",
          "VoyageNr": "951N",
          "Carrier": "HAMBURG SÜD"
        }
      }
    ],
    "Deadlines": [
      {
        "Typ": "FCL",
        "Time": "19.11.2019 (DI - 16.00 H)",
        "AdditionalInfo": null
      },
      {
        "Typ": "S/I",
        "Time": "19.11.2019 (DI - 10.00 H)",
        "AdditionalInfo": null
      },
      {
        "Typ": "VGM",
        "Time": "19.11.2019 (DI - 10.00 H)",
        "AdditionalInfo": null
      }
    ]
  },
  {
    "TransitTime": "30",
    "ErrorMessage": null,
    "Service": "ECSA - AE",
    "Routing": "1 TRANSSHIPMENT",
    "SpaceInfo": "OK",
    "SpaceInfoColor": "#04aa06",
    "idRequest": null,
    "idRoute": null,
    "OriginInfo": {
      "DepartureDate": "2019-11-28",
      "Port": {
        "ID": "NLRTM",
        "HarbourName": "ROTTERDAM",
        "PortName": "NETHERLANDS / ROTTERDAM<br/> DDE ECT DELTA TERMINAL<br/> EUROPAWEG 875 / PORT NO. 8200<br/> ROTTERDAM, NETHERLANDS",
        "Land": "NETHERLANDS"
      },
      "VoyageInfo": {
        "VesselName": "CAP SAN NICOLAS",
        "VoyageNr": "948S",
        "Carrier": "HAMBURG SÜD"
      }
    },
    "DestinationInfo": {
      "ArrivalDate": "2019-12-28",
      "Port": {
        "ID": "BRSSA",
        "HarbourName": "SALVADOR DE BAHIA",
        "PortName": "BRAZIL / SALVADOR DE BAHIA<br/> TECON SALVADOR SA<br/> AV ENGENHEIRO OSCAR PONTES<br/> POSTCAL CODE 40460-130<br/> SALVADOR DE BAHIA, BRAZIL",
        "Land": "BRAZIL"
      },
      "VoyageInfo": {
        "VesselName": "AMERICO VESPUCIO",
        "VoyageNr": "951N",
        "Carrier": "HAMBURG SÜD"
      }
    },
    "IntermediatePortInfos": [
      {
        "ArrivalDate": "2019-12-21",
        "DepartureDate": "2019-12-24",
        "Port": {
          "ID": "BRSSZ",
          "HarbourName": "SANTOS",
          "PortName": null,
          "Land": "BRAZIL"
        },
        "VoyageInfo": {
          "VesselName": "AMERICO VESPUCIO",
          "VoyageNr": "951N",
          "Carrier": "HAMBURG SÜD"
        }
      }
    ],
    "Deadlines": [
      {
        "Typ": "FCL",
        "Time": "26.11.2019 (DI - 16.00 H)",
        "AdditionalInfo": null
      },
      {
        "Typ": "S/I",
        "Time": "26.11.2019 (DI - 10.00 H)",
        "AdditionalInfo": null
      },
      {
        "Typ": "VGM",
        "Time": "26.11.2019 (DI - 10.00 H)",
        "AdditionalInfo": null
      }
    ]
  }
]
}
`;

export default routesTestData;

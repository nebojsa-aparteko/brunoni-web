import cheerio from 'cheerio';

enum Types {
  CANCELED = 'Cancelled',
  REQUESTED = 'Requested',
}

enum Titles {
  // Odd table
  BOOKER = 'BOOKER',
  CONTACT = 'CONTACT',
  SHIPPER = 'SHIPPER',
  CARRIER = 'Carrier/NVOCC/Booking Agent',
  INTTRA_REFERENCE_NUMBER = 'INTTRA REFERENCE NUMBER',
  CARRIER_BOOKING_NUMBER = 'CARRIER BOOKING NUMBER',
  CUSTOMER_SHIPMENT_ID = 'CUSTOMER SHIPMENT ID',
  BOOKING_OFFICE = 'BOOKING OFFICE',
  CONTRACT_NUMBER = 'CONTRACT NUMBER',
  FREIGHT_FORWARDERS_REFERENCE_NUMBERS = "FREIGHT FORWARDER'S REFERENCE NUMBER(S)",
  SHIPPER_REFERENCE_NUMBERS = "SHIPPER'S REFERENCE NUMBER(S)",
  CUSTOMER_PREFERENCES = 'CUSTOMER PREFERENCES',
  CUSTOMER_TRANSACTION_ASSEMBLED_DATE = 'CUSTOMER TRANSACTION ASSEMBLED DATE',
  MOVE_TYPE = 'MOVE TYPE',
  PLACE_OF_CARRIER_RECEIPT = 'PLACE OF CARRIER RECEIPT',
  PLACE_OF_CARRIER_DELIVERY = 'PLACE OF CARRIER DELIVERY',
  MAIN_PORT_OF_LOAD = 'MAIN PORT OF LOAD',
  MAIN_PORT_OF_DISCHARGE = 'MAIN PORT OF DISCHARGE',
  SAIL_DATE = 'SAIL DATE',
  ESTIMATED_ARRIVAL_DATE = 'ESTIMATED ARRIVAL DATE',
  // Normal table
  CUSTOMER_COMMENTS = 'CUSTOMER COMMENTS',
  TRANSPORT_PLAN_DETAILS = 'TRANSPORT PLAN DETAILS',
  CARGO_PACKING = 'CARGO / PACKING',
  PACKAGES = 'PACKAGES',
  CARGO_DESCRIPTION = 'CARGO DESCRIPTION',
  CARGO_WEIGHT_EXCLUDING_TARE = 'CARGO WEIGHT (EXCLUDING TARE)',
  GROSS_VOLUME = 'GROSS VOLUME',
  NET_WEIGHT = 'NET WEIGHT',
  NET_VOLUME = 'NET VOLUME',
  CONTAINER = 'CONTAINER',
  REEFER_SETTINGS = 'REEFER SETTINGS',
  EMPTY_CONTAINER_PICK_UP_LOCATION = 'PICK-UP LOCATION',
  EMPTY_CONTAINER_REQUESTED_PICK_UP_DATE = 'PICK-UP DATE',
  PAYMENT_TERM = 'PAYMENT TERM',
  FREIGHT_PAYER = 'FREIGHT PAYER',
  PAYMENT_LOCATION = 'PAYMENT LOCATION',
}

enum NeededData {
  // Odd Table
  INTTRA_ID = 'INTTRA ID',
  EMAIL_ADDRESS = 'Email Address',
  PHONE_NUMBER = 'Phone Number',
  // Normal Table
  TRANSPORT_MODE = 'Transport Mode',
  CONVEYANCE_TYPE = 'Conveyance Type',
  CARRIER = 'Carrier',
  VESSEL = 'Vessel',
  VOYAGE = 'Voyage',
  QUANTITY = 'Quantity',
  CONTAINER_NUMBER = 'Container Number',
  SIZE_TYPE_CODE = 'Size/Type',
  NET_WEIGHT = 'Net Weight',
  NET_VOLUME = 'Net Volume',
  EQUIPMENT_SUPPLIER = 'Equipment Supplier',
  EMPTY_FULL = 'Empty/Full',
  SERVICE_ARRANGEMENT = 'Service Arrangement',
  HAULAGE_ARRANGEMENT = 'Haulage Arrangement',
  POSTAL_CODE = 'Postal Code',
  COUNTRY_CODE = 'Country Code',
}

interface PuckUpLocation {
  COUNTRY_CODE: string;
  POSTAL_CODE: string;
  ADDRESS: string[];
}

export interface HtmlBookingContainer {
  EMPTY_CONTAINER_PICK_UP_LOCATION?: PuckUpLocation;
  EMPTY_CONTAINER_REQUESTED_PICK_UP_DATE?: string;
  EMPTY_FULL?: string;
  EQUIPMENT_SUPPLIER: string;
  HAULAGE_ARRANGEMENT: string;
  NET_VOLUME?: string;
  NET_WEIGHT: string;
  QUANTITY: string;
  REEFER_SETTINGS?: string;
  SERVICE_ARRANGEMENT: string;
  SIZE?: string;
  TYPE?: string;
}

export interface HtmlBookingRequest {
  // Odd table
  BOOKER_INTTRA_ID: string;
  BOOKER_CONTACT_EMAIL: string;
  BOOKER_PHONE_NUMBER: string;
  CARRIER_INTTRA_ID: string;
  CARRIER_ID: string;
  CARRIER_BOOKING_NUMBER?: string;
  INTTRA_REFERENCE_NUMBER: string;
  CUSTOMER_SHIPMENT_ID: string;
  BOOKING_OFFICE?: string;
  CONTRACT_NUMBER: string;
  FREIGHT_FORWARDERS_REFERENCE_NUMBERS: string[];
  SHIPPER_REFERENCE_NUMBERS: string[];
  CUSTOMER_PREFERENCES?: string;
  CUSTOMER_TRANSACTION_ASSEMBLED_DATE: string;
  MOVE_TYPE: string;
  PLACE_OF_CARRIER_RECEIPT: string;
  PLACE_OF_CARRIER_DELIVERY: string;
  MAIN_PORT_OF_LOAD: string;
  MAIN_PORT_OF_DISCHARGE: string;
  SAIL_DATE: string;
  ESTIMATED_ARRIVAL_DATE: string;
  // Normal table
  CUSTOMER_COMMENTS: string;
  TRANSPORT_MODE: string;
  CONVEYANCE_TYPE: string;
  CARRIER: string;
  VESSEL: string;
  VOYAGE: string;
  CARGO_PACKING: string;
  PACKAGES?: string;
  CARGO_DESCRIPTION: string;
  CARGO_WEIGHT_EXCLUDING_TARE?: string;
  GROSS_VOLUME?: string;
  CONTAINERS: HtmlBookingContainer[];
  PAYMENT_TERM?: string;
  FREIGHT_PAYER?: string;
  PAYMENT_LOCATION?: string;
  BOOKING_TYPE?: string;
}

interface DataOddTable {
  [key: string]: string[];
}

interface DataNormalTable {
  [key: string]: string[][];
}

const parseOddTable = ($: cheerio.Root, table: cheerio.Cheerio) => {
  let DATA: DataOddTable = {};

  table.find('td').each((index, td) => {
    let titleData: string;
    let prevTitleData: string;
    const titles = $(td).find('strong');
    titles.each((index, title) => {
      prevTitleData = $(titles.get(index - 1))
        .text()
        .replace(/\s+/g, ' ')
        .trim();
      titleData = $(title)
        .text()
        .replace(/\s+/g, ' ')
        .trim();
      // Get all siblings until next <strong> tag
      let siblings = $(title).nextUntil('strong');
      const dataArray: string[] = [];
      // Iterate over <strong> siblings
      siblings.each((index, sibling) => {
        //Siblings are either <span> OR <br>.
        const tagName = sibling.tagName;
        // Ignore <br>
        if (tagName === 'br') return;
        else {
          // Iterate over <span class='data_nopad'> children
          $(sibling.childNodes).each((index, child) => {
            // child is either <br> OR #text.
            const tagName = child.tagName;
            // Ignore <br>
            if (tagName === 'br') return;
            else {
              const text = $(child)
                .text()
                .replace(/\s+/g, ' ')
                .trim();
              if (text) dataArray.push(text);
            }
          });
        }
      });
      if (DATA[titleData]) {
        DATA[prevTitleData + '_' + titleData] = dataArray;
      } else {
        DATA[titleData] = dataArray;
      }
    });
  });
  return DATA;
};

const findDataOddTable = (
  object: DataOddTable,
  key: Titles,
  neededData?: NeededData,
  index?: number,
  multiple?: boolean,
) => {
  if (!object[key]) return;
  // get by index
  if (index) return object[key][index];
  // if multiple return array
  if (multiple) return object[key];
  // get by field, split by comma
  if (neededData) {
    let data = object[key].find(el => el.includes(neededData));
    data = data?.split(':')[1].trim();
    return data;
  } else {
    // get directly by title. Always the 1st element
    return object[key][0];
  }
};

const extractDataOddTable = (object: DataOddTable) => {
  // Booker
  const BOOKER_INTTRA_ID = findDataOddTable(object, Titles.BOOKER, NeededData.INTTRA_ID);
  const BOOKER_CONTACT_EMAIL = findDataOddTable(object, Titles.CONTACT, NeededData.EMAIL_ADDRESS);
  const BOOKER_PHONE_NUMBER = findDataOddTable(object, Titles.CONTACT, NeededData.PHONE_NUMBER);
  // Carrier
  const CARRIER_INTTRA_ID = findDataOddTable(object, Titles.CARRIER, NeededData.INTTRA_ID);
  const CARRIER_ID = findDataOddTable(object, Titles.CARRIER, undefined, 1);
  const CARRIER_BOOKING_NUMBER = findDataOddTable(object, Titles.CARRIER_BOOKING_NUMBER);

  const INTTRA_REFERENCE_NUMBER = findDataOddTable(object, Titles.INTTRA_REFERENCE_NUMBER);
  const CUSTOMER_SHIPMENT_ID = findDataOddTable(object, Titles.CUSTOMER_SHIPMENT_ID);
  const BOOKING_OFFICE = findDataOddTable(object, Titles.BOOKING_OFFICE);
  console.log(object);
  const CONTRACT_NUMBER = findDataOddTable(object, Titles.CONTRACT_NUMBER);
  console.log(CONTRACT_NUMBER);
  const FREIGHT_FORWARDERS_REFERENCE_NUMBERS = findDataOddTable(
    object,
    Titles.FREIGHT_FORWARDERS_REFERENCE_NUMBERS,
    undefined,
    undefined,
    true,
  );
  const SHIPPER_REFERENCE_NUMBERS = findDataOddTable(
    object,
    Titles.SHIPPER_REFERENCE_NUMBERS,
    undefined,
    undefined,
    true,
  );
  const CUSTOMER_PREFERENCES = findDataOddTable(object, Titles.CUSTOMER_PREFERENCES);
  const CUSTOMER_TRANSACTION_ASSEMBLED_DATE = findDataOddTable(object, Titles.CUSTOMER_TRANSACTION_ASSEMBLED_DATE);
  const MOVE_TYPE = findDataOddTable(object, Titles.MOVE_TYPE);
  const PLACE_OF_CARRIER_RECEIPT = findDataOddTable(object, Titles.PLACE_OF_CARRIER_RECEIPT);
  const PLACE_OF_CARRIER_DELIVERY = findDataOddTable(object, Titles.PLACE_OF_CARRIER_DELIVERY);
  const MAIN_PORT_OF_LOAD = findDataOddTable(object, Titles.MAIN_PORT_OF_LOAD);
  const MAIN_PORT_OF_DISCHARGE = findDataOddTable(object, Titles.MAIN_PORT_OF_DISCHARGE);
  const SAIL_DATE = findDataOddTable(object, Titles.SAIL_DATE);
  const ESTIMATED_ARRIVAL_DATE = findDataOddTable(object, Titles.ESTIMATED_ARRIVAL_DATE);

  const DATA = {
    BOOKER_INTTRA_ID,
    BOOKER_CONTACT_EMAIL,
    BOOKER_PHONE_NUMBER,
    CARRIER_INTTRA_ID,
    CARRIER_ID,
    CARRIER_BOOKING_NUMBER,
    INTTRA_REFERENCE_NUMBER,
    CUSTOMER_SHIPMENT_ID,
    BOOKING_OFFICE,
    CONTRACT_NUMBER,
    FREIGHT_FORWARDERS_REFERENCE_NUMBERS,
    SHIPPER_REFERENCE_NUMBERS,
    CUSTOMER_PREFERENCES,
    CUSTOMER_TRANSACTION_ASSEMBLED_DATE,
    MOVE_TYPE,
    PLACE_OF_CARRIER_RECEIPT,
    PLACE_OF_CARRIER_DELIVERY,
    MAIN_PORT_OF_LOAD,
    MAIN_PORT_OF_DISCHARGE,
    SAIL_DATE,
    ESTIMATED_ARRIVAL_DATE,
  };
  return DATA;
};

const parseNormalTable = ($: cheerio.Root, table: cheerio.Cheerio) => {
  let DATA: DataNormalTable = {};
  // find table rows
  const tableRows = table.find('tr');
  const nTableRows = tableRows.length;
  let curDataTableRowIndex = 1;
  // titles are always in the 1st row
  const titlesTableRow = $(tableRows.get(0));
  // Iterate over remaining table rows
  while (curDataTableRowIndex < nTableRows) {
    // get current data table row
    const dataTableRow = $(tableRows.get(curDataTableRowIndex));
    // init variables
    let dataArray: string[] = [];
    let title: string = '';
    let insideTitle: string = 'info';
    // get the table data columns
    dataTableRow.children().each((index, column) => {
      // index is mapping 1 to 1 title to data
      title = $(titlesTableRow.children().get(index))
        .text()
        .replace(/\s+/g, ' ')
        .trim();
      // ignore 'NET WEIGHT' & 'NET VOLUME' because it's already under CONTAINER info
      if (title?.includes(Titles.NET_WEIGHT)) return;
      if (title?.includes(Titles.NET_VOLUME)) return;
      // iterate over column children with data
      $(column)
        .children()
        .each((index, child) => {
          // child is either <br>, <strong> (inside title) OR <span> (data).
          // Ignore <br>
          const tagName = child.tagName;
          if (tagName === 'br') return;
          //insideTitle
          if (tagName === 'strong') {
            insideTitle = $(child)
              .text()
              .replace(/\s+/g, ' ')
              .trim();
            // ignore '--------------------'
            if (insideTitle?.includes('-----')) return;
            dataArray.push(insideTitle);
          }
          // data
          if (tagName === 'span') {
            // Iterate over <span class='data_nopad'> children
            $(child.childNodes).each((index, child) => {
              // child is either <br> OR #text.
              const tagName = child.tagName;
              // Ignore <br>
              if (tagName === 'br') return;
              else {
                const text = $(child)
                  .text()
                  .replace(/\s+/g, ' ')
                  .trim();
                if (text) dataArray.push(text);
              }
            });
          }
          if (DATA[title]) {
            DATA[title] = [...DATA[title], dataArray];
          } else {
            DATA[title] = [dataArray];
          }
          dataArray = [];
        });
    });
    curDataTableRowIndex++;
  }
  return DATA;
};

const getNeededData = (array: string[], neededData: NeededData) => {
  return array
    .find(el => el.includes(neededData))
    ?.split(':')[1]
    .trim();
};

const getContainerData = (array: string[]) => {
  const QUANTITY = getNeededData(array, NeededData.QUANTITY);
  const SIZE_TYPE_CODE = getNeededData(array, NeededData.SIZE_TYPE_CODE);
  //todo. different naming (HAMBURG SUED?)
  //todo. TRANSPORT PLAN DETAILS missing
  //todo. date reversed
  //todo. reversed in INTTRA_BKG_1_176427567?
  //console.log(SIZE_TYPE_CODE)
  const TYPE = SIZE_TYPE_CODE?.substring(0, SIZE_TYPE_CODE?.indexOf(' '));
  const SIZE = SIZE_TYPE_CODE?.substring(SIZE_TYPE_CODE?.indexOf(' ') + 1).slice(1, -1);
  const NET_WEIGHT = getNeededData(array, NeededData.NET_WEIGHT);
  const NET_VOLUME = getNeededData(array, NeededData.NET_VOLUME);
  const EQUIPMENT_SUPPLIER = getNeededData(array, NeededData.EQUIPMENT_SUPPLIER);
  const EMPTY_FULL = getNeededData(array, NeededData.EMPTY_FULL);
  const SERVICE_ARRANGEMENT = getNeededData(array, NeededData.SERVICE_ARRANGEMENT);
  const HAULAGE_ARRANGEMENT = getNeededData(array, NeededData.HAULAGE_ARRANGEMENT);

  const CONTAINER = {
    QUANTITY,
    SIZE,
    TYPE,
    NET_WEIGHT,
    NET_VOLUME,
    EQUIPMENT_SUPPLIER,
    EMPTY_FULL,
    SERVICE_ARRANGEMENT,
    HAULAGE_ARRANGEMENT,
  } as HtmlBookingContainer;

  return CONTAINER;
};

const getContainerLocation = (array: string[]) => {
  if (!array) return undefined;

  const ADDRESS: string[] | undefined = [];
  let POSTAL_CODE: string | undefined;
  let COUNTRY_CODE: string | undefined;
  array.forEach(el => {
    if (el.includes(NeededData.POSTAL_CODE)) {
      POSTAL_CODE = el.split(':')[1].trim();
    } else if (el.includes(NeededData.COUNTRY_CODE)) {
      COUNTRY_CODE = el.split(':')[1].trim();
    } else {
      ADDRESS.push(el);
    }
  });
  const location = {
    ADDRESS,
    POSTAL_CODE,
    COUNTRY_CODE,
  };
  return location;
};

const getContainerMainData = (container: string[][]) => {
  const data = container.find(
    data => data[0]?.includes(NeededData.QUANTITY) || data[0]?.includes(NeededData.CONTAINER_NUMBER),
  );
  if (data) return getContainerData(data);
};

const getContainerTitleData = (container: string[][], title: Titles) => {
  const index = container.findIndex(data => data[0]?.includes(title));
  if (index === -1) return;
  // Data is always after title
  const next = container[index + 1];
  switch (title) {
    case Titles.EMPTY_CONTAINER_PICK_UP_LOCATION:
      return getContainerLocation(next);
    case Titles.EMPTY_CONTAINER_REQUESTED_PICK_UP_DATE:
    case Titles.REEFER_SETTINGS:
      return next[0];
  }
};

const findDataNormalTable = (object: DataNormalTable, key: Titles, neededData?: NeededData, container?: boolean) => {
  if (!object[key]) return undefined;

  if (container) {
    let data = object[key];
    let containers: any = [];
    // indexes where new container data start
    const startIndexes: number[] = [];
    data.forEach((el, index) => {
      if (el[0]?.includes(NeededData.QUANTITY) || el[0]?.includes(NeededData.CONTAINER_NUMBER)) {
        startIndexes.push(index);
      }
    });
    // divide into different arrays
    const slicedData = startIndexes.map((el, index) => {
      if (startIndexes[index + 1]) return data.slice(startIndexes[index], startIndexes[index + 1]);
      else return data.slice(startIndexes[index], data.length);
    });
    // map over containers and get data
    slicedData.forEach(container => {
      // First data in container
      const main = getContainerMainData(container);
      // Data with title in container
      const EMPTY_CONTAINER_PICK_UP_LOCATION = getContainerTitleData(
        container,
        Titles.EMPTY_CONTAINER_PICK_UP_LOCATION,
      );
      const EMPTY_CONTAINER_REQUESTED_PICK_UP_DATE = getContainerTitleData(
        container,
        Titles.EMPTY_CONTAINER_REQUESTED_PICK_UP_DATE,
      );
      const REEFER_SETTINGS = getContainerTitleData(container, Titles.REEFER_SETTINGS);

      containers.push({
        ...main,
        EMPTY_CONTAINER_PICK_UP_LOCATION,
        EMPTY_CONTAINER_REQUESTED_PICK_UP_DATE,
        REEFER_SETTINGS,
      });
    });
    return containers;
  }

  let flattenData = object[key].flat();

  if (neededData) {
    const data = flattenData.find(el => el.includes(neededData));
    if (!data) return undefined;
    // Data separated by '/'. Ex. TRANSPORT PLAN DETAILS
    return getNeededData(data.split('/'), neededData);
  } else {
    // get directly by title. Always the 1st element
    return flattenData[0];
  }
};

const extractDataNormalTable = (object: DataNormalTable) => {
  const CUSTOMER_COMMENTS = findDataNormalTable(object, Titles.CUSTOMER_COMMENTS);
  // TRANSPORT PLAN DETAILS
  const TRANSPORT_MODE = findDataNormalTable(object, Titles.TRANSPORT_PLAN_DETAILS, NeededData.TRANSPORT_MODE);
  const CONVEYANCE_TYPE = findDataNormalTable(object, Titles.TRANSPORT_PLAN_DETAILS, NeededData.CONVEYANCE_TYPE);
  const CARRIER = findDataNormalTable(object, Titles.TRANSPORT_PLAN_DETAILS, NeededData.CARRIER);
  const VESSEL = findDataNormalTable(object, Titles.TRANSPORT_PLAN_DETAILS, NeededData.VESSEL);
  const VOYAGE = findDataNormalTable(object, Titles.TRANSPORT_PLAN_DETAILS, NeededData.VOYAGE);
  // CARGO
  const CARGO_PACKING = findDataNormalTable(object, Titles.CARGO_PACKING);
  const PACKAGES = findDataNormalTable(object, Titles.PACKAGES);
  const CARGO_DESCRIPTION = findDataNormalTable(object, Titles.CARGO_DESCRIPTION);
  const CARGO_WEIGHT_EXCLUDING_TARE = findDataNormalTable(object, Titles.CARGO_WEIGHT_EXCLUDING_TARE);
  const GROSS_VOLUME = findDataNormalTable(object, Titles.GROSS_VOLUME);
  // CONTAINERS
  const CONTAINERS = findDataNormalTable(object, Titles.CONTAINER, undefined, true);
  // CHARGE TYPE
  const PAYMENT_TERM = findDataNormalTable(object, Titles.PAYMENT_TERM);
  const FREIGHT_PAYER = findDataNormalTable(object, Titles.FREIGHT_PAYER);
  const PAYMENT_LOCATION = findDataNormalTable(object, Titles.PAYMENT_LOCATION);

  const DATA = {
    CUSTOMER_COMMENTS,
    TRANSPORT_MODE,
    CONVEYANCE_TYPE,
    CARRIER,
    VESSEL,
    VOYAGE,
    CARGO_PACKING,
    PACKAGES,
    CARGO_DESCRIPTION,
    CARGO_WEIGHT_EXCLUDING_TARE,
    GROSS_VOLUME,
    CONTAINERS,
    PAYMENT_TERM,
    FREIGHT_PAYER,
    PAYMENT_LOCATION,
  };
  return DATA;
};

const findOddTableIndex = ($: cheerio.Root, dataTables: cheerio.Cheerio): number => {
  let oddDataTableIndex = 0;
  let currTableIndex = 0;
  const nDataTables = dataTables.length;

  while (currTableIndex < nDataTables) {
    const tableElement = dataTables.get(currTableIndex);
    const table = $(tableElement);
    const title = $(table)
      .find('strong')
      .text();

    if (title.includes(Titles.BOOKER)) {
      oddDataTableIndex = currTableIndex;
      break;
    }
    currTableIndex++;
  }
  return oddDataTableIndex;
};

export const Parse = (html: string): HtmlBookingRequest | undefined => {
  const $ = cheerio.load(html);

  const bookingType = $('span[class=h]').text();

  // If type not requested, return undefined
  if (!bookingType.includes(Types.REQUESTED)) return;

  const dataTables = $('table[class=blBody]');
  const nDataTables = dataTables.length;

  const oddDataTableIndex = findOddTableIndex($, dataTables);

  let oddTable: DataOddTable = {};
  let normalTable: DataNormalTable = {};

  let nCurrTable = 0;

  while (nCurrTable < nDataTables) {
    const tableElement = dataTables.get(nCurrTable);
    const table = $(tableElement);
    if (nCurrTable === oddDataTableIndex) {
      oddTable = parseOddTable($, table);
    } else {
      // Destructuring because there are several normal tables, so it combines into 1
      normalTable = { ...normalTable, ...parseNormalTable($, table) };
    }
    nCurrTable++;
  }
  return {
    ...extractDataOddTable(oddTable),
    ...extractDataNormalTable(normalTable),
  } as HtmlBookingRequest;
};

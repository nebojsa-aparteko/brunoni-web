import cheerio from 'cheerio';

enum titles {
  CUSTOMER_COMMENTS = 'CUSTOMER COMMENTS',
  BOOKER = 'BOOKER',
  CONTACT = 'CONTACT',
  SHIPPER = 'SHIPPER',
  CARRIER = 'Carrier/NVOCC/Booking Agent',
  REF_NUMBER = 'INTTRA REFERENCE NUMBER',
  CARRIER_BOOKING_NUMBER = 'CARRIER BOOKING NUMBER',
  CUSTOMER_SHIPMENT_ID = 'CUSTOMER SHIPMENT ID',
  TRANSPORT_PLAN_DETAILS = 'TRANSPORT PLAN DETAILS',
  NET_WEIGHT = 'NET WEIGHT',
  NET_VOLUME = 'NET VOLUME',
  MAIN_CARRIAGE = 'MAIN CARRIAGE',
}

interface DataOddTable {
  [key: string]: string[];
}

interface DataNormalTable {
  [key: string]: string[][];
}

export const readAndParseFile = async (file: File) => {
  const reader = new FileReader();
  reader.readAsText(file, 'utf-8');
  reader.onload = () => {
    parse(<string>reader.result);
  };
};

const parseOddTable = ($: cheerio.Root, table: cheerio.Cheerio) => {
  let DATA: DataOddTable = {};

  table.find('td').each((index, td) => {
    let titleData: string;
    const titles = $(td).find('strong');
    titles.each((index, title) => {
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
      DATA[titleData] = dataArray;
    });
  });
  console.log(DATA);
  return DATA;
};

const extractDataOddTable = (object: DataOddTable) => {};

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
      //console.log('title: ', title)
      // ignore 'NET WEIGHT' & 'NET VOLUME' because it's already under CONTAINER info
      if (title.includes(titles.NET_WEIGHT)) return;
      if (title.includes(titles.NET_VOLUME)) return;
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
            if (insideTitle.includes('-----')) return;
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
  console.log(DATA);
  return DATA;
};

const extractDataNormalTable = (object: DataNormalTable) => {};

const parse = (html: string) => {
  const $ = cheerio.load(html);

  let oddDataTable = 0;
  let title = $('body > table:nth-child(2) > tbody > tr:nth-child(1) > td > strong').text();
  if (title === titles.CUSTOMER_COMMENTS) {
    oddDataTable = 1;
  }
  console.log('oddTable: ', oddDataTable);

  const dataTables = $('table[class=blBody]');
  const nDataTables = dataTables.length;
  console.log('nTables: ', nDataTables);

  let oddTable: DataOddTable = {};
  let normalTable: DataNormalTable = {};

  let nCurrTable = 0;
  while (nCurrTable < nDataTables) {
    const tableElement = dataTables.get(nCurrTable);
    const table = $(tableElement);
    console.log('\ncurr table: ', nCurrTable);
    if (nCurrTable === oddDataTable) {
      console.log('_______________ ODD TABLE _______________ ');

      oddTable = parseOddTable($, table);
      extractDataOddTable(oddTable);

      console.log('_________________________________________ \n');
    } else {
      normalTable = parseNormalTable($, table);
      extractDataNormalTable(normalTable);
    }
    nCurrTable++;
  }
};

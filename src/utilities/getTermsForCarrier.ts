import { CarrierId } from '../model/Booking';

export default (carrier: string | undefined) => {
  switch (carrier) {
    case CarrierId.HMM:
      return 'http://www.hmm21.com/cms/company/korn/download/Original_BL.pdf';
    case CarrierId.HSG:
      return 'https://www.hamburgsud-line.com/liner/media/sonstiges/terms___conditions/bl/2017-01_HS_BL.pdf';
    case CarrierId.MACS:
      return 'https://www.macship.com/TERMS';
    case CarrierId.SLOM:
      return 'https://www.sloman-neptun.com/fileadmin/bill_of_lading/general_form.pdf';
    case CarrierId.STNN:
      return 'https://www.stinnes-linien.de/Portals/0/docs/downloads/STINNES_BL_T&C_ed_201802.pdf';
    case CarrierId.UAL:
      return 'https://ualalliance.com/wp-content/uploads/2020/01/UAL-BILL-OF-LADING-CONDITIONS-OF-CARRIAGE.pdf';
    default:
      return '#';
  }
};

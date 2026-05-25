export type PrimarySalesFile = {
  sales: Array<{
    /** Property registry id as decimal string */
    propertyId: string;
    chainId: number;
    saleAddress: `0x${string}`;
    paymentToken: `0x${string}`;
    paymentDecimals: number;
    paymentSymbol: string;
  }>;
};

/** Globals set by Veriff CDN scripts (sdk + incontext). */

export type VeriffSessionResponse = {
  status?: string;
  verification?: {
    id?: string;
    url: string;
    host?: string;
    status?: string;
    sessionToken?: string;
  };
};

export type VeriffOnSession = (err: Error | null, response: VeriffSessionResponse | null) => void;

export interface VeriffOptions {
  host: string;
  apiKey: string;
  parentId: string;
  onSession: VeriffOnSession;
}

export interface VeriffMountOptions {
  formLabel?: { givenName?: string; lastName?: string; vendorData?: string };
  submitBtnText?: string;
  loadingText?: string;
}

export interface VeriffSetParams {
  person?: { givenName?: string; lastName?: string };
  vendorData?: string;
}

export interface VeriffInstance {
  mount: (opts?: VeriffMountOptions) => void;
  setParams: (opts: VeriffSetParams) => void;
}

export type VeriffFactory = (opts: VeriffOptions) => VeriffInstance;

declare global {
  interface Window {
    Veriff: VeriffFactory;
    veriffSDK: {
      createVeriffFrame: (opts: { url: string }) => void;
    };
  }
}

export {};

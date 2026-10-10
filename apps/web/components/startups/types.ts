export type StartupFundingType =
  | 'INVESTMENT'
  | 'GRANT';

export type StartupFunding = {
  id: string;
  startupId: string;

  type:
    StartupFundingType;

  amount?:
    | string
    | number
    | null;

  currency?:
    | string
    | null;

  source?:
    | string
    | null;

  round?:
    | string
    | null;

  fundedAt?:
    | string
    | null;

  notes?:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
};

export type StartupDocument = {
  id: string;

  fileName: string;
  originalName?:
    | string
    | null;

  fileUrl: string;
  storageKey: string;

  mimeType?:
    | string
    | null;

  fileSize?:
    | number
    | null;

  description?:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
};

export type Startup = {
  id: string;

  name: string;

  founderName?:
    | string
    | null;

  phone?:
    | string
    | null;

  email?:
    | string
    | null;

  stage?:
    | string
    | null;

  status:
    | 'ACTIVE'
    | 'PAUSED'
    | 'COMPLETED'
    | 'ARCHIVED';

  joinedAt?:
    | string
    | null;

  notes?:
    | string
    | null;

  logoUrl?:
    | string
    | null;

  funding:
    StartupFunding[];

  documents?:
    StartupDocument[];

  _count?: {
    tasks: number;
    documents: number;
  };

  createdAt: string;
  updatedAt: string;
};
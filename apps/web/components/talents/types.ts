export type TalentStatus =
  | 'AVAILABLE'
  | 'OPEN_TO_OFFERS'
  | 'EMPLOYED'
  | 'NOT_AVAILABLE';

export type LanguageLevel =
  | 'BASIC'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'FLUENT'
  | 'NATIVE';

export type TalentLanguage = {
  id: string;
  language: string;
  level: LanguageLevel;
  talentId: string;
  createdAt: string;
};

export type TalentDocument = {
  id: string;

  fileName: string;
  originalName?: string | null;

  fileUrl: string;
  storageKey: string;

  mimeType?: string | null;
  fileSize?: number | null;

  description?: string | null;

  createdAt: string;
  updatedAt: string;

  uploadedBy?: {
    id: string;
    name: string;
    surname?: string | null;
  };
};

export type Talent = {
  id: string;

  fullName: string;
  position?: string | null;

  phone?: string | null;
  email?: string | null;
  telegram?: string | null;

  location?: string | null;
  currentCompany?: string | null;

  experienceYears?: number | null;

  salaryExpectation?:
    | number
    | string
    | null;

  salaryCurrency?: string | null;

  status: TalentStatus;

  photoUrl?: string | null;

  notes?: string | null;

  languages: TalentLanguage[];

  documents?: TalentDocument[];

  _count?: {
    documents: number;
  };

  createdAt: string;
  updatedAt: string;
};

export type TalentFormValues = {
  fullName: string;
  position: string;

  phone: string;
  email: string;
  telegram: string;

  location: string;
  currentCompany: string;

  experienceYears: string;

  salaryExpectation: string;
  salaryCurrency: string;

  status: TalentStatus;

  notes: string;

  englishLevel:
    | ''
    | LanguageLevel;

  russianLevel:
    | ''
    | LanguageLevel;

  uzbekLevel:
    | ''
    | LanguageLevel;
};
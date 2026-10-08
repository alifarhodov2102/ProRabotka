export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'REPLIED'
  | 'FOLLOW_UP'
  | 'MEETING_PLANNED'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'NO_RESPONSE';

export type UserOption = {
  id: string;
  name: string;
  email: string;
};

export type Campaign = {
  id: string;
  name: string;
  country: string;
  city?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  targetSectors?: string | null;
  description?: string | null;

  _count?: {
    leads: number;
  };

  leads?: {
    status: LeadStatus;
  }[];
};

export type Lead = {
  id: string;

  companyName: string;
  country: string;
  city?: string | null;
  industry?: string | null;

  website?: string | null;
  companyLinkedIn?: string | null;

  contactName?: string | null;
  contactPosition?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactLinkedIn?: string | null;

  source?: string | null;
  channel?: string | null;

  status: LeadStatus;

  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;

  notes?: string | null;

  campaignId?: string | null;
  ownerId?: string | null;

  campaign?: {
    id: string;
    name: string;
    country: string;
  } | null;

  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type Overview = {
  total: number;
  contacted: number;
  replied: number;
  meetings: number;
  interested: number;
  followUpsToday: number;
  overdueFollowUps: number;

  attention: Array<{
    id: string;
    companyName: string;
    country: string;
    status: LeadStatus;
    nextFollowUpAt: string | null;
    attentionType: 'OVERDUE' | 'TODAY';

    owner?: {
      id: string;
      name: string;
    } | null;
  }>;
};

export type QuickLeadForm = {
  companyName: string;
  country: string;
  city: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  status: LeadStatus;
  campaignId: string;
  nextFollowUpAt: string;
  ownerId: string;
};

export type CampaignForm = {
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  targetSectors: string;
  description: string;
};

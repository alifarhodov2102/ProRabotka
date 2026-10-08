import type {
  CampaignForm,
  LeadStatus,
  QuickLeadForm,
} from './types';

export const leadStatuses: Array<{
  value: LeadStatus;
  label: string;
}> = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'REPLIED', label: 'Replied' },
  { value: 'FOLLOW_UP', label: 'Follow up' },
  { value: 'MEETING_PLANNED', label: 'Meeting planned' },
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'NOT_INTERESTED', label: 'Not interested' },
  { value: 'NO_RESPONSE', label: 'No response' },
];

export const emptyQuickLead: QuickLeadForm = {
  companyName: '',
  country: '',
  city: '',
  industry: '',
  contactName: '',
  contactEmail: '',
  status: 'NEW',
  campaignId: '',
  nextFollowUpAt: '',
  ownerId: '',
};

export const emptyCampaign: CampaignForm = {
  name: '',
  country: '',
  city: '',
  startDate: '',
  endDate: '',
  targetSectors: '',
  description: '',
};

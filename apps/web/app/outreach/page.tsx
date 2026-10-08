'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Plus,
} from 'lucide-react';

import AppShell from '@/components/app-shell';
import ConfirmModal from '@/components/ui/confirm-modal';

import CampaignModal from '@/components/outreach/campaign-modal';
import Campaigns from '@/components/outreach/campaigns';
import {
  emptyCampaign,
  emptyQuickLead,
} from '@/components/outreach/constants';
import LeadsList from '@/components/outreach/leads-list';
import OutreachOverview from '@/components/outreach/overview';
import QuickLeadEntry from '@/components/outreach/quick-lead-entry';
import {
  toDateInput,
} from '@/components/outreach/helpers';

import type {
  Campaign,
  CampaignForm,
  Lead,
  Overview,
  QuickLeadForm,
  UserOption,
} from '@/components/outreach/types';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

export default function OutreachPage() {
  const [
    tab,
    setTab,
  ] = useState<
    | 'overview'
    | 'leads'
    | 'campaigns'
  >('overview');

  const [
    overview,
    setOverview,
  ] = useState<Overview | null>(
    null,
  );

  const [
    leads,
    setLeads,
  ] = useState<Lead[]>([]);

  const [
    campaigns,
    setCampaigns,
  ] = useState<Campaign[]>([]);

  const [
    users,
    setUsers,
  ] = useState<UserOption[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    quickLead,
    setQuickLead,
  ] = useState<QuickLeadForm>({
    ...emptyQuickLead,
  });

  const [
    quickSaving,
    setQuickSaving,
  ] = useState(false);

  const [
    campaignModalOpen,
    setCampaignModalOpen,
  ] = useState(false);

  const [
    editingCampaignId,
    setEditingCampaignId,
  ] = useState<
    string | null
  >(null);

  const [
    campaignForm,
    setCampaignForm,
  ] = useState<CampaignForm>({
    ...emptyCampaign,
  });

  const [
    savingCampaign,
    setSavingCampaign,
  ] = useState(false);

  const [
    deleteLead,
    setDeleteLead,
  ] = useState<Lead | null>(
    null,
  );

  const [
    deleteCampaign,
    setDeleteCampaign,
  ] = useState<Campaign | null>(
    null,
  );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  async function loadData() {
    try {
      setError('');

      const [
        overviewData,
        leadsData,
        campaignsData,
        usersData,
      ] = await Promise.all([
        apiFetch<Overview>(
          '/outreach/overview',
        ),

        apiFetch<Lead[]>(
          '/outreach/leads',
        ),

        apiFetch<Campaign[]>(
          '/outreach/campaigns',
        ),

        apiFetch<any[]>(
          '/users',
        ),
      ]);

      setOverview(
        overviewData,
      );

      setLeads(
        leadsData,
      );

      setCampaigns(
        campaignsData,
      );

      setUsers(
        usersData.map(
          (user) => ({
            id:
              user.id,

            name:
              user.name,

            email:
              user.email,
          }),
        ),
      );
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status !== 401
      ) {
        setError(
          err.message,
        );
      }
    }
  }

  useEffect(() => {
    async function initialLoad() {
      setLoading(true);
      await loadData();
      setLoading(false);
    }

    void initialLoad();
  }, []);

  function openCampaignCreate() {
    setEditingCampaignId(
      null,
    );

    setCampaignForm({
      ...emptyCampaign,
    });

    setCampaignModalOpen(
      true,
    );
  }

  function openCampaignEdit(
    campaign: Campaign,
  ) {
    setEditingCampaignId(
      campaign.id,
    );

    setCampaignForm({
      name:
        campaign.name,

      country:
        campaign.country,

      city:
        campaign.city || '',

      startDate:
        toDateInput(
          campaign.startDate,
        ),

      endDate:
        toDateInput(
          campaign.endDate,
        ),

      targetSectors:
        campaign.targetSectors ||
        '',

      description:
        campaign.description ||
        '',
    });

    setCampaignModalOpen(
      true,
    );
  }

  async function saveCampaign(
    event: FormEvent,
  ) {
    event.preventDefault();

    try {
      setSavingCampaign(
        true,
      );

      setError('');

      const payload = {
        ...campaignForm,

        startDate:
          campaignForm.startDate ||
          null,

        endDate:
          campaignForm.endDate ||
          null,
      };

      await apiFetch(
        editingCampaignId
          ? `/outreach/campaigns/${editingCampaignId}`
          : '/outreach/campaigns',
        {
          method:
            editingCampaignId
              ? 'PATCH'
              : 'POST',

          body:
            JSON.stringify(
              payload,
            ),
        },
      );

      setCampaignModalOpen(
        false,
      );

      await loadData();
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setSavingCampaign(
        false,
      );
    }
  }

  async function confirmDeleteLead() {
    if (!deleteLead) {
      return;
    }

    try {
      setDeleting(true);

      await apiFetch(
        `/outreach/leads/${deleteLead.id}`,
        {
          method:
            'DELETE',
        },
      );

      setDeleteLead(
        null,
      );

      await loadData();
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setDeleting(false);
    }
  }

  async function confirmDeleteCampaign() {
    if (!deleteCampaign) {
      return;
    }

    try {
      setDeleting(true);

      await apiFetch(
        `/outreach/campaigns/${deleteCampaign.id}`,
        {
          method:
            'DELETE',
        },
      );

      setDeleteCampaign(
        null,
      );

      await loadData();
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-slate-600">
              Business development
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Outreach
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Keep foreign company outreach simple:
              add leads, track replies and remember follow-ups.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openCampaignCreate
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Plus
              size={16}
            />
            Campaign
          </button>
        </header>

        <nav className="flex w-fit items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
          {[
            [
              'overview',
              'Overview',
            ],
            [
              'leads',
              'Leads',
            ],
            [
              'campaigns',
              'Campaigns',
            ],
          ].map(
            ([
              key,
              label,
            ]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setTab(
                    key as typeof tab,
                  )
                }
                className={[
                  'rounded-lg px-3.5 py-2 text-sm transition',

                  tab === key
                    ? 'bg-white font-medium text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200',
                ].join(
                  ' ',
                )}
              >
                {label}
              </button>
            ),
          )}
        </nav>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
            Loading outreach...
          </div>
        ) : (
          <>
            {tab ===
              'overview' && (
              <OutreachOverview
                overview={
                  overview
                }
              />
            )}

            {tab ===
              'leads' && (
              <div className="space-y-6">
                <QuickLeadEntry
                  value={
                    quickLead
                  }
                  campaigns={
                    campaigns
                  }
                  users={
                    users
                  }
                  saving={
                    quickSaving
                  }
                  onChange={
                    setQuickLead
                  }
                  onSavingChange={
                    setQuickSaving
                  }
                  onSaved={
                    loadData
                  }
                  onError={
                    setError
                  }
                />

                <LeadsList
                  leads={
                    leads
                  }
                  campaigns={
                    campaigns
                  }
                  users={
                    users
                  }
                  onRefresh={
                    loadData
                  }
                  onDelete={
                    setDeleteLead
                  }
                  onError={
                    setError
                  }
                />
              </div>
            )}

            {tab ===
              'campaigns' && (
              <Campaigns
                campaigns={
                  campaigns
                }
                onEdit={
                  openCampaignEdit
                }
                onDelete={
                  setDeleteCampaign
                }
                onOpenLeads={(
                  campaign,
                ) => {
                  setQuickLead(
                    (current) => ({
                      ...current,

                      country:
                        current.country ||
                        campaign.country,

                      campaignId:
                        campaign.id,
                    }),
                  );

                  setTab(
                    'leads',
                  );
                }}
              />
            )}
          </>
        )}

        {campaignModalOpen && (
          <CampaignModal
            value={
              campaignForm
            }
            editing={
              !!editingCampaignId
            }
            saving={
              savingCampaign
            }
            onChange={
              setCampaignForm
            }
            onClose={() =>
              !savingCampaign &&
              setCampaignModalOpen(
                false,
              )
            }
            onSubmit={
              saveCampaign
            }
          />
        )}

        <ConfirmModal
          open={
            deleteLead !==
            null
          }
          variant="delete"
          loading={
            deleting
          }
          title="Delete lead?"
          description={`${deleteLead?.companyName ?? ''} will be permanently deleted.`}
          confirmText="Delete"
          onClose={() =>
            !deleting &&
            setDeleteLead(
              null,
            )
          }
          onConfirm={
            confirmDeleteLead
          }
        />

        <ConfirmModal
          open={
            deleteCampaign !==
            null
          }
          variant="delete"
          loading={
            deleting
          }
          title="Delete campaign?"
          description={`${deleteCampaign?.name ?? ''} will be deleted. Existing leads will remain.`}
          confirmText="Delete"
          onClose={() =>
            !deleting &&
            setDeleteCampaign(
              null,
            )
          }
          onConfirm={
            confirmDeleteCampaign
          }
        />
      </div>
    </AppShell>
  );
}

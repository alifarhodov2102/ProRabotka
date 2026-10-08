'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Plus,
  Search,
} from 'lucide-react';

import AppShell from '@/components/app-shell';

import ResidentOverview from '@/components/residents/resident-overview';

import ResidentTable, {
  type Resident,
} from '@/components/residents/resident-table';

import ResidentModal from '@/components/residents/resident-modal';

import QuarterlyReports from '@/components/residents/quarterly-reports';

import ConfirmModal from '@/components/ui/confirm-modal';

import SectionSpaces from '@/components/spaces/section-spaces';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

const emptyForm = {
  companyName: '',
  tin: '',
  activity: '',
  exporter: false,
  founderCountry: '',
  region: '',
  district: '',
  residentSince: '',
  focalPoint: '',
  broughtBy: '',
  status: 'ACTIVE',
  notes: '',
};

export default function ResidentsPage() {
  const [
    tab,
    setTab,
  ] = useState<
    | 'overview'
    | 'list'
    | 'reports'
    | 'spaces'
  >('overview');

  const [
    residents,
    setResidents,
  ] =
    useState<Resident[]>(
      [],
    );

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState<
    string | null
  >(null);

  const [
    form,
    setForm,
  ] = useState(
    emptyForm,
  );

  const [
    confirmAction,
    setConfirmAction,
  ] = useState<{
    type:
      | 'archive'
      | 'delete';

    resident:
      Resident;
  } | null>(
    null,
  );

  const [
    confirmLoading,
    setConfirmLoading,
  ] = useState(false);

  async function loadResidents() {
    try {
      setError('');

      const data =
        await apiFetch<
          Resident[]
        >(
          '/residents',
        );

      setResidents(
        data,
      );
    } catch (err) {
      if (
        err instanceof
          ApiError &&
        err.status !==
          401
      ) {
        setError(
          err.message,
        );
      }
    }
  }

  useEffect(() => {
    async function initialLoad() {
      try {
        setLoading(
          true,
        );

        await loadResidents();
      } finally {
        setLoading(
          false,
        );
      }
    }

    void initialLoad();
  }, []);

  const filtered =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      if (!q) {
        return residents;
      }

      return residents.filter(
        (
          resident,
        ) =>
          [
            resident.companyName,
            resident.tin,
            resident.activity,
            resident.founderCountry,
            resident.region,
            resident.district,
            resident.focalPoint,
          ]
            .filter(
              Boolean,
            )
            .some(
              (value) =>
                String(
                  value,
                )
                  .toLowerCase()
                  .includes(
                    q,
                  ),
            ),
      );
    }, [
      residents,
      search,
    ]);

  function openCreate() {
    setEditingId(
      null,
    );

    setForm({
      ...emptyForm,
    });

    setModalOpen(
      true,
    );
  }

  function openEdit(
    resident:
      Resident,
  ) {
    setEditingId(
      resident.id,
    );

    setForm({
      companyName:
        resident.companyName,

      tin:
        resident.tin ||
        '',

      activity:
        resident.activity ||
        '',

      exporter:
        resident.exporter,

      founderCountry:
        resident.founderCountry ||
        '',

      region:
        resident.region ||
        '',

      district:
        resident.district ||
        '',

      residentSince:
        resident.residentSince
          ? resident.residentSince.slice(
              0,
              10,
            )
          : '',

      focalPoint:
        resident.focalPoint ||
        '',

      broughtBy:
        resident.broughtBy ||
        '',

      status:
        resident.status,

      notes:
        resident.notes ||
        '',
    });

    setModalOpen(
      true,
    );
  }

  async function saveResident() {
    if (
      !form.companyName.trim()
    ) {
      setError(
        'Company name is required.',
      );

      return;
    }

    try {
      setSaving(
        true,
      );

      setError('');

      const payload = {
        ...form,

        companyName:
          form.companyName.trim(),

        tin:
          form.tin ||
          undefined,

        activity:
          form.activity ||
          undefined,

        founderCountry:
          form.founderCountry ||
          undefined,

        region:
          form.region ||
          undefined,

        district:
          form.district ||
          undefined,

        residentSince:
          form.residentSince ||
          undefined,

        focalPoint:
          form.focalPoint ||
          undefined,

        broughtBy:
          form.broughtBy ||
          undefined,

        notes:
          form.notes ||
          undefined,
      };

      if (
        editingId
      ) {
        await apiFetch(
          `/residents/${editingId}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );
      } else {
        await apiFetch(
          '/residents',
          {
            method:
              'POST',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );
      }

      setModalOpen(
        false,
      );

      setEditingId(
        null,
      );

      setForm({
        ...emptyForm,
      });

      await loadResidents();
    } catch (err) {
      if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setSaving(
        false,
      );
    }
  }

  function archiveResident(
    resident:
      Resident,
  ) {
    setConfirmAction({
      type:
        'archive',

      resident,
    });
  }

  function deleteResident(
    resident:
      Resident,
  ) {
    setConfirmAction({
      type:
        'delete',

      resident,
    });
  }

  async function handleConfirmAction() {
    if (
      !confirmAction
    ) {
      return;
    }

    try {
      setConfirmLoading(
        true,
      );

      setError('');

      if (
        confirmAction.type ===
        'archive'
      ) {
        await apiFetch(
          `/residents/${confirmAction.resident.id}/archive`,
          {
            method:
              'POST',
          },
        );
      }

      if (
        confirmAction.type ===
        'delete'
      ) {
        await apiFetch(
          `/residents/${confirmAction.resident.id}`,
          {
            method:
              'DELETE',
          },
        );
      }

      setConfirmAction(
        null,
      );

      await loadResidents();
    } catch (err) {
      if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setConfirmLoading(
        false,
      );
    }
  }

  return (
    <AppShell>
      <div className="space-y-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Residents
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage resident companies and quarterly reporting.
            </p>
          </div>

          {tab !==
            'spaces' && (
            <button
              type="button"
              onClick={
                openCreate
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              <Plus
                size={
                  16
                }
              />

              Add resident
            </button>
          )}
        </section>

        <section className="overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          <div className="flex min-w-max gap-6">
            {[
              [
                'overview',
                'Overview',
              ],

              [
                'list',
                'Resident list',
              ],

              [
                'reports',
                'Quarterly reports',
              ],

              [
                'spaces',
                'Spaces',
              ],
            ].map(
              ([
                key,
                label,
              ]) => (
                <button
                  key={
                    key
                  }
                  type="button"
                  onClick={() =>
                    setTab(
                      key as typeof tab,
                    )
                  }
                  className={[
                    'border-b-2 px-1 pb-3 text-sm transition',

                    tab === key
                      ? 'border-slate-900 font-medium text-slate-900 dark:border-slate-100 dark:text-slate-100'
                      : 'border-transparent text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300',
                  ].join(
                    ' ',
                  )}
                >
                  {
                    label
                  }
                </button>
              ),
            )}
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">
            Loading residents...
          </div>
        ) : (
          <>
            {tab ===
              'overview' && (
              <ResidentOverview
                residents={
                  residents
                }
              />
            )}

            {tab ===
              'list' && (
              <div className="space-y-4">
                <div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
                  <Search
                    size={
                      16
                    }
                    className="text-slate-400 dark:text-slate-500"
                  />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      event,
                    ) =>
                      setSearch(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Search residents..."
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                  />
                </div>

                <ResidentTable
                  residents={
                    filtered
                  }
                  onEdit={
                    openEdit
                  }
                  onArchive={
                    archiveResident
                  }
                  onDelete={
                    deleteResident
                  }
                  onChanged={
                    loadResidents
                  }
                  onError={
                    setError
                  }
                />
              </div>
            )}

            {tab ===
              'reports' && (
              <QuarterlyReports
                residents={
                  residents
                }
                year={
                  new Date().getFullYear()
                }
                onChanged={
                  loadResidents
                }
              />
            )}

            {tab ===
              'spaces' && (
              <SectionSpaces section="RESIDENTS" />
            )}
          </>
        )}

        <ResidentModal
          open={
            modalOpen
          }
          title={
            editingId
              ? 'Edit resident'
              : 'Add resident'
          }
          value={
            form
          }
          saving={
            saving
          }
          onChange={
            setForm
          }
          onClose={() => {
            if (
              !saving
            ) {
              setModalOpen(
                false,
              );

              setEditingId(
                null,
              );
            }
          }}
          onSave={
            saveResident
          }
        />

        <ConfirmModal
          open={
            confirmAction !==
            null
          }
          variant={
            confirmAction?.type ??
            'archive'
          }
          loading={
            confirmLoading
          }
          title={
            confirmAction?.type ===
            'delete'
              ? 'Delete resident?'
              : 'Archive resident?'
          }
          description={
            confirmAction?.type ===
            'delete'
              ? `${
                  confirmAction
                    ?.resident
                    .companyName ??
                  ''
                } will be permanently deleted. This action cannot be undone.`
              : `${
                  confirmAction
                    ?.resident
                    .companyName ??
                  ''
                } will be moved to archived residents. Its information and history will remain available.`
          }
          confirmText={
            confirmAction?.type ===
            'delete'
              ? 'Delete resident'
              : 'Archive resident'
          }
          onClose={() => {
            if (
              !confirmLoading
            ) {
              setConfirmAction(
                null,
              );
            }
          }}
          onConfirm={
            handleConfirmAction
          }
        />
      </div>
    </AppShell>
  );
}
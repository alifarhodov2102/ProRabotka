'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Download,
  Plus,
  Search,
} from 'lucide-react';

import AppShell from '@/components/app-shell';

import ResidentOverview from '@/components/residents/resident-overview';

import ResidentTable, {
  type Resident,
} from '@/components/residents/resident-table';

import SpreadsheetWorkspace from '@/components/residents/spreadsheet-workspace';

import BecomingResidentsTable, {
  type ResidentApplication,
} from '@/components/residents/becoming-residents-table';

import ResidentModal from '@/components/residents/resident-modal';

import QuarterlyReports from '@/components/residents/quarterly-reports';

import ConfirmModal from '@/components/ui/confirm-modal';

import SectionSpaces from '@/components/spaces/section-spaces';

import {
  ApiError,
  apiFetch,
  apiUrl,
  getToken,
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
    | 'becoming'
    | 'excel'
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
    applications,
    setApplications,
  ] =
    useState<
      ResidentApplication[]
    >(
      [],
    );

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    applicationSearch,
    setApplicationSearch,
  ] =
    useState('');

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    exporting,
    setExporting,
  ] =
    useState(false);

  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    form,
    setForm,
  ] =
    useState(
      emptyForm,
    );

  const [
    deleteResidentTarget,
    setDeleteResidentTarget,
  ] =
    useState<
      Resident | null
    >(null);

  const [
    confirmLoading,
    setConfirmLoading,
  ] =
    useState(false);

  async function loadResidents() {
    const data =
      await apiFetch<
        Resident[]
      >(
        '/residents',
      );

    setResidents(
      data,
    );
  }

  async function loadApplications() {
    const data =
      await apiFetch<
        ResidentApplication[]
      >(
        '/residents/applications',
      );

    setApplications(
      data,
    );
  }

  async function loadAll() {
    try {
      setError('');

      await Promise.all([
        loadResidents(),
        loadApplications(),
      ]);
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

        await loadAll();
      } finally {
        setLoading(
          false,
        );
      }
    }

    void initialLoad();
  }, []);

  const filteredResidents =
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
              (
                value,
              ) =>
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

  const filteredApplications =
    useMemo(() => {
      const q =
        applicationSearch
          .trim()
          .toLowerCase();

      if (!q) {
        return applications;
      }

      return applications.filter(
        (
          application,
        ) =>
          [
            application.companyName,
            application.tin,
            application.activity,
            application.founderCountry,
            application.region,
            application.district,
            application.focalPoint,
            application.status,
          ]
            .filter(
              Boolean,
            )
            .some(
              (
                value,
              ) =>
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
      applications,
      applicationSearch,
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

  async function downloadExcel() {
    try {
      setExporting(
        true,
      );

      setError('');

      const token =
        getToken();

      const response =
        await fetch(
          apiUrl(
            '/residents/export',
          ),
          {
            headers:
              token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {},
          },
        );

      if (
        !response.ok
      ) {
        throw new Error();
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob,
        );

      const anchor =
        document.createElement(
          'a',
        );

      anchor.href =
        url;

      anchor.download =
        `sirdaryo-residents-${new Date()
          .toISOString()
          .slice(
            0,
            10,
          )}.xlsx`;

      document.body.appendChild(
        anchor,
      );

      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(
        url,
      );
    } catch {
      setError(
        'Could not download the Excel file.',
      );
    } finally {
      setExporting(
        false,
      );
    }
  }

  async function deleteResident() {
    if (
      !deleteResidentTarget
    ) {
      return;
    }

    try {
      setConfirmLoading(
        true,
      );

      setError('');

      await apiFetch(
        `/residents/${deleteResidentTarget.id}`,
        {
          method:
            'DELETE',
        },
      );

      setDeleteResidentTarget(
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
              Manage resident companies and residency applications.
            </p>
          </div>

          {tab !==
            'spaces' && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={
                  exporting
                }
                onClick={() =>
                  void downloadExcel()
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Download
                  size={16}
                />

                {exporting
                  ? 'Downloading...'
                  : 'Download Excel'}
              </button>

              {tab !==
                'becoming' && (
                <button
                  type="button"
                  onClick={
                    openCreate
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  <Plus
                    size={16}
                  />

                  Add resident
                </button>
              )}
            </div>
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
                'becoming',
                'Becoming residents',
              ],
              [
                'excel',
                'Excel view',
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

                    tab ===
                    key
                      ? 'border-slate-900 font-medium text-slate-900 dark:border-slate-100 dark:text-slate-100'
                      : 'border-transparent text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300',
                  ].join(
                    ' ',
                  )}
                >
                  {label}
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
          <div className="py-20 text-center text-sm text-slate-400">
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
                <SearchBox
                  value={
                    search
                  }
                  onChange={
                    setSearch
                  }
                  placeholder="Search residents..."
                />

                <ResidentTable
                  residents={
                    filteredResidents
                  }
                  onEdit={
                    openEdit
                  }
                  onDelete={
                    setDeleteResidentTarget
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
              'becoming' && (
              <div className="space-y-4">
                <SearchBox
                  value={
                    applicationSearch
                  }
                  onChange={
                    setApplicationSearch
                  }
                  placeholder="Search applications..."
                />

                <BecomingResidentsTable
                  applications={
                    filteredApplications
                  }
                  onChanged={
                    loadAll
                  }
                  onError={
                    setError
                  }
                />
              </div>
            )}

            {tab ===
              'excel' && (
              <SpreadsheetWorkspace
                residents={
                  residents
                }
                applications={
                  applications
                }
                onResidentsChanged={
                  loadResidents
                }
                onApplicationsChanged={
                  loadAll
                }
                onError={
                  setError
                }
              />
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
            deleteResidentTarget !==
            null
          }
          variant="delete"
          loading={
            confirmLoading
          }
          title="Delete resident?"
          description={`${
            deleteResidentTarget
              ?.companyName ??
            ''
          } will be permanently deleted. This action cannot be undone.`}
          confirmText="Delete resident"
          onClose={() => {
            if (
              !confirmLoading
            ) {
              setDeleteResidentTarget(
                null,
              );
            }
          }}
          onConfirm={
            deleteResident
          }
        />
      </div>
    </AppShell>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;

  onChange: (
    value: string,
  ) => void;

  placeholder: string;
}) {
  return (
    <div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
      <Search
        size={16}
        className="text-slate-400"
      />

      <input
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200"
      />
    </div>
  );
}

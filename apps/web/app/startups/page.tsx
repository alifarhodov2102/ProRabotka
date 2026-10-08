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
import ConfirmModal from '@/components/ui/confirm-modal';
import SectionSpaces from '@/components/spaces/section-spaces';

import StartupOverview from '@/components/startups/startup-overview';

import StartupTable, {
  Startup,
} from '@/components/startups/startup-table';

import StartupModal from '@/components/startups/startup-modal';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

const emptyForm = {
  name: '',
  founderName: '',
  phone: '',
  email: '',
  stage: '',
  status: 'ACTIVE',
  joinedAt: '',
  notes: '',
};

export default function StartupsPage() {
  const [
    tab,
    setTab,
  ] = useState<
    | 'overview'
    | 'list'
    | 'spaces'
  >('overview');

  const [
    startups,
    setStartups,
  ] = useState<Startup[]>([]);

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

    startup: Startup;
  } | null>(null);

  const [
    confirmLoading,
    setConfirmLoading,
  ] = useState(false);

  async function loadStartups() {
    try {
      setLoading(true);
      setError('');

      const data =
        await apiFetch<
          Startup[]
        >('/startups');

      setStartups(data);
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status !== 401
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStartups();
  }, []);

  const filtered =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      if (!q) {
        return startups;
      }

      return startups.filter(
        (startup) =>
          [
            startup.name,
            startup.founderName,
            startup.email,
            startup.phone,
            startup.stage,
          ]
            .filter(Boolean)
            .some(
              (value) =>
                String(value)
                  .toLowerCase()
                  .includes(q),
            ),
      );
    }, [
      startups,
      search,
    ]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(
    startup: Startup,
  ) {
    setEditingId(
      startup.id,
    );

    setForm({
      name:
        startup.name,

      founderName:
        startup.founderName ||
        '',

      phone:
        startup.phone ||
        '',

      email:
        startup.email ||
        '',

      stage:
        startup.stage ||
        '',

      status:
        startup.status,

      joinedAt:
        startup.joinedAt
          ? startup.joinedAt.slice(
              0,
              10,
            )
          : '',

      notes:
        startup.notes ||
        '',
    });

    setModalOpen(true);
  }

  async function saveStartup() {
    try {
      setSaving(true);
      setError('');

      const payload = {
        ...form,

        founderName:
          form.founderName ||
          undefined,

        phone:
          form.phone ||
          undefined,

        email:
          form.email ||
          undefined,

        stage:
          form.stage ||
          undefined,

        joinedAt:
          form.joinedAt ||
          undefined,

        notes:
          form.notes ||
          undefined,
      };

      if (editingId) {
        await apiFetch(
          `/startups/${editingId}`,
          {
            method: 'PATCH',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );
      } else {
        await apiFetch(
          '/startups',
          {
            method: 'POST',

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

      setForm(
        emptyForm,
      );

      await loadStartups();
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setSaving(false);
    }
  }

  function archiveStartup(
    startup: Startup,
  ) {
    setConfirmAction({
      type: 'archive',
      startup,
    });
  }

  function deleteStartup(
    startup: Startup,
  ) {
    setConfirmAction({
      type: 'delete',
      startup,
    });
  }

  async function handleConfirmAction() {
    if (!confirmAction) {
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
          `/startups/${confirmAction.startup.id}/archive`,
          {
            method: 'POST',
          },
        );
      }

      if (
        confirmAction.type ===
        'delete'
      ) {
        await apiFetch(
          `/startups/${confirmAction.startup.id}`,
          {
            method: 'DELETE',
          },
        );
      }

      setConfirmAction(
        null,
      );

      await loadStartups();
    } catch (err) {
      if (
        err instanceof ApiError
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
              Startups
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage startup
              companies and
              progress.
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
                size={16}
              />

              Add startup
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
                'Startup list',
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
                  key={key}
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
          <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">
            Loading startups...
          </div>
        ) : (
          <>
            {tab ===
              'overview' && (
              <StartupOverview
                startups={
                  startups
                }
              />
            )}

            {tab ===
              'list' && (
              <div className="space-y-4">
                <div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition-colors dark:border-slate-800 dark:bg-slate-900">
                  <Search
                    size={16}
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
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Search startups..."
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                  />
                </div>

                <StartupTable
                  startups={
                    filtered
                  }
                  onEdit={
                    openEdit
                  }
                  onArchive={
                    archiveStartup
                  }
                  onDelete={
                    deleteStartup
                  }
                />
              </div>
            )}

            {tab ===
              'spaces' && (
              <SectionSpaces section="STARTUPS" />
            )}
          </>
        )}

        <StartupModal
          open={
            modalOpen
          }
          title={
            editingId
              ? 'Edit startup'
              : 'Add startup'
          }
          value={form}
          saving={saving}
          onChange={
            setForm
          }
          onClose={() => {
            if (!saving) {
              setModalOpen(
                false,
              );

              setEditingId(
                null,
              );
            }
          }}
          onSave={
            saveStartup
          }
        />

        <ConfirmModal
          open={
            confirmAction !==
            null
          }
          variant={
            confirmAction
              ?.type ??
            'archive'
          }
          loading={
            confirmLoading
          }
          title={
            confirmAction
              ?.type ===
            'delete'
              ? 'Delete startup?'
              : 'Archive startup?'
          }
          description={
            confirmAction
              ?.type ===
            'delete'
              ? `${
                  confirmAction
                    ?.startup
                    .name ??
                  ''
                } will be permanently deleted. This action cannot be undone.`
              : `${
                  confirmAction
                    ?.startup
                    .name ??
                  ''
                } will be moved to archived startups. Its information will remain available.`
          }
          confirmText={
            confirmAction
              ?.type ===
            'delete'
              ? 'Delete startup'
              : 'Archive startup'
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
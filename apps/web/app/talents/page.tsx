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

import TalentModal from '@/components/talents/talent-modal';

import TalentTable from '@/components/talents/talent-table';

import TalentExcelView from '@/components/talents/talent-excel-view';

import {
  TALENT_CV_MARKER,
  type TalentCvDocument,
} from '@/components/talents/talent-cv-cell';

import type {
  LanguageLevel,
  Talent,
  TalentFormValues,
} from '@/components/talents/types';

import ConfirmModal from '@/components/ui/confirm-modal';

import {
  ApiError,
  apiFetch,
  apiUrl,
  getToken,
} from '@/lib/api';

export default function TalentsPage() {
  const [
    tab,
    setTab,
  ] =
    useState<
      | 'list'
      | 'excel'
    >(
      'list',
    );

  const [
    talents,
    setTalents,
  ] =
    useState<Talent[]>(
      [],
    );

  const [
    talentDocuments,
    setTalentDocuments,
  ] =
    useState<
      TalentCvDocument[]
    >(
      [],
    );

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
    search,
    setSearch,
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
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<Talent | null>(
      null,
    );

  const [
    deleteLoading,
    setDeleteLoading,
  ] =
    useState(false);

  async function loadTalents() {
    const data =
      await apiFetch<Talent[]>(
        '/talents',
      );

    setTalents(
      [
        ...data,
      ].sort(
        (
          first,
          second,
        ) =>
          new Date(
            first.createdAt,
          ).getTime() -
          new Date(
            second.createdAt,
          ).getTime(),
      ),
    );
  }

  async function loadTalentDocuments() {
    const data =
      await apiFetch<
        TalentCvDocument[]
      >(
        '/documents?section=TALENTS',
      );

    setTalentDocuments(
      data,
    );
  }

  async function loadAll() {
    try {
      setError('');

      await Promise.all([
        loadTalents(),
        loadTalentDocuments(),
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

  const cvByTalentId =
    useMemo(() => {
      const result:
        Record<
          string,
          TalentCvDocument | null
        > = {};

      const cvs =
        talentDocuments
          .filter(
            (
              document,
            ) =>
              document.description ===
                TALENT_CV_MARKER &&
              document.talentId,
          )
          .sort(
            (
              first,
              second,
            ) =>
              new Date(
                second.createdAt,
              ).getTime() -
              new Date(
                first.createdAt,
              ).getTime(),
          );

      for (
        const document of
        cvs
      ) {
        const talentId =
          document.talentId;

        if (
          talentId &&
          !result[
            talentId
          ]
        ) {
          result[
            talentId
          ] =
            document;
        }
      }

      return result;
    }, [
      talentDocuments,
    ]);

  const filteredTalents =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return talents;
      }

      return talents.filter(
        (
          talent,
        ) => {
          const haystack = [
            talent.fullName,
            talent.phone,
            talent.telegram,
            talent.location,
            talent.experienceYears,
            talent.status,
            formatDateForSearch(
              talent.createdAt,
            ),

            ...talent.languages.map(
              (
                language,
              ) =>
                `${language.language} ${language.level}`,
            ),
          ]
            .filter(
              (
                value,
              ) =>
                value !==
                  null &&
                value !==
                  undefined,
            )
            .join(
              ' ',
            )
            .toLowerCase();

          return haystack.includes(
            query,
          );
        },
      );
    }, [
      talents,
      search,
    ]);

  async function createTalent(
    form:
      TalentFormValues,
  ) {
    try {
      setSaving(
        true,
      );

      setError('');

      const talent =
        await apiFetch<Talent>(
          '/talents',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                fullName:
                  form.fullName,

                phone:
                  form.phone ||
                  null,

                telegram:
                  form.telegram ||
                  null,

                location:
                  form.location ||
                  null,

                experienceYears:
                  form.experienceYears ||
                  null,

                status:
                  form.status,

                notes:
                  form.notes ||
                  null,
              }),
          },
        );

      const languages: {
        language:
          string;

        level:
          LanguageLevel;
      }[] = [];

      if (
        form.englishLevel
      ) {
        languages.push({
          language:
            'English',

          level:
            form.englishLevel,
        });
      }

      if (
        form.russianLevel
      ) {
        languages.push({
          language:
            'Russian',

          level:
            form.russianLevel,
        });
      }

      if (
        form.uzbekLevel
      ) {
        languages.push({
          language:
            'Uzbek',

          level:
            form.uzbekLevel,
        });
      }

      for (
        const language of
        languages
      ) {
        await apiFetch(
          `/talents/${talent.id}/languages`,
          {
            method:
              'POST',

            body:
              JSON.stringify(
                language,
              ),
          },
        );
      }

      setModalOpen(
        false,
      );

      await loadAll();
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

  async function deleteTalent() {
    if (
      !deleteTarget
    ) {
      return;
    }

    try {
      setDeleteLoading(
        true,
      );

      setError('');

      await apiFetch(
        `/talents/${deleteTarget.id}`,
        {
          method:
            'DELETE',
        },
      );

      setDeleteTarget(
        null,
      );

      await loadAll();
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
      setDeleteLoading(
        false,
      );
    }
  }

  async function exportExcel() {
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
            '/talents/export',
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
        `talents-${new Date()
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

  return (
    <AppShell>
      <div className="min-w-0 space-y-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Talents
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage candidates, languages and CVs in one clean table.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={
                exporting
              }
              onClick={() =>
                void exportExcel()
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download
                size={15}
              />

              {exporting
                ? 'Downloading...'
                : 'Download Excel'}
            </button>

            <button
              type="button"
              onClick={() =>
                setModalOpen(
                  true,
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              <Plus
                size={15}
              />

              Add talent
            </button>
          </div>
        </section>

        <section className="overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          <div className="flex min-w-max gap-6">
            {[
              [
                'list',
                'Talent list',
              ],
              [
                'excel',
                'Excel view',
              ],
            ].map(
              (
                [
                  key,
                  label,
                ],
              ) => (
                <button
                  key={
                    key
                  }
                  type="button"
                  onClick={() =>
                    setTab(
                      key as
                        | 'list'
                        | 'excel',
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
            {
              error
            }
          </div>
        )}

        <div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
          <Search
            size={16}
            className="text-slate-400"
          />

          <input
            value={
              search
            }
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search talents..."
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">
            Loading talents...
          </div>
        ) : tab ===
          'list' ? (
          <TalentTable
            talents={
              filteredTalents
            }
            cvByTalentId={
              cvByTalentId
            }
            onChanged={
              loadAll
            }
            onDelete={
              setDeleteTarget
            }
            onError={
              setError
            }
          />
        ) : (
          <TalentExcelView
            talents={
              filteredTalents
            }
            cvByTalentId={
              cvByTalentId
            }
            onChanged={
              loadAll
            }
            onError={
              setError
            }
          />
        )}

        <TalentModal
          open={
            modalOpen
          }
          saving={
            saving
          }
          onClose={() =>
            setModalOpen(
              false,
            )
          }
          onSubmit={
            createTalent
          }
        />

        <ConfirmModal
          open={
            deleteTarget !==
            null
          }
          variant="delete"
          loading={
            deleteLoading
          }
          title="Delete talent?"
          description={`${
            deleteTarget
              ?.fullName ??
            ''
          } will be permanently deleted. This action cannot be undone.`}
          confirmText="Delete talent"
          onClose={() => {
            if (
              !deleteLoading
            ) {
              setDeleteTarget(
                null,
              );
            }
          }}
          onConfirm={
            deleteTalent
          }
        />
      </div>
    </AppShell>
  );
}

function formatDateForSearch(
  value: string,
) {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  return [
    date.toLocaleDateString(
      'en-GB',
    ),

    value.slice(
      0,
      10,
    ),
  ].join(
    ' ',
  );
}

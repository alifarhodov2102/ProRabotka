'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import {
  Download,
  Plus,
  Search,
  UsersRound,
} from 'lucide-react';

import AppShell from '@/components/app-shell';

import TalentCard from '@/components/talents/talent-card';

import TalentModal from '@/components/talents/talent-modal';

import {
  LanguageLevel,
  Talent,
  TalentFormValues,
  TalentStatus,
} from '@/components/talents/types';

import {
  ApiError,
  apiFetch,
  apiUrl,
  getToken,
} from '@/lib/api';

type StatusFilter =
  | 'ALL'
  | TalentStatus;

type LanguageFilter =
  | 'ALL'
  | 'ENGLISH'
  | 'RUSSIAN'
  | 'UZBEK';

export default function TalentsPage() {
  const [
    talents,
    setTalents,
  ] =
    useState<Talent[]>(
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
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      'ALL',
    );

  const [
    languageFilter,
    setLanguageFilter,
  ] =
    useState<LanguageFilter>(
      'ALL',
    );

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

  async function loadTalents() {
    try {
      setLoading(
        true,
      );

      setError('');

      const data =
        await apiFetch<Talent[]>(
          '/talents',
        );

      setTalents(
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
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(() => {
    void loadTalents();
  }, []);

  const filteredTalents =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return talents.filter(
        (
          talent,
        ) => {
          if (
            statusFilter !==
              'ALL' &&
            talent.status !==
              statusFilter
          ) {
            return false;
          }

          if (
            languageFilter !==
            'ALL'
          ) {
            const languageName =
              languageFilter ===
              'ENGLISH'
                ? 'english'
                : languageFilter ===
                    'RUSSIAN'
                  ? 'russian'
                  : 'uzbek';

            const hasLanguage =
              talent.languages.some(
                (
                  item,
                ) =>
                  item.language
                    .trim()
                    .toLowerCase() ===
                  languageName,
              );

            if (!hasLanguage) {
              return false;
            }
          }

          if (!query) {
            return true;
          }

          const haystack = [
            talent.fullName,
            talent.phone,
            talent.email,
            talent.telegram,
            talent.location,

            ...talent.languages.map(
              (
                language,
              ) =>
                language.language,
            ),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return haystack.includes(
            query,
          );
        },
      );
    }, [
      talents,
      search,
      statusFilter,
      languageFilter,
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
              JSON.stringify(
                buildTalentPayload(
                  form,
                ),
              ),
          },
        );

      const languages: {
        language: string;

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

      await loadTalents();
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

      const today =
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          );

      anchor.href =
        url;

      anchor.download =
        `talents-${today}.xlsx`;

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
      <div className="min-w-0 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Talents
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Internal candidate
              pool for company
              hiring requests.
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
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
              placeholder="Search by name, phone, Telegram, location or language..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-[16px] text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-800 sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={
                statusFilter ===
                'ALL'
              }
              onClick={() =>
                setStatusFilter(
                  'ALL',
                )
              }
            >
              All
            </FilterButton>

            <FilterButton
              active={
                statusFilter ===
                'AVAILABLE'
              }
              onClick={() =>
                setStatusFilter(
                  'AVAILABLE',
                )
              }
            >
              Available
            </FilterButton>

            <FilterButton
              active={
                statusFilter ===
                'OPEN_TO_OFFERS'
              }
              onClick={() =>
                setStatusFilter(
                  'OPEN_TO_OFFERS',
                )
              }
            >
              Open to offers
            </FilterButton>

            <FilterButton
              active={
                statusFilter ===
                'EMPLOYED'
              }
              onClick={() =>
                setStatusFilter(
                  'EMPLOYED',
                )
              }
            >
              Employed
            </FilterButton>

            <div className="mx-1 hidden h-8 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

            <FilterButton
              active={
                languageFilter ===
                'ENGLISH'
              }
              onClick={() =>
                setLanguageFilter(
                  languageFilter ===
                    'ENGLISH'
                    ? 'ALL'
                    : 'ENGLISH',
                )
              }
            >
              English
            </FilterButton>

            <FilterButton
              active={
                languageFilter ===
                'RUSSIAN'
              }
              onClick={() =>
                setLanguageFilter(
                  languageFilter ===
                    'RUSSIAN'
                    ? 'ALL'
                    : 'RUSSIAN',
                )
              }
            >
              Russian
            </FilterButton>

            <FilterButton
              active={
                languageFilter ===
                'UZBEK'
              }
              onClick={() =>
                setLanguageFilter(
                  languageFilter ===
                    'UZBEK'
                    ? 'ALL'
                    : 'UZBEK',
                )
              }
            >
              Uzbek
            </FilterButton>
          </div>
        </div>

        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {
                filteredTalents.length
              }{' '}
              {filteredTalents.length ===
              1
                ? 'candidate'
                : 'candidates'}
            </p>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-sm text-slate-400">
            Loading talents...
          </div>
        ) : filteredTalents.length ===
          0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-20 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <UsersRound
                size={21}
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">
              No talents found
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              Add your first
              candidate or change
              the current filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredTalents.map(
              (
                talent,
              ) => (
                <TalentCard
                  key={
                    talent.id
                  }
                  talent={
                    talent
                  }
                />
              ),
            )}
          </div>
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
      </div>
    </AppShell>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick:
    () => void;

  children:
    ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        'h-8 rounded-lg px-3 text-xs font-medium transition',

        active
          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
          : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function buildTalentPayload(
  form:
    TalentFormValues,
) {
  return {
    fullName:
      form.fullName,

    phone:
      form.phone ||
      null,

    email:
      form.email ||
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
  };
}
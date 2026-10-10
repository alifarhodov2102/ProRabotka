'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Download,
  FileText,
  Gift,
  ImagePlus,
  Mail,
  Phone,
  Plus,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react';

import {
  useParams,
  useRouter,
} from 'next/navigation';

import AppShell from '@/components/app-shell';

import {
  Startup,
  StartupFunding,
} from '@/components/startups/types';

import {
  ApiError,
  apiFetch,
  apiUrl,
  getToken,
} from '@/lib/api';

type FundingForm = {
  type:
    | 'INVESTMENT'
    | 'GRANT';

  amount: string;
  currency: string;
  source: string;
  round: string;
  fundedAt: string;
  notes: string;
};

const emptyFundingForm:
  FundingForm = {
  type:
    'INVESTMENT',
  amount: '',
  currency: 'USD',
  source: '',
  round: '',
  fundedAt: '',
  notes: '',
};

export default function StartupProfilePage() {
  const params =
    useParams();

  const router =
    useRouter();

  const id =
    String(
      params.id,
    );

  const logoInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const documentInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    startup,
    setStartup,
  ] =
    useState<Startup | null>(
      null,
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
    fundingOpen,
    setFundingOpen,
  ] =
    useState(false);

  const [
    fundingSaving,
    setFundingSaving,
  ] =
    useState(false);

  const [
    fundingForm,
    setFundingForm,
  ] =
    useState<FundingForm>(
      emptyFundingForm,
    );

  const [
    logoUploading,
    setLogoUploading,
  ] =
    useState(false);

  const [
    documentOpen,
    setDocumentOpen,
  ] =
    useState(false);

  const [
    documentUploading,
    setDocumentUploading,
  ] =
    useState(false);

  const [
    selectedDocument,
    setSelectedDocument,
  ] =
    useState<File | null>(
      null,
    );

  const [
    documentDescription,
    setDocumentDescription,
  ] =
    useState('');

  async function loadStartup() {
    try {
      setLoading(
        true,
      );

      setError('');

      const data =
        await apiFetch<Startup>(
          `/startups/${id}`,
        );

      setStartup(
        data,
      );
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
      setLoading(
        false,
      );
    }
  }

  useEffect(() => {
    if (id) {
      void loadStartup();
    }
  }, [id]);

  const totals =
    useMemo(() => {
      if (!startup) {
        return {
          investment: 0,
          grant: 0,
        };
      }

      let investment =
        0;

      let grant =
        0;

      for (
        const item of
        startup.funding
      ) {
        const amount =
          Number(
            item.amount ??
              0,
          );

        if (
          !Number.isFinite(
            amount,
          )
        ) {
          continue;
        }

        if (
          item.type ===
          'INVESTMENT'
        ) {
          investment +=
            amount;
        }

        if (
          item.type ===
          'GRANT'
        ) {
          grant +=
            amount;
        }
      }

      return {
        investment,
        grant,
      };
    }, [startup]);

  async function addFunding() {
    try {
      setFundingSaving(
        true,
      );

      setError('');

      await apiFetch(
        `/startups/${id}/funding`,
        {
          method:
            'POST',

          body:
            JSON.stringify({
              type:
                fundingForm.type,

              amount:
                fundingForm.amount ||
                null,

              currency:
                fundingForm.currency ||
                null,

              source:
                fundingForm.source ||
                null,

              round:
                fundingForm.round ||
                null,

              fundedAt:
                fundingForm.fundedAt ||
                null,

              notes:
                fundingForm.notes ||
                null,
            }),
        },
      );

      setFundingOpen(
        false,
      );

      setFundingForm(
        emptyFundingForm,
      );

      await loadStartup();
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
      setFundingSaving(
        false,
      );
    }
  }

  async function deleteFunding(
    funding:
      StartupFunding,
  ) {
    try {
      setError('');

      await apiFetch(
        `/startups/${id}/funding/${funding.id}`,
        {
          method:
            'DELETE',
        },
      );

      await loadStartup();
    } catch (err) {
      if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message,
        );
      }
    }
  }

  async function uploadLogo(
    file: File,
  ) {
    try {
      setLogoUploading(
        true,
      );

      setError('');

      const formData =
        new FormData();

      formData.append(
        'file',
        file,
      );

      await apiFetch(
        `/startups/${id}/logo`,
        {
          method:
            'POST',

          body:
            formData,
        },
      );

      await loadStartup();
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
      setLogoUploading(
        false,
      );

      if (
        logoInputRef.current
      ) {
        logoInputRef.current.value =
          '';
      }
    }
  }

  function openDocumentUpload() {
    setSelectedDocument(
      null,
    );

    setDocumentDescription(
      '',
    );

    if (
      documentInputRef.current
    ) {
      documentInputRef.current.value =
        '';
    }

    setDocumentOpen(
      true,
    );
  }

  async function uploadDocument() {
    if (
      !selectedDocument
    ) {
      return;
    }

    try {
      setDocumentUploading(
        true,
      );

      setError('');

      const formData =
        new FormData();

      formData.append(
        'file',
        selectedDocument,
      );

      formData.append(
        'section',
        'STARTUPS',
      );

      formData.append(
        'startupId',
        id,
      );

      if (
        documentDescription
          .trim()
      ) {
        formData.append(
          'description',
          documentDescription.trim(),
        );
      }

      await apiFetch(
        '/documents/upload',
        {
          method:
            'POST',

          body:
            formData,
        },
      );

      setDocumentOpen(
        false,
      );

      setSelectedDocument(
        null,
      );

      setDocumentDescription(
        '',
      );

      if (
        documentInputRef.current
      ) {
        documentInputRef.current.value =
          '';
      }

      await loadStartup();
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
      setDocumentUploading(
        false,
      );
    }
  }

  async function downloadDocument(
    documentId: string,
    fileName: string,
  ) {
    try {
      setError('');

      const token =
        getToken();

      const response =
        await fetch(
          apiUrl(
            `/documents/${documentId}/download`,
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
        window.document.createElement(
          'a',
        );

      anchor.href =
        url;

      anchor.download =
        fileName;

      window.document.body.appendChild(
        anchor,
      );

      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(
        url,
      );
    } catch {
      setError(
        'Could not download the file.',
      );
    }
  }

  async function deleteDocument(
    documentId: string,
  ) {
    try {
      setError('');

      await apiFetch(
        `/documents/${documentId}`,
        {
          method:
            'DELETE',
        },
      );

      await loadStartup();
    } catch (err) {
      if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message,
        );
      }
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-slate-400 dark:text-slate-500">
          Loading startup...
        </div>
      </AppShell>
    );
  }

  if (!startup) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-slate-500 dark:text-slate-400">
          {error ||
            'Startup not found.'}
        </div>
      </AppShell>
    );
  }

  const initials =
    startup.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (
          part,
        ) =>
          part
            .charAt(0)
            .toUpperCase(),
      )
      .join('');

  const logoSrc =
    startup.logoUrl
      ? startup.logoUrl.startsWith(
          'http://',
        ) ||
        startup.logoUrl.startsWith(
          'https://',
        )
        ? startup.logoUrl
        : apiUrl(
            startup.logoUrl,
          )
      : null;

  return (
    <AppShell>
      <div className="min-w-0 space-y-6">
        <button
          type="button"
          onClick={() =>
            router.push(
              '/startups',
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft
            size={16}
          />

          Startups
        </button>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:p-6">
            <div className="relative shrink-0">
              <button
                type="button"
                disabled={
                  logoUploading
                }
                onClick={() =>
                  logoInputRef.current?.click()
                }
                className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 transition hover:ring-2 hover:ring-slate-300 disabled:cursor-wait dark:bg-slate-800 dark:hover:ring-slate-700"
                title="Change startup logo"
              >
                {logoSrc ? (
                  <img
                    src={
                      logoSrc
                    }
                    alt={
                      startup.name
                    }
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <span className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                    {initials ||
                      'S'}
                  </span>
                )}

                {!logoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 opacity-0 transition group-hover:opacity-100">
                    <ImagePlus
                      size={20}
                      className="text-white"
                    />
                  </div>
                )}

                {logoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/85 px-2 text-center text-xs font-medium text-slate-600 dark:bg-slate-900/85 dark:text-slate-300">
                    Uploading...
                  </div>
                )}
              </button>

              <input
                ref={
                  logoInputRef
                }
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(
                  event,
                ) => {
                  const file =
                    event
                      .target
                      .files?.[0];

                  if (file) {
                    void uploadLogo(
                      file,
                    );
                  }
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {startup.name}
                </h1>

                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {startup.status}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {startup.stage ||
                  'Startup profile'}
              </p>

              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Tap the logo to
                upload or replace it.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {startup.funding.some(
                  (
                    item,
                  ) =>
                    item.type ===
                    'INVESTMENT',
                ) && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <Banknote
                      size={13}
                    />

                    Investment
                  </span>
                )}

                {startup.funding.some(
                  (
                    item,
                  ) =>
                    item.type ===
                    'GRANT',
                ) && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
                    <Gift
                      size={13}
                    />

                    Grant
                  </span>
                )}

                {startup.funding.length ===
                  0 && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    No funding
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            <InfoItem
              icon={
                <UserRound
                  size={16}
                />
              }
              label="Founder"
              value={
                startup.founderName ||
                '—'
              }
            />

            <InfoItem
              icon={
                <Mail
                  size={16}
                />
              }
              label="Email"
              value={
                startup.email ||
                '—'
              }
            />

            <InfoItem
              icon={
                <Phone
                  size={16}
                />
              }
              label="Phone"
              value={
                startup.phone ||
                '—'
              }
            />

            <InfoItem
              icon={
                <CalendarDays
                  size={16}
                />
              }
              label="Joined"
              value={
                startup.joinedAt
                  ? new Date(
                      startup.joinedAt,
                    ).toLocaleDateString(
                      'en-GB',
                    )
                  : '—'
              }
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total investment
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {formatMoney(
                totals.investment,
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total grants
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {formatMoney(
                totals.grant,
              )}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Funding
              </h2>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Investments and
                grants received by
                this startup.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFundingOpen(
                  true,
                )
              }
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white sm:w-auto"
            >
              <Plus
                size={15}
              />

              Add funding
            </button>
          </div>

          {startup.funding.length ===
          0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-400 dark:text-slate-500">
              No funding records
              yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {startup.funding.map(
                (
                  funding,
                ) => (
                  <div
                    key={
                      funding.id
                    }
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <FundingBadge
                          type={
                            funding.type
                          }
                        />

                        {funding.amount !==
                          null &&
                          funding.amount !==
                            undefined && (
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {Number(
                                funding.amount,
                              ).toLocaleString()}
                              {' '}
                              {funding.currency ||
                                ''}
                            </span>
                          )}
                      </div>

                      <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-300">
                        {funding.source ||
                          'Source not specified'}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
                        {funding.round && (
                          <span>
                            {
                              funding.round
                            }
                          </span>
                        )}

                        {funding.fundedAt && (
                          <span>
                            {new Date(
                              funding.fundedAt,
                            ).toLocaleDateString(
                              'en-GB',
                            )}
                          </span>
                        )}
                      </div>

                      {funding.notes && (
                        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {
                            funding.notes
                          }
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void deleteFunding(
                          funding,
                        )
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400 sm:self-auto"
                      aria-label="Delete funding"
                    >
                      <Trash2
                        size={15}
                      />
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              About
            </h2>
          </div>

          <div className="whitespace-pre-wrap p-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {startup.notes ||
              'No description has been added yet.'}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Documents
              </h2>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Pitch decks,
                business plans,
                grant files and
                other startup
                documents.
              </p>
            </div>

            <button
              type="button"
              onClick={
                openDocumentUpload
              }
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
            >
              <Upload
                size={15}
              />

              Upload document
            </button>
          </div>

          {!startup.documents ||
          startup.documents.length ===
            0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <FileText
                  size={19}
                />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                No documents yet
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Upload PDF, Word,
                Excel, PowerPoint
                or image files.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {startup.documents.map(
                (
                  item,
                ) => {
                  const name =
                    item.originalName ||
                    item.fileName;

                  return (
                    <div
                      key={
                        item.id
                      }
                      className="flex min-w-0 items-center gap-3 p-4 sm:px-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <FileText
                          size={17}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                          {name}
                        </p>

                        <div className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-slate-400 dark:text-slate-500">
                          <span>
                            {item.fileSize
                              ? formatFileSize(
                                  item.fileSize,
                                )
                              : 'File'}
                          </span>

                          {item.createdAt && (
                            <span>
                              {new Date(
                                item.createdAt,
                              ).toLocaleDateString(
                                'en-GB',
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            void downloadDocument(
                              item.id,
                              name,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          aria-label="Download document"
                        >
                          <Download
                            size={15}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteDocument(
                              item.id,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          aria-label="Delete document"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        {fundingOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-x-hidden bg-slate-950/40 backdrop-blur-[2px] dark:bg-black/70 sm:items-center sm:p-5">
            <button
              type="button"
              className="absolute inset-0"
              onClick={() => {
                if (
                  !fundingSaving
                ) {
                  setFundingOpen(
                    false,
                  );
                }
              }}
              aria-label="Close funding modal"
            />

            <div className="relative z-10 flex max-h-[calc(100dvh-8px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-slate-900 sm:max-h-[calc(100dvh-40px)] sm:rounded-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    Add funding
                  </h2>

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Add an investment
                    or grant record.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    fundingSaving
                  }
                  onClick={() =>
                    setFundingOpen(
                      false,
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                <FieldLabel label="Type">
                  <select
                    value={
                      fundingForm.type
                    }
                    onChange={(
                      event,
                    ) =>
                      setFundingForm(
                        {
                          ...fundingForm,
                          type:
                            event
                              .target
                              .value as FundingForm['type'],
                        },
                      )
                    }
                    className={inputClass}
                  >
                    <option value="INVESTMENT">
                      Investment
                    </option>

                    <option value="GRANT">
                      Grant
                    </option>
                  </select>
                </FieldLabel>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FieldLabel label="Amount">
                    <input
                      inputMode="decimal"
                      value={
                        fundingForm.amount
                      }
                      onChange={(
                        event,
                      ) =>
                        setFundingForm(
                          {
                            ...fundingForm,
                            amount:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      placeholder="150000"
                      className={
                        inputClass
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Currency">
                    <input
                      value={
                        fundingForm.currency
                      }
                      onChange={(
                        event,
                      ) =>
                        setFundingForm(
                          {
                            ...fundingForm,
                            currency:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      placeholder="USD"
                      className={
                        inputClass
                      }
                    />
                  </FieldLabel>
                </div>

                <FieldLabel
                  label={
                    fundingForm.type ===
                    'GRANT'
                      ? 'Organization'
                      : 'Investor'
                  }
                >
                  <input
                    value={
                      fundingForm.source
                    }
                    onChange={(
                      event,
                    ) =>
                      setFundingForm(
                        {
                          ...fundingForm,
                          source:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </FieldLabel>

                <FieldLabel label="Round / program">
                  <input
                    value={
                      fundingForm.round
                    }
                    onChange={(
                      event,
                    ) =>
                      setFundingForm(
                        {
                          ...fundingForm,
                          round:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    placeholder="Seed, Accelerator..."
                    className={
                      inputClass
                    }
                  />
                </FieldLabel>

                <FieldLabel label="Date">
                  <input
                    type="date"
                    value={
                      fundingForm.fundedAt
                    }
                    onChange={(
                      event,
                    ) =>
                      setFundingForm(
                        {
                          ...fundingForm,
                          fundedAt:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </FieldLabel>

                <FieldLabel label="Notes">
                  <textarea
                    rows={3}
                    value={
                      fundingForm.notes
                    }
                    onChange={(
                      event,
                    ) =>
                      setFundingForm(
                        {
                          ...fundingForm,
                          notes:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className={`${inputClass} h-auto min-h-[100px] resize-none py-3`}
                  />
                </FieldLabel>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 bg-white p-4 pb-[max(16px,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-900 sm:flex sm:justify-end">
                <button
                  type="button"
                  disabled={
                    fundingSaving
                  }
                  onClick={() =>
                    setFundingOpen(
                      false,
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:h-10 sm:rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    fundingSaving
                  }
                  onClick={() =>
                    void addFunding()
                  }
                  className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 sm:h-10 sm:rounded-lg"
                >
                  {fundingSaving
                    ? 'Saving...'
                    : 'Add funding'}
                </button>
              </div>
            </div>
          </div>
        )}

        {documentOpen && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center overflow-x-hidden bg-slate-950/40 backdrop-blur-[2px] dark:bg-black/70 sm:items-center sm:p-5">
            <button
              type="button"
              onClick={() => {
                if (
                  !documentUploading
                ) {
                  setDocumentOpen(
                    false,
                  );
                }
              }}
              className="absolute inset-0"
              aria-label="Close upload"
            />

            <div className="relative z-10 flex max-h-[calc(100dvh-8px)] w-full max-w-[560px] flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-h-[calc(100dvh-40px)] sm:rounded-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Upload document
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Attach a file to
                    this startup.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    documentUploading
                  }
                  onClick={() =>
                    setDocumentOpen(
                      false,
                    )
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Close upload"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    File
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      documentInputRef.current?.click()
                    }
                    className="flex min-h-[120px] w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 text-center transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950/50 dark:hover:border-slate-600"
                  >
                    <Upload
                      size={22}
                      className="text-slate-400"
                    />

                    {selectedDocument ? (
                      <>
                        <p className="mt-3 max-w-full truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                          {
                            selectedDocument.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatFileSize(
                            selectedDocument.size,
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                          Choose a file
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          PDF, Word,
                          Excel,
                          PowerPoint or
                          image
                        </p>
                      </>
                    )}
                  </button>

                  <input
                    ref={
                      documentInputRef
                    }
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
                    onChange={(
                      event,
                    ) => {
                      const file =
                        event
                          .target
                          .files?.[0];

                      if (file) {
                        setSelectedDocument(
                          file,
                        );
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={
                      documentDescription
                    }
                    onChange={(
                      event,
                    ) =>
                      setDocumentDescription(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Optional note..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[16px] text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/60 p-4 pb-[max(16px,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-950/40 sm:flex sm:justify-end sm:px-6">
                <button
                  type="button"
                  disabled={
                    documentUploading
                  }
                  onClick={() =>
                    setDocumentOpen(
                      false,
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:h-10 sm:rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    documentUploading ||
                    !selectedDocument
                  }
                  onClick={() =>
                    void uploadDocument()
                  }
                  className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 sm:h-10 sm:rounded-lg"
                >
                  {documentUploading
                    ? 'Uploading...'
                    : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

const inputClass =
  'h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-[16px] text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800 sm:text-sm';

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>

      {children}
    </label>
  );
}

function FundingBadge({
  type,
}: {
  type:
    | 'INVESTMENT'
    | 'GRANT';
}) {
  if (
    type ===
    'GRANT'
  ) {
    return (
      <span className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
        Grant
      </span>
    );
  }

  return (
    <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
      Investment
    </span>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        {icon}

        {label}
      </div>

      <p className="mt-2 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function formatMoney(
  value: number,
) {
  if (!value) {
    return '0';
  }

  return value.toLocaleString();
}

function formatFileSize(
  bytes: number,
) {
  if (
    bytes < 1024
  ) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(1)} MB`;
}
'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarRange,
  Download,
  FileText,
  Globe,
  ImagePlus,
  Mail,
  MapPin,
  Pencil,
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

import TalentModal from '@/components/talents/talent-modal';

import {
  LanguageLevel,
  Talent,
  TalentDocument,
  TalentFormValues,
} from '@/components/talents/types';

import {
  ApiError,
  apiFetch,
  apiUrl,
  getToken,
} from '@/lib/api';

export default function TalentProfilePage() {
  const params =
    useParams();

  const router =
    useRouter();

  const id =
    String(
      params.id,
    );

  const photoInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const documentInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    talent,
    setTalent,
  ] =
    useState<Talent | null>(
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
    editOpen,
    setEditOpen,
  ] =
    useState(false);

  const [
    editSaving,
    setEditSaving,
  ] =
    useState(false);

  const [
    photoUploading,
    setPhotoUploading,
  ] =
    useState(false);

  const [
    languageName,
    setLanguageName,
  ] =
    useState('');

  const [
    languageLevel,
    setLanguageLevel,
  ] =
    useState<LanguageLevel>(
      'INTERMEDIATE',
    );

  const [
    languageSaving,
    setLanguageSaving,
  ] =
    useState(false);

  const [
    documentOpen,
    setDocumentOpen,
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

  const [
    documentUploading,
    setDocumentUploading,
  ] =
    useState(false);

  async function loadTalent() {
    try {
      setLoading(
        true,
      );

      setError('');

      const data =
        await apiFetch<Talent>(
          `/talents/${id}`,
        );

      setTalent(
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
      void loadTalent();
    }
  }, [id]);

  async function saveTalent(
    form:
      TalentFormValues,
  ) {
    try {
      setEditSaving(
        true,
      );

      setError('');

      await apiFetch(
        `/talents/${id}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              fullName:
                form.fullName,

              position:
                form.position ||
                null,

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

              currentCompany:
                form.currentCompany ||
                null,

              experienceYears:
                form.experienceYears ||
                null,

              salaryExpectation:
                form.salaryExpectation ||
                null,

              salaryCurrency:
                form.salaryCurrency ||
                null,

              status:
                form.status,

              notes:
                form.notes ||
                null,
            }),
        },
      );

      await syncLanguages(
        form,
      );

      setEditOpen(
        false,
      );

      await loadTalent();
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
      setEditSaving(
        false,
      );
    }
  }

  async function syncLanguages(
    form:
      TalentFormValues,
  ) {
    if (!talent) {
      return;
    }

    const desired = [
      {
        language:
          'English',

        level:
          form.englishLevel,
      },

      {
        language:
          'Russian',

        level:
          form.russianLevel,
      },

      {
        language:
          'Uzbek',

        level:
          form.uzbekLevel,
      },
    ];

    for (
      const item of
      desired
    ) {
      const existing =
        talent.languages.find(
          (
            language,
          ) =>
            language.language.toLowerCase() ===
            item.language.toLowerCase(),
        );

      if (
        item.level &&
        existing
      ) {
        if (
          existing.level !==
          item.level
        ) {
          await apiFetch(
            `/talents/${id}/languages/${existing.id}`,
            {
              method:
                'PATCH',

              body:
                JSON.stringify({
                  language:
                    item.language,

                  level:
                    item.level,
                }),
            },
          );
        }
      } else if (
        item.level &&
        !existing
      ) {
        await apiFetch(
          `/talents/${id}/languages`,
          {
            method:
              'POST',

            body:
              JSON.stringify({
                language:
                  item.language,

                level:
                  item.level,
              }),
          },
        );
      } else if (
        !item.level &&
        existing
      ) {
        await apiFetch(
          `/talents/${id}/languages/${existing.id}`,
          {
            method:
              'DELETE',
          },
        );
      }
    }
  }

  async function uploadPhoto(
    file: File,
  ) {
    try {
      setPhotoUploading(
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
        `/talents/${id}/photo`,
        {
          method:
            'POST',

          body:
            formData,
        },
      );

      await loadTalent();
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
      setPhotoUploading(
        false,
      );

      if (
        photoInputRef.current
      ) {
        photoInputRef.current.value =
          '';
      }
    }
  }

  async function addLanguage() {
    const language =
      languageName.trim();

    if (!language) {
      return;
    }

    try {
      setLanguageSaving(
        true,
      );

      setError('');

      await apiFetch(
        `/talents/${id}/languages`,
        {
          method:
            'POST',

          body:
            JSON.stringify({
              language,

              level:
                languageLevel,
            }),
        },
      );

      setLanguageName(
        '',
      );

      setLanguageLevel(
        'INTERMEDIATE',
      );

      await loadTalent();
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
      setLanguageSaving(
        false,
      );
    }
  }

  async function deleteLanguage(
    languageId: string,
  ) {
    try {
      setError('');

      await apiFetch(
        `/talents/${id}/languages/${languageId}`,
        {
          method:
            'DELETE',
        },
      );

      await loadTalent();
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
        'TALENTS',
      );

      formData.append(
        'talentId',
        id,
      );

      if (
        documentDescription.trim()
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

      await loadTalent();
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
    document:
      TalentDocument,
  ) {
    try {
      const token =
        getToken();

      const response =
        await fetch(
          apiUrl(
            `/documents/${document.id}/download`,
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
        document.originalName ||
        document.fileName;

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
        'Could not download the document.',
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

      await loadTalent();
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
        <div className="py-24 text-center text-sm text-slate-400">
          Loading talent...
        </div>
      </AppShell>
    );
  }

  if (!talent) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-slate-500">
          {error ||
            'Talent not found.'}
        </div>
      </AppShell>
    );
  }

  const initials =
    talent.fullName
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

  const photoSrc =
    talent.photoUrl
      ? talent.photoUrl.startsWith(
          'http://',
        ) ||
        talent.photoUrl.startsWith(
          'https://',
        )
        ? talent.photoUrl
        : apiUrl(
            talent.photoUrl,
          )
      : null;

  return (
    <AppShell>
      <div className="min-w-0 space-y-6">
        <button
          type="button"
          onClick={() =>
            router.push(
              '/talents',
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft
            size={16}
          />

          Talents
        </button>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:p-6">
            <div className="shrink-0">
              <button
                type="button"
                disabled={
                  photoUploading
                }
                onClick={() =>
                  photoInputRef.current?.click()
                }
                className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 transition hover:ring-2 hover:ring-slate-300 dark:bg-slate-800 dark:hover:ring-slate-700"
              >
                {photoSrc ? (
                  <img
                    src={
                      photoSrc
                    }
                    alt={
                      talent.fullName
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
                    {initials ||
                      'T'}
                  </span>
                )}

                {!photoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 opacity-0 transition group-hover:opacity-100">
                    <ImagePlus
                      size={21}
                      className="text-white"
                    />
                  </div>
                )}

                {photoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-xs font-medium text-slate-600 dark:bg-slate-900/90 dark:text-slate-300">
                    Uploading...
                  </div>
                )}
              </button>

              <input
                ref={
                  photoInputRef
                }
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(
                  event,
                ) => {
                  const file =
                    event
                      .target
                      .files?.[0];

                  if (file) {
                    void uploadPhoto(
                      file,
                    );
                  }
                }}
              />

              <button
                type="button"
                disabled={
                  photoUploading
                }
                onClick={() =>
                  photoInputRef.current?.click()
                }
                className="mt-2 w-28 text-center text-xs font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {photoSrc
                  ? 'Change photo'
                  : 'Upload photo'}
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {
                    talent.fullName
                  }
                </h1>

                <StatusBadge
                  status={
                    talent.status
                  }
                />
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {talent.position ||
                  'Position not added'}
              </p>

              {talent.languages.length >
                0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {talent.languages.map(
                    (
                      language,
                    ) => (
                      <span
                        key={
                          language.id
                        }
                        className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {
                          language.language
                        }{' '}
                        ·{' '}
                        {humanize(
                          language.level,
                        )}
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setEditOpen(
                  true,
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Pencil
                size={14}
              />

              Edit
            </button>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            <InfoItem
              icon={
                <Mail
                  size={16}
                />
              }
              label="Email"
              value={
                talent.email ||
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
                talent.phone ||
                '—'
              }
            />

            <InfoItem
              icon={
                <MapPin
                  size={16}
                />
              }
              label="Location"
              value={
                talent.location ||
                '—'
              }
            />

            <InfoItem
              icon={
                <BriefcaseBusiness
                  size={16}
                />
              }
              label="Company"
              value={
                talent.currentCompany ||
                '—'
              }
            />

            <InfoItem
              icon={
                <CalendarRange
                  size={16}
                />
              }
              label="Experience"
              value={
                talent.experienceYears !==
                  null &&
                talent.experienceYears !==
                  undefined
                  ? `${talent.experienceYears} years`
                  : '—'
              }
            />

            <InfoItem
              icon={
                <UserRound
                  size={16}
                />
              }
              label="Telegram"
              value={
                talent.telegram ||
                '—'
              }
            />

            <InfoItem
              icon={
                <Globe
                  size={16}
                />
              }
              label="Salary"
              value={
                talent.salaryExpectation
                  ? `${Number(
                      talent.salaryExpectation,
                    ).toLocaleString()} ${
                      talent.salaryCurrency ||
                      ''
                    }`
                  : '—'
              }
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Languages
            </h2>
          </div>

          <div className="p-5">
            <div className="grid gap-2 sm:grid-cols-[1fr_150px_44px]">
              <input
                value={
                  languageName
                }
                onChange={(
                  event,
                ) =>
                  setLanguageName(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="English"
                className={
                  inputClass
                }
              />

              <select
                value={
                  languageLevel
                }
                onChange={(
                  event,
                ) =>
                  setLanguageLevel(
                    event
                      .target
                      .value as LanguageLevel,
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="BASIC">
                  Basic
                </option>

                <option value="INTERMEDIATE">
                  Intermediate
                </option>

                <option value="ADVANCED">
                  Advanced
                </option>

                <option value="FLUENT">
                  Fluent
                </option>

                <option value="NATIVE">
                  Native
                </option>
              </select>

              <button
                type="button"
                disabled={
                  languageSaving ||
                  !languageName.trim()
                }
                onClick={() =>
                  void addLanguage()
                }
                className="flex h-11 items-center justify-center rounded-xl bg-slate-900 text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
              >
                <Plus
                  size={17}
                />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {talent.languages.length ===
              0 ? (
                <p className="text-sm text-slate-400">
                  No languages added
                  yet.
                </p>
              ) : (
                talent.languages.map(
                  (
                    language,
                  ) => (
                    <div
                      key={
                        language.id
                      }
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {
                            language.language
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {humanize(
                            language.level,
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          void deleteLanguage(
                            language.id,
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      >
                        <Trash2
                          size={14}
                        />
                      </button>
                    </div>
                  ),
                )
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Notes
            </h2>
          </div>

          <div className="whitespace-pre-wrap p-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {talent.notes ||
              'No notes added yet.'}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                CV & Documents
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Candidate CV and
                supporting files.
              </p>
            </div>

            <button
              type="button"
              onClick={
                openDocumentUpload
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Upload
                size={15}
              />

              Upload document
            </button>
          </div>

          {!talent.documents ||
          talent.documents.length ===
            0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <FileText
                  size={19}
                />
              </div>

              <p className="mt-3 text-sm text-slate-500">
                No documents yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {talent.documents.map(
                (
                  document,
                ) => (
                  <div
                    key={
                      document.id
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
                        {document.originalName ||
                          document.fileName}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {document.fileSize
                          ? formatFileSize(
                              document.fileSize,
                            )
                          : 'File'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void downloadDocument(
                          document,
                        )
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    >
                      <Download
                        size={15}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void deleteDocument(
                          document.id,
                        )
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
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

        <TalentModal
          open={
            editOpen
          }
          saving={
            editSaving
          }
          talent={
            talent
          }
          onClose={() =>
            setEditOpen(
              false,
            )
          }
          onSubmit={
            saveTalent
          }
        />

        {documentOpen && (
          <div className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-950/40 backdrop-blur-[2px] dark:bg-black/70 sm:items-center sm:p-5">
            <button
              type="button"
              className="absolute inset-0"
              onClick={() => {
                if (
                  !documentUploading
                ) {
                  setDocumentOpen(
                    false,
                  );
                }
              }}
            />

            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    Upload document
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Upload the
                    candidate CV or
                    another supporting
                    file.
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <button
                  type="button"
                  onClick={() =>
                    documentInputRef.current?.click()
                  }
                  className="flex min-h-[120px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-950/50"
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

                      <p className="mt-1 text-xs text-slate-400">
                        PDF, Word,
                        Excel or image
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
                  ) =>
                    setSelectedDocument(
                      event
                        .target
                        .files?.[0] ||
                        null,
                    )
                  }
                />

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
                  placeholder="Optional description..."
                  className={`${inputClass} h-auto min-h-[90px] resize-none py-3`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
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
                  className="h-11 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
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
                  className="h-11 rounded-xl bg-slate-900 text-sm font-medium text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
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

function InfoItem({
  icon,
  label,
  value,
}: {
  icon:
    ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        {icon}

        {label}
      </div>

      <p className="mt-2 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const className =
    status ===
    'AVAILABLE'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
      : status ===
          'OPEN_TO_OFFERS'
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
        : status ===
            'NOT_AVAILABLE'
          ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

  return (
    <span
      className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold ${className}`}
    >
      {humanize(
        status,
      )}
    </span>
  );
}

function humanize(
  value: string,
) {
  return value
    .toLowerCase()
    .split('_')
    .map(
      (
        word,
      ) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(' ');
}

function formatFileSize(
  bytes: number,
) {
  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 *
      1024
  ) {
    return `${(
      bytes /
      1024
    ).toFixed(
      1,
    )} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(
    1,
  )} MB`;
}

const inputClass =
  'h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-[16px] text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800 sm:text-sm';
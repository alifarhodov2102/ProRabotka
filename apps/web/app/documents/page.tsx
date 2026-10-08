'use client';

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Download,
  File,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import AppShell from '@/components/app-shell';
import ConfirmModal from '@/components/ui/confirm-modal';

import {
  ApiError,
  apiFetch,
  getToken,
} from '@/lib/api';

type Section =
  | 'RESIDENTS'
  | 'STARTUPS'
  | 'INFRASTRUCTURE'
  | 'GENERAL';

type Space = {
  id: string;
  name: string;
  section: Section;

  _count?: {
    folders: number;
    documents: number;
  };
};

type DocumentItem = {
  id: string;
  fileName: string;
  originalName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;

  section: Section;

  createdAt: string;

  uploadedBy?: {
    id: string;
    name: string;
  };

  space?: {
    id: string;
    name: string;
  } | null;

  folder?: {
    id: string;
    name: string;
  } | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';

export default function DocumentsPage() {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    documents,
    setDocuments,
  ] = useState<DocumentItem[]>(
    [],
  );

  const [
    spaces,
    setSpaces,
  ] = useState<Space[]>([]);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    filter,
    setFilter,
  ] = useState<
    'ALL' | Section
  >('ALL');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    uploadOpen,
    setUploadOpen,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(
    null,
  );

  const [
    uploadSection,
    setUploadSection,
  ] =
    useState<Section>(
      'GENERAL',
    );

  const [
    uploadSpaceId,
    setUploadSpaceId,
  ] = useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    deleteItem,
    setDeleteItem,
  ] =
    useState<DocumentItem | null>(
      null,
    );

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [
        documentsData,
        spacesData,
      ] = await Promise.all([
        apiFetch<DocumentItem[]>(
          '/documents',
        ),

        apiFetch<Space[]>(
          '/spaces',
        ),
      ]);

      setDocuments(
        documentsData,
      );

      setSpaces(
        spacesData,
      );
    } catch (err) {
      if (
        err instanceof
          ApiError &&
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
    loadData();
  }, []);

  const filteredDocuments =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      return documents.filter(
        (document) => {
          const matchesSection =
            filter ===
              'ALL' ||
            document.section ===
              filter;

          const matchesSearch =
            !q ||
            [
              document.originalName,
              document.fileName,
              document.space?.name,
              document.folder?.name,
              document.uploadedBy
                ?.name,
            ]
              .filter(Boolean)
              .some(
                (value) =>
                  String(
                    value,
                  )
                    .toLowerCase()
                    .includes(
                      q,
                    ),
              );

          return (
            matchesSection &&
            matchesSearch
          );
        },
      );
    }, [
      documents,
      filter,
      search,
    ]);

  const availableSpaces =
    useMemo(() => {
      return spaces.filter(
        (space) =>
          space.section ===
          uploadSection,
      );
    }, [
      spaces,
      uploadSection,
    ]);

  const recentCount =
    useMemo(() => {
      const sevenDaysAgo =
        Date.now() -
        7 *
          24 *
          60 *
          60 *
          1000;

      return documents.filter(
        (document) =>
          new Date(
            document.createdAt,
          ).getTime() >=
          sevenDaysAgo,
      ).length;
    }, [documents]);

  function openUpload() {
    setSelectedFile(
      null,
    );

    setUploadSection(
      'GENERAL',
    );

    setUploadSpaceId(
      '',
    );

    setDescription(
      '',
    );

    setUploadOpen(
      true,
    );
  }

  function closeUpload() {
    if (uploading) {
      return;
    }

    setUploadOpen(
      false,
    );

    setSelectedFile(
      null,
    );

    setDescription(
      '',
    );

    setUploadSpaceId(
      '',
    );

    if (
      inputRef.current
    ) {
      inputRef.current.value =
        '';
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (file) {
      setSelectedFile(
        file,
      );
    }
  }

  async function uploadDocument() {
    if (!selectedFile) {
      setError(
        'Please select a file.',
      );

      return;
    }

    try {
      setUploading(
        true,
      );

      setError('');

      const formData =
        new FormData();

      formData.append(
        'file',
        selectedFile,
      );

      formData.append(
        'section',
        uploadSection,
      );

      if (uploadSpaceId) {
        formData.append(
          'spaceId',
          uploadSpaceId,
        );
      }

      if (
        description.trim()
      ) {
        formData.append(
          'description',
          description.trim(),
        );
      }

      await apiFetch(
        '/documents/upload',
        {
          method: 'POST',
          body: formData,
        },
      );

      setUploadOpen(
        false,
      );

      setSelectedFile(
        null,
      );

      setDescription(
        '',
      );

      setUploadSpaceId(
        '',
      );

      if (
        inputRef.current
      ) {
        inputRef.current.value =
          '';
      }

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
      setUploading(
        false,
      );
    }
  }

  async function downloadDocument(
    document: DocumentItem,
  ) {
    try {
      setError('');

      const token =
        getToken();

      const response =
        await fetch(
          `${API_URL}/documents/${document.id}/download`,
          {
            headers: token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {},
          },
        );

      if (!response.ok) {
        throw new Error(
          'Could not download the file.',
        );
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
        'Could not download the file.',
      );
    }
  }

  async function handleDelete() {
    if (!deleteItem) {
      return;
    }

    try {
      setDeleteLoading(
        true,
      );

      setError('');

      await apiFetch(
        `/documents/${deleteItem.id}`,
        {
          method:
            'DELETE',
        },
      );

      setDeleteItem(
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
      setDeleteLoading(
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

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Documents
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Find files across
              residents, startups
              and infrastructure.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openUpload
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            <Upload
              size={16}
            />

            Upload
          </button>
        </section>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label="Total documents"
            value={
              documents.length
            }
            note="Across all sections"
          />

          <SummaryCard
            label="Spaces"
            value={
              spaces.length
            }
            note="Active document spaces"
          />

          <SummaryCard
            label="Recently uploaded"
            value={
              recentCount
            }
            note="During the last 7 days"
          />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex h-10 w-full max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition-colors dark:border-slate-800 dark:bg-slate-900">
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
                placeholder="Search documents..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
              {[
                [
                  'ALL',
                  'All',
                ],
                [
                  'RESIDENTS',
                  'Residents',
                ],
                [
                  'STARTUPS',
                  'Startups',
                ],
                [
                  'INFRASTRUCTURE',
                  'Infrastructure',
                ],
                [
                  'GENERAL',
                  'General',
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
                      setFilter(
                        key as typeof filter,
                      )
                    }
                    className={[
                      'h-9 shrink-0 rounded-lg border px-3 text-sm transition',

                      filter ===
                      key
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                    ].join(
                      ' ',
                    )}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <div className="grid grid-cols-[2.6fr_1fr_1.7fr_1.4fr_1.2fr_0.8fr_100px] bg-[#356b5a] px-5 py-3.5 text-[12px] font-semibold text-white dark:bg-[#284f43]">
                  <div>
                    File
                  </div>

                  <div>
                    Section
                  </div>

                  <div>
                    Space
                  </div>

                  <div>
                    Uploaded by
                  </div>

                  <div>
                    Uploaded
                  </div>

                  <div>
                    Size
                  </div>

                  <div />
                </div>

                {loading ? (
                  <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                    Loading
                    documents...
                  </div>
                ) : filteredDocuments.length ===
                  0 ? (
                  <div className="py-16 text-center">
                    <File
                      size={28}
                      className="mx-auto text-slate-300 dark:text-slate-700"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                      No documents
                      found
                    </p>

                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Upload a file
                      to get
                      started.
                    </p>
                  </div>
                ) : (
                  filteredDocuments.map(
                    (
                      document,
                      index,
                    ) => (
                      <div
                        key={
                          document.id
                        }
                        className={[
                          'grid grid-cols-[2.6fr_1fr_1.7fr_1.4fr_1.2fr_0.8fr_100px] items-center px-5 py-3.5 text-sm transition-colors',

                          index %
                            2 ===
                          0
                            ? 'bg-white dark:bg-slate-900'
                            : 'bg-slate-50/70 dark:bg-slate-950/40',

                          'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',

                          index !==
                          filteredDocuments.length -
                            1
                            ? 'border-b border-slate-100 dark:border-slate-800'
                            : '',
                        ].join(
                          ' ',
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3 pr-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <DocumentIcon
                              document={
                                document
                              }
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                              {document.originalName ||
                                document.fileName}
                            </p>

                            {document.mimeType && (
                              <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">
                                {
                                  document.mimeType
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <SectionBadge
                            section={
                              document.section
                            }
                          />
                        </div>

                        <div className="flex min-w-0 items-center gap-2 text-slate-500 dark:text-slate-400">
                          <FolderOpen
                            size={14}
                            className="shrink-0 text-slate-400 dark:text-slate-500"
                          />

                          <span className="truncate">
                            {document
                              .folder
                              ?.name ||
                              document
                                .space
                                ?.name ||
                              '—'}
                          </span>
                        </div>

                        <div className="truncate text-slate-500 dark:text-slate-400">
                          {document
                            .uploadedBy
                            ?.name ||
                            '—'}
                        </div>

                        <div className="text-[13px] text-slate-500 dark:text-slate-400">
                          {formatDate(
                            document.createdAt,
                          )}
                        </div>

                        <div className="text-[13px] text-slate-400 dark:text-slate-500">
                          {formatFileSize(
                            document.fileSize,
                          )}
                        </div>

                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              downloadDocument(
                                document,
                              )
                            }
                            title="Download"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          >
                            <Download
                              size={
                                14
                              }
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteItem(
                                document,
                              )
                            }
                            title="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          >
                            <Trash2
                              size={
                                14
                              }
                            />
                          </button>
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500 md:hidden">
              Jadvalni
              to‘liq ko‘rish
              uchun
              chapga/o‘ngga
              suring.
            </div>
          </div>
        </section>

        {uploadOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-5 backdrop-blur-[2px] dark:bg-black/60">
            <button
              type="button"
              onClick={
                closeUpload
              }
              className="absolute inset-0"
              aria-label="Close upload"
            />

            <div className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Upload
                    document
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Add a file to
                    ProRabotka.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    uploading
                  }
                  onClick={
                    closeUpload
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X
                    size={
                      18
                    }
                  />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    File
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      inputRef.current?.click()
                    }
                    className="flex min-h-[110px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 text-center transition hover:border-slate-400 hover:bg-slate-50/70 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-slate-600 dark:hover:bg-slate-950"
                  >
                    <Upload
                      size={22}
                      className="text-slate-400 dark:text-slate-500"
                    />

                    {selectedFile ? (
                      <>
                        <p className="mt-3 max-w-full truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                          {
                            selectedFile.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {formatFileSize(
                            selectedFile.size,
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                          Choose a
                          file
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          Maximum file
                          size 25 MB
                        </p>
                      </>
                    )}
                  </button>

                  <input
                    ref={inputRef}
                    type="file"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Section
                    </label>

                    <select
                      value={
                        uploadSection
                      }
                      onChange={(
                        event,
                      ) => {
                        setUploadSection(
                          event
                            .target
                            .value as Section,
                        );

                        setUploadSpaceId(
                          '',
                        );
                      }}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
                    >
                      <option value="GENERAL">
                        General
                      </option>

                      <option value="RESIDENTS">
                        Residents
                      </option>

                      <option value="STARTUPS">
                        Startups
                      </option>

                      <option value="INFRASTRUCTURE">
                        Infrastructure
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Space
                    </label>

                    <select
                      value={
                        uploadSpaceId
                      }
                      onChange={(
                        event,
                      ) =>
                        setUploadSpaceId(
                          event
                            .target
                            .value,
                        )
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
                    >
                      <option value="">
                        No space
                      </option>

                      {availableSpaces.map(
                        (
                          space,
                        ) => (
                          <option
                            key={
                              space.id
                            }
                            value={
                              space.id
                            }
                          >
                            {
                              space.name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={
                      description
                    }
                    onChange={(
                      event,
                    ) =>
                      setDescription(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Optional note..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
                <button
                  type="button"
                  disabled={
                    uploading
                  }
                  onClick={
                    closeUpload
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    uploading ||
                    !selectedFile
                  }
                  onClick={
                    uploadDocument
                  }
                  className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  {uploading
                    ? 'Uploading...'
                    : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          open={
            deleteItem !==
            null
          }
          variant="delete"
          loading={
            deleteLoading
          }
          title="Delete document?"
          description={`${
            deleteItem
              ?.originalName ||
            deleteItem
              ?.fileName ||
            ''
          } will be permanently deleted from ProRabotka.`}
          confirmText="Delete document"
          onClose={() => {
            if (
              !deleteLoading
            ) {
              setDeleteItem(
                null,
              );
            }
          }}
          onConfirm={
            handleDelete
          }
        />
      </div>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-colors dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </p>

      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        {note}
      </p>
    </div>
  );
}

function DocumentIcon({
  document,
}: {
  document:
    DocumentItem;
}) {
  const name =
    document.originalName ||
    document.fileName;

  const extension =
    name
      .split('.')
      .pop()
      ?.toLowerCase() ||
    '';

  if (
    extension ===
      'xlsx' ||
    extension ===
      'xls' ||
    extension ===
      'csv'
  ) {
    return (
      <FileSpreadsheet
        size={17}
      />
    );
  }

  if (
    extension ===
      'pdf' ||
    extension ===
      'doc' ||
    extension ===
      'docx'
  ) {
    return (
      <FileText
        size={17}
      />
    );
  }

  return (
    <File size={17} />
  );
}

function SectionBadge({
  section,
}: {
  section: Section;
}) {
  const labels:
    Record<
      Section,
      string
    > = {
    RESIDENTS:
      'Residents',

    STARTUPS:
      'Startups',

    INFRASTRUCTURE:
      'Infrastructure',

    GENERAL:
      'General',
  };

  const styles:
    Record<
      Section,
      string
    > = {
    RESIDENTS:
      'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/50',

    STARTUPS:
      'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-900/50',

    INFRASTRUCTURE:
      'bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:ring-sky-900/50',

    GENERAL:
      'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
  };

  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset',

        styles[
          section
        ],
      ].join(' ')}
    >
      {labels[section]}
    </span>
  );
}

function formatFileSize(
  bytes?:
    | number
    | null,
) {
  if (!bytes) {
    return '—';
  }

  if (bytes < 1024) {
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
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function formatDate(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleDateString(
    'en-GB',
  );
}
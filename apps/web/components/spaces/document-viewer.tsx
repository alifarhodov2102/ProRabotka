'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Check,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

import mammoth from 'mammoth';

import * as XLSX from 'xlsx';

import {
  apiUrl,
  getToken,
} from '@/lib/api';

export type SpaceDocumentItem = {
  id: string;
  fileName: string;
  originalName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  createdAt: string;

  uploadedBy?: {
    id: string;
    name: string;
  };
};

export function DocumentRow({
  document,
  onPreview,
  onRename,
  onDownload,
  onDelete,
}: {
  document:
    SpaceDocumentItem;

  onPreview:
    () => void;

  onRename: (
    name: string,
  ) =>
    Promise<void>;

  onDownload:
    () => void;

  onDelete:
    () => void;
}) {
  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    name,
    setName,
  ] =
    useState(
      document.originalName ||
        document.fileName,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  useEffect(() => {
    if (
      !editing
    ) {
      setName(
        document.originalName ||
          document.fileName,
      );
    }
  }, [
    document.originalName,
    document.fileName,
    editing,
  ]);

  async function saveRename() {
    const nextName =
      name.trim();

    if (
      !nextName
    ) {
      return;
    }

    const currentName =
      document.originalName ||
      document.fileName;

    if (
      nextName ===
      currentName
    ) {
      setEditing(
        false,
      );

      return;
    }

    try {
      setSaving(
        true,
      );

      await onRename(
        nextName,
      );

      setEditing(
        false,
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  function cancelRename() {
    setName(
      document.originalName ||
        document.fileName,
    );

    setEditing(
      false,
    );
  }

  return (
    <div className="group flex items-center gap-3 border-b border-slate-100 px-5 py-3.5 last:border-b-0 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
      <button
        type="button"
        onClick={
          onPreview
        }
        title="Preview"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
      >
        <DocumentIcon
          document={
            document
          }
        />
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex max-w-xl items-center gap-2">
            <input
              autoFocus
              value={
                name
              }
              disabled={
                saving
              }
              onChange={(
                event,
              ) =>
                setName(
                  event
                    .target
                    .value,
                )
              }
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                  'Enter'
                ) {
                  event.preventDefault();

                  void saveRename();
                }

                if (
                  event.key ===
                  'Escape'
                ) {
                  event.preventDefault();

                  cancelRename();
                }
              }}
              className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
            />

            <button
              type="button"
              disabled={
                saving ||
                !name.trim()
              }
              onClick={() =>
                void saveRename()
              }
              title="Save name"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-40 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              <Check
                size={14}
              />
            </button>

            <button
              type="button"
              disabled={
                saving
              }
              onClick={
                cancelRename
              }
              title="Cancel"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X
                size={14}
              />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={
              onPreview
            }
            className="block max-w-full text-left"
            title="Open preview"
          >
            <p className="truncate text-sm font-medium text-slate-800 transition hover:text-slate-950 hover:underline dark:text-slate-200 dark:hover:text-white">
              {document.originalName ||
                document.fileName}
            </p>
          </button>
        )}

        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
          {formatFileSize(
            document.fileSize,
          )}

          {document.uploadedBy
            ?.name
            ? ` · ${document.uploadedBy.name}`
            : ''}
        </p>
      </div>

      {!editing && (
        <button
          type="button"
          onClick={() =>
            setEditing(
              true,
            )
          }
          title="Rename"
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 opacity-100 transition hover:bg-white hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Pencil
            size={14}
          />
        </button>
      )}

      <button
        type="button"
        onClick={
          onPreview
        }
        title="Preview"
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Eye
          size={14}
        />
      </button>

      <button
        type="button"
        onClick={
          onDownload
        }
        title="Download"
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Download
          size={14}
        />
      </button>

      <button
        type="button"
        onClick={
          onDelete
        }
        title="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 opacity-100 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2
          size={14}
        />
      </button>
    </div>
  );
}

export function DocumentPreviewModal({
  document,
  onClose,
  onDownload,
}: {
  document:
    SpaceDocumentItem | null;

  onClose:
    () => void;

  onDownload:
    () => void;
}) {
  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    objectUrl,
    setObjectUrl,
  ] =
    useState('');

  const [
    html,
    setHtml,
  ] =
    useState('');

  const [
    workbook,
    setWorkbook,
  ] =
    useState<XLSX.WorkBook | null>(
      null,
    );

  const [
    selectedSheet,
    setSelectedSheet,
  ] =
    useState('');

  const fileName =
    document?.originalName ||
    document?.fileName ||
    '';

  const extension =
    useMemo(
      () =>
        fileName
          .split('.')
          .pop()
          ?.toLowerCase() ||
        '',
      [
        fileName,
      ],
    );

  const isImage =
    document?.mimeType?.startsWith(
      'image/',
    ) ||
    [
      'png',
      'jpg',
      'jpeg',
      'webp',
      'gif',
    ].includes(
      extension,
    );

  const isPdf =
    document?.mimeType ===
      'application/pdf' ||
    extension ===
      'pdf';

  const isDocx =
    extension ===
      'docx';

  const isSpreadsheet =
    [
      'xlsx',
      'xls',
      'csv',
    ].includes(
      extension,
    );

  useEffect(() => {
    if (
      !document
    ) {
      return;
    }

    const currentDocument =
      document;

    let cancelled =
      false;

    let localObjectUrl =
      '';

    async function loadPreview() {
      try {
        setLoading(
          true,
        );

        setError('');

        setHtml('');

        setWorkbook(
          null,
        );

        setSelectedSheet('');

        setObjectUrl('');

        const token =
          getToken();

        const response =
          await fetch(
            apiUrl(
              `/documents/${currentDocument.id}/preview`,
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
          throw new Error(
            'Could not load preview.',
          );
        }

        if (
          isDocx
        ) {
          const arrayBuffer =
            await response.arrayBuffer();

          const result =
            await mammoth.convertToHtml({
              arrayBuffer,
            });

          if (
            cancelled
          ) {
            return;
          }

          setHtml(
            createDocumentHtml(
              result.value,
            ),
          );

          return;
        }

        if (
          isSpreadsheet
        ) {
          const arrayBuffer =
            await response.arrayBuffer();

          const nextWorkbook =
            XLSX.read(
              arrayBuffer,
              {
                type:
                  'array',
              },
            );

          if (
            cancelled
          ) {
            return;
          }

          setWorkbook(
            nextWorkbook,
          );

          const firstSheet =
            nextWorkbook
              .SheetNames[0] ||
            '';

          setSelectedSheet(
            firstSheet,
          );

          if (
            firstSheet
          ) {
            setHtml(
              createSpreadsheetHtml(
                nextWorkbook,
                firstSheet,
              ),
            );
          }

          return;
        }

        if (
          isPdf ||
          isImage
        ) {
          const blob =
            await response.blob();

          localObjectUrl =
            window.URL.createObjectURL(
              blob,
            );

          if (
            cancelled
          ) {
            window.URL.revokeObjectURL(
              localObjectUrl,
            );

            return;
          }

          setObjectUrl(
            localObjectUrl,
          );

          return;
        }

        setError(
          extension ===
            'doc'
            ? 'Legacy .doc files cannot be previewed in the browser. Please download the file or save it as .docx.'
            : 'Preview is not available for this file type.',
        );
      } catch {
        if (
          !cancelled
        ) {
          setError(
            'Could not preview the file.',
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false,
          );
        }
      }
    }

    void loadPreview();

    return () => {
      cancelled =
        true;

      if (
        localObjectUrl
      ) {
        window.URL.revokeObjectURL(
          localObjectUrl,
        );
      }
    };
  }, [
    document,
    extension,
    isDocx,
    isImage,
    isPdf,
    isSpreadsheet,
  ]);

  useEffect(() => {
    if (
      !workbook ||
      !selectedSheet
    ) {
      return;
    }

    setHtml(
      createSpreadsheetHtml(
        workbook,
        selectedSheet,
      ),
    );
  }, [
    workbook,
    selectedSheet,
  ]);

  if (
    !document
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[2px] dark:bg-black/80 sm:p-5">
      <button
        type="button"
        onClick={
          onClose
        }
        className="absolute inset-0"
        aria-label="Close preview"
      />

      <div className="relative z-10 flex h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <DocumentIcon
              document={
                document
              }
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {
                fileName
              }
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              View only ·{' '}
              {formatFileSize(
                document.fileSize,
              )}
            </p>
          </div>

          {isSpreadsheet &&
            workbook &&
            workbook.SheetNames.length >
              1 && (
              <select
                value={
                  selectedSheet
                }
                onChange={(
                  event,
                ) =>
                  setSelectedSheet(
                    event
                      .target
                      .value,
                  )
                }
                className="hidden h-9 max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 md:block"
              >
                {workbook.SheetNames.map(
                  (
                    sheet,
                  ) => (
                    <option
                      key={
                        sheet
                      }
                      value={
                        sheet
                      }
                    >
                      {
                        sheet
                      }
                    </option>
                  ),
                )}
              </select>
            )}

          <button
            type="button"
            onClick={
              onDownload
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download
              size={14}
            />

            <span className="hidden sm:inline">
              Download
            </span>
          </button>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close preview"
          >
            <X
              size={18}
            />
          </button>
        </div>

        {isSpreadsheet &&
          workbook &&
          workbook.SheetNames.length >
            1 && (
            <div className="shrink-0 border-b border-slate-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 md:hidden">
              <select
                value={
                  selectedSheet
                }
                onChange={(
                  event,
                ) =>
                  setSelectedSheet(
                    event
                      .target
                      .value,
                  )
                }
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                {workbook.SheetNames.map(
                  (
                    sheet,
                  ) => (
                    <option
                      key={
                        sheet
                      }
                      value={
                        sheet
                      }
                    >
                      {
                        sheet
                      }
                    </option>
                  ),
                )}
              </select>
            </div>
          )}

        <div className="min-h-0 flex-1 bg-slate-100 dark:bg-slate-950">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Loading preview...
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <File
                size={36}
                className="text-slate-300 dark:text-slate-700"
              />

              <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                Preview not available
              </p>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                {
                  error
                }
              </p>

              <button
                type="button"
                onClick={
                  onDownload
                }
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                <Download
                  size={15}
                />

                Download file
              </button>
            </div>
          ) : objectUrl &&
            isImage ? (
            <div className="flex h-full items-center justify-center overflow-auto p-5">
              <img
                src={
                  objectUrl
                }
                alt={
                  fileName
                }
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : objectUrl &&
            isPdf ? (
            <iframe
              src={
                objectUrl
              }
              title={
                fileName
              }
              className="h-full w-full border-0 bg-white"
            />
          ) : html ? (
            <iframe
              srcDoc={
                html
              }
              sandbox=""
              title={
                fileName
              }
              className="h-full w-full border-0 bg-white"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DocumentIcon({
  document,
}: {
  document:
    SpaceDocumentItem;
}) {
  const fileName =
    document.originalName ||
    document.fileName;

  const extension =
    fileName
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
    <File
      size={17}
    />
  );
}

function createDocumentHtml(
  body:
    string,
) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<style>
  * {
    box-sizing: border-box;
  }

  html {
    background: #e2e8f0;
  }

  body {
    width: min(900px, calc(100% - 32px));
    min-height: calc(100vh - 32px);

    margin: 16px auto;

    padding: 56px 64px;

    background: white;

    color: #0f172a;

    font-family: Arial, Helvetica, sans-serif;

    font-size: 15px;

    line-height: 1.65;

    box-shadow:
      0 1px 8px
      rgba(15, 23, 42, 0.12);
  }

  img {
    max-width: 100%;
    height: auto;
  }

  table {
    width: 100%;

    border-collapse:
      collapse;

    margin:
      18px 0;
  }

  td,
  th {
    border:
      1px solid #cbd5e1;

    padding:
      7px 9px;

    vertical-align:
      top;
  }

  p {
    margin:
      0 0 12px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height:
      1.3;

    margin:
      20px 0 10px;
  }

  ul,
  ol {
    padding-left:
      24px;
  }

  a {
    color:
      #2563eb;
  }

  @media (
    max-width:
      640px
  ) {
    body {
      width:
        100%;

      min-height:
        100vh;

      margin:
        0;

      padding:
        24px 18px;

      box-shadow:
        none;
    }
  }
</style>
</head>

<body>
${body}
</body>
</html>`;
}

function createSpreadsheetHtml(
  workbook:
    XLSX.WorkBook,

  sheetName:
    string,
) {
  const sheet =
    workbook.Sheets[
      sheetName
    ];

  if (
    !sheet
  ) {
    return '';
  }

  const table =
    XLSX.utils.sheet_to_html(
      sheet,
      {
        id:
          'sheet-table',
      },
    );

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<style>
  * {
    box-sizing:
      border-box;
  }

  html,
  body {
    margin:
      0;

    min-height:
      100%;

    background:
      #ffffff;

    color:
      #0f172a;

    font-family:
      Arial,
      Helvetica,
      sans-serif;
  }

  body {
    padding:
      18px;

    overflow:
      auto;
  }

  .sheet-wrap {
    min-width:
      max-content;
  }

  table {
    border-collapse:
      collapse;

    background:
      white;

    font-size:
      13px;
  }

  td,
  th {
    min-width:
      90px;

    max-width:
      360px;

    border:
      1px solid #cbd5e1;

    padding:
      6px 8px;

    white-space:
      pre-wrap;

    vertical-align:
      top;
  }

  tr:first-child td,
  tr:first-child th {
    background:
      #f8fafc;

    font-weight:
      600;
  }
</style>
</head>

<body>
<div class="sheet-wrap">
${table}
</div>
</body>
</html>`;
}

function formatFileSize(
  bytes?:
    | number
    | null,
) {
  if (
    !bytes
  ) {
    return '—';
  }

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
    (1024 *
      1024)
  ).toFixed(
    1,
  )} MB`;
}
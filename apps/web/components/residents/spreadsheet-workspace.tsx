'use client';

import {
  ChevronDown,
  FileSpreadsheet,
  LockKeyhole,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

import ResidentExcelView from './resident-excel-view';

import BecomingResidentsTable, {
  type ResidentApplication,
} from './becoming-residents-table';

import type {
  Resident,
} from './resident-table';

import SpaceSpreadsheetEditor, {
  type SpreadsheetDocument,
} from './space-spreadsheet-editor';

type SelectedWorkbook =
  | {
      type:
        'system';
    }
  | {
      type:
        'space';

      documentId:
        string;
    };

export default function SpreadsheetWorkspace({
  residents,
  applications,
  onResidentsChanged,
  onApplicationsChanged,
  onError,
}: {
  residents:
    Resident[];

  applications:
    ResidentApplication[];

  onResidentsChanged:
    () => Promise<void>;

  onApplicationsChanged:
    () => Promise<void>;

  onError: (
    message: string,
  ) => void;
}) {
  const [
    documents,
    setDocuments,
  ] =
    useState<
      SpreadsheetDocument[]
    >(
      [],
    );

  const [
    selected,
    setSelected,
  ] =
    useState<SelectedWorkbook>({
      type:
        'system',
    });

  const [
    systemSheet,
    setSystemSheet,
  ] =
    useState<
      | 'residents'
      | 'becoming'
    >(
      'residents',
    );

  const [
    loadingDocuments,
    setLoadingDocuments,
  ] =
    useState(true);

  useEffect(() => {
    void loadExcelDocuments();
  }, []);

  async function loadExcelDocuments() {
    try {
      setLoadingDocuments(
        true,
      );

      const data =
        await apiFetch<
          SpreadsheetDocument[]
        >(
          '/documents?section=RESIDENTS',
        );

      setDocuments(
        data.filter(
          (
            document,
          ) =>
            isExcelFile(
              document.originalName ||
                document.fileName,
            ),
        ),
      );
    } catch (error) {
      if (
        error instanceof
        ApiError &&
        error.status !==
          401
      ) {
        onError(
          error.message,
        );
      }
    } finally {
      setLoadingDocuments(
        false,
      );
    }
  }

  const selectedDocument =
    useMemo(
      () =>
        selected.type ===
        'space'
          ? documents.find(
              (
                document,
              ) =>
                document.id ===
                selected.documentId,
            ) ||
            null
          : null,
      [
        selected,
        documents,
      ],
    );

  function handleWorkbookChange(
    value:
      string,
  ) {
    if (
      value ===
      'system'
    ) {
      setSelected({
        type:
          'system',
      });

      return;
    }

    setSelected({
      type:
        'space',

      documentId:
        value,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet
              size={
                17
              }
              className="text-emerald-600 dark:text-emerald-400"
            />

            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Spreadsheet workspace
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Open the live resident database or edit Excel files stored in Residents Spaces.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-[280px]">
            <select
              value={
                selected.type ===
                'system'
                  ? 'system'
                  : selected.documentId
              }
              onChange={(
                event,
              ) =>
                handleWorkbookChange(
                  event.target.value,
                )
              }
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="system">
                ★ Sirdaryo Residents — System
              </option>

              {documents.length >
                0 && (
                <optgroup label="Residents Spaces">
                  {documents.map(
                    (
                      document,
                    ) => (
                      <option
                        key={
                          document.id
                        }
                        value={
                          document.id
                        }
                      >
                        {documentLabel(
                          document,
                        )}
                      </option>
                    ),
                  )}
                </optgroup>
              )}
            </select>

            <ChevronDown
              size={
                15
              }
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {selected.type ===
            'system' && (
            <div className="relative min-w-[190px]">
              <select
                value={
                  systemSheet
                }
                onChange={(
                  event,
                ) =>
                  setSystemSheet(
                    event.target.value as
                      | 'residents'
                      | 'becoming',
                  )
                }
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="residents">
                  Residents
                </option>

                <option value="becoming">
                  Becoming residents
                </option>
              </select>

              <ChevronDown
                size={
                  15
                }
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          )}
        </div>
      </div>

      {loadingDocuments && (
        <p className="px-1 text-xs text-slate-400">
          Loading Excel files from Spaces...
        </p>
      )}

      {selected.type ===
        'system' ? (
        <>
          <div className="flex items-center gap-2 px-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <LockKeyhole
              size={
                12
              }
            />

            System workbook — core columns stay protected because they are connected to the Residents database.
          </div>

          {systemSheet ===
          'residents' ? (
            <ResidentExcelView
              residents={
                residents
              }
              onChanged={
                onResidentsChanged
              }
              onError={
                onError
              }
            />
          ) : (
            <BecomingResidentsTable
              applications={
                applications
              }
              onChanged={
                onApplicationsChanged
              }
              onError={
                onError
              }
            />
          )}
        </>
      ) : selectedDocument ? (
        <SpaceSpreadsheetEditor
          key={
            selectedDocument.id
          }
          document={
            selectedDocument
          }
          onError={
            onError
          }
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          This Excel file is no longer available. Choose another workbook.
        </div>
      )}
    </div>
  );
}

function isExcelFile(
  fileName:
    string,
) {
  const lower =
    fileName.toLowerCase();

  return (
    lower.endsWith(
      '.xlsx',
    ) ||
    lower.endsWith(
      '.xls',
    )
  );
}

function documentLabel(
  document:
    SpreadsheetDocument,
) {
  const name =
    document.originalName ||
    document.fileName;

  const location =
    [
      document.space?.name,
      document.folder?.name,
    ]
      .filter(
        Boolean,
      )
      .join(
        ' / ',
      );

  return location
    ? `${location} — ${name}`
    : name;
}

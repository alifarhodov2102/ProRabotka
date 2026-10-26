'use client';

import {
  ChevronDown,
  Download,
  Minus,
  Plus,
  Save,
  TableColumnsSplit,
  TableRowsSplit,
  Trash2,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import * as XLSX from 'xlsx';

import {
  ApiError,
  apiFetch,
  apiUrl,
  getToken,
} from '@/lib/api';

export type SpreadsheetDocument = {
  id: string;
  fileName: string;
  originalName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;

  space?: {
    id: string;
    name: string;
  } | null;

  folder?: {
    id: string;
    name: string;
  } | null;
};

type CellValue =
  | string
  | number
  | boolean
  | null;

type Matrix =
  CellValue[][];

export default function SpaceSpreadsheetEditor({
  document,
  onError,
}: {
  document:
    SpreadsheetDocument;

  onError: (
    message: string,
  ) => void;
}) {
  const [
    workbook,
    setWorkbook,
  ] =
    useState<XLSX.WorkBook | null>(
      null,
    );

  const [
    sheetName,
    setSheetName,
  ] =
    useState('');

  const [
    matrix,
    setMatrix,
  ] =
    useState<Matrix>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    dirty,
    setDirty,
  ] =
    useState(false);

  const [
    scale,
    setScale,
  ] =
    useState(
      0.9,
    );

  const [
    selectedRow,
    setSelectedRow,
  ] =
    useState<
      number | null
    >(null);

  const [
    selectedColumn,
    setSelectedColumn,
  ] =
    useState<
      number | null
    >(null);

  const name =
    document.originalName ||
    document.fileName;

  useEffect(() => {
    void loadWorkbook();
  }, [
    document.id,
  ]);

  async function loadWorkbook() {
    try {
      setLoading(
        true,
      );

      setDirty(
        false,
      );

      setSelectedRow(
        null,
      );

      setSelectedColumn(
        null,
      );

      onError('');

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
        throw new Error(
          'Could not open workbook.',
        );
      }

      const buffer =
        await response.arrayBuffer();

      const nextWorkbook =
        XLSX.read(
          buffer,
          {
            type:
              'array',

            cellDates:
              true,
          },
        );

      const firstSheet =
        nextWorkbook.SheetNames[0] ||
        '';

      setWorkbook(
        nextWorkbook,
      );

      setSheetName(
        firstSheet,
      );

      setMatrix(
        firstSheet
          ? sheetToMatrix(
              nextWorkbook.Sheets[
                firstSheet
              ],
            )
          : createEmptyMatrix(),
      );
    } catch (error) {
      onError(
        error instanceof
        Error
          ? error.message
          : 'Could not open workbook.',
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  function commitCurrentSheet(
    sourceWorkbook:
      XLSX.WorkBook,
  ) {
    if (
      !sheetName
    ) {
      return sourceWorkbook;
    }

    const cloned =
      {
        ...sourceWorkbook,

        Sheets: {
          ...sourceWorkbook.Sheets,
        },
      } as XLSX.WorkBook;

    const oldSheet =
      sourceWorkbook.Sheets[
        sheetName
      ];

    const nextSheet =
      XLSX.utils.aoa_to_sheet(
        matrix,
      );

    if (
      oldSheet?.['!cols']
    ) {
      nextSheet['!cols'] =
        oldSheet['!cols'];
    }

    if (
      oldSheet?.['!rows']
    ) {
      nextSheet['!rows'] =
        oldSheet['!rows'];
    }

    cloned.Sheets[
      sheetName
    ] =
      nextSheet;

    return cloned;
  }

  function changeSheet(
    nextSheetName:
      string,
  ) {
    if (
      !workbook ||
      !nextSheetName
    ) {
      return;
    }

    const nextWorkbook =
      commitCurrentSheet(
        workbook,
      );

    setWorkbook(
      nextWorkbook,
    );

    setSheetName(
      nextSheetName,
    );

    setMatrix(
      sheetToMatrix(
        nextWorkbook.Sheets[
          nextSheetName
        ],
      ),
    );

    setSelectedRow(
      null,
    );

    setSelectedColumn(
      null,
    );
  }

  function updateCell(
    rowIndex:
      number,

    columnIndex:
      number,

    value:
      string,
  ) {
    setMatrix(
      (
        current,
      ) => {
        const next =
          ensureMatrixSize(
            current,
            rowIndex +
              1,
            columnIndex +
              1,
          );

        next[
          rowIndex
        ][
          columnIndex
        ] =
          value;

        return next;
      },
    );

    setDirty(
      true,
    );
  }

  function addRow() {
    setMatrix(
      (
        current,
      ) => {
        const columnCount =
          Math.max(
            1,
            getColumnCount(
              current,
            ),
          );

        return [
          ...current.map(
            (
              row,
            ) => [
              ...row,
            ],
          ),

          Array.from(
            {
              length:
                columnCount,
            },
            () =>
              '',
          ),
        ];
      },
    );

    setDirty(
      true,
    );
  }

  function addColumn() {
    setMatrix(
      (
        current,
      ) => {
        const rows =
          current.length
            ? current
            : createEmptyMatrix();

        return rows.map(
          (
            row,
          ) => [
            ...row,
            '',
          ],
        );
      },
    );

    setDirty(
      true,
    );
  }

  function deleteSelectedRow() {
    if (
      selectedRow ===
      null
    ) {
      return;
    }

    setMatrix(
      (
        current,
      ) => {
        const next =
          current
            .filter(
              (
                _row,
                index,
              ) =>
                index !==
                selectedRow,
            )
            .map(
              (
                row,
              ) => [
                ...row,
              ],
            );

        return next.length
          ? next
          : createEmptyMatrix();
      },
    );

    setSelectedRow(
      null,
    );

    setDirty(
      true,
    );
  }

  function deleteSelectedColumn() {
    if (
      selectedColumn ===
      null
    ) {
      return;
    }

    setMatrix(
      (
        current,
      ) => {
        const next =
          current.map(
            (
              row,
            ) =>
              row.filter(
                (
                  _cell,
                  index,
                ) =>
                  index !==
                  selectedColumn,
              ),
          );

        if (
          getColumnCount(
            next,
          ) ===
          0
        ) {
          return next.map(
            () => [
              '',
            ],
          );
        }

        return next;
      },
    );

    setSelectedColumn(
      null,
    );

    setDirty(
      true,
    );
  }

  function buildWorkbook() {
    if (
      !workbook
    ) {
      return null;
    }

    return commitCurrentSheet(
      workbook,
    );
  }

  async function saveWorkbook() {
    const nextWorkbook =
      buildWorkbook();

    if (
      !nextWorkbook
    ) {
      return;
    }

    try {
      setSaving(
        true,
      );

      onError('');

      const output =
        XLSX.write(
          nextWorkbook,
          {
            type:
              'array',

            bookType:
              getBookType(
                name,
              ),
          },
        );

      const blob =
        new Blob(
          [
            output,
          ],
          {
            type:
              getMimeType(
                name,
              ),
          },
        );

      const formData =
        new FormData();

      formData.append(
        'file',
        blob,
        name,
      );

      await apiFetch(
        `/documents/${document.id}/replace`,
        {
          method:
            'POST',

          body:
            formData,
        },
      );

      setWorkbook(
        nextWorkbook,
      );

      setDirty(
        false,
      );
    } catch (error) {
      onError(
        error instanceof
        ApiError
          ? error.message
          : 'Could not save workbook.',
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  function downloadWorkbook() {
    const nextWorkbook =
      buildWorkbook();

    if (
      !nextWorkbook
    ) {
      return;
    }

    const output =
      XLSX.write(
        nextWorkbook,
        {
          type:
            'array',

          bookType:
            getBookType(
              name,
            ),
        },
      );

    const blob =
      new Blob(
        [
          output,
        ],
        {
          type:
            getMimeType(
              name,
            ),
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const anchor =
      window.document.createElement(
        'a',
      );

    anchor.href =
      url;

    anchor.download =
      name;

    window.document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(
      url,
    );
  }

  const visibleMatrix =
    useMemo(
      () =>
        ensureMatrixSize(
          matrix,
          Math.max(
            18,
            matrix.length,
          ),
          Math.max(
            10,
            getColumnCount(
              matrix,
            ),
          ),
        ),
      [
        matrix,
      ],
    );

  const columnCount =
    getColumnCount(
      visibleMatrix,
    );

  const gridTemplateColumns =
    `52px repeat(${columnCount}, minmax(130px, 1fr))`;

  if (
    loading
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center text-sm text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        Opening workbook...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {
                name
              }
            </p>

            {dirty && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                Unsaved
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
            {[
              document.space?.name,
              document.folder?.name,
            ]
              .filter(
                Boolean,
              )
              .join(
                ' / ',
              ) ||
              'Residents Spaces'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {workbook &&
            workbook.SheetNames.length >
              1 && (
              <div className="relative">
                <select
                  value={
                    sheetName
                  }
                  onChange={(
                    event,
                  ) =>
                    changeSheet(
                      event.target.value,
                    )
                  }
                  className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  {workbook.SheetNames.map(
                    (
                      name,
                    ) => (
                      <option
                        key={
                          name
                        }
                        value={
                          name
                        }
                      >
                        {
                          name
                        }
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={
                    13
                  }
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            )}

          <ToolbarButton
            label="Row"
            icon={
              <TableRowsSplit
                size={
                  14
                }
              />
            }
            onClick={
              addRow
            }
          />

          <ToolbarButton
            label="Column"
            icon={
              <TableColumnsSplit
                size={
                  14
                }
              />
            }
            onClick={
              addColumn
            }
          />

          <ToolbarButton
            label="Delete row"
            icon={
              <Trash2
                size={
                  13
                }
              />
            }
            disabled={
              selectedRow ===
              null
            }
            onClick={
              deleteSelectedRow
            }
          />

          <ToolbarButton
            label="Delete column"
            icon={
              <Trash2
                size={
                  13
                }
              />
            }
            disabled={
              selectedColumn ===
              null
            }
            onClick={
              deleteSelectedColumn
            }
          />

          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() =>
                setScale(
                  (
                    current,
                  ) =>
                    Math.max(
                      0.6,
                      Number(
                        (
                          current -
                          0.1
                        ).toFixed(
                          1,
                        ),
                      ),
                    ),
                )
              }
              disabled={
                scale <=
                0.6
              }
              className="flex h-9 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Minus
                size={
                  13
                }
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setScale(
                  0.9,
                )
              }
              className="flex h-9 min-w-[52px] items-center justify-center border-x border-slate-200 px-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
              title="Reset to 90%"
            >
              {Math.round(
                scale *
                  100,
              )}
              %
            </button>

            <button
              type="button"
              onClick={() =>
                setScale(
                  (
                    current,
                  ) =>
                    Math.min(
                      1,
                      Number(
                        (
                          current +
                          0.1
                        ).toFixed(
                          1,
                        ),
                      ),
                    ),
                )
              }
              disabled={
                scale >=
                1
              }
              className="flex h-9 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Plus
                size={
                  13
                }
              />
            </button>
          </div>

          <button
            type="button"
            onClick={
              downloadWorkbook
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download
              size={
                14
              }
            />

            Download
          </button>

          <button
            type="button"
            onClick={() =>
              void saveWorkbook()
            }
            disabled={
              saving ||
              !dirty
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            <Save
              size={
                14
              }
            />

            {saving
              ? 'Saving...'
              : 'Save'}
          </button>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500">
        Click a row number or column letter before deleting it. Cell values save only when you press Save.
      </div>

      <div className="overflow-auto">
        <div
          className="min-w-max"
          style={{
            zoom:
              scale,
          }}
        >
          <div
            className="grid sticky top-0 z-20"
            style={{
              gridTemplateColumns,
            }}
          >
            <div className="flex h-9 items-center justify-center border-b border-r border-slate-300 bg-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500" />

            {Array.from(
              {
                length:
                  columnCount,
              },
              (
                _,
                columnIndex,
              ) => (
                <button
                  key={
                    columnIndex
                  }
                  type="button"
                  onClick={() => {
                    setSelectedColumn(
                      columnIndex,
                    );

                    setSelectedRow(
                      null,
                    );
                  }}
                  className={[
                    'flex h-9 items-center justify-center border-b border-r border-slate-300 text-[11px] font-bold transition dark:border-slate-700',

                    selectedColumn ===
                    columnIndex
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
                  ].join(
                    ' ',
                  )}
                >
                  {columnLabel(
                    columnIndex,
                  )}
                </button>
              ),
            )}
          </div>

          {visibleMatrix.map(
            (
              row,
              rowIndex,
            ) => (
              <div
                key={
                  rowIndex
                }
                className="grid"
                style={{
                  gridTemplateColumns,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRow(
                      rowIndex,
                    );

                    setSelectedColumn(
                      null,
                    );
                  }}
                  className={[
                    'flex min-h-10 items-center justify-center border-b border-r border-slate-300 text-[11px] font-semibold transition dark:border-slate-700',

                    selectedRow ===
                    rowIndex
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-slate-800',
                  ].join(
                    ' ',
                  )}
                >
                  {rowIndex +
                    1}
                </button>

                {Array.from(
                  {
                    length:
                      columnCount,
                  },
                  (
                    _,
                    columnIndex,
                  ) => (
                    <input
                      key={
                        `${rowIndex}-${columnIndex}`
                      }
                      value={
                        cellToString(
                          row[
                            columnIndex
                          ],
                        )
                      }
                      onChange={(
                        event,
                      ) =>
                        updateCell(
                          rowIndex,
                          columnIndex,
                          event.target.value,
                        )
                      }
                      className={[
                        'min-h-10 border-b border-r border-slate-300 bg-white px-2.5 text-[12px] font-medium text-slate-800 outline-none transition focus:relative focus:z-10 focus:bg-emerald-50 focus:ring-2 focus:ring-inset focus:ring-emerald-400/60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-emerald-950/30',

                        rowIndex ===
                        0
                          ? 'font-semibold'
                          : '',
                      ].join(
                        ' ',
                      )}
                    />
                  ),
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  icon,
  onClick,
  disabled =
    false,
}: {
  label: string;

  icon:
    ReactNode;

  onClick:
    () => void;

  disabled?:
    boolean;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {
        icon
      }

      {
        label
      }
    </button>
  );
}

function sheetToMatrix(
  sheet:
    XLSX.WorkSheet,
): Matrix {
  const rows =
    XLSX.utils.sheet_to_json<
      CellValue[]
    >(
      sheet,
      {
        header:
          1,

        raw:
          false,

        defval:
          '',
      },
    );

  if (
    rows.length ===
    0
  ) {
    return createEmptyMatrix();
  }

  return ensureMatrixSize(
    rows.map(
      (
        row,
      ) =>
        row.map(
          (
            cell,
          ) =>
            normalizeCell(
              cell,
            ),
        ),
    ),
    Math.max(
      18,
      rows.length,
    ),
    Math.max(
      10,
      rows.reduce(
        (
          maximum,
          row,
        ) =>
          Math.max(
            maximum,
            row.length,
          ),
        0,
      ),
    ),
  );
}

function normalizeCell(
  value:
    unknown,
): CellValue {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return '';
  }

  if (
    typeof value ===
      'string' ||
    typeof value ===
      'number' ||
    typeof value ===
      'boolean'
  ) {
    return value;
  }

  if (
    value instanceof
    Date
  ) {
    return value.toLocaleDateString(
      'en-GB',
    );
  }

  return String(
    value,
  );
}

function createEmptyMatrix():
  Matrix {
  return Array.from(
    {
      length:
        18,
    },
    () =>
      Array.from(
        {
          length:
            10,
        },
        () =>
          '',
      ),
  );
}

function ensureMatrixSize(
  source:
    Matrix,

  rowCount:
    number,

  columnCount:
    number,
): Matrix {
  const next =
    source.map(
      (
        row,
      ) => [
        ...row,
      ],
    );

  while (
    next.length <
    rowCount
  ) {
    next.push(
      [],
    );
  }

  for (
    const row of
    next
  ) {
    while (
      row.length <
      columnCount
    ) {
      row.push(
        '',
      );
    }
  }

  return next;
}

function getColumnCount(
  matrix:
    Matrix,
) {
  return matrix.reduce(
    (
      maximum,
      row,
    ) =>
      Math.max(
        maximum,
        row.length,
      ),

    0,
  );
}

function cellToString(
  value:
    CellValue,
) {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return '';
  }

  return String(
    value,
  );
}

function columnLabel(
  index:
    number,
) {
  let value =
    index +
    1;

  let label =
    '';

  while (
    value >
    0
  ) {
    const remainder =
      (
        value -
        1
      ) %
      26;

    label =
      String.fromCharCode(
        65 +
          remainder,
      ) +
      label;

    value =
      Math.floor(
        (
          value -
          1
        ) /
          26,
      );
  }

  return label;
}

function getBookType(
  fileName:
    string,
):
  XLSX.BookType {
  return fileName
    .toLowerCase()
    .endsWith(
      '.xls',
    )
    ? 'biff8'
    : 'xlsx';
}

function getMimeType(
  fileName:
    string,
) {
  return fileName
    .toLowerCase()
    .endsWith(
      '.xls',
    )
    ? 'application/vnd.ms-excel'
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
}

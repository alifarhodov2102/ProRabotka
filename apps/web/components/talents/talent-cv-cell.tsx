'use client';

import {
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';

import {
  useRef,
  useState,
} from 'react';

import {
  DocumentPreviewModal,
} from '@/components/spaces/document-viewer';

import {
  ApiError,
  apiFetch,
  apiUrl,
  getToken,
} from '@/lib/api';

export const TALENT_CV_MARKER =
  '__TALENT_CV__';

export type TalentCvDocument = {
  id: string;
  fileName: string;
  originalName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  description?: string | null;
  talentId?: string | null;
  createdAt: string;

  uploadedBy?: {
    id: string;
    name: string;
  };
};

export default function TalentCvCell({
  talentId,
  cv,
  onChanged,
  onError,
  compact = false,
}: {
  talentId: string;

  cv:
    | TalentCvDocument
    | null;

  onChanged:
    () => Promise<void>;

  onError: (
    message:
      string,
  ) => void;

  compact?:
    boolean;
}) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    preview,
    setPreview,
  ] =
    useState<TalentCvDocument | null>(
      null,
    );

  async function uploadCv(
    file:
      File,
  ) {
    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase();

    if (
      !extension ||
      ![
        'pdf',
        'doc',
        'docx',
      ].includes(
        extension,
      )
    ) {
      onError(
        'CV must be PDF, DOC or DOCX.',
      );

      return;
    }

    try {
      setUploading(
        true,
      );

      onError('');

      const formData =
        new FormData();

      formData.append(
        'file',
        file,
      );

      formData.append(
        'section',
        'TALENTS',
      );

      formData.append(
        'talentId',
        talentId,
      );

      formData.append(
        'description',
        TALENT_CV_MARKER,
      );

      await apiFetch(
        '/documents/upload',
        {
          method:
            'POST',

          body:
            formData,
        },
      );

      if (cv) {
        try {
          await apiFetch(
            `/documents/${cv.id}`,
            {
              method:
                'DELETE',
            },
          );
        } catch {
          // New CV is already safely uploaded.
          // The newest CV will be used if old cleanup fails.
        }
      }

      await onChanged();
    } catch (error) {
      onError(
        error instanceof
        ApiError
          ? error.message
          : 'Could not upload CV.',
      );
    } finally {
      setUploading(
        false,
      );

      if (
        inputRef.current
      ) {
        inputRef.current.value =
          '';
      }
    }
  }

  async function deleteCv() {
    if (!cv) {
      return;
    }

    try {
      onError('');

      await apiFetch(
        `/documents/${cv.id}`,
        {
          method:
            'DELETE',
        },
      );

      setPreview(
        null,
      );

      await onChanged();
    } catch (error) {
      onError(
        error instanceof
        ApiError
          ? error.message
          : 'Could not delete CV.',
      );
    }
  }

  async function downloadCv() {
    if (!cv) {
      return;
    }

    try {
      const token =
        getToken();

      const response =
        await fetch(
          apiUrl(
            `/documents/${cv.id}/download`,
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
        cv.originalName ||
        cv.fileName;

      window.document.body.appendChild(
        anchor,
      );

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(
        url,
      );
    } catch {
      onError(
        'Could not download CV.',
      );
    }
  }

  return (
    <>
      <div
        className={[
          'flex items-center justify-center gap-1',

          compact
            ? 'min-h-12'
            : 'min-h-14',
        ].join(
          ' ',
        )}
      >
        <input
          ref={
            inputRef
          }
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(
            event,
          ) => {
            const file =
              event.target
                .files?.[0];

            if (file) {
              void uploadCv(
                file,
              );
            }
          }}
        />

        {cv ? (
          <>
            <button
              type="button"
              onClick={() =>
                setPreview(
                  cv,
                )
              }
              title={
                cv.originalName ||
                cv.fileName
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              <FileText
                size={
                  13
                }
              />

              CV
            </button>

            <button
              type="button"
              disabled={
                uploading
              }
              onClick={() =>
                inputRef.current?.click()
              }
              title="Replace CV"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <RefreshCw
                size={
                  13
                }
                className={
                  uploading
                    ? 'animate-spin'
                    : ''
                }
              />
            </button>

            <button
              type="button"
              onClick={() =>
                void deleteCv()
              }
              title="Delete CV"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <Trash2
                size={
                  13
                }
              />
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={
              uploading
            }
            onClick={() =>
              inputRef.current?.click()
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-2.5 text-[11px] font-medium text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400"
          >
            {uploading ? (
              <RefreshCw
                size={
                  13
                }
                className="animate-spin"
              />
            ) : (
              <Plus
                size={
                  13
                }
              />
            )}

            {uploading
              ? 'Uploading'
              : 'CV'}
          </button>
        )}
      </div>

      <DocumentPreviewModal
        document={
          preview
        }
        onClose={() =>
          setPreview(
            null,
          )
        }
        onDownload={() =>
          void downloadCv()
        }
      />
    </>
  );
}

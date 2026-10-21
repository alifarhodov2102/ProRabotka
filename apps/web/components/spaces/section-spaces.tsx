'use client';

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArrowLeft,
  ChevronRight,
  Folder,
  FolderPlus,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import ConfirmModal from '@/components/ui/confirm-modal';

import {
  DocumentPreviewModal,
  DocumentRow,
} from './document-viewer';

import type {
  SpaceDocumentItem,
} from './document-viewer';

import {
  ApiError,
  apiFetch,
  apiUrl,
  getToken,
} from '@/lib/api';

type SectionType =
  | 'RESIDENTS'
  | 'STARTUPS'
  | 'INFRASTRUCTURE';

type Space = {
  id: string;
  name: string;
  description?: string | null;
  section: SectionType;

  _count?: {
    folders: number;
    documents: number;
  };
};

type FolderItem = {
  id: string;
  name: string;
  spaceId: string;
  parentId?: string | null;

  _count?: {
    documents: number;
    children: number;
  };
};

type DocumentItem =
  SpaceDocumentItem;

type SpaceDetails =
  Space & {
    folders:
      FolderItem[];

    documents:
      DocumentItem[];
  };

type FolderDetails =
  FolderItem & {
    children:
      FolderItem[];

    documents:
      DocumentItem[];

    space: {
      id: string;
      name: string;
    };

    parent?: {
      id: string;
      name: string;
    } | null;
  };

type Breadcrumb = {
  id: string;
  name: string;
};

export default function SectionSpaces({
  section,
}: {
  section:
    SectionType;
}) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    spaces,
    setSpaces,
  ] =
    useState<Space[]>(
      [],
    );

  const [
    selectedSpace,
    setSelectedSpace,
  ] =
    useState<Space | null>(
      null,
    );

  const [
    spaceDetails,
    setSpaceDetails,
  ] =
    useState<SpaceDetails | null>(
      null,
    );

  const [
    folderDetails,
    setFolderDetails,
  ] =
    useState<FolderDetails | null>(
      null,
    );

  const [
    breadcrumbs,
    setBreadcrumbs,
  ] =
    useState<Breadcrumb[]>(
      [],
    );

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    contentLoading,
    setContentLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    spaceModalOpen,
    setSpaceModalOpen,
  ] =
    useState(false);

  const [
    spaceName,
    setSpaceName,
  ] =
    useState('');

  const [
    spaceDescription,
    setSpaceDescription,
  ] =
    useState('');

  const [
    creatingSpace,
    setCreatingSpace,
  ] =
    useState(false);

  const [
    folderModalOpen,
    setFolderModalOpen,
  ] =
    useState(false);

  const [
    folderName,
    setFolderName,
  ] =
    useState('');

  const [
    creatingFolder,
    setCreatingFolder,
  ] =
    useState(false);

  const [
    uploadModalOpen,
    setUploadModalOpen,
  ] =
    useState(false);

  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    deleteSpace,
    setDeleteSpace,
  ] =
    useState<Space | null>(
      null,
    );

  const [
    deleteFolder,
    setDeleteFolder,
  ] =
    useState<FolderItem | null>(
      null,
    );

  const [
    deleteDocument,
    setDeleteDocument,
  ] =
    useState<DocumentItem | null>(
      null,
    );

  const [
    deleteLoading,
    setDeleteLoading,
  ] =
    useState(false);

  const [
    previewDocument,
    setPreviewDocument,
  ] =
    useState<DocumentItem | null>(
      null,
    );

  async function loadSpaces() {
    try {
      setLoading(
        true,
      );

      setError('');

      const data =
        await apiFetch<Space[]>(
          `/spaces?section=${section}`,
        );

      setSpaces(
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
    void loadSpaces();
  }, [section]);

  async function openSpace(
    space:
      Space,
  ) {
    try {
      setContentLoading(
        true,
      );

      setError('');

      const data =
        await apiFetch<SpaceDetails>(
          `/spaces/${space.id}`,
        );

      setSelectedSpace(
        space,
      );

      setSpaceDetails(
        data,
      );

      setFolderDetails(
        null,
      );

      setBreadcrumbs(
        [],
      );

      setSearch('');
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
      setContentLoading(
        false,
      );
    }
  }

  async function reloadCurrentLocation() {
    if (
      !selectedSpace
    ) {
      await loadSpaces();
      return;
    }

    if (
      folderDetails
    ) {
      await openFolder(
        folderDetails.id,
        false,
      );

      return;
    }

    await openSpace(
      selectedSpace,
    );
  }

  async function openFolder(
    folderId:
      string,

    addBreadcrumb =
      true,
  ) {
    try {
      setContentLoading(
        true,
      );

      setError('');

      const data =
        await apiFetch<FolderDetails>(
          `/folders/${folderId}`,
        );

      setFolderDetails(
        data,
      );

      if (
        addBreadcrumb
      ) {
        setBreadcrumbs(
          (
            current,
          ) => {
            if (
              current.some(
                (
                  item,
                ) =>
                  item.id ===
                  folderId,
              )
            ) {
              return current;
            }

            return [
              ...current,

              {
                id:
                  data.id,

                name:
                  data.name,
              },
            ];
          },
        );
      }
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
      setContentLoading(
        false,
      );
    }
  }

  function goBackToSpaces() {
    setSelectedSpace(
      null,
    );

    setSpaceDetails(
      null,
    );

    setFolderDetails(
      null,
    );

    setBreadcrumbs(
      [],
    );

    setSearch('');

    void loadSpaces();
  }

  async function goToSpaceRoot() {
    if (
      !selectedSpace
    ) {
      return;
    }

    setFolderDetails(
      null,
    );

    setBreadcrumbs(
      [],
    );

    await openSpace(
      selectedSpace,
    );
  }

  async function goToBreadcrumb(
    breadcrumb:
      Breadcrumb,

    index:
      number,
  ) {
    setBreadcrumbs(
      breadcrumbs.slice(
        0,
        index + 1,
      ),
    );

    await openFolder(
      breadcrumb.id,
      false,
    );
  }

  async function createSpace() {
    if (
      !spaceName.trim()
    ) {
      return;
    }

    try {
      setCreatingSpace(
        true,
      );

      setError('');

      await apiFetch(
        '/spaces',
        {
          method:
            'POST',

          body:
            JSON.stringify({
              name:
                spaceName.trim(),

              description:
                spaceDescription.trim() ||
                undefined,

              section,
            }),
        },
      );

      setSpaceModalOpen(
        false,
      );

      setSpaceName('');

      setSpaceDescription('');

      await loadSpaces();
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
      setCreatingSpace(
        false,
      );
    }
  }

  async function createFolder() {
    if (
      !folderName.trim() ||
      !selectedSpace
    ) {
      return;
    }

    try {
      setCreatingFolder(
        true,
      );

      setError('');

      await apiFetch(
        '/folders',
        {
          method:
            'POST',

          body:
            JSON.stringify({
              name:
                folderName.trim(),

              spaceId:
                selectedSpace.id,

              parentId:
                folderDetails?.id ||
                undefined,
            }),
        },
      );

      setFolderModalOpen(
        false,
      );

      setFolderName('');

      await reloadCurrentLocation();
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
      setCreatingFolder(
        false,
      );
    }
  }

  function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0];

    if (
      file
    ) {
      setSelectedFile(
        file,
      );
    }
  }

  async function uploadFile() {
    if (
      !selectedFile ||
      !selectedSpace
    ) {
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
        section,
      );

      formData.append(
        'spaceId',
        selectedSpace.id,
      );

      if (
        folderDetails
      ) {
        formData.append(
          'folderId',
          folderDetails.id,
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

      setUploadModalOpen(
        false,
      );

      setSelectedFile(
        null,
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          '';
      }

      await reloadCurrentLocation();
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
      setUploading(
        false,
      );
    }
  }

  async function renameFile(
    document:
      DocumentItem,

    originalName:
      string,
  ) {
    const name =
      originalName.trim();

    if (
      !name
    ) {
      throw new Error(
        'File name is required.',
      );
    }

    try {
      setError('');

      await apiFetch(
        `/documents/${document.id}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              originalName:
                name,
            }),
        },
      );

      await reloadCurrentLocation();
    } catch (err) {
      if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message,
        );

        throw err;
      }

      setError(
        'Could not rename the file.',
      );

      throw err;
    }
  }

  async function downloadFile(
    document:
      DocumentItem,
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
        'Could not download the file.',
      );
    }
  }

  async function handleDelete() {
    try {
      setDeleteLoading(
        true,
      );

      setError('');

      if (
        deleteSpace
      ) {
        await apiFetch(
          `/spaces/${deleteSpace.id}`,
          {
            method:
              'DELETE',
          },
        );

        setDeleteSpace(
          null,
        );

        await loadSpaces();

        return;
      }

      if (
        deleteFolder
      ) {
        await apiFetch(
          `/folders/${deleteFolder.id}`,
          {
            method:
              'DELETE',
          },
        );

        setDeleteFolder(
          null,
        );

        await reloadCurrentLocation();

        return;
      }

      if (
        deleteDocument
      ) {
        await apiFetch(
          `/documents/${deleteDocument.id}`,
          {
            method:
              'DELETE',
          },
        );

        setDeleteDocument(
          null,
        );

        await reloadCurrentLocation();
      }
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

  const currentFolders =
    folderDetails?.children ||
    spaceDetails?.folders ||
    [];

  const currentDocuments =
    folderDetails?.documents ||
    spaceDetails?.documents ||
    [];

  const filteredFolders =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      if (
        !q
      ) {
        return currentFolders;
      }

      return currentFolders.filter(
        (
          folder,
        ) =>
          folder.name
            .toLowerCase()
            .includes(
              q,
            ),
      );
    }, [
      currentFolders,
      search,
    ]);

  const filteredDocuments =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      if (
        !q
      ) {
        return currentDocuments;
      }

      return currentDocuments.filter(
        (
          document,
        ) =>
          (
            document.originalName ||
            document.fileName
          )
            .toLowerCase()
            .includes(
              q,
            ),
      );
    }, [
      currentDocuments,
      search,
    ]);

  if (
    loading
  ) {
    return (
      <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">
        Loading spaces...
      </div>
    );
  }

  if (
    !selectedSpace
  ) {
    return (
      <>
        <div className="space-y-5">
          {error && (
            <ErrorMessage
              message={
                error
              }
            />
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Spaces
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Organize documents into
                shared workspaces.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSpaceModalOpen(
                  true,
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              <Plus
                size={16}
              />

              New space
            </button>
          </div>

          {spaces.length ===
          0 ? (
            <EmptySpaces
              onCreate={() =>
                setSpaceModalOpen(
                  true,
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {spaces.map(
                (
                  space,
                ) => (
                  <div
                    key={
                      space.id
                    }
                    className="group relative rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        openSpace(
                          space,
                        )
                      }
                      className="block w-full text-left"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                        <Folder
                          size={21}
                          strokeWidth={
                            1.8
                          }
                        />
                      </div>

                      <h3 className="mt-4 truncate font-semibold text-slate-900 dark:text-slate-100">
                        {
                          space.name
                        }
                      </h3>

                      <p className="mt-1 min-h-10 text-sm leading-5 text-slate-400 dark:text-slate-500">
                        {space.description ||
                          'Shared workspace'}
                      </p>

                      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                        <span>
                          {space._count
                            ?.folders ??
                            0}{' '}
                          folders
                        </span>

                        <span>
                          {space._count
                            ?.documents ??
                            0}{' '}
                          files
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      title="Delete space"
                      onClick={() =>
                        setDeleteSpace(
                          space,
                        )
                      }
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <CreateSpaceModal
          open={
            spaceModalOpen
          }
          name={
            spaceName
          }
          description={
            spaceDescription
          }
          saving={
            creatingSpace
          }
          onNameChange={
            setSpaceName
          }
          onDescriptionChange={
            setSpaceDescription
          }
          onClose={() =>
            setSpaceModalOpen(
              false,
            )
          }
          onSave={
            createSpace
          }
        />

        <ConfirmModal
          open={
            deleteSpace !==
            null
          }
          variant="delete"
          loading={
            deleteLoading
          }
          title="Delete space?"
          description={`${
            deleteSpace?.name ??
            ''
          } will be permanently deleted. Only empty spaces can be deleted.`}
          confirmText="Delete space"
          onClose={() =>
            setDeleteSpace(
              null,
            )
          }
          onConfirm={
            handleDelete
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {error && (
          <ErrorMessage
            message={
              error
            }
          />
        )}

        <div>
          <button
            type="button"
            onClick={
              goBackToSpaces
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft
              size={15}
            />

            All spaces
          </button>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {
                  selectedSpace.name
                }
              </h2>

              {selectedSpace.description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {
                    selectedSpace.description
                  }
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setFolderModalOpen(
                    true,
                  )
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <FolderPlus
                  size={16}
                />

                New folder
              </button>

              <button
                type="button"
                onClick={() =>
                  setUploadModalOpen(
                    true,
                  )
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                <Upload
                  size={16}
                />

                Upload
              </button>
            </div>
          </div>
        </div>

        <div className="flex min-h-9 flex-wrap items-center gap-1 text-sm">
          <button
            type="button"
            onClick={
              goToSpaceRoot
            }
            className={[
              'rounded-md px-2 py-1 transition',

              breadcrumbs.length ===
              0
                ? 'font-medium text-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            ].join(
              ' ',
            )}
          >
            {
              selectedSpace.name
            }
          </button>

          {breadcrumbs.map(
            (
              item,
              index,
            ) => (
              <div
                key={
                  item.id
                }
                className="flex items-center gap-1"
              >
                <ChevronRight
                  size={14}
                  className="text-slate-300 dark:text-slate-700"
                />

                <button
                  type="button"
                  onClick={() =>
                    goToBreadcrumb(
                      item,
                      index,
                    )
                  }
                  className={[
                    'rounded-md px-2 py-1 transition',

                    index ===
                    breadcrumbs.length -
                      1
                      ? 'font-medium text-slate-900 dark:text-slate-100'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                  ].join(
                    ' ',
                  )}
                >
                  {
                    item.name
                  }
                </button>
              </div>
            ),
          )}
        </div>

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
            placeholder="Search in this folder..."
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        {contentLoading ? (
          <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">
            Loading...
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {filteredFolders.length ===
              0 &&
            filteredDocuments.length ===
              0 ? (
              <div className="px-6 py-16 text-center">
                <Folder
                  size={32}
                  className="mx-auto text-slate-300 dark:text-slate-700"
                />

                <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                  This folder is empty
                </p>

                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Create a folder or
                  upload a document.
                </p>
              </div>
            ) : (
              <>
                {filteredFolders.map(
                  (
                    folder,
                  ) => (
                    <FolderRow
                      key={
                        folder.id
                      }
                      folder={
                        folder
                      }
                      onOpen={() =>
                        openFolder(
                          folder.id,
                        )
                      }
                      onDelete={() =>
                        setDeleteFolder(
                          folder,
                        )
                      }
                    />
                  ),
                )}

                {filteredDocuments.map(
                  (
                    document,
                  ) => (
                    <DocumentRow
                      key={
                        document.id
                      }
                      document={
                        document
                      }
                      onPreview={() =>
                        setPreviewDocument(
                          document,
                        )
                      }
                      onRename={(
                        name,
                      ) =>
                        renameFile(
                          document,
                          name,
                        )
                      }
                      onDownload={() =>
                        downloadFile(
                          document,
                        )
                      }
                      onDelete={() =>
                        setDeleteDocument(
                          document,
                        )
                      }
                    />
                  ),
                )}
              </>
            )}
          </div>
        )}
      </div>

      <CreateFolderModal
        open={
          folderModalOpen
        }
        value={
          folderName
        }
        saving={
          creatingFolder
        }
        onChange={
          setFolderName
        }
        onClose={() =>
          setFolderModalOpen(
            false,
          )
        }
        onSave={
          createFolder
        }
      />

      <UploadModal
        open={
          uploadModalOpen
        }
        file={
          selectedFile
        }
        uploading={
          uploading
        }
        fileInputRef={
          fileInputRef
        }
        onFileChange={
          handleFileChange
        }
        onClose={() => {
          if (
            !uploading
          ) {
            setUploadModalOpen(
              false,
            );
          }
        }}
        onUpload={
          uploadFile
        }
      />

      <DocumentPreviewModal
        document={
          previewDocument
        }
        onClose={() =>
          setPreviewDocument(
            null,
          )
        }
        onDownload={() => {
          if (
            previewDocument
          ) {
            void downloadFile(
              previewDocument,
            );
          }
        }}
      />

      <ConfirmModal
        open={
          deleteFolder !==
          null
        }
        variant="delete"
        loading={
          deleteLoading
        }
        title="Delete folder?"
        description={`${
          deleteFolder?.name ??
          ''
        } will be permanently deleted. Only empty folders can be deleted.`}
        confirmText="Delete folder"
        onClose={() =>
          setDeleteFolder(
            null,
          )
        }
        onConfirm={
          handleDelete
        }
      />

      <ConfirmModal
        open={
          deleteDocument !==
          null
        }
        variant="delete"
        loading={
          deleteLoading
        }
        title="Delete document?"
        description={`${
          deleteDocument
            ?.originalName ||
          deleteDocument
            ?.fileName ||
          ''
        } will be permanently deleted.`}
        confirmText="Delete document"
        onClose={() =>
          setDeleteDocument(
            null,
          )
        }
        onConfirm={
          handleDelete
        }
      />
    </>
  );
}

function FolderRow({
  folder,
  onOpen,
  onDelete,
}: {
  folder:
    FolderItem;

  onOpen:
    () => void;

  onDelete:
    () => void;
}) {
  return (
    <div className="group flex items-center border-b border-slate-100 px-5 py-3.5 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
      <button
        type="button"
        onClick={
          onOpen
        }
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <Folder
            size={18}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
            {
              folder.name
            }
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            {folder._count
              ?.children ??
              0}{' '}
            folders ·{' '}
            {folder._count
              ?.documents ??
              0}{' '}
            files
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={
          onDelete
        }
        title="Delete folder"
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        <Trash2
          size={14}
        />
      </button>
    </div>
  );
}

function CreateSpaceModal({
  open,
  name,
  description,
  saving,
  onNameChange,
  onDescriptionChange,
  onClose,
  onSave,
}: {
  open:
    boolean;

  name:
    string;

  description:
    string;

  saving:
    boolean;

  onNameChange: (
    value:
      string,
  ) => void;

  onDescriptionChange: (
    value:
      string,
  ) => void;

  onClose:
    () => void;

  onSave:
    () => void;
}) {
  if (
    !open
  ) {
    return null;
  }

  return (
    <ModalShell
      title="New space"
      subtitle="Create a shared workspace for files and folders."
      onClose={
        onClose
      }
    >
      <div className="space-y-4">
        <Field
          label="Space name"
          value={
            name
          }
          placeholder="Example: Quarterly Reports"
          onChange={
            onNameChange
          }
        />

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
              onDescriptionChange(
                event
                  .target
                  .value,
              )
            }
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
          />
        </div>

        <ModalActions
          saving={
            saving
          }
          saveLabel="Create space"
          disabled={
            !name.trim()
          }
          onClose={
            onClose
          }
          onSave={
            onSave
          }
        />
      </div>
    </ModalShell>
  );
}

function CreateFolderModal({
  open,
  value,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  open:
    boolean;

  value:
    string;

  saving:
    boolean;

  onChange: (
    value:
      string,
  ) => void;

  onClose:
    () => void;

  onSave:
    () => void;
}) {
  if (
    !open
  ) {
    return null;
  }

  return (
    <ModalShell
      title="New folder"
      subtitle="Create a folder in the current location."
      onClose={
        onClose
      }
    >
      <div className="space-y-4">
        <Field
          label="Folder name"
          value={
            value
          }
          placeholder="Folder name"
          onChange={
            onChange
          }
        />

        <ModalActions
          saving={
            saving
          }
          saveLabel="Create folder"
          disabled={
            !value.trim()
          }
          onClose={
            onClose
          }
          onSave={
            onSave
          }
        />
      </div>
    </ModalShell>
  );
}

function UploadModal({
  open,
  file,
  uploading,
  fileInputRef,
  onFileChange,
  onClose,
  onUpload,
}: {
  open:
    boolean;

  file:
    File | null;

  uploading:
    boolean;

  fileInputRef:
    React.RefObject<HTMLInputElement | null>;

  onFileChange: (
    event:
      ChangeEvent<HTMLInputElement>,
  ) => void;

  onClose:
    () => void;

  onUpload:
    () => void;
}) {
  if (
    !open
  ) {
    return null;
  }

  return (
    <ModalShell
      title="Upload document"
      subtitle="Upload a file to the current folder."
      onClose={
        onClose
      }
    >
      <button
        type="button"
        onClick={() =>
          fileInputRef.current?.click()
        }
        className="flex min-h-[130px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950/50 dark:hover:border-slate-600"
      >
        <Upload
          size={23}
          className="text-slate-400 dark:text-slate-500"
        />

        {file ? (
          <>
            <p className="mt-3 max-w-full truncate text-sm font-medium text-slate-700 dark:text-slate-200">
              {
                file.name
              }
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {formatFileSize(
                file.size,
              )}
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              Choose file
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Maximum 25 MB
            </p>
          </>
        )}
      </button>

      <input
        ref={
          fileInputRef
        }
        type="file"
        onChange={
          onFileChange
        }
        className="hidden"
      />

      <div className="mt-5">
        <ModalActions
          saving={
            uploading
          }
          saveLabel="Upload"
          disabled={
            !file
          }
          onClose={
            onClose
          }
          onSave={
            onUpload
          }
        />
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title:
    string;

  subtitle?:
    string;

  onClose:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-5 backdrop-blur-[2px] dark:bg-black/60">
      <button
        type="button"
        onClick={
          onClose
        }
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-[520px] rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {
                title
              }
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {
                  subtitle
                }
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X
              size={17}
            />
          </button>
        </div>

        <div className="p-6">
          {
            children
          }
        </div>
      </div>
    </div>
  );
}

function ModalActions({
  saving,
  saveLabel,
  disabled,
  onClose,
  onSave,
}: {
  saving:
    boolean;

  saveLabel:
    string;

  disabled?:
    boolean;

  onClose:
    () => void;

  onSave:
    () => void;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
      <button
        type="button"
        disabled={
          saving
        }
        onClick={
          onClose
        }
        className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        Cancel
      </button>

      <button
        type="button"
        disabled={
          saving ||
          disabled
        }
        onClick={
          onSave
        }
        className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        {saving
          ? 'Please wait...'
          : saveLabel}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label:
    string;

  value:
    string;

  placeholder?:
    string;

  onChange: (
    value:
      string,
  ) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {
          label
        }
      </label>

      <input
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(
          event,
        ) =>
          onChange(
            event
              .target
              .value,
          )
        }
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
      />
    </div>
  );
}

function EmptySpaces({
  onCreate,
}: {
  onCreate:
    () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
      <Folder
        size={34}
        className="mx-auto text-slate-300 dark:text-slate-700"
      />

      <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
        No spaces yet
      </p>

      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
        Create your first workspace.
      </p>

      <button
        type="button"
        onClick={
          onCreate
        }
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        <Plus
          size={15}
        />

        New space
      </button>
    </div>
  );
}

function ErrorMessage({
  message,
}: {
  message:
    string;
}) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
      {
        message
      }
    </div>
  );
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
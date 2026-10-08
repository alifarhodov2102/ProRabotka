'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Plus,
  Search,
} from 'lucide-react';

import AppShell from '@/components/app-shell';
import ConfirmModal from '@/components/ui/confirm-modal';
import SectionSpaces from '@/components/spaces/section-spaces';

import InfrastructureOverview from '@/components/infrastructure/infrastructure-overview';

import RoomTable, {
  InfrastructureItem,
} from '@/components/infrastructure/room-table';

import EquipmentTable from '@/components/infrastructure/equipment-table';

import InfrastructureModal from '@/components/infrastructure/infrastructure-modal';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

type ResidentOption = {
  id: string;
  companyName: string;
};

const emptyForm = {
  name: '',

  type: 'ROOM' as
    | 'ROOM'
    | 'EQUIPMENT',

  status: 'AVAILABLE',

  roomNumber: '',
  inventoryNo: '',
  location: '',

  quantity: '1',
  capacity: '',

  residentId: '',
  description: '',
};

export default function InfrastructurePage() {
  const [
    tab,
    setTab,
  ] = useState<
    | 'overview'
    | 'rooms'
    | 'equipment'
    | 'spaces'
  >('overview');

  const [
    items,
    setItems,
  ] = useState<
    InfrastructureItem[]
  >([]);

  const [
    residents,
    setResidents,
  ] = useState<
    ResidentOption[]
  >([]);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState<
    string | null
  >(null);

  const [
    form,
    setForm,
  ] = useState(
    emptyForm,
  );

  const [
    deleteItem,
    setDeleteItem,
  ] =
    useState<
      InfrastructureItem | null
    >(null);

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [
        infrastructure,
        residentsData,
      ] =
        await Promise.all([
          apiFetch<
            InfrastructureItem[]
          >(
            '/infrastructure',
          ),

          apiFetch<
            ResidentOption[]
          >(
            '/residents',
          ),
        ]);

      setItems(
        infrastructure,
      );

      setResidents(
        residentsData.map(
          (resident) => ({
            id:
              resident.id,

            companyName:
              resident.companyName,
          }),
        ),
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

  const rooms =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.type ===
            'ROOM',
        ),
      [items],
    );

  const equipment =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.type ===
            'EQUIPMENT',
        ),
      [items],
    );

  function matchesSearch(
    item: InfrastructureItem,
  ) {
    const q =
      search
        .trim()
        .toLowerCase();

    if (!q) {
      return true;
    }

    return [
      item.name,
      item.roomNumber,
      item.inventoryNo,
      item.location,
      item.resident
        ?.companyName,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value)
          .toLowerCase()
          .includes(q),
      );
  }

  function openCreate(
    type:
      | 'ROOM'
      | 'EQUIPMENT',
  ) {
    setEditingId(null);

    setForm({
      ...emptyForm,
      type,
    });

    setModalOpen(true);
  }

  function openEdit(
    item: InfrastructureItem,
  ) {
    setEditingId(
      item.id,
    );

    setForm({
      name:
        item.name,

      type:
        item.type,

      status:
        item.status,

      roomNumber:
        item.roomNumber ||
        '',

      inventoryNo:
        item.inventoryNo ||
        '',

      location:
        item.location ||
        '',

      quantity:
        String(
          item.quantity || 1,
        ),

      capacity:
        item.capacity != null
          ? String(
              item.capacity,
            )
          : '',

      residentId:
        item.residentId ||
        '',

      description:
        item.description ||
        '',
    });

    setModalOpen(true);
  }

  async function saveItem() {
    try {
      setSaving(true);
      setError('');

      const payload = {
        name:
          form.name,

        type:
          form.type,

        status:
          form.status,

        roomNumber:
          form.type ===
          'ROOM'
            ? form.roomNumber ||
              undefined
            : undefined,

        inventoryNo:
          form.type ===
          'EQUIPMENT'
            ? form.inventoryNo ||
              undefined
            : undefined,

        location:
          form.location ||
          undefined,

        quantity:
          form.type ===
          'EQUIPMENT'
            ? Number(
                form.quantity ||
                  1,
              )
            : 1,

        capacity:
          form.type ===
            'ROOM' &&
          form.capacity
            ? Number(
                form.capacity,
              )
            : undefined,

        residentId:
          form.residentId ||
          null,

        description:
          form.description ||
          undefined,
      };

      if (editingId) {
        await apiFetch(
          `/infrastructure/${editingId}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );
      } else {
        await apiFetch(
          '/infrastructure',
          {
            method:
              'POST',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );
      }

      setModalOpen(
        false,
      );

      setEditingId(
        null,
      );

      setForm({
        ...emptyForm,
      });

      await loadData();
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
      setSaving(false);
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
        `/infrastructure/${deleteItem.id}`,
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

  return (
    <AppShell>
      <div className="space-y-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Infrastructure
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage rooms,
              equipment and
              resident assignments.
            </p>
          </div>

          {tab !==
            'spaces' && (
            <button
              type="button"
              onClick={() =>
                openCreate(
                  tab ===
                    'equipment'
                    ? 'EQUIPMENT'
                    : 'ROOM',
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              <Plus
                size={16}
              />

              {tab ===
              'equipment'
                ? 'Add equipment'
                : 'Add room'}
            </button>
          )}
        </section>

        <section className="overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          <div className="flex min-w-max gap-6">
            {[
              [
                'overview',
                'Overview',
              ],

              [
                'rooms',
                'Rooms',
              ],

              [
                'equipment',
                'Equipment',
              ],

              [
                'spaces',
                'Spaces',
              ],
            ].map(
              ([
                key,
                label,
              ]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setTab(
                      key as typeof tab,
                    )
                  }
                  className={[
                    'border-b-2 px-1 pb-3 text-sm transition',

                    tab === key
                      ? 'border-slate-900 font-medium text-slate-900 dark:border-slate-100 dark:text-slate-100'
                      : 'border-transparent text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300',
                  ].join(
                    ' ',
                  )}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">
            Loading infrastructure...
          </div>
        ) : (
          <>
            {tab ===
              'overview' && (
              <InfrastructureOverview
                items={
                  items
                }
              />
            )}

            {(tab ===
              'rooms' ||
              tab ===
                'equipment') && (
              <div className="space-y-4">
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
                    placeholder={
                      tab ===
                      'rooms'
                        ? 'Search rooms...'
                        : 'Search equipment...'
                    }
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                  />
                </div>

                {tab ===
                'rooms' ? (
                  <RoomTable
                    rooms={rooms.filter(
                      matchesSearch,
                    )}
                    onEdit={
                      openEdit
                    }
                    onDelete={
                      setDeleteItem
                    }
                  />
                ) : (
                  <EquipmentTable
                    equipment={equipment.filter(
                      matchesSearch,
                    )}
                    onEdit={
                      openEdit
                    }
                    onDelete={
                      setDeleteItem
                    }
                  />
                )}
              </div>
            )}

            {tab ===
              'spaces' && (
              <SectionSpaces section="INFRASTRUCTURE" />
            )}
          </>
        )}

        <InfrastructureModal
          open={
            modalOpen
          }
          title={
            editingId
              ? 'Edit infrastructure'
              : form.type ===
                  'ROOM'
                ? 'Add room'
                : 'Add equipment'
          }
          value={form}
          residents={
            residents
          }
          saving={
            saving
          }
          onChange={
            setForm
          }
          onClose={() => {
            if (!saving) {
              setModalOpen(
                false,
              );

              setEditingId(
                null,
              );
            }
          }}
          onSave={
            saveItem
          }
        />

        <ConfirmModal
          open={
            deleteItem !==
            null
          }
          variant="delete"
          loading={
            deleteLoading
          }
          title="Delete item?"
          description={`${
            deleteItem?.name ??
            ''
          } will be permanently deleted. This action cannot be undone.`}
          confirmText="Delete"
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
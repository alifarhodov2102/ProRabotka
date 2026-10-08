'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Check,
  Clock3,
  KeyRound,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  UserX,
  X,
} from 'lucide-react';

import AppShell from '@/components/app-shell';
import ConfirmModal from '@/components/ui/confirm-modal';

import TeamMemberModal, {
  TeamMemberForm,
} from '@/components/team/team-member-modal';

import PasswordModal from '@/components/team/password-modal';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

type TeamMember = {
  id: string;
  name: string;
  surname?: string | null;
  email: string;

  role?: string | null;
  position?: string | null;

  approvalStatus:
    ApprovalStatus;

  isActive: boolean;

  createdAt: string;
  updatedAt?: string;
};

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;

  role?: string | null;
  position?: string | null;

  isSuperAdmin?: boolean;
};

const emptyForm: TeamMemberForm = {
  name: '',
  email: '',
  position: '',
  password: '',
};

export default function TeamPage() {
  const [
    members,
    setMembers,
  ] = useState<TeamMember[]>(
    [],
  );

  const [
    pendingMembers,
    setPendingMembers,
  ] = useState<TeamMember[]>(
    [],
  );

  const [
    currentUser,
    setCurrentUser,
  ] = useState<StoredUser | null>(
    null,
  );

  const [search, setSearch] =
    useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    pendingLoading,
    setPendingLoading,
  ] = useState(false);

  const [error, setError] =
    useState('');

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingMember,
    setEditingMember,
  ] =
    useState<TeamMember | null>(
      null,
    );

  const [form, setForm] =
    useState<TeamMemberForm>(
      emptyForm,
    );

  const [saving, setSaving] =
    useState(false);

  const [
    deactivateMember,
    setDeactivateMember,
  ] =
    useState<TeamMember | null>(
      null,
    );

  const [
    deactivateLoading,
    setDeactivateLoading,
  ] = useState(false);

  const [
    passwordMember,
    setPasswordMember,
  ] =
    useState<TeamMember | null>(
      null,
    );

  const [
    passwordSaving,
    setPasswordSaving,
  ] = useState(false);

  const [
    rejectMember,
    setRejectMember,
  ] =
    useState<TeamMember | null>(
      null,
    );

  const [
    rejectLoading,
    setRejectLoading,
  ] = useState(false);

  const [
    approvingId,
    setApprovingId,
  ] =
    useState<string | null>(
      null,
    );

  const isSuperAdmin =
    currentUser?.isSuperAdmin ===
    true;

  useEffect(() => {
    const stored =
      localStorage.getItem(
        'prorabotka_user',
      );

    if (!stored) {
      return;
    }

    try {
      setCurrentUser(
        JSON.parse(stored),
      );
    } catch {
      localStorage.removeItem(
        'prorabotka_user',
      );
    }
  }, []);

  async function loadMembers() {
    try {
      setLoading(true);
      setError('');

      const data =
        await apiFetch<
          TeamMember[]
        >(
          '/users?includeInactive=true',
        );

      setMembers(data);
    } catch (err) {
      if (
        err instanceof ApiError &&
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

  async function loadPending() {
    if (!isSuperAdmin) {
      setPendingMembers(
        [],
      );

      return;
    }

    try {
      setPendingLoading(true);

      const data =
        await apiFetch<
          TeamMember[]
        >('/users/pending');

      setPendingMembers(
        data,
      );
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status !== 401
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setPendingLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadPending();
    }
  }, [currentUser]);

  const filtered =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      if (!q) {
        return members;
      }

      return members.filter(
        (member) =>
          [
            member.name,
            member.surname,
            member.email,
            member.role,
            member.position,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(q),
            ),
      );
    }, [
      members,
      search,
    ]);

  const activeCount =
    members.filter(
      (member) =>
        member.isActive,
    ).length;

  function openCreate() {
    setEditingMember(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(
    member: TeamMember,
  ) {
    setEditingMember(
      member,
    );

    setForm({
      name: member.name,
      email: member.email,

      position:
        member.position ||
        member.role ||
        '',

      password: '',
    });

    setModalOpen(true);
  }

  async function saveMember() {
    try {
      setSaving(true);
      setError('');

      if (editingMember) {
        await apiFetch(
          `/users/${editingMember.id}`,
          {
            method: 'PATCH',

            body:
              JSON.stringify({
                name:
                  form.name.trim(),

                email:
                  form.email
                    .trim()
                    .toLowerCase(),

                position:
                  form.position
                    .trim() ||
                  undefined,

                role:
                  form.position
                    .trim() ||
                  undefined,
              }),
          },
        );
      } else {
        await apiFetch(
          '/users',
          {
            method: 'POST',

            body:
              JSON.stringify({
                name:
                  form.name.trim(),

                email:
                  form.email
                    .trim()
                    .toLowerCase(),

                position:
                  form.position
                    .trim() ||
                  undefined,

                role:
                  form.position
                    .trim() ||
                  undefined,

                password:
                  form.password,
              }),
          },
        );
      }

      setModalOpen(false);

      setEditingMember(
        null,
      );

      setForm(
        emptyForm,
      );

      await loadMembers();
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function approveMember(
    member: TeamMember,
  ) {
    try {
      setApprovingId(
        member.id,
      );

      setError('');

      await apiFetch(
        `/users/${member.id}/approve`,
        {
          method: 'POST',
        },
      );

      await Promise.all([
        loadMembers(),
        loadPending(),
      ]);
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setApprovingId(
        null,
      );
    }
  }

  async function handleReject() {
    if (!rejectMember) {
      return;
    }

    try {
      setRejectLoading(
        true,
      );

      setError('');

      await apiFetch(
        `/users/${rejectMember.id}/reject`,
        {
          method: 'POST',
        },
      );

      setRejectMember(
        null,
      );

      await Promise.all([
        loadMembers(),
        loadPending(),
      ]);
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setRejectLoading(
        false,
      );
    }
  }

  async function handleDeactivate() {
    if (
      !deactivateMember
    ) {
      return;
    }

    try {
      setDeactivateLoading(
        true,
      );

      setError('');

      await apiFetch(
        `/users/${deactivateMember.id}/deactivate`,
        {
          method: 'POST',
        },
      );

      setDeactivateMember(
        null,
      );

      await loadMembers();
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setDeactivateLoading(
        false,
      );
    }
  }

  async function reactivate(
    member: TeamMember,
  ) {
    try {
      setError('');

      await apiFetch(
        `/users/${member.id}/reactivate`,
        {
          method: 'POST',
        },
      );

      await loadMembers();
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    }
  }

  async function resetPassword(
    password: string,
  ) {
    if (
      !passwordMember
    ) {
      return;
    }

    try {
      setPasswordSaving(
        true,
      );

      setError('');

      await apiFetch(
        `/users/${passwordMember.id}/reset-password`,
        {
          method: 'POST',

          body:
            JSON.stringify({
              password,
            }),
        },
      );

      setPasswordMember(
        null,
      );
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setPasswordSaving(
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

            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Team
              </h1>

              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  <ShieldCheck
                    size={12}
                  />
                  Admin
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage people who can
              access ProRabotka and
              receive tasks.
            </p>
          </div>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={
                openCreate
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              <Plus
                size={16}
              />

              Add member
            </button>
          )}
        </section>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {isSuperAdmin && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Clock3
                    size={17}
                    className="text-amber-600 dark:text-amber-400"
                  />

                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Pending requests
                  </h2>

                  {pendingMembers.length >
                    0 && (
                    <span className="flex min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      {
                        pendingMembers.length
                      }
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  New accounts waiting
                  for your approval.
                </p>
              </div>
            </div>

            {pendingLoading ? (
              <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                Loading requests...
              </div>
            ) : pendingMembers.length ===
              0 ? (
              <div className="py-10 text-center">
                <Check
                  size={21}
                  className="mx-auto text-emerald-500"
                />

                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  No pending requests
                </p>

                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  New registrations
                  will appear here.
                </p>
              </div>
            ) : (
              <div>
                {pendingMembers.map(
                  (
                    member,
                    index,
                  ) => (
                    <div
                      key={
                        member.id
                      }
                      className={[
                        'flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center',
                        index !==
                        pendingMembers.length -
                          1
                          ? 'border-b border-slate-100 dark:border-slate-800'
                          : '',
                      ].join(
                        ' ',
                      )}
                    >
                      <Avatar
                        name={
                          member.name
                        }
                        inactive={
                          false
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                            {
                              member.name
                            }
                          </p>

                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            PENDING
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                          {
                            member.email
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          Registered{' '}
                          {formatDate(
                            member.createdAt,
                          )}
                        </p>
                      </div>

                      <div className="sm:w-[220px]">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Role
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-700 dark:text-slate-300">
                          {member.role ||
                            member.position ||
                            '—'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          disabled={
                            approvingId ===
                            member.id
                          }
                          onClick={() =>
                            approveMember(
                              member,
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                          <Check
                            size={14}
                          />

                          {approvingId ===
                          member.id
                            ? 'Approving...'
                            : 'Approve'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setRejectMember(
                              member,
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        >
                          <X
                            size={14}
                          />

                          Reject
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryCard
            label="Team members"
            value={
              members.length
            }
            note="Approved accounts"
          />

          <SummaryCard
            label="Active"
            value={
              activeCount
            }
            note="Can sign in and receive tasks"
          />
        </section>

        <div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition-colors dark:border-slate-800 dark:bg-slate-900">
          <Search
            size={16}
            className="text-slate-400 dark:text-slate-500"
          />

          <input
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target
                  .value,
              )
            }
            placeholder="Search team..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-500">
            Loading team...
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {filtered.length ===
            0 ? (
              <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                Team members not found.
              </div>
            ) : (
              filtered.map(
                (
                  member,
                  index,
                ) => {
                  const isCurrentSuperAdmin =
                    currentUser?.email
                      ?.trim()
                      .toLowerCase() ===
                    member.email
                      .trim()
                      .toLowerCase() &&
                    isSuperAdmin;

                  return (
                    <div
                      key={
                        member.id
                      }
                      className={[
                        'flex flex-col gap-4 px-5 py-4 transition-colors sm:flex-row sm:items-center',

                        index !==
                        filtered.length -
                          1
                          ? 'border-b border-slate-100 dark:border-slate-800'
                          : '',

                        !member.isActive
                          ? 'bg-slate-50/80 dark:bg-slate-950/40'
                          : '',
                      ].join(
                        ' ',
                      )}
                    >
                      <Avatar
                        name={
                          member.name
                        }
                        inactive={
                          !member.isActive
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                            {
                              member.name
                            }
                          </p>

                          <StatusBadge
                            active={
                              member.isActive
                            }
                          />

                          {isCurrentSuperAdmin && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                              <ShieldCheck
                                size={10}
                              />

                              SUPER ADMIN
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                          {
                            member.email
                          }
                        </p>
                      </div>

                      <div className="sm:w-[220px]">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Role
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-700 dark:text-slate-300">
                          {member.role ||
                            member.position ||
                            '—'}
                        </p>
                      </div>

                      {isSuperAdmin && (
                        <div className="flex items-center gap-1 self-end sm:self-auto">
                          {!isCurrentSuperAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    member,
                                  )
                                }
                                title="Edit"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              >
                                <Pencil
                                  size={
                                    15
                                  }
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setPasswordMember(
                                    member,
                                  )
                                }
                                title="Reset password"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              >
                                <KeyRound
                                  size={
                                    15
                                  }
                                />
                              </button>

                              {member.isActive ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeactivateMember(
                                      member,
                                    )
                                  }
                                  title="Deactivate"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                >
                                  <UserX
                                    size={
                                      15
                                    }
                                  />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    reactivate(
                                      member,
                                    )
                                  }
                                  title="Reactivate"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-500 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                                >
                                  <RotateCcw
                                    size={
                                      15
                                    }
                                  />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                },
              )
            )}
          </div>
        )}

        <TeamMemberModal
          open={modalOpen}
          editing={
            editingMember !==
            null
          }
          value={form}
          saving={saving}
          onChange={
            setForm
          }
          onClose={() => {
            if (!saving) {
              setModalOpen(
                false,
              );

              setEditingMember(
                null,
              );
            }
          }}
          onSave={
            saveMember
          }
        />

        <PasswordModal
          key={
            passwordMember
              ?.id ||
            'closed'
          }
          open={
            passwordMember !==
            null
          }
          memberName={
            passwordMember
              ?.name || ''
          }
          saving={
            passwordSaving
          }
          onClose={() => {
            if (
              !passwordSaving
            ) {
              setPasswordMember(
                null,
              );
            }
          }}
          onSave={
            resetPassword
          }
        />

        <ConfirmModal
          open={
            rejectMember !==
            null
          }
          variant="archive"
          loading={
            rejectLoading
          }
          title="Reject registration?"
          description={`${
            rejectMember?.name ||
            ''
          } will not be able to sign in with this registration.`}
          confirmText="Reject"
          onClose={() => {
            if (
              !rejectLoading
            ) {
              setRejectMember(
                null,
              );
            }
          }}
          onConfirm={
            handleReject
          }
        />

        <ConfirmModal
          open={
            deactivateMember !==
            null
          }
          variant="archive"
          loading={
            deactivateLoading
          }
          title="Deactivate member?"
          description={`${
            deactivateMember
              ?.name || ''
          } will no longer be able to sign in or receive new task assignments.`}
          confirmText="Deactivate"
          onClose={() => {
            if (
              !deactivateLoading
            ) {
              setDeactivateMember(
                null,
              );
            }
          }}
          onConfirm={
            handleDeactivate
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

      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>

      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        {note}
      </p>
    </div>
  );
}

function Avatar({
  name,
  inactive,
}: {
  name: string;
  inactive: boolean;
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part
        .charAt(0)
        .toUpperCase(),
    )
    .join('');

  return (
    <div
      className={[
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold',

        inactive
          ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
          : 'bg-slate-900 text-white dark:bg-slate-700 dark:text-slate-100',
      ].join(' ')}
    >
      {initials || (
        <UserRound
          size={17}
        />
      )}
    </div>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={[
        'rounded-full px-2 py-0.5 text-[10px] font-semibold',

        active
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
      ].join(' ')}
    >
      {active
        ? 'ACTIVE'
        : 'INACTIVE'}
    </span>
  );
}

function formatDate(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}
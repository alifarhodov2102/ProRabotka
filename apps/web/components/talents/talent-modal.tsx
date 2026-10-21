'use client';

import {
  useEffect,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import {
  X,
} from 'lucide-react';

import {
  LanguageLevel,
  Talent,
  TalentFormValues,
  TalentStatus,
} from './types';

const emptyForm:
  TalentFormValues = {
  fullName: '',
  position: '',

  phone: '',
  email: '',
  telegram: '',

  location: '',
  currentCompany: '',

  experienceYears: '',

  salaryExpectation: '',
  salaryCurrency: 'USD',

  status: 'AVAILABLE',

  notes: '',

  englishLevel: '',
  russianLevel: '',
  uzbekLevel: '',
};

export default function TalentModal({
  open,
  saving,
  talent,
  onClose,
  onSubmit,
}: {
  open: boolean;

  saving: boolean;

  talent?:
    | Talent
    | null;

  onClose:
    () => void;

  onSubmit: (
    values:
      TalentFormValues,
  ) =>
    | void
    | Promise<void>;
}) {
  const [
    form,
    setForm,
  ] =
    useState<TalentFormValues>(
      emptyForm,
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!talent) {
      setForm(
        emptyForm,
      );

      return;
    }

    setForm({
      fullName:
        talent.fullName ||
        '',

      position:
        talent.position ||
        '',

      phone:
        talent.phone ||
        '',

      email:
        talent.email ||
        '',

      telegram:
        talent.telegram ||
        '',

      location:
        talent.location ||
        '',

      currentCompany:
        talent.currentCompany ||
        '',

      experienceYears:
        talent.experienceYears !==
          null &&
        talent.experienceYears !==
          undefined
          ? String(
              talent.experienceYears,
            )
          : '',

      salaryExpectation:
        talent.salaryExpectation !==
          null &&
        talent.salaryExpectation !==
          undefined
          ? String(
              talent.salaryExpectation,
            )
          : '',

      salaryCurrency:
        talent.salaryCurrency ||
        'USD',

      status:
        talent.status,

      notes:
        talent.notes ||
        '',

      englishLevel:
        findLanguage(
          talent,
          'English',
        ),

      russianLevel:
        findLanguage(
          talent,
          'Russian',
        ),

      uzbekLevel:
        findLanguage(
          talent,
          'Uzbek',
        ),
    });
  }, [
    open,
    talent,
  ]);

  if (!open) {
    return null;
  }

  function update<
    K extends keyof TalentFormValues,
  >(
    key: K,

    value:
      TalentFormValues[K],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [key]:
          value,
      }),
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center overflow-x-hidden bg-slate-950/40 backdrop-blur-[2px] dark:bg-black/70 sm:items-center sm:p-5">
      <button
        type="button"
        className="absolute inset-0"
        onClick={() => {
          if (!saving) {
            onClose();
          }
        }}
        aria-label="Close"
      />

      <div className="relative z-10 flex max-h-[calc(100dvh-8px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-slate-900 sm:max-h-[calc(100dvh-40px)] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {talent
                ? 'Edit talent'
                : 'Add talent'}
            </h2>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {talent
                ? 'Update candidate information.'
                : 'Add a candidate to the internal talent pool.'}
            </p>
          </div>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X
              size={18}
            />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          <SectionTitle>
            Basic information
          </SectionTitle>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              required
            >
              <input
                value={
                  form.fullName
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'fullName',
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Ali Karimov"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Position">
              <input
                value={
                  form.position
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'position',
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Frontend Developer"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Location">
              <input
                value={
                  form.location
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'location',
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Gulistan"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Current company">
              <input
                value={
                  form.currentCompany
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'currentCompany',
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Company name"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Experience">
              <div className="relative">
                <input
                  inputMode="numeric"
                  value={
                    form.experienceYears
                  }
                  onChange={(
                    event,
                  ) =>
                    update(
                      'experienceYears',
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="3"
                  className={`${inputClass} pr-16`}
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  years
                </span>
              </div>
            </Field>

            <Field label="Status">
              <select
                value={
                  form.status
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'status',
                    event
                      .target
                      .value as TalentStatus,
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="AVAILABLE">
                  Available
                </option>

                <option value="OPEN_TO_OFFERS">
                  Open to offers
                </option>

                <option value="EMPLOYED">
                  Employed
                </option>

                <option value="NOT_AVAILABLE">
                  Not available
                </option>
              </select>
            </Field>
          </div>

          <SectionTitle>
            Contact
          </SectionTitle>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone">
              <input
                value={
                  form.phone
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'phone',
                    event
                      .target
                      .value,
                  )
                }
                placeholder="+998..."
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={
                  form.email
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'email',
                    event
                      .target
                      .value,
                  )
                }
                placeholder="name@email.com"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Telegram">
              <input
                value={
                  form.telegram
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'telegram',
                    event
                      .target
                      .value,
                  )
                }
                placeholder="@username"
                className={
                  inputClass
                }
              />
            </Field>
          </div>

          <SectionTitle>
            Languages
          </SectionTitle>

          <div className="grid gap-4 sm:grid-cols-3">
            <LanguageField
              label="English"
              value={
                form.englishLevel
              }
              onChange={(
                value,
              ) =>
                update(
                  'englishLevel',
                  value,
                )
              }
            />

            <LanguageField
              label="Russian"
              value={
                form.russianLevel
              }
              onChange={(
                value,
              ) =>
                update(
                  'russianLevel',
                  value,
                )
              }
            />

            <LanguageField
              label="Uzbek"
              value={
                form.uzbekLevel
              }
              onChange={(
                value,
              ) =>
                update(
                  'uzbekLevel',
                  value,
                )
              }
            />
          </div>

          <SectionTitle>
            Salary
          </SectionTitle>

          <div className="grid grid-cols-[1fr_120px] gap-3">
            <Field label="Salary expectation">
              <input
                inputMode="decimal"
                value={
                  form.salaryExpectation
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'salaryExpectation',
                    event
                      .target
                      .value,
                  )
                }
                placeholder="1500"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Currency">
              <input
                value={
                  form.salaryCurrency
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'salaryCurrency',
                    event
                      .target
                      .value
                      .toUpperCase(),
                  )
                }
                placeholder="USD"
                className={
                  inputClass
                }
              />
            </Field>
          </div>

          <SectionTitle>
            Notes
          </SectionTitle>

          <Field label="Internal notes">
            <textarea
              rows={4}
              value={
                form.notes
              }
              onChange={(
                event,
              ) =>
                update(
                  'notes',
                  event
                    .target
                    .value,
                )
              }
              placeholder="Additional information about the candidate..."
              className={`${inputClass} h-auto min-h-[110px] resize-none py-3`}
            />
          </Field>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 bg-white p-4 pb-[max(16px,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-900 sm:flex sm:justify-end sm:px-6">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:h-10 sm:rounded-lg"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              saving ||
              !form.fullName.trim()
            }
            onClick={() =>
              void onSubmit(
                form,
              )
            }
            className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 sm:h-10 sm:rounded-lg"
          >
            {saving
              ? 'Saving...'
              : talent
                ? 'Save changes'
                : 'Add talent'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;

  required?: boolean;

  children:
    ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function SectionTitle({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 dark:border-slate-800 dark:text-slate-500">
      {children}
    </div>
  );
}

function LanguageField({
  label,
  value,
  onChange,
}: {
  label: string;

  value:
    | ''
    | LanguageLevel;

  onChange: (
    value:
      | ''
      | LanguageLevel,
  ) => void;
}) {
  return (
    <Field
      label={
        label
      }
    >
      <select
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event
              .target
              .value as
              | ''
              | LanguageLevel,
          )
        }
        className={
          inputClass
        }
      >
        <option value="">
          Not specified
        </option>

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
    </Field>
  );
}

function findLanguage(
  talent: Talent,

  language: string,
):
  | ''
  | LanguageLevel {
  const item =
    talent.languages.find(
      (
        current,
      ) =>
        current.language.toLowerCase() ===
        language.toLowerCase(),
    );

  return item?.level ||
    '';
}

const inputClass =
  'h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-[16px] text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800 sm:text-sm';
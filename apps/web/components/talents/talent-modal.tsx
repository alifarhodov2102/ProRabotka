'use client';

import {
  useEffect,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import {
  ChevronDown,
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
  phone: '',
  email: '',
  telegram: '',
  location: '',
  experienceYears: '',
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

      experienceYears:
        talent.experienceYears !==
          null &&
        talent.experienceYears !==
          undefined
          ? String(
              talent.experienceYears,
            )
          : '',

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

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, [open]);

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

      <div className="relative z-10 flex max-h-[calc(100dvh-8px)] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-slate-900 sm:max-h-[calc(100dvh-40px)] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {talent
                ? 'Edit talent'
                : 'Add talent'}
            </h2>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {talent
                ? 'Update the candidate details.'
                : 'Add the key details now. CV can be uploaded from the list.'}
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X
              size={18}
            />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="space-y-5">
            <Field
              label="Full name"
              required
            >
              <input
                autoFocus
                value={
                  form.fullName
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'fullName',
                    event.target.value,
                  )
                }
                placeholder="Ali Karimov"
                className={
                  inputClass
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <input
                  type="tel"
                  value={
                    form.phone
                  }
                  onChange={(
                    event,
                  ) =>
                    update(
                      'phone',
                      event.target.value,
                    )
                  }
                  placeholder="+998..."
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
                      event.target.value,
                    )
                  }
                  placeholder="@username"
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
                      event.target.value,
                    )
                  }
                  placeholder="Gulistan"
                  className={
                    inputClass
                  }
                />
              </Field>
              <Field label="Status">
                <SelectWrap>
                  <select
                    value={
                      form.status
                    }
                    onChange={(
                      event,
                    ) =>
                      update(
                        'status',
                        event.target.value as TalentStatus,
                      )
                    }
                    className={`${inputClass} appearance-none pr-10`}
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
                </SelectWrap>
              </Field>
            </div>

            <div>
              <div className="mb-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Languages
                </p>

                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  Leave a language empty if it is not needed.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
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


              </div>
            </div>

            <Field label="Notes">
              <textarea
                rows={3}
                value={
                  form.notes
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'notes',
                    event.target.value,
                  )
                }
                placeholder="Optional note..."
                className={`${inputClass} h-auto min-h-[90px] resize-none py-3`}
              />
            </Field>
          </div>
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
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:h-10 sm:rounded-lg"
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
            className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white sm:h-10 sm:rounded-lg"
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

function SelectWrap({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <div className="relative">
      {children}

      <ChevronDown
        size={16}
        strokeWidth={1.8}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />
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
    <Field label={label}>
      <SelectWrap>
        <select
          value={
            value
          }
          onChange={(
            event,
          ) =>
            onChange(
              event.target.value as
                | ''
                | LanguageLevel,
            )
          }
          className={`${inputClass} appearance-none pr-10`}
        >
          <option value="">
            —
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
      </SelectWrap>
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
  'h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-800 sm:text-sm';

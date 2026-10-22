'use client';

import {
  ArrowUpRight,
  Check,
  Copy,
  Languages,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';

import {
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  apiUrl,
} from '@/lib/api';

import {
  Talent,
} from './types';

export default function TalentCard({
  talent,
}: {
  talent: Talent;
}) {
  const router =
    useRouter();

  const [
    copied,
    setCopied,
  ] =
    useState<
      | 'phone'
      | 'telegram'
      | null
    >(null);

  const initials =
    talent.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (
          part,
        ) =>
          part
            .charAt(0)
            .toUpperCase(),
      )
      .join('');

  const photoSrc =
    talent.photoUrl
      ? talent.photoUrl.startsWith(
          'http://',
        ) ||
        talent.photoUrl.startsWith(
          'https://',
        )
        ? talent.photoUrl
        : apiUrl(
            talent.photoUrl,
          )
      : null;

  async function copyValue(
    type:
      | 'phone'
      | 'telegram',

    value: string,
  ) {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setCopied(
        type,
      );

      window.setTimeout(
        () => {
          setCopied(
            (
              current,
            ) =>
              current ===
              type
                ? null
                : current,
          );
        },
        1200,
      );
    } catch {
      setCopied(
        null,
      );
    }
  }

  function openTalent() {
    router.push(
      `/talents/${talent.id}`,
    );
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={
        openTalent
      }
      onKeyDown={(
        event,
      ) => {
        if (
          event.key ===
            'Enter' ||
          event.key ===
            ' '
        ) {
          event.preventDefault();
          openTalent();
        }
      }}
      className="group flex min-h-[310px] min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-slate-300 active:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:focus-visible:ring-slate-700"
    >
      <div className="relative flex min-h-[150px] items-center justify-center border-b border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/40">
        {photoSrc ? (
          <img
            src={
              photoSrc
            }
            alt={
              talent.fullName
            }
            className="h-24 w-24 rounded-2xl object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-900 text-xl font-semibold text-white shadow-sm dark:bg-slate-700">
            {initials ||
              'T'}
          </div>
        )}

        <span
          className={[
            'absolute right-3 top-3 rounded-lg px-2 py-1 text-[10px] font-semibold',

            talent.status ===
            'AVAILABLE'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              : '',

            talent.status ===
            'OPEN_TO_OFFERS'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
              : '',

            talent.status ===
            'EMPLOYED'
              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              : '',

            talent.status ===
            'NOT_AVAILABLE'
              ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
              : '',
          ].join(' ')}
        >
          {humanize(
            talent.status,
          )}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              {
                talent.fullName
              }
            </h2>

            {talent.location && (
              <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin
                  size={12}
                  className="shrink-0"
                />

                <span className="truncate">
                  {
                    talent.location
                  }
                </span>
              </div>
            )}
          </div>

          <ArrowUpRight
            size={16}
            className="mt-0.5 shrink-0 text-slate-300 transition group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-300"
          />
        </div>

        <div className="mt-4 space-y-2">
          {talent.phone && (
            <CopyRow
              icon={
                <Phone
                  size={13}
                />
              }
              value={
                talent.phone
              }
              copied={
                copied ===
                'phone'
              }
              onCopy={() =>
                void copyValue(
                  'phone',
                  talent.phone!,
                )
              }
            />
          )}

          {talent.telegram && (
            <CopyRow
              icon={
                <Send
                  size={13}
                />
              }
              value={
                talent.telegram
              }
              copied={
                copied ===
                'telegram'
              }
              onCopy={() =>
                void copyValue(
                  'telegram',
                  talent.telegram!,
                )
              }
            />
          )}

          {talent.languages.length >
            0 && (
            <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Languages
                size={13}
                className="shrink-0"
              />

              <span className="truncate">
                {talent.languages
                  .slice(
                    0,
                    3,
                  )
                  .map(
                    (
                      item,
                    ) =>
                      `${item.language} ${shortLevel(
                        item.level,
                      )}`,
                  )
                  .join(
                    ' · ',
                  )}
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4">
          {talent.experienceYears !==
            null &&
            talent.experienceYears !==
              undefined && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {
                  talent.experienceYears ===
                  0
                    ? 'No experience'
                    : `${talent.experienceYears} ${
                        talent.experienceYears ===
                        1
                          ? 'year'
                          : 'years'
                      } experience`
                }
              </span>
            )}
        </div>
      </div>
    </article>
  );
}

function CopyRow({
  icon,
  value,
  copied,
  onCopy,
}: {
  icon:
    React.ReactNode;

  value: string;

  copied: boolean;

  onCopy:
    () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <span className="shrink-0">
        {icon}
      </span>

      <span className="min-w-0 flex-1 truncate">
        {value}
      </span>

      <button
        type="button"
        onClick={(
          event,
        ) => {
          event.stopPropagation();
          onCopy();
        }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        title={
          copied
            ? 'Copied'
            : 'Copy'
        }
        aria-label={
          copied
            ? 'Copied'
            : `Copy ${value}`
        }
      >
        {copied ? (
          <Check
            size={13}
          />
        ) : (
          <Copy
            size={13}
          />
        )}
      </button>
    </div>
  );
}

function humanize(
  value: string,
) {
  return value
    .toLowerCase()
    .split('_')
    .map(
      (
        word,
      ) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(' ');
}

function shortLevel(
  level: string,
) {
  switch (level) {
    case 'BASIC':
      return 'Basic';

    case 'INTERMEDIATE':
      return 'Int.';

    case 'ADVANCED':
      return 'Adv.';

    case 'FLUENT':
      return 'Fluent';

    case 'NATIVE':
      return 'Native';

    default:
      return level;
  }
}

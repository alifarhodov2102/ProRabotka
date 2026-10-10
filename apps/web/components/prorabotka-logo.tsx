'use client';

import Image from 'next/image';

export default function ProRabotkaLogo({
  compact = false,
  className = '',
}: {
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div
        className={[
          'flex min-w-0 items-center overflow-hidden',
          className,
        ].join(' ')}
      >
        <Image
          src="/brand/prorabotka-dark.png"
          alt="ProRabotka"
          width={180}
          height={60}
          priority
          className="h-8 w-auto max-w-full object-contain object-left dark:hidden"
        />

        <Image
          src="/brand/prorabotka-light.png"
          alt="ProRabotka"
          width={180}
          height={60}
          priority
          className="hidden h-8 w-auto max-w-full object-contain object-left dark:block"
        />
      </div>
    );
  }

  return (
    <div
      className={[
        'flex min-w-0 items-center overflow-hidden',
        className,
      ].join(' ')}
    >
      <Image
        src="/brand/prorabotka-dark.png"
        alt="ProRabotka"
        width={220}
        height={74}
        priority
        className="h-auto w-full max-w-full object-contain object-left dark:hidden"
      />

      <Image
        src="/brand/prorabotka-light.png"
        alt="ProRabotka"
        width={220}
        height={74}
        priority
        className="hidden h-auto w-full max-w-full object-contain object-left dark:block"
      />
    </div>
  );
}
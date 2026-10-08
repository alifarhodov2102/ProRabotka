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
          'flex items-center',
          className,
        ].join(' ')}
      >
        <Image
          src="/brand/prorabotka-dark.png"
          alt="ProRabotka"
          width={44}
          height={44}
          priority
          className="h-9 w-auto object-contain dark:hidden"
        />

        <Image
          src="/brand/prorabotka-light.png"
          alt="ProRabotka"
          width={44}
          height={44}
          priority
          className="hidden h-9 w-auto object-contain dark:block"
        />
      </div>
    );
  }

  return (
    <div
      className={[
        'flex items-center',
        className,
      ].join(' ')}
    >
      <Image
        src="/brand/prorabotka-dark.png"
        alt="ProRabotka"
        width={220}
        height={74}
        priority
        className="h-auto w-full object-contain object-left dark:hidden"
      />

      <Image
        src="/brand/prorabotka-light.png"
        alt="ProRabotka"
        width={220}
        height={74}
        priority
        className="hidden h-auto w-full object-contain object-left dark:block"
      />
    </div>
  );
}
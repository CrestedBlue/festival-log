const STAR_PATH =
  'M0 -18 L4.47 -6.15 L17.12 -5.56 L7.23 2.35 L10.58 14.56 L0 7.6 L-10.58 14.56 L-7.23 2.35 L-17.12 -5.56 L-4.47 -6.15 Z'

/** 두두페 wristband mark. The star follows the text color, so it reads on both themes. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle
        cx="60"
        cy="62"
        r="38"
        fill="none"
        stroke="#ff4d2e"
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray="196 43"
        transform="rotate(-48 60 62)"
      />
      <rect x="55" y="9" width="22" height="31" rx="6" fill="#c6f432" transform="rotate(10 66 24.5)" />
      <path
        d={STAR_PATH}
        transform="translate(60 64)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

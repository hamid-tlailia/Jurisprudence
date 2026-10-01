import { useId } from "react";

/** شعار الرواق: كتاب مفتوح تعلوه نجمة ثمانية */
export function Logo({ size = 42 }: { size?: number }) {
  // معرّف فريد لكل نسخة حتى لا يتعطل التدرج إذا أُخفيت نسخة أخرى
  const gid = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden role="img">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f5e4b" />
          <stop offset="1" stopColor="#2f6e57" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="17" fill={`url(#${gid})`} />
      <path d="M32 9.5l2.6 4.3 4.9-1.1-1.1 4.9 4.3 2.6-4.3 2.6 1.1 4.9-4.9-1.1L32 30.9l-2.6-4.3-4.9 1.1 1.1-4.9-4.3-2.6 4.3-2.6-1.1-4.9 4.9 1.1z" fill="#e8cf96" />
      <path d="M32 36c-5-3.4-11.2-4.6-18-4.2v18.6c6.8-.4 13 .8 18 4.2 5-3.4 11.2-4.6 18-4.2V31.8c-6.8-.4-13 .8-18 4.2z" fill="none" stroke="#f7efdc" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M32 36v18.6" stroke="#f7efdc" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

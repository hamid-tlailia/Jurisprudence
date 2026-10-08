import type { SVGProps } from "react";

type Props = Omit<SVGProps<SVGSVGElement>, "ref"> & { size?: number; strokeWidth?: number };

/** مصحف مفتوح على كرسي (رَحْل)، بنفس أسلوب أيقونات lucide. عند التعبئة يمتلئ المصحف ويبقى الكرسي خطاً. */
export function QuranIcon({ size = 24, strokeWidth = 2, fill = "none", ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d="M12 6.5C9.5 4.8 6.5 4.6 3 5.5v8c3.5-.9 6.5-.7 9 1 2.5-1.7 5.5-1.9 9-1v-8c-3.5-.9-6.5-.7-9 1Z" fill={fill} />
      <path d="M12 6.5v8" stroke={fill === "none" ? "currentColor" : "var(--bar-bg, var(--surface))"} />
      <path d="m7 15.5 10 5.5M17 15.5 7 21" />
    </svg>
  );
}

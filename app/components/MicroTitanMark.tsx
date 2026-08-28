interface Props {
  height?: number;
  idPrefix?: string;
  className?: string;
}

export default function MicroTitanMark({ height = 32, idPrefix = "mtMark", className }: Props) {
  const silver = `${idPrefix}Silver`;
  const violet = `${idPrefix}Violet`;
  return (
    <svg aria-hidden="true" height={height} viewBox="243 160 653 433" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={silver} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF"/>
          <stop offset=".52" stopColor="#D7D7D8"/>
          <stop offset="1" stopColor="#85878A"/>
        </linearGradient>
        <linearGradient id={violet} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8589FF"/>
          <stop offset=".55" stopColor="#6669E8"/>
          <stop offset="1" stopColor="#4D51C9"/>
        </linearGradient>
      </defs>
      <path fill={`url(#${silver})`} fillRule="evenodd" d="M258 175 H345 L567 365 L793 175 H881 V578 H783 V548 H849 V205 H806 L567 405 L331 205 H289 V548 H359 V578 H258 Z"/>
      <path fill={`url(#${violet})`} d="M483 437 H655 V478 H590 V578 H548 V478 H483 Z"/>
    </svg>
  );
}

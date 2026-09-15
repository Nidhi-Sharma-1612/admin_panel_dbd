import Image from "next/image";

export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/company_logo.png"
      alt="Design by Dial"
      width={940}
      height={218}
      priority
      className={className}
    />
  );
}

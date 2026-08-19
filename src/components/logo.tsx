import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="DevHub home">
      <Image className="logo-mark" src="/favicon.png" alt="" width={18} height={18} aria-hidden />
      <span>DevHub</span>
    </Link>
  );
}

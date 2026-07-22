"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route — login lives on `/`. */
export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}

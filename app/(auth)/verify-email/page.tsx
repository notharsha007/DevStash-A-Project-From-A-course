"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided.");
      return;
    }

    async function verify() {
      const res = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data.error === "Token has expired"
            ? "This verification link has expired. Please request a new one."
            : "This verification link is invalid. It may have already been used."
        );
        return;
      }

      setStatus("success");
    }

    verify();
  }, [token]);

  if (status === "loading") {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center py-12">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Verifying your email...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <XCircle className="size-10 text-destructive" />
          </div>
          <CardTitle className="text-xl">Verification Failed</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/sign-in" className={buttonVariants({ className: "w-full" })}>
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <CardTitle className="text-xl">Email Verified!</CardTitle>
        <CardDescription>
          Your email has been verified. You can now sign in.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href="/sign-in?verified=true" className={buttonVariants({ className: "w-full" })}>
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

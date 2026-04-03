"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/dashboard");
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="ghost" size="icon" onClick={handleBack} />}
      >
        <ArrowLeft className="size-4" />
      </TooltipTrigger>
      <TooltipContent>Back</TooltipContent>
    </Tooltip>
  );
}

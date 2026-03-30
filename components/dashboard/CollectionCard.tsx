"use client";

import Link from "next/link";
import {
  Star,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { iconMap } from "@/lib/icon-map";

interface CollectionCardProps {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantTypeColor: string;
  itemTypeIcons: string[];
}

export function CollectionCard({
  id,
  name,
  description,
  isFavorite,
  itemCount,
  dominantTypeColor,
  itemTypeIcons,
}: CollectionCardProps) {
  return (
    <Link href={`/collections/${id}`} className="block">
      <Card
        className="transition-colors hover:ring-foreground/20"
        style={{
          borderLeftWidth: "3px",
          borderLeftColor: dominantTypeColor,
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {name}
            {isFavorite && (
              <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
            )}
          </CardTitle>
          <CardAction>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => e.preventDefault()}
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </TooltipTrigger>
              <TooltipContent>More options</TooltipContent>
            </Tooltip>
          </CardAction>
          <CardDescription>{itemCount} items</CardDescription>
        </CardHeader>

        <CardContent>
          {description && (
            <p className="line-clamp-1 text-sm text-muted-foreground/80">
              {description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            {itemTypeIcons.map((iconName, i) => {
              const Icon = iconMap[iconName] ?? iconMap.Code;
              return <Icon key={i} className="size-3.5 text-muted-foreground" />;
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

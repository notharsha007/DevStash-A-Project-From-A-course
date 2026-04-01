"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { iconMap } from "@/lib/icon-map";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { deleteCollection } from "@/actions/collections";

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
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCollection(id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Collection deleted");
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <Card
        className="cursor-pointer transition-colors hover:ring-foreground/20"
        style={{ borderLeftWidth: "3px", borderLeftColor: dominantTypeColor }}
        onClick={() => router.push(`/collections/${id}`)}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {name}
            {isFavorite && (
              <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
            )}
          </CardTitle>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Star className="size-4" />
                  Favorite
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={{ id, name, description }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the collection. Items inside it will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

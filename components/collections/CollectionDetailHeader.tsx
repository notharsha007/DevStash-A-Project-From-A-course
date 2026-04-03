"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { deleteCollection, toggleCollectionFavorite } from "@/actions/collections";

interface CollectionDetailHeaderProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    isFavorite: boolean;
  };
  itemCount: number;
}

export function CollectionDetailHeader({
  collection,
  itemCount,
}: CollectionDetailHeaderProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCollection(collection.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Collection deleted");
    setDeleteOpen(false);
    router.push("/collections");
  }

  async function handleToggleFavorite() {
    setTogglingFavorite(true);
    const result = await toggleCollectionFavorite(collection.id);
    setTogglingFavorite(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setIsFavorite(result.data.isFavorite);
    toast.success(
      result.data.isFavorite ? "Collection added to favorites" : "Collection removed from favorites"
    );
    router.refresh();
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          {collection.description && (
            <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
          )}
          <p className="mt-0.5 text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            disabled={togglingFavorite}
            onClick={handleToggleFavorite}
            title="Favorite"
          >
            <Star
              className={`size-4 ${
                isFavorite ? "fill-yellow-500 text-yellow-500" : ""
              }`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{collection.name}&rdquo;?</AlertDialogTitle>
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

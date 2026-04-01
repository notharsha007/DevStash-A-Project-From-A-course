"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCollection } from "@/actions/collections";

interface EditCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: {
    id: string;
    name: string;
    description: string | null;
  };
}

export function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
}: EditCollectionDialogProps) {
  const router = useRouter();
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(collection.name);
      setDescription(collection.description ?? "");
    }
  }, [open, collection]);

  async function handleSave() {
    setSaving(true);
    const result = await updateCollection(collection.id, {
      name,
      description: description || null,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Collection updated");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-collection-name"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-collection-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React Patterns"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-collection-description"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Description
            </Label>
            <Textarea
              id="edit-collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || name.trim() === ""}>
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

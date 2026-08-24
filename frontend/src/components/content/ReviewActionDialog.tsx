import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ReviewDecision = "approve" | "request_adjustments";

type ReviewActionDialogProps = {
  contentTitle: string;
  isSubmitting?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (decision: ReviewDecision, comment?: string) => Promise<void> | void;
};

export function ReviewActionDialog({
  contentTitle,
  isSubmitting = false,
  open,
  onOpenChange,
  onConfirm,
}: ReviewActionDialogProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setComment("");
      setError(null);
    }
  }, [open]);

  function confirmAdjustments() {
    const normalizedComment = comment.trim();

    if (!normalizedComment) {
      setError("Informe o comentário com os ajustes necessários.");
      return;
    }

    setError(null);
    void onConfirm("request_adjustments", normalizedComment);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revisar conteúdo</DialogTitle>
          <DialogDescription>
            Registre a decisão editorial para “{contentTitle}”. A solicitação de ajustes exige uma justificativa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="editorial-comment">Comentário editorial</Label>
          <Textarea
            id="editorial-comment"
            rows={5}
            maxLength={1000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Descreva os ajustes necessários ou registre uma observação da aprovação."
          />
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={confirmAdjustments}>
            Solicitar ajustes
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={() => void onConfirm("approve", comment.trim() || undefined)}>
            Aprovar conteúdo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

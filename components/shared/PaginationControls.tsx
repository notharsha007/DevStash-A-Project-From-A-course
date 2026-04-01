import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g., '/items/snippets'
}

export function PaginationControls({
  currentPage,
  totalPages,
  basePath,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-8 flex justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : "#"}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        <div className="mx-4 flex items-center text-sm font-medium text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? `${basePath}?page=${currentPage + 1}` : "#"}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

import { Button } from "@/components/ui/button";

interface PlaceFormActionsProps {
  onReset: () => void;
  isLoading?: boolean;
}

export function PlaceFormActions({
  onReset,
  isLoading = false,
}: PlaceFormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={isLoading}
      >
        Reset
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-[#6c47ff] text-white"
      >
        {isLoading ? "Creating..." : "Create place"}
      </Button>
    </div>
  );
}

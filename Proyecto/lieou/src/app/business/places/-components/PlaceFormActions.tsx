import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PlaceFormActionsProps {
  onReset: () => void;
  isLoading?: boolean;
}

export function PlaceFormActions({
  onReset,
  isLoading = false,
}: PlaceFormActionsProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      size="lg"
      className="h-14 w-full rounded-full bg-white text-lg font-bold text-[#fd5564] shadow-2xl hover:scale-[1.02] hover:bg-gray-50 hover:shadow-2xl disabled:hover:scale-100"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Creating your place...
        </>
      ) : (
        "Create place"
      )}
    </Button>
  );
}

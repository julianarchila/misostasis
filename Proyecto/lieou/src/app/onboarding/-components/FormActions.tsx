import { Button } from "@/components/ui/button"

interface FormActionsProps {
  selectedUserType: "explorer" | "business" | null
  onReset: () => void
}

export function FormActions({ selectedUserType, onReset }: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="flex-1"
      >
        Reset
      </Button>
      <Button
        type="submit"
        className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg hover:from-pink-600 hover:to-orange-600"
      >
        {selectedUserType === "business"
          ? "Create business account"
          : selectedUserType === "explorer"
            ? "Start exploring"
            : "Continue"}
      </Button>
    </div>
  )
}


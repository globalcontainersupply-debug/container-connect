import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TagListField({
  label,
  value,
  onChange,
  placeholder,
  id,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  id: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        rows={4}
        value={value.join("\n")}
        placeholder={placeholder ?? "One item per line"}
        onChange={(e) =>
          onChange(
            e.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
      />
      <p className="text-xs text-muted-foreground">One item per line.</p>
    </div>
  );
}

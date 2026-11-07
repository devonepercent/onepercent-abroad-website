import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { COUNTRIES, POPULAR_COUNTRY_ISOS, flagEmoji, type Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

type Props = {
  /** Dial code, e.g. "+91". */
  value: string;
  onChange: (dialCode: string) => void;
  variant?: "light" | "dark";
  className?: string;
};

const popular = POPULAR_COUNTRY_ISOS.map((iso) => COUNTRIES.find((c) => c.iso === iso)!).filter(Boolean);
const rest = COUNTRIES.filter((c) => !POPULAR_COUNTRY_ISOS.includes(c.iso));

/** Ranks name-prefix matches first, then any substring of name, code or ISO. */
const filter = (value: string, search: string) => {
  const q = search.trim().toLowerCase().replace(/^\+/, "");
  if (!q) return 1;
  const [name, digits, iso] = value.split("|");
  if (name.startsWith(q) || digits.startsWith(q) || iso === q) return 1;
  if (name.includes(q) || digits.includes(q)) return 0.5;
  return 0;
};

const itemValue = (c: Country) => `${c.name.toLowerCase()}|${c.dialCode.slice(1)}|${c.iso.toLowerCase()}`;

const CountryCodeSelect = ({ value, onChange, variant = "light", className }: Props) => {
  const [open, setOpen] = useState(false);
  // Several countries share a code (e.g. +1), so remember which one was picked.
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const selected = useMemo(() => {
    const picked = COUNTRIES.find((c) => c.iso === selectedIso && c.dialCode === value);
    return picked ?? popular.find((c) => c.dialCode === value) ?? COUNTRIES.find((c) => c.dialCode === value);
  }, [selectedIso, value]);

  const dark = variant === "dark";

  const renderItem = (c: Country) => (
    <CommandItem
      key={c.iso}
      value={itemValue(c)}
      onSelect={() => {
        setSelectedIso(c.iso);
        onChange(c.dialCode);
        setOpen(false);
      }}
      className={cn("gap-2 cursor-pointer", dark && "text-white data-[selected=true]:bg-white/10 data-[selected=true]:text-white")}
    >
      <span className="text-base leading-none">{flagEmoji(c.iso)}</span>
      <span className="flex-1 truncate">{c.name}</span>
      <span className={cn("text-xs tabular-nums", dark ? "text-white/50" : "text-muted-foreground")}>{c.dialCode}</span>
      <Check className={cn("h-4 w-4 shrink-0", selected?.iso === c.iso ? "opacity-100" : "opacity-0")} />
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={selected ? `Country code: ${selected.name} ${selected.dialCode}` : "Country code"}
          className={cn("flex shrink-0 items-center justify-between gap-1.5 outline-none", className)}
        >
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            {selected && <span className="text-base leading-none">{flagEmoji(selected.iso)}</span>}
            <span>{value}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-[280px] p-0", dark && "border-white/10 bg-[#141414] text-white")}
      >
        <Command
          filter={filter}
          className={cn(dark && "bg-[#141414] text-white [&_[cmdk-input-wrapper]]:border-white/10 [&_[cmdk-input]]:placeholder:text-white/40")}
        >
          <CommandInput placeholder="Search country or code..." />
          <CommandList className="max-h-[260px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup heading="Popular" className={cn(dark && "text-white [&_[cmdk-group-heading]]:text-white/50")}>
              {popular.map(renderItem)}
            </CommandGroup>
            <CommandGroup heading="All countries" className={cn(dark && "text-white [&_[cmdk-group-heading]]:text-white/50")}>
              {rest.map(renderItem)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountryCodeSelect;

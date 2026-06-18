"use client";

import type { MoodOption } from "@/lib/mood-data";

type EmojiMoodPickerProps = {
  options: MoodOption[];
  value: string | null;
  onChange: (slug: string) => void;
  disabled?: boolean;
};

export function EmojiMoodPicker({ options, value, onChange, disabled }: EmojiMoodPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {options.map((option) => {
        const selected = value === option.slug;
        return (
          <button
            key={option.slug}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.slug)}
            title={option.label}
            className={`flex flex-col items-center gap-1 border p-3 transition-colors sm:p-4 ${
              selected
                ? "border-signal bg-signal/10"
                : "border-border bg-background hover:border-signal/40 hover:bg-surface"
            } disabled:opacity-50`}
          >
            <span className="text-2xl sm:text-3xl">{option.emoji}</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

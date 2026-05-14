"use client";

import { useEffect, useRef, useState } from "react";

export type LocationResult = {
  displayName: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string | null;
};

type Props = {
  id: string;
  value: string;
  timezone?: string | null;
  onChange: (value: string, location?: LocationResult) => void;
  placeholder?: string;
  required?: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function LocationAutocomplete({
  id,
  value,
  timezone,
  onChange,
  placeholder = "София, България",
  required,
}: Props) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(!!timezone);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSelected(false);
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!API_BASE || val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/geocode/search?q=${encodeURIComponent(val)}`,
        );
        if (!res.ok) throw new Error("geocode failed");
        const data = (await res.json()) as LocationResult[];
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  function handleSelect(r: LocationResult) {
    setSelected(true);
    setOpen(false);
    setResults([]);
    onChange(r.displayName, r);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="field pr-9"
          autoComplete="off"
          required={required}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
          aria-hidden
        >
          {loading ? (
            <span className="text-gold/70 animate-pulse">◌</span>
          ) : selected ? (
            <span className="text-gold">✦</span>
          ) : (
            <span className="text-gold/40">◎</span>
          )}
        </span>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-md border border-gold/25 bg-card/95 backdrop-blur-md shadow-2xl shadow-black/50 overflow-hidden animate-fade-in">
          {results.map((r, i) => (
            <button
              key={`${r.lat}-${r.lon}-${i}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(r);
              }}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gold/10 transition-colors ${
                i < results.length - 1 ? "border-b border-gold/10" : ""
              }`}
            >
              <span className="text-gold/70 text-xs mt-0.5 shrink-0">◎</span>
              <div className="min-w-0 flex-1">
                <div className="text-parchment text-sm truncate">
                  {r.city}
                  {r.country ? `, ${r.country}` : ""}
                </div>
                <div className="text-muted text-xs truncate mt-0.5">
                  {r.displayName}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {timezone && selected && (
        <p className="mt-2 text-xs text-gold/70">
          🕐 Часова зона: <span className="text-parchment/85">{timezone}</span>
        </p>
      )}
    </div>
  );
}

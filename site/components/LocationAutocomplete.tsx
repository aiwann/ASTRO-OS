"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  timezoneLabel?: string;
  onChange: (value: string, location?: LocationResult) => void;
  placeholder?: string;
  required?: boolean;
  showError?: boolean;
};

export default function LocationAutocomplete({
  id,
  value,
  timezone,
  timezoneLabel = "🕐 Часова зона:",
  onChange,
  placeholder = "София, България",
  required,
  showError,
}: Props) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(!!timezone);
  const [touched, setTouched] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function updateDropdownPosition() {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSelected(false);
    setTouched(true);
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/geocode/search?q=${encodeURIComponent(val)}`,
        );
        if (!res.ok) throw new Error("geocode failed");
        const data = (await res.json()) as LocationResult[];
        setResults(data);
        if (data.length > 0) {
          updateDropdownPosition();
          setOpen(true);
        } else {
          setOpen(false);
        }
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
    const label = r.country ? `${r.city}, ${r.country}` : r.city;
    onChange(label, r);
  }

  const dropdown = open && results.length > 0 && mounted ? createPortal(
    <div
      style={dropdownStyle}
      className="rounded-md border border-gold/25 bg-card/95 backdrop-blur-md shadow-2xl shadow-black/50 overflow-hidden animate-fade-in"
    >
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
    </div>,
    document.body
  ) : null;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => {
            if (results.length > 0) {
              updateDropdownPosition();
              setOpen(true);
            }
          }}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          className={`field pr-9 ${(showError || (touched && value.trim() && !selected)) ? "border-red-500/60" : ""}`}
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

      {dropdown}

      {timezone && selected && (
        <p className="mt-2 text-xs text-gold/70">
          {timezoneLabel}{" "}
          <span className="text-parchment/85">{timezone}</span>
        </p>
      )}

      {(showError || (touched && value.trim() && !selected)) && (
        <p className="mt-2 text-sm text-red-400">
          * Изберете валидна локация от падащото меню
        </p>
      )}
    </div>
  );
}

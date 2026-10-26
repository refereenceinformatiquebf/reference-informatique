"use client";

import { useState } from "react";
import { fieldClasses } from "./input";
import { Select } from "./select";
import { cn } from "@/lib/utils";
import {
  AFRICAN_COUNTRIES,
  PHONE_DIAL_CODES,
  type AfricanCountry,
} from "@/lib/phone";

const DIAL_OPTIONS = AFRICAN_COUNTRIES.map((country) => ({
  value: country,
  label: PHONE_DIAL_CODES[country]
    ? `${country} (${PHONE_DIAL_CODES[country]})`
    : "Autre pays",
}));

/** Déduit l'indicatif + le numéro local depuis une valeur brute (profil existant, etc.) */
function splitValue(value: string): { country: AfricanCountry; local: string } {
  const trimmed = value.trim();
  if (!trimmed) return { country: "Burkina Faso", local: "" };
  for (const [country, code] of Object.entries(PHONE_DIAL_CODES)) {
    if (code && trimmed.startsWith(code)) {
      return {
        country: country as AfricanCountry,
        local: trimmed.slice(code.length).trim(),
      };
    }
  }
  return { country: "Autre", local: trimmed };
}

/**
 * Indicatif + numéro local, combinés en un seul champ stocké au format
 * « +226 70000000 » — remplace un champ téléphone libre : le pays du client
 * se déduit ensuite de ce numéro (voir lib/phone.ts countryFromPhone),
 * jamais d'un champ « Pays » séparé qui pourrait le contredire.
 */
export function PhoneInput({
  id,
  value,
  onChange,
  required,
  placeholder,
  "aria-invalid": ariaInvalid,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  "aria-invalid"?: boolean;
}) {
  const initial = splitValue(value);
  const [country, setCountry] = useState<AfricanCountry>(initial.country);
  const [local, setLocal] = useState(initial.local);

  const dialCode = PHONE_DIAL_CODES[country];

  const emit = (nextCountry: AfricanCountry, nextLocal: string) => {
    const code = PHONE_DIAL_CODES[nextCountry];
    onChange(code ? `${code} ${nextLocal}`.trim() : nextLocal.trim());
  };

  return (
    <div className="flex min-w-0 gap-2">
      <Select
        value={country}
        onChange={(event) => {
          const next = event.target.value as AfricanCountry;
          setCountry(next);
          emit(next, local);
        }}
        aria-label="Indicatif du pays"
        className="w-[128px] shrink-0 sm:w-[168px]"
      >
        {DIAL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={local}
        onChange={(event) => {
          setLocal(event.target.value);
          emit(country, event.target.value);
        }}
        placeholder={
          placeholder ?? (dialCode ? "70 00 00 00" : "Ex. +33 6 12 34 56 78")
        }
        required={required}
        aria-invalid={ariaInvalid}
        className={cn(fieldClasses, "min-w-0 flex-1")}
      />
    </div>
  );
}

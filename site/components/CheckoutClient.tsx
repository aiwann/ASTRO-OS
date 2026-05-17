"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Product, formatBGN, formatEUR } from "@/lib/products";
import { BUMPS, getBySlug as catalogGetBySlug, type CatalogItem } from "@/lib/catalog";
import { TranslationKey } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import BumpPopup from "@/components/BumpPopup";
import LocationAutocomplete from "@/components/LocationAutocomplete";

type T = (key: TranslationKey, vars?: Record<string, string | number>) => string;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_QUESTION_LENGTH = 10;
const QUESTION_BUMP_ID = "B1";

function formatBirthDate(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function isValidBirthDate(date: string): boolean {
  const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const d = +m[1];
  const mo = +m[2];
  const y = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return false;
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

function formatBirthTime(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidBirthTime(time: string): boolean {
  if (!time) return true;
  const m = time.match(/^(\d{2}):(\d{2})$/);
  if (!m) return false;
  const h = +m[1];
  const mi = +m[2];
  return h >= 0 && h <= 23 && mi >= 0 && mi <= 59;
}

function toISO(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split("/");
  return `${y}-${m}-${d}`;
}

type PersonFields = {
  name: string;
  gender: "male" | "female" | "";
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  birthLat?: number;
  birthLon?: number;
  birthTimezone?: string | null;
};

const emptyPerson: PersonFields = {
  name: "",
  gender: "",
  birthDate: "",
  birthTime: "",
  birthPlace: "",
};

export default function CheckoutClient({ product }: { product: Product }) {
  const { t } = useLanguage();

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSeen, setPopupSeen] = useState(false);

  const [person, setPerson] = useState<PersonFields>(emptyPerson);
  const [partner, setPartner] = useState<PersonFields>(emptyPerson);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());
  const [questionText, setQuestionText] = useState("");

  const [noRefund, setNoRefund] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const bumpQuestionSelected = selectedBumps.has(QUESTION_BUMP_ID);

  const toggleBump = (id: string, on: boolean) => {
    setSelectedBumps((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    if (popupSeen) return;
    const timer = setTimeout(() => setPopupOpen(true), 500);
    return () => clearTimeout(timer);
  }, [popupSeen]);

  const emailValid = EMAIL_RE.test(email);
  const showEmailError = emailTouched && email.length > 0 && !emailValid;

  const selectedBumpItems = useMemo<CatalogItem[]>(
    () => BUMPS.filter((b) => selectedBumps.has(String(b.id))),
    [selectedBumps],
  );

  const bumpsTotal = useMemo(
    () => selectedBumpItems.reduce((s, b) => s + b.priceEur, 0),
    [selectedBumpItems],
  );

  const total = useMemo(
    () => product.newPrice + bumpsTotal,
    [product.newPrice, bumpsTotal],
  );

  const personLocationValid = !!person.birthLat && !!person.birthLon;
  const partnerLocationValid =
    !product.twoPersons || (!!partner.birthLat && !!partner.birthLon);
  const personValid =
    isValidBirthDate(person.birthDate) && isValidBirthTime(person.birthTime) && personLocationValid;
  const partnerValid =
    !product.twoPersons ||
    (isValidBirthDate(partner.birthDate) && isValidBirthTime(partner.birthTime) && partnerLocationValid);
  const questionValid =
    !bumpQuestionSelected || questionText.trim().length >= MIN_QUESTION_LENGTH;
  const canSubmit =
    emailValid &&
    noRefund &&
    personValid &&
    partnerValid &&
    questionValid &&
    !submitting;

  const handlePopupAccept = () => {
    toggleBump(QUESTION_BUMP_ID, true);
    setPopupOpen(false);
    setPopupSeen(true);
  };
  const handlePopupDecline = () => {
    setPopupOpen(false);
    setPopupSeen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const customerData: Record<string, string> = {
        name: person.name,
        gender: person.gender,
        birthDate: toISO(person.birthDate),
        birthTime: person.birthTime || "",
        birthPlace: person.birthPlace,
      };

      if (product.apiType === "synastry") {
        customerData.name2 = partner.name;
        customerData.gender2 = partner.gender;
        customerData.birthDate2 = toISO(partner.birthDate);
        customerData.birthTime2 = partner.birthTime || "";
        customerData.birthPlace2 = partner.birthPlace;
      }

      if (bumpQuestionSelected && questionText.trim().length >= MIN_QUESTION_LENGTH) {
        customerData.question = questionText.trim();
      }

      // Build itemIds: main product id + each selected bump id
      const mainItem = catalogGetBySlug(product.apiType);
      const itemIds: Array<number | string> = [];
      if (mainItem) itemIds.push(mainItem.id);
      else itemIds.push(product.apiType); // fallback — backend will handle/reject
      for (const b of selectedBumpItems) itemIds.push(b.id);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemIds,
            customerData,
            email,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Checkout failed");
      }

      const { url } = await res.json();
      if (!url) throw new Error("Не е върнат Stripe URL");

      window.location.href = url;
    } catch (err) {
      setSubmitting(false);
      const msg = err instanceof Error ? err.message : "Моля опитай отново.";
      alert(`Грешка: ${msg}`);
    }
  };

  return (
    <>
      <BumpPopup
        open={popupOpen}
        onAccept={handlePopupAccept}
        onDecline={handlePopupDecline}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <header className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-3">
            {t("checkout.kicker")}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light">
            <span className="gold-gradient-text">{product.title}</span>
          </h1>
          <p className="mt-2 text-parchment/60 font-serif italic">
            {product.subtitle}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
        >
          <div className="lg:col-span-3 space-y-8">
            {product.twoPersons ? (
              <>
                <PersonSection
                  title={t("checkout.yourData")}
                  data={person}
                  onChange={setPerson}
                  idPrefix="me"
                  t={t}
                />
                <PersonSection
                  title={t("checkout.partnerData")}
                  data={partner}
                  onChange={setPartner}
                  idPrefix="partner"
                  t={t}
                />
              </>
            ) : (
              <PersonSection
                title={t("checkout.yourData")}
                data={person}
                onChange={setPerson}
                idPrefix="me"
                t={t}
              />
            )}

            <FormCard>
              <FieldLabel htmlFor="email" required>
                {t("checkout.email")}
              </FieldLabel>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder={t("checkout.email.placeholder")}
                className={`field ${
                  showEmailError ? "border-red-500/60" : ""
                }`}
                autoComplete="email"
                required
              />
              {showEmailError && (
                <p className="mt-2 text-sm text-red-400">
                  {t("checkout.email.error")}
                </p>
              )}
            </FormCard>

            <section className="space-y-4">
              <h3 className="text-xs tracking-[0.3em] uppercase text-gold/70">
                {t("checkout.addons")}
              </h3>

              {BUMPS.map((bump) => {
                const id = String(bump.id);
                const checked = selectedBumps.has(id);
                return (
                  <BumpItem
                    key={id}
                    checked={checked}
                    onChange={(v) => toggleBump(id, v)}
                    title={bump.title}
                    description={bump.description || bump.subtitle}
                    pages={bump.pages}
                    price={bump.priceEur}
                  >
                    {id === QUESTION_BUMP_ID && checked && (
                      <div className="mt-4 animate-fade-in">
                        <FieldLabel htmlFor="question">
                          {t("checkout.question.label")}
                        </FieldLabel>
                        <div className="mb-3 rounded-md border border-gold/20 bg-card/40 p-3 space-y-1 text-xs text-parchment/75">
                          <p>{t("checkout.question.helperWarn")}</p>
                          <p>
                            <span className="text-emerald-400">
                              {t("checkout.question.helperValid")}
                            </span>{" "}
                            {t("checkout.question.helperValidEx")}
                          </p>
                          <p>
                            <span className="text-red-400">
                              {t("checkout.question.helperInvalid")}
                            </span>{" "}
                            {t("checkout.question.helperInvalidEx")}
                          </p>
                        </div>
                        <textarea
                          id="question"
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          rows={3}
                          placeholder={t("checkout.question.placeholder")}
                          className="field resize-none"
                        />
                        {questionText.length > 0 &&
                          questionText.trim().length < MIN_QUESTION_LENGTH && (
                            <p className="mt-2 text-sm text-amber-400">
                              {t("checkout.question.minChars", {
                                min: MIN_QUESTION_LENGTH,
                                current: questionText.trim().length,
                              })}
                            </p>
                          )}
                      </div>
                    )}
                  </BumpItem>
                );
              })}
            </section>

            <FormCard>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noRefund}
                  onChange={(e) => setNoRefund(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-gold shrink-0"
                />
                <span className="text-sm text-parchment/80 leading-relaxed">
                  {t("checkout.terms.accept")}{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-gold-light hover:text-gold underline underline-offset-2"
                  >
                    {t("checkout.terms.linkTerms")}
                  </Link>{" "}
                  {t("checkout.terms.and")}{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-gold-light hover:text-gold underline underline-offset-2"
                  >
                    {t("checkout.terms.linkPrivacy")}
                  </Link>
                  .
                </span>
              </label>
            </FormCard>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-5 rounded-md font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                canSubmit
                  ? "bg-gold text-dark hover:bg-gold-light hover:shadow-[0_0_40px_rgba(212,175,55,0.45)]"
                  : "bg-gold/30 text-dark/50 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <Spinner /> {t("checkout.submitting")}
                </>
              ) : (
                <>
                  {t("checkout.submit")} <span>→</span>
                </>
              )}
            </button>
          </div>

          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-gold/30 bg-card/80 backdrop-blur-sm p-6">
                <p className="text-xs tracking-[0.3em] uppercase text-muted mb-3">
                  {t("checkout.order")}
                </p>
                <h2 className="font-serif text-2xl text-parchment">
                  {product.title}
                </h2>
                <p className="text-sm text-parchment/60 mt-1">
                  {product.duration}
                </p>

                <div className="mt-5 flex items-baseline justify-between">
                  <span className="text-red-400/80 line-through text-base">
                    {formatEUR(product.oldPrice)}
                  </span>
                  <span className="flex items-baseline gap-3">
                    <span className="font-serif text-3xl font-semibold text-emerald-400">
                      {formatEUR(product.newPrice)}
                    </span>
                    <span className="text-xs font-semibold tracking-widest text-red-300 bg-red-900/30 border border-red-500/40 rounded-full px-2 py-0.5">
                      -{product.discount}%
                    </span>
                  </span>
                </div>

                {selectedBumpItems.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gold/15 space-y-2 text-sm">
                    {selectedBumpItems.map((b) => (
                      <div key={b.id} className="flex justify-between text-parchment/80">
                        <span>+ {b.title}</span>
                        <span className="text-emerald-400">
                          {formatEUR(b.priceEur)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-gold/30 flex justify-between items-baseline">
                  <span className="font-serif text-xl text-parchment">
                    {t("checkout.total")}
                  </span>
                  <div className="text-right">
                    <div className="font-serif text-3xl font-semibold gold-gradient-text">
                      {formatEUR(total)}
                    </div>
                    <div className="text-xs text-parchment/55 mt-1">
                      ≈ {formatBGN(total)}
                    </div>
                  </div>
                </div>
              </div>

              <ul className="rounded-2xl border border-gold/15 bg-card/50 p-5 space-y-2 text-sm text-parchment/80">
                <li>{t("checkout.trust.secure")}</li>
                <li>{t("checkout.trust.email")}</li>
                <li>{t("checkout.trust.fast")}</li>
              </ul>
            </div>
          </aside>
        </form>
      </div>

      <style jsx>{`
        :global(.field) {
          width: 100%;
          background-color: #14101e;
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          color: #e8dcc8;
          font-size: 1rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.field::placeholder) {
          color: #8a7a60;
        }
        :global(.field:focus) {
          outline: none;
          border-color: #d4af37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }
      `}</style>
    </>
  );
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gold/20 bg-card/60 backdrop-blur-sm p-5 sm:p-6">
      {children}
    </div>
  );
}

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-parchment mb-2"
    >
      {children}
      {required && <span className="text-gold ml-1">*</span>}
    </label>
  );
}

function PersonSection({
  title,
  data,
  onChange,
  idPrefix,
  t,
}: {
  title: string;
  data: PersonFields;
  onChange: (v: PersonFields) => void;
  idPrefix: string;
  t: T;
}) {
  const [dateTouched, setDateTouched] = useState(false);
  const [timeTouched, setTimeTouched] = useState(false);

  const update = <K extends keyof PersonFields>(
    key: K,
    value: PersonFields[K],
  ) => onChange({ ...data, [key]: value });

  const dateError =
    dateTouched && data.birthDate.length > 0 && !isValidBirthDate(data.birthDate);
  const timeError =
    timeTouched && data.birthTime.length > 0 && !isValidBirthTime(data.birthTime);

  return (
    <FormCard>
      <h3 className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-5">
        — {title} —
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor={`${idPrefix}-name`} required>
            {t("checkout.fullName")}
          </FieldLabel>
          <input
            id={`${idPrefix}-name`}
            type="text"
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={t("checkout.fullName.placeholder")}
            className="field"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <span className="block text-sm font-medium text-parchment mb-2">
            {t("checkout.gender")}
          </span>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${idPrefix}-gender`}
                value="male"
                checked={data.gender === "male"}
                onChange={() => update("gender", "male")}
                className="accent-gold"
              />
              <span className="text-parchment/90">{t("checkout.gender.male")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${idPrefix}-gender`}
                value="female"
                checked={data.gender === "female"}
                onChange={() => update("gender", "female")}
                className="accent-gold"
              />
              <span className="text-parchment/90">{t("checkout.gender.female")}</span>
            </label>
          </div>
        </div>

        <div>
          <FieldLabel htmlFor={`${idPrefix}-bdate`} required>
            {t("checkout.birthDate")}
          </FieldLabel>
          <input
            id={`${idPrefix}-bdate`}
            type="text"
            inputMode="numeric"
            value={data.birthDate}
            onChange={(e) =>
              update("birthDate", formatBirthDate(e.target.value))
            }
            onBlur={() => setDateTouched(true)}
            placeholder={t("checkout.birthDate.placeholder")}
            maxLength={10}
            className={`field ${dateError ? "border-red-500/60" : ""}`}
            required
          />
          {dateError && (
            <p className="mt-2 text-sm text-red-400">
              {t("checkout.birthDate.error")}
            </p>
          )}
        </div>

        <div>
          <FieldLabel htmlFor={`${idPrefix}-btime`}>
            {t("checkout.birthTime")}
          </FieldLabel>
          <input
            id={`${idPrefix}-btime`}
            type="text"
            inputMode="numeric"
            value={data.birthTime}
            onChange={(e) =>
              update("birthTime", formatBirthTime(e.target.value))
            }
            onBlur={() => setTimeTouched(true)}
            placeholder={t("checkout.birthTime.placeholder")}
            maxLength={5}
            className={`field ${timeError ? "border-red-500/60" : ""}`}
          />
          {timeError && (
            <p className="mt-2 text-sm text-red-400">
              {t("checkout.birthTime.error")}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor={`${idPrefix}-place`} required>
            {t("checkout.birthPlace")}
          </FieldLabel>
          <LocationAutocomplete
            id={`${idPrefix}-place`}
            value={data.birthPlace}
            timezone={data.birthTimezone}
            timezoneLabel={t("checkout.timezone.label")}
            onChange={(value, location) =>
              onChange({
                ...data,
                birthPlace: value,
                birthLat: location?.lat,
                birthLon: location?.lon,
                birthTimezone: location?.timezone ?? null,
              })
            }
            placeholder={t("checkout.birthPlace.placeholder")}
            required
            showError={!!(data.birthPlace.trim() && !data.birthLat)}
          />
        </div>
      </div>
    </FormCard>
  );
}

function BumpItem({
  checked,
  onChange,
  title,
  description,
  pages,
  price,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
  pages: number;
  price: number;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card/60 backdrop-blur-sm p-5 transition-colors ${
        checked
          ? "border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          : "border-gold/20"
      }`}
    >
      <label className="flex items-start gap-4 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-5 h-5 accent-gold shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-serif text-lg text-parchment">{title}</span>
            <span className="font-semibold text-emerald-400 whitespace-nowrap">
              +{formatEUR(price)}
            </span>
          </div>
          <p className="text-sm text-parchment/70 mt-1">{description}</p>
          <p className="text-xs text-parchment/45 mt-2">
            📄 {pages} {pages === 1 ? "страница" : "страници"} · PDF секция в анализа
          </p>
        </div>
      </label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

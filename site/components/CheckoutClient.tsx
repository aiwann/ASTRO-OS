"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Product, formatEUR } from "@/lib/products";
import BumpPopup from "@/components/BumpPopup";
import LocationAutocomplete from "@/components/LocationAutocomplete";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUMP_PRICE = 4.99;
const BUMP_OLD_PRICE = 12.49;
const MIN_QUESTION_LENGTH = 10;

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
  const router = useRouter();

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupSeen, setPopupSeen] = useState(false);

  const [person, setPerson] = useState<PersonFields>(emptyPerson);
  const [partner, setPartner] = useState<PersonFields>(emptyPerson);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const [bumpQuestion, setBumpQuestion] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [bumpPartnerIdeal, setBumpPartnerIdeal] = useState(false);

  const [noRefund, setNoRefund] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (popupSeen) return;
    const t = setTimeout(() => setPopupOpen(true), 500);
    return () => clearTimeout(t);
  }, [popupSeen]);

  const emailValid = EMAIL_RE.test(email);
  const showEmailError = emailTouched && email.length > 0 && !emailValid;

  const total = useMemo(() => {
    let t = product.newPrice;
    if (bumpQuestion) t += BUMP_PRICE;
    if (bumpPartnerIdeal) t += BUMP_PRICE;
    return t;
  }, [product.newPrice, bumpQuestion, bumpPartnerIdeal]);

  const personValid =
    isValidBirthDate(person.birthDate) && isValidBirthTime(person.birthTime);
  const partnerValid =
    !product.twoPersons ||
    (isValidBirthDate(partner.birthDate) && isValidBirthTime(partner.birthTime));
  const questionValid =
    !bumpQuestion || questionText.trim().length >= MIN_QUESTION_LENGTH;
  const canSubmit =
    emailValid &&
    noRefund &&
    personValid &&
    partnerValid &&
    questionValid &&
    !submitting;

  const handlePopupAccept = () => {
    setBumpQuestion(true);
    setPopupOpen(false);
    setPopupSeen(true);
  };
  const handlePopupDecline = () => {
    setPopupOpen(false);
    setPopupSeen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      router.push(`/thank-you?product=${product.slug}`);
    }, 1500);
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
            Checkout
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
                  title="ТВОИТЕ ДАННИ"
                  data={person}
                  onChange={setPerson}
                  idPrefix="me"
                />
                <PersonSection
                  title="ДАННИ НА ПАРТНЬОРА"
                  data={partner}
                  onChange={setPartner}
                  idPrefix="partner"
                />
              </>
            ) : (
              <PersonSection
                title="ТВОИТЕ ДАННИ"
                data={person}
                onChange={setPerson}
                idPrefix="me"
              />
            )}

            <FormCard>
              <FieldLabel htmlFor="email" required>
                Email адрес
              </FieldLabel>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="ime@example.com"
                className={`field ${
                  showEmailError ? "border-red-500/60" : ""
                }`}
                autoComplete="email"
                required
              />
              {showEmailError && (
                <p className="mt-2 text-sm text-red-400">
                  ❌ Моля въведи валиден имейл адрес
                </p>
              )}
            </FormCard>

            <section className="space-y-4">
              <h3 className="text-xs tracking-[0.3em] uppercase text-gold/70">
                Препоръчани допълнения
              </h3>

              <BumpItem
                checked={bumpQuestion}
                onChange={setBumpQuestion}
                title="Персонален Въпрос"
                description="Задай конкретен въпрос — AI отговаря директно в доклада."
                oldPrice={BUMP_OLD_PRICE}
                newPrice={BUMP_PRICE}
              >
                {bumpQuestion && (
                  <div className="mt-4 animate-fade-in">
                    <FieldLabel htmlFor="question">Твоят въпрос</FieldLabel>
                    <div className="mb-3 rounded-md border border-gold/20 bg-card/40 p-3 space-y-1 text-xs text-parchment/75">
                      <p>⚠️ Въпросът трябва да е свързан с теб лично.</p>
                      <p>
                        <span className="text-emerald-400">✅ Валиден пример:</span>{" "}
                        &bdquo;Зададено ли ми е да бъда богат?&ldquo;
                      </p>
                      <p>
                        <span className="text-red-400">❌ Невалиден:</span>{" "}
                        &bdquo;Кога ще стана богат?&ldquo; (предсказания не са възможни)
                      </p>
                    </div>
                    <textarea
                      id="question"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      rows={3}
                      placeholder="Напр. &bdquo;Зададено ли ми е да бъда богат?&ldquo;"
                      className="field resize-none"
                    />
                    {questionText.length > 0 &&
                      questionText.trim().length < MIN_QUESTION_LENGTH && (
                        <p className="mt-2 text-sm text-amber-400">
                          ⚠️ Минимум {MIN_QUESTION_LENGTH} символа ({questionText.trim().length}/
                          {MIN_QUESTION_LENGTH})
                        </p>
                      )}
                  </div>
                )}
              </BumpItem>

              <BumpItem
                checked={bumpPartnerIdeal}
                onChange={setBumpPartnerIdeal}
                title="Идеален Партньор"
                description="Кратък профил на идеалния за теб партньор."
                oldPrice={BUMP_OLD_PRICE}
                newPrice={BUMP_PRICE}
              />
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
                  Приемам всички{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-gold-light hover:text-gold underline underline-offset-2"
                  >
                    условия
                  </Link>{" "}
                  и{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-gold-light hover:text-gold underline underline-offset-2"
                  >
                    политика за поверителност
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
                  <Spinner /> Обработваме...
                </>
              ) : (
                <>
                  Плати сигурно <span>→</span>
                </>
              )}
            </button>
          </div>

          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-gold/30 bg-card/80 backdrop-blur-sm p-6">
                <p className="text-xs tracking-[0.3em] uppercase text-muted mb-3">
                  Поръчка
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

                {(bumpQuestion || bumpPartnerIdeal) && (
                  <div className="mt-5 pt-5 border-t border-gold/15 space-y-2 text-sm">
                    {bumpQuestion && (
                      <div className="flex justify-between text-parchment/80">
                        <span>+ Персонален Въпрос</span>
                        <span className="text-emerald-400">
                          {formatEUR(BUMP_PRICE)}
                        </span>
                      </div>
                    )}
                    {bumpPartnerIdeal && (
                      <div className="flex justify-between text-parchment/80">
                        <span>+ Идеален Партньор</span>
                        <span className="text-emerald-400">
                          {formatEUR(BUMP_PRICE)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-gold/30 flex justify-between items-baseline">
                  <span className="font-serif text-xl text-parchment">
                    ОБЩО
                  </span>
                  <span className="font-serif text-3xl font-semibold gold-gradient-text">
                    {formatEUR(total)}
                  </span>
                </div>
              </div>

              <ul className="rounded-2xl border border-gold/15 bg-card/50 p-5 space-y-2 text-sm text-parchment/80">
                <li>🔒 Сигурно плащане</li>
                <li>📧 PDF на имейла</li>
                <li>⚡ Готово в минути</li>
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
}: {
  title: string;
  data: PersonFields;
  onChange: (v: PersonFields) => void;
  idPrefix: string;
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
            Пълно Име
          </FieldLabel>
          <input
            id={`${idPrefix}-name`}
            type="text"
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Иван Петров"
            className="field"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <span className="block text-sm font-medium text-parchment mb-2">
            Пол
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
              <span className="text-parchment/90">Мъж</span>
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
              <span className="text-parchment/90">Жена</span>
            </label>
          </div>
        </div>

        <div>
          <FieldLabel htmlFor={`${idPrefix}-bdate`} required>
            Дата на раждане
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
            placeholder="DD/MM/YYYY"
            maxLength={10}
            className={`field ${dateError ? "border-red-500/60" : ""}`}
            required
          />
          {dateError && (
            <p className="mt-2 text-sm text-red-400">
              ❌ Невалидна дата — провери ден, месец и година
            </p>
          )}
        </div>

        <div>
          <FieldLabel htmlFor={`${idPrefix}-btime`}>Час на раждане</FieldLabel>
          <input
            id={`${idPrefix}-btime`}
            type="text"
            inputMode="numeric"
            value={data.birthTime}
            onChange={(e) =>
              update("birthTime", formatBirthTime(e.target.value))
            }
            onBlur={() => setTimeTouched(true)}
            placeholder="HH:MM"
            maxLength={5}
            className={`field ${timeError ? "border-red-500/60" : ""}`}
          />
          {timeError && (
            <p className="mt-2 text-sm text-red-400">
              ❌ Невалиден час — 00:00 до 23:59
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor={`${idPrefix}-place`} required>
            Място на раждане
          </FieldLabel>
          <LocationAutocomplete
            id={`${idPrefix}-place`}
            value={data.birthPlace}
            timezone={data.birthTimezone}
            onChange={(value, location) =>
              onChange({
                ...data,
                birthPlace: value,
                birthLat: location?.lat,
                birthLon: location?.lon,
                birthTimezone: location?.timezone ?? null,
              })
            }
            placeholder="София, България"
            required
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
  oldPrice,
  newPrice,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
  oldPrice: number;
  newPrice: number;
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
            <span className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-sm text-red-400/80 line-through">
                {formatEUR(oldPrice)}
              </span>
              <span className="font-semibold text-emerald-400">
                {formatEUR(newPrice)}
              </span>
            </span>
          </div>
          <p className="text-sm text-parchment/70 mt-1">{description}</p>
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

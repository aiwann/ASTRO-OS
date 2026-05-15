"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_STORAGE_KEY,
} from "@/components/CookieBanner";

const CLARITY_ID = "wrozukx7de";

/**
 * Microsoft Clarity tag — зарежда се САМО ако потребителят е приел
 * „всички бисквитки" в CookieBanner. Слуша custom event-а на банера,
 * така че скриптът се активира веднага щом потребителят натисне
 * „Приемам всички" — без презареждане на страницата.
 *
 * Същият pattern важи и за всеки бъдещ маркетинг таг (Meta Pixel,
 * GA, TikTok и т.н.) — добавяй ги по същия начин.
 */
export default function Clarity() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = () => {
      const v = window.localStorage.getItem(COOKIE_STORAGE_KEY);
      setEnabled(v === "all");
    };
    check();
    window.addEventListener(COOKIE_CONSENT_EVENT, check);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, check);
  }, []);

  if (!enabled) return null;

  return (
    <Script
      id="ms-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_ID}");
        `,
      }}
    />
  );
}

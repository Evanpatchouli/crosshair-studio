import { loadLocale } from "../locale";
import { type TextKey } from "../locale/type";
import { useEffect, useMemo } from "react";
import useLocalStorage from "./useLocalStorage";
import { set, get } from "@public/plugins/tauri-plugin-share";
import useCache from "./useCache";
import { useShallow } from 'zustand/react/shallow'

function useIntl() {
  const cache = useCache();
  const messages = useCache(useShallow(s => s['locale_messages']));
  const [locale] = useLocalStorage<"zh_CN" | "en_US">("locale", "en_US");
  const syncMessages = async (locale: string) => {
    const is_updating_locale_messages = await get<boolean>('updating_locale_messages');
    if (!is_updating_locale_messages) {
      await set<boolean>('updating_locale_messages', true);
    }
    const new_messages = (await loadLocale(locale)).messages;
    await set<Record<string, string>>("locale_messages", new_messages);
    await set<boolean>('updating_locale_messages', false);
    return new_messages;
  }
  useEffect(() => {
    syncMessages(locale).then(data => {
      cache.set({
        "locale_messages": data
      });
    })
  }, [locale])

  const intl = useMemo(() => ({
    locale,
    formatMessage: (options: { id: TextKey }) => messages[options.id] ?? options.id,
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, options).format(date),
    formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, options).format(date),
    formatRelative: (date: Date, options?: { unit: Intl.RelativeTimeFormatUnit }) => {
      const diff = Math.abs(date.getTime() - new Date().getTime());
      const unit = options?.unit || 'second';
      const value = unit === 'second' ? diff / 1000 :
        unit === 'minute' ? diff / (1000 * 60) :
          unit === 'hour' ? diff / (1000 * 60 * 60) :
            unit === 'day' ? diff / (1000 * 60 * 60 * 24) :
              unit === 'week' ? diff / (1000 * 60 * 60 * 24 * 7) :
                unit === 'month' ? diff / (1000 * 60 * 60 * 24 * 30) :
                  diff / (1000 * 60 * 60 * 24 * 365);
      return new Intl.RelativeTimeFormat(locale, options as any).format(Math.round(value), unit);
    },
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, options).format(value),
    formatPlural: (value: number, options?: Intl.PluralRulesOptions) =>
      new Intl.PluralRules(locale, options).select(value),
  }), [locale, messages])
  return intl;
}

function useLocale(id: TextKey): string;
function useLocale(): (id: TextKey) => string;

function useLocale(id?: TextKey): string | ((id: TextKey) => string) {
  const intl = useIntl();
  const $ = (id: TextKey) => (intl.formatMessage({ id }) || id);
  if (id) return $(id);
  return $;
}

export default useLocale;

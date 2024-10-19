import { TextKey } from "./type";
import { invoke } from "@public/utils";

export type localeSupported = "en_US" | "zh_CN" | (string & {});

async function loadLocale(lang?: localeSupported): Promise<{
  locale: localeSupported;
  messages: Record<TextKey, string>;
}> {
  let locale = lang || "en_US";
  let messages = await invoke('get_locale_messages', { locale });
  return { locale, messages: messages as Record<TextKey, string> };
}
export { loadLocale };

/**
 * 通用在线准星 API 请求模块
 *
 * 根据用户配置的接口地址和请求方式，获取准星列表。
 * 支持自定义请求头（硬编码值或从文件读取）。
 */
import { ResponseType } from '@tauri-apps/api/http';
import { readTextFile } from '@tauri-apps/api/fs';
import fetch from '@public/utils/fetch';
import { useConfigStore } from '@public/hooks/useConfig';
import type { OnlineCrosshairConfig } from '@public/config/defaults';

/** 在线准星项 */
export interface OnlineCrosshairItem {
  /** 准星文件名/显示名 */
  name: string;
  /** 图片可直接访问的 URL */
  url: string;
  /** 可选，文件大小 (bytes) */
  size?: number;
  /** 可选，最后修改时间 */
  lastModified?: string;
}

/** 预期的 API 响应格式 */
interface OnlineCrosshairResponse {
  list: OnlineCrosshairItem[];
}

/**
 * 组装请求头：合并用户配置的自定义 headers 和基础 headers。
 * 支持从文件路径读取 value（value_from_file 不为空时，读取文件内容替代 value 字段）。
 */
async function buildHeaders(
  config: OnlineCrosshairConfig
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  for (const h of config.headers) {
    if (!h.field) continue;

    if (h.value_type === "file" && h.value_from_file) {
      try {
        const fileContent = await readTextFile(h.value_from_file);
        headers[h.field] = fileContent.trim();
      } catch {
        console.warn(
          `[online-crosshair] Failed to read header value from file: ${h.value_from_file}, skipping header "${h.field}"`
        );
      }
    } else if (h.value_type === "inline" && h.value) {
      headers[h.field] = h.value;
    }
  }

  return headers;
}

/**
 * 根据用户配置获取在线准星列表。
 *
 * @returns 准星列表（请求失败或格式错误时返回空数组）
 */
export async function fetchOnlineCrosshairs(): Promise<OnlineCrosshairItem[]> {
  const config = useConfigStore.getState().config.online_crosshair;

  if (!config.api_url) {
    return [];
  }

  const headers = await buildHeaders(config);

  try {
    const options: Record<string, unknown> = {
      headers,
      responseType: ResponseType.JSON,
    };

    let response: { status: number; data: unknown };

    if (config.request_method === 'POST') {
      response = await fetch.post(config.api_url, undefined, options);
    } else {
      response = await fetch.get(config.api_url, options);
    }

    if (response.status !== 200) {
      console.warn(
        `[online-crosshair] API returned status ${response.status}`
      );
      return [];
    }

    const body = response.data as OnlineCrosshairResponse;

    if (!body || !Array.isArray(body.list)) {
      console.warn(
        '[online-crosshair] API response format invalid: expected { list: [...] }'
      );
      return [];
    }

    return body.list;
  } catch (error) {
    console.error('[online-crosshair] Failed to fetch crosshairs:', error);
    throw error;
  }
}

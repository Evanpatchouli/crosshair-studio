import { ResponseType } from '@tauri-apps/api/http';
import fetch from '@public/utils/fetch';
import { xmlToJson } from "@public/utils";
import cfg from "./cfg";
import { Authorize } from "./utils/index";

type Params = {
  word: string;
  start?: string;
  count: number;
  token?: string;
}

const list_v2_auth_v1 = async (params: Params) => {
  const timestamp = Date.now();
  const timeGMT = new Date(timestamp).toUTCString();
  const query = {
    "list-type": 2,
    delimiter: "",
    "prefix": `crosshair-studio/crosshairs/`,
    "start-after": params.start,
    "max-keys": params.count,
    "continuation-token": params.token,
  } as {
    "list-type": 2,
    "delimiter"?: string,
    "start-after"?: string,
    "continuation-token"?: string,
    "max-keys"?: number,
    "prefix"?: string,
    "encoding-type"?: "url",
    /** 指定是否在返回结果中包含owner信息 */
    "fetch-owner"?: boolean,
  };
  type QK = keyof typeof query;
  const qs = encodeURI(
    Object.keys(query).filter(key => query[key as QK] !== void 0).map((key) => `${key}=${query[key as QK]}`).join("&")
  );
  const sign = Authorize({
    uri: `/${cfg.oss.bucket}/`,
    method: 'GET',
    timestamp: timestamp,
    headers: {
      'x-oss-date': timeGMT,
    },
  });
  const res = await fetch.get(`http://${cfg.oss.host}/?${qs}`, {
    headers: {
      // GMT format
      'x-oss-date': timeGMT,
      "Authorization": sign,
    },
    timeout: 50,
    responseType: ResponseType.Text
  });
  if (res.status === 200) {
    const xml = res.data;
    const data = xmlToJson(xml);
    const NextContinuationToken = data.NextContinuationToken;
    const objects = data.Contents;
    const crosshairs = objects.map((item: any) => {
      const filename = item.Key.split("/").pop();
      // 保留 2 位小数
      const kbSize = (item.Size / 1024).toFixed(2);
      const localTime = new Date(item.LastModified).toLocaleString();
      return {
        name: filename,
        url: `http://${cfg.oss.host}/${item.Key}`,
        size: item.Size,
        lastModified: item.LastModified,
        desc: `Size: ${kbSize} KB Datetime: ${localTime}`,
      }
    }).filter((item: any) => item.name !== "");
    return {
      list: crosshairs,
      NextContinuationToken,
    };
  }
  return {
    list: [],
    NextContinuationToken: null,
  }
}


export type OSSImage = {
  name: string;
  url: string;
  size: number;
  lastModified: number;
  desc?: string;
};

const listCrosshairs = async (params: Params) => {
  return await list_v2_auth_v1(params) as {
    list: OSSImage[];
    NextContinuationToken: string | null;
  };
}

export default listCrosshairs;
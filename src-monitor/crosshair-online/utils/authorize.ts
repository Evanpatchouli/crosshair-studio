import CryptoJS from "crypto-js";
import cfg from "../cfg";

const HmacSHA1 = (key: string, message: string) => {
  return CryptoJS.HmacSHA1(message, key);
}

const base64 = (message: CryptoJS.lib.WordArray) => {
  return CryptoJS.enc.Base64.stringify(message);
}

type CanonicalRequestConstructOptions = {
  /**
   * HTTP请求方法，其中正斜线（`/`）不需要编码。
   */
  Verb: (string & {}) | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'TRACE' | 'CONNECT';
  ContentMD5?: string;
  ContentType?: string;
  /** format GMT */
  Date: string;
  Headers: {
    /** format: ISO8601
     * @example "20130524T000000Z"
     */
    "x-oss-date": string,
    [key: string]: string
  },
  Resources: string;
}

class CanonicalRequest {
  private verb: (string & {}) | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'TRACE' | 'CONNECT';
  private headers: { [key: string]: string };
  private contentMD5?: string;
  private contentType?: string;
  private date: string;
  private resources: string;

  constructor({
    Verb,
    ContentMD5,
    ContentType,
    Date,
    Headers,
    Resources,
  }: CanonicalRequestConstructOptions) {
    this.verb = Verb;
    this.contentMD5 = ContentMD5 || ""
    this.contentType = ContentType || ""
    this.date = Date;
    this.headers = Headers;
    this.resources = Resources;
  }
  toString() {
    const canonicalRequest = [
      this.verb,
      this.contentMD5,
      this.contentType,
      this.date,
      ...Object.keys(this.headers)
        .sort()
        .map((key) => `${key.toLowerCase()}:${this.headers[key].trim()}`),
      this.resources,
    ].join('\n');

    return canonicalRequest;
  }
}

type SignatureOptions = {
  uri: string;
  method: (string & {}) | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'TRACE' | 'CONNECT';
  headers: {
    /** format: ISO8601
     * @example "20130524T000000Z"
     */
    "x-oss-date": string,
    [key: string]: string
  };
  timestamp: number;
}

function signature(options: SignatureOptions) {
  const timestamp = new Date(options.timestamp);
  // TimeGMT example: Sun, 06 Oct 2024 09:13:12 GMT
  const timeGMT = timestamp.toUTCString();
  const canonicalRequest = new CanonicalRequest({
    Verb: options.method,
    Date: timeGMT,
    Headers: {
      'x-oss-date': timeGMT,
    },
    Resources: options.uri,
  }).toString();
  const signingKey = cfg.oss.accessKeySecret;
  const Signature = base64(HmacSHA1(signingKey, canonicalRequest));
  return Signature;
}

export default function Authorize(options: SignatureOptions) {
  const Signature = signature(options);
  return `OSS ${cfg.oss.accessKeyId}:${Signature}`;
}
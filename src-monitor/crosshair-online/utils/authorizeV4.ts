import CryptoJS from "crypto-js";
import cfg from "../cfg";

const SHA246Hash = (message: string) => {
  return CryptoJS.SHA256(message);
}

const HexSHA256Hash = (message: string) => {
  return SHA246Hash(message).toString(CryptoJS.enc.Hex);
}

const HmacSHA256 = (key: string, message: string) => {
  return CryptoJS.HmacSHA256(message, key);
}

const HexHmacSHA256 = (key: string, message: string) => {
  return HmacSHA256(message, key).toString(CryptoJS.enc.Hex);
}

type CanonicalRequestConstructOptions = {
  /**
   * HTTP请求方法，其中正斜线（`/`）不需要编码。
   */
  Verb: (string & {}) | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'TRACE' | 'CONNECT';
  /**
   * URI进行UrIEncode后的字符串
   * 
   * - 如果URL中不包含QueryString，则从正斜线（/）开始到URL末尾。
   * - 如果URL中包含QueryString，则从正斜线（/）开始到问号（？）结束
   * 
   * @example "/examplebucket/"
   */
  URI: string,
  /**
   * 针对QueryString执行UrIEncode后的字符串，单独对key和value进行编码。
   */
  QueryString: string,
  Headers: {
    /** format: ISO8601
     * @example "20130524T000000Z"
     */
    "x-oss-date": string,
    "x-oss-content-sha256": "UNSIGNED-PAYLOAD",
    [key: string]: string
  },
  /** 如果存在则加入签名的 AdditionalHeaders 包括：
   * - Content-Type
   * - Content-MD5
   * - x-oss-*
   */
  AdditionalHeaders: {
    host: string,
    [key: string]: string
  },
  /**
   * Only supports `"UNSIGNED-PAYLOAD"` now.
   */
  Payload?: string,
}

class CanonicalRequest {
  private verb: (string & {}) | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'TRACE' | 'CONNECT';
  private uri: string;
  private queryString: string;
  private headers: { [key: string]: string };
  private additionalHeaders: { [key: string]: string };
  private payload: string;

  constructor({
    Verb,
    URI,
    QueryString,
    Headers,
    AdditionalHeaders,
    Payload,
  }: CanonicalRequestConstructOptions) {
    this.verb = Verb;
    this.uri = URI;
    this.queryString = QueryString;
    this.headers = Headers;
    this.additionalHeaders = AdditionalHeaders;
    this.payload = Payload || "UNSIGNED-PAYLOAD";
  }
  toString() {
    const canonicalRequest = [
      this.verb,
      this.uri,
      this.queryString,
      ...Object.keys(this.headers)
        .sort()
        .map((key) => `${key.toLowerCase()}:${this.headers[key].trim()}`),
      ...Object.keys(this.additionalHeaders)
        .sort()
        .map((key) => `${key.toLowerCase()}:${this.additionalHeaders[key.trim()]}`),
      this.payload,
    ].join('\n');

    return canonicalRequest;
  }
}

class StringToSign {
  private signatureMethod: 'OSS4-HMAC-SHA256' = "OSS4-HMAC-SHA256";
  private timestamp: string;
  private scope: string;
  private canonicalRequest: string;

  constructor(
    /** format: ISO8601
     * @example 20231203T121212Z
     */
    timestamp: string,
    /** <SigningDate>/<SigningRegion>/oss/aliyun_v4_request */
    scope: string,
    canonicalRequest: string) {
    this.timestamp = timestamp;
    this.scope = scope;
    this.canonicalRequest = canonicalRequest;
  }

  toString() {
    return [
      this.signatureMethod,
      this.timestamp,
      this.scope,
      // Hex(SHA256Hash(<CanonicalRequest>))
      HexSHA256Hash(this.canonicalRequest),
    ].join('\n');
  }
}

class Scope {
  private date: string;
  private region: string;
  private service: 'oss' = 'oss';
  private requestVersion = 'aliyun_v4_request';
  private scope = "";
  constructor(date: string, region: string) {
    this.date = date;
    this.region = region;
    this.scope = `${this.date}/${this.region}/${this.service}/${this.requestVersion}`;
  }
  toString() {
    return this.scope;
  }
}

class SigningKey {
  private accessKey: string;
  /** format: ISO8601
   * @example "20231203"
   */
  private date: string;
  private region: string;

  private DateKey: string;
  private DateRegionKey: string;
  private DateRegionServiceKey: string;

  constructor(accessKey: string, date: string, region: string) {
    this.accessKey = accessKey;
    this.date = date;
    this.region = region;
    this.DateKey = HmacSHA256(`aliyun_v4${this.accessKey}`, this.date).toString();
    this.DateRegionKey = HmacSHA256(this.DateKey, this.region).toString();
    this.DateRegionServiceKey = HmacSHA256(this.DateRegionKey, 'oss').toString();
  }

  toString() {
    return HmacSHA256(this.DateRegionServiceKey, 'aliyun_v4_request').toString();
  }
}

type SignatureOptions = {
  uri: string;
  method: (string & {}) | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'TRACE' | 'CONNECT';
  qs: string;
  additionalHeaders: {
    host: string,
    [key: string]: string
  };
  timestamp: number;
}

function signature(options: SignatureOptions) {
  const timestamp = new Date(options.timestamp);
  // ISO8601 example: 20231203T121212Z
  const timeISO = timestamp.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const signingDate = timeISO.slice(0, 8);
  const canonicalRequest = new CanonicalRequest({
    Verb: options.method,
    URI: options.uri,
    QueryString: encodeURI(options.qs),
    Headers: {
      'x-oss-content-sha256': 'UNSIGNED-PAYLOAD',
      'x-oss-date': timeISO,
    },
    AdditionalHeaders: options.additionalHeaders,
    Payload: 'UNSIGNED-PAYLOAD',
  }).toString();

  const signingRegion = cfg.oss.region;
  const scope = new Scope(signingDate, signingRegion).toString();
  const stringToSign = new StringToSign(timeISO, scope, canonicalRequest).toString();
  const signingKey = new SigningKey(cfg.oss.accessKeySecret, signingDate, signingRegion).toString();
  const Signature = HexHmacSHA256(signingKey, stringToSign);
  return Signature;
}

export default function Authorize(options: SignatureOptions) {
  const Signature = signature(options);
  const timestamp = new Date(options.timestamp);
  // ISO8601 example: 20231203T121212Z
  const timeISO = timestamp.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const signingDate = timeISO.slice(0, 8);
  const scope = new Scope(signingDate, cfg.oss.region).toString();
  const additionalHeaderKeys = Object.keys(options.additionalHeaders).map((key) => key.toLowerCase()).join(';');
  return `OSS4-HMAC-SHA256 Credential=${cfg.oss.accessKeyId}/${scope}, AdditionalHeaders=${additionalHeaderKeys}, Signature=${Signature}`;
}
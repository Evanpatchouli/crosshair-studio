import CryptoJS from "crypto-js";
import { oss } from "../../package.json";

const state = {
  first: false,
}

const decryptOss = (crypted: string) => {
  const bytes = CryptoJS.AES.decrypt(crypted, 'crosshair-studio-oss');
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  const parsed = JSON.parse(decrypted);
  return parsed;
};

const cfg = {
  oss: {} as {
    accessKeyId: string,
    accessKeySecret: string,
    bucket: string,
    host: string,
    region: string,
  }
};

if (!state.first) {
  state.first = true;
  Object.assign(cfg.oss, decryptOss(oss));
}

export default cfg;
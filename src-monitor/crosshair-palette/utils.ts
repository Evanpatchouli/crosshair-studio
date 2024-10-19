type CS2Cfg = {
  color: string;
  opacity: number;
  lineWidth: number;
  lineLength: number;
  lineGap: number;
  showOutline: boolean;
  showCenterDot: boolean;
  tShape: boolean;
}

export function convertToCS2(cfg: CS2Cfg) {
  const hex = cfg.color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const cs2_template = `
cl_crosshaircolor_r ${r};
cl_crosshaircolor_g ${g};
cl_crosshaircolor_b ${b};
cl_crosshairusealpha 1;
cl_crosshairalpha ${cfg.opacity};
cl_crosshairthickness ${cfg.lineWidth};
cl_crosshairsize ${cfg.lineLength};
cl_crosshairgap_useweaponvalue 1;
cl_crosshairgap ${cfg.lineGap};
cl_crosshair_drawoutline ${cfg.showOutline ? 1 : 0};
cl_crosshair_outlinethickness 1;
cl_crosshairdot ${cfg.showCenterDot ? 1 : 0};
cl_crosshair_t ${cfg.tShape ? 1 : 0};
`
  return cs2_template;
}

interface ValorantCfg { }

export function convertToValorant(cfg: ValorantCfg) {
  return JSON.stringify(cfg);
}
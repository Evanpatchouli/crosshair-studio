import { Box, Button, Divider, Tooltip } from "@mui/material";
import { Add, HourglassEmpty } from "@mui/icons-material";
import * as TauriPluginShare from "@public/plugins/tauri-plugin-share";
import SchemeItem from "./scheme-item";
import { Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { schemes } from "@public/store";
import Model from "@public/model";
import useLocale from "@public/hooks/uselocale";
import { TextKey } from "@public/locale/type";

const { useShare } = TauriPluginShare;

export default function CrosshairScheme() {
  const $ = useLocale();
  const [crosshair_schemes, set_crosshair_schemes] = useShare<ICrosshairScheme[]>("crosshair-schemes", [], {
    register_if_not_exists: false,
  });
  const [schemesCards, setSchemesCards] = useState<
    (ICrosshairScheme & {
      defaultExpanded?: boolean;
    })[]
  >(crosshair_schemes);

  useEffect(() => {
    setSchemesCards((prev) => {
      return crosshair_schemes.map((scheme) => ({
        ...scheme,
        defaultExpanded: prev.some((s) => s.id === scheme.id)
          ? prev.find((s) => s.id === scheme.id)!.defaultExpanded
          : false,
      }));
    });
  }, [crosshair_schemes]);

  const createScheme = async () => {
    const newone = new Model.CrosshairScheme({
      name: "New Scheme",
      crosshair: "",
      desc: "",
      width: 200,
      height: 200,
      lockRatio: true,
      canvasSize: 200,
      canvasShape: "rect" as "rect" | "circle",
      enableInvertFilter: false,
    });

    await schemes.add(newone);
    const list = await schemes.all();
    set_crosshair_schemes(list);
    setSchemesCards((prev) => [
      ...prev,
      {
        ...newone,
        defaultExpanded: true,
      },
    ]);
  };

  return (
    <>
      <h2>{$("Crosshair Scheme")}</h2>
      <Box sx={{ width: "100%", height: "100%", padding: "1rem", boxSizing: "border-box" }}>
        {schemesCards.length !== 0 ? (
          schemesCards.map((scheme) => (
            <Fragment key={scheme.id}>
              <SchemeItem scheme={scheme} defaultExpanded={scheme.defaultExpanded} />
              <Divider />
            </Fragment>
          ))
        ) : (
          <Empty $={$} />
        )}
        <Tooltip title={$("New Scheme")}>
          <Button
            variant="contained"
            onClick={createScheme}
            style={{
              position: "fixed",
              right: 16,
              bottom: 16,
              borderRadius: "50%",
              padding: 0,
              width: 56,
              minWidth: "unset",
              height: 56,
            }}
          >
            <Add />
          </Button>
        </Tooltip>
      </Box>
    </>
  );
}

function Empty({ $ }: { $: (key: TextKey) => string }) {
  return (
    <Box width="100%" height="100%" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <HourglassEmpty sx={{ color: "text.secondary" }} />
      <Box sx={{ mt: 1, color: "text.secondary" }}>{$("No crosshair scheme yet, create one")}</Box>
    </Box>
  );
}

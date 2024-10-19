import { Radio } from "@mui/material";
import Flex from "@public/components/Flex";
import Label from "@public/components/Lable";
import useLocale from "@public/hooks/uselocale";
import useLocalStorage from "@public/hooks/useLocalStorage";

export default function CrosshairBgSelector() {
  const $ = useLocale();
  const [selectedValue, setSelectedValue] = useLocalStorage<"grey" | "grid">("img_bg_type", "grey");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value as any);
  };
  return (
    <Flex>
      <Label>{$("Grey")}</Label>
      <Radio
        name="background of crosshairs in monitor"
        checked={selectedValue === "grey"}
        onChange={handleChange}
        value="grey"
        inputProps={{ "aria-label": "grey" }}
      />
      <Label>{$("Grid")}</Label>
      <Radio
        name="background of crosshairs in monitor"
        checked={selectedValue === "grid"}
        onChange={handleChange}
        value="grid"
        inputProps={{ "aria-label": "grid" }}
      />
    </Flex>
  );
}

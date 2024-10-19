import * as React from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import useLocalStorage from "@public/hooks/useLocalStorage";
import { Hintable } from "@evanpatchouli/react-hooks-kit/dist/typings";
import { invoke } from "@public/utils";

export default function LocaleSelector() {
  const [locale, setLocale] = useLocalStorage<Hintable<"zh_CN" | "en_US">>("locale", "zh_CN");
  const [options, setOptions] = React.useState<
    Array<{
      label: string;
      value: string;
    }>
  >([]);

  React.useEffect(() => {
    invoke("get_locales").then((locales) => {
      const localizedOptions = Object.keys(locales).map((key) => ({
        label: locales[key],
        value: key,
      }));
      console.log(localizedOptions);
      setOptions(localizedOptions);
    });
  }, []);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selected, setSelected] = React.useState(locale);

  const handleClick = () => {
    console.info(`You clicked ${selected}`);
  };

  const handleMenuItemClick = (_event: React.MouseEvent<HTMLLIElement, MouseEvent>, value: string) => {
    setSelected(value);
    setLocale(value);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <React.Fragment>
      <ButtonGroup variant="contained" ref={anchorRef} aria-label="Button group with a nested menu" size="small">
        <Button onClick={handleClick}>{options.find((i) => i.value === selected)?.label}</Button>
        <Button
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper sx={{ zIndex: 1 }} open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option) => (
                    <MenuItem
                      key={option.value}
                      selected={selected === option.value}
                      onClick={(event) => handleMenuItemClick(event, option.value)}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}

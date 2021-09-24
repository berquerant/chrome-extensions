import React, { useState } from "react";
import Fade from "react-bootstrap/Fade";
import ReactTooltip from "react-bootstrap/Tooltip";
import { Placement } from "react-bootstrap/Overlay";

/** Fading tooltip. */
export function Tooltip(props: {
  id: string;
  button: JSX.Element;
  content: string;
  onClick?: () => void;
  timeout?: number;
  delay?: number;
  placement?: Placement;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const timeout = props.timeout || 300;
  const delay = props.delay || 500;
  const onClick = () => {
    if (props.onClick) {
      props.onClick();
    }
    setOpen(true);
    setTimeout(() => setOpen(false), delay);
  };
  const button = <div onClick={onClick}>{props.button}</div>;
  const tip = (
    <ReactTooltip
      id={`${props.id}-tooltip`}
      placement={props.placement || "right"}
    >
      {props.content}
    </ReactTooltip>
  );
  return (
    <>
      {button}
      <Fade in={open} timeout={timeout}>
        {tip}
      </Fade>
    </>
  );
}

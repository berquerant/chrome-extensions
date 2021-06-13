import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ReactPopover from "react-bootstrap/Popover";
import Button from "react-bootstrap/Button";

/**
 * Limited popover wrapper.
 * Only content of popover and toggle button.
 */
export function Popover(props: { id: string; content: JSX.Element }) {
  const po = (
    <ReactPopover id={props.id}>
      <ReactPopover.Content>{props.content}</ReactPopover.Content>
    </ReactPopover>
  );
  return (
    <OverlayTrigger trigger="click" placement="auto" overlay={po}>
      <Button variant="success">Settings</Button>
    </OverlayTrigger>
  );
}

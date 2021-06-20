import React, { useEffect } from "react";
import "bootstrap-datepicker";
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

/**
 * Visual date picker wrapper.
 * With clear button.
 */
export function DatePicker(props: { id: string; className?: string }) {
  return (
    <input
      id={props.id}
      className={props.className || ""}
      data-provide="datepicker"
      data-date-format="yyyy-mm-dd"
      data-date-clear-btn
    />
  );
}

/**
 * Creates selections from a dictionary.
 * A key is a text, a value is a value of an option.
 * @param props `id` is id of select
 * @param className class name of select
 */
export function SelectItems<T>(props: {
  id: string;
  items: { [key: string]: T };
  className?: string;
}) {
  const options = Object.entries(props.items).map(([k, v]) => (
    <option key={k} value={String(v)}>
      {k}
    </option>
  ));
  return (
    <select id={props.id} key={props.id} className={props.className || ""}>
      {options}
    </select>
  );
}

/** Minimal bootstrap danger alert. */
export function Alert(props: {
  id: string;
  message: JSX.Element;
  onClose: () => void;
}) {
  // add listener after rendering
  useEffect(() => {
    document
      .getElementById(props.id)
      .addEventListener("close.bs.alert", props.onClose);
  });
  return (
    <div
      id={props.id}
      className="alert alert-danger alert-dismissible fade show popup-alert"
      role="alert"
    >
      {props.message}
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      />
    </div>
  );
}

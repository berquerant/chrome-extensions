import React, { useEffect, useState } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ReactPopover from "react-bootstrap/Popover";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Fade from "react-bootstrap/Fade";
import Tooltip from "react-bootstrap/Tooltip";
import { Placement } from "react-bootstrap/Overlay";
import { None, Some } from "./Function";
import "bootstrap-datepicker";
import $ from "jquery";
import * as Time from "../common/Time";

/**
 * Fade out effect wrapper.
 * The content is shown if clicked, after a while, it is faded out.
 * @param timeout Duration of the fade animation in milliseconds, default is 300
 * @param delay Duration until fading in milliseconds, default is 500
 */
export function FadeOut(props: {
  button: JSX.Element;
  content: JSX.Element;
  onClick?: () => void;
  timeout?: number;
  delay?: number;
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
  return (
    <>
      {button}
      <Fade in={open} timeout={timeout}>
        {props.content}
      </Fade>
    </>
  );
}

/**
 * Fading out tooltip.
 */
export function FadeOutTooltip(props: {
  id: string;
  button: JSX.Element;
  content: string;
  onClick?: () => void;
  timeout?: number;
  delay?: number;
  placement?: Placement;
}): JSX.Element {
  const tip = (
    <Tooltip id={`${props.id}-tooltip`} placement={props.placement || "right"}>
      {props.content}
    </Tooltip>
  );
  return (
    <FadeOut
      button={props.button}
      content={tip}
      onClick={props.onClick}
      timeout={props.timeout}
      delay={props.delay}
    />
  );
}

/**
 * Limited popover wrapper.
 * Only content of popover and toggle button.
 */
export function Popover(props: {
  id: string;
  content: JSX.Element;
}): JSX.Element {
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
export function DatePicker(props: {
  id: string;
  className?: string;
  onChange?: (value: string) => void;
  value?: string;
  orientation?: DatepickerOrientations;
}): JSX.Element {
  const id = `#${props.id}`;
  const jq = $(id).datepicker({
    clearBtn: true,
    format: "yyyy-mm-dd",
    todayHighlight: true,
    orientation: props.orientation || "auto",
  });
  $(id).datepicker("update", props.value || "");
  if (props.onChange) {
    useEffect(() => {
      jq.on("changeDate", (e) => {
        const d = e.date;
        props.onChange(d ? `${Time.dateToTimestring(d)}` : "");
      });
    });
  }
  return <input id={props.id} className={props.className || ""} />;
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
  onChange?: (value: string) => void;
  value?: T;
}): JSX.Element {
  const options = Object.entries(props.items).map(([k, v]) => (
    <option key={k} value={String(v)}>
      {k}
    </option>
  ));
  return (
    <select
      id={props.id}
      key={props.id}
      className={props.className || ""}
      onChange={(e) => {
        if (props.onChange) {
          props.onChange(e.currentTarget.value);
        }
      }}
      value={props.value ? String(props.value) : ""}
    >
      {options}
    </select>
  );
}

/** Minimal bootstrap danger alert. */
export function Alert(props: {
  id: string;
  message: JSX.Element;
  onClose?: () => void;
}): JSX.Element {
  if (props.onClose) {
    // add listener after rendering
    useEffect(() => {
      document
        .getElementById(props.id)
        .addEventListener("close.bs.alert", props.onClose);
    });
  }
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

/**
 * Modal template for popup.
 * @param triggerTitle title of modal trigger button
 * @param triggerStyle style of modal trigger button
 * @param title title of modal
 * @param body body of modal
 * @param footer footer of modal
 * @param disabled disable modal trigger button if true
 * @param onClose hook on close of modal
 */
export function LightModal(props: {
  id: string;
  triggerTitle: string;
  triggerStyle?: string;
  title?: string;
  body?: JSX.Element;
  footer?: JSX.Element;
  disabled?: boolean;
  onClose?: () => void;
}): JSX.Element {
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    if (props.onClose) {
      props.onClose();
    }
  };
  const handleShow = () => setShow(true);
  const disabled = props.disabled !== undefined && props.disabled;
  const triggerVariant = props.triggerStyle || "primary";
  const triggerButton = (
    <Button variant={triggerVariant} onClick={handleShow} disabled={disabled}>
      {props.triggerTitle}
    </Button>
  );
  const modalHeader =
    props.title !== undefined
      ? Some(
          <Modal.Header closeButton>
            <Modal.Title>{props.title}</Modal.Title>
          </Modal.Header>
        )
      : None;
  const modalBody =
    props.body !== undefined
      ? Some(<Modal.Body>{props.body}</Modal.Body>)
      : None;
  const modalFooter = (
    <Modal.Footer>{props.footer !== undefined && props.footer}</Modal.Footer>
  );
  const modal = (
    <Modal id={props.id} show={show} onHide={handleClose} animation scrollable>
      {modalHeader.ok && modalHeader.value}
      {modalBody.ok && modalBody.value}
      {modalFooter}
    </Modal>
  );
  return (
    <>
      {triggerButton}
      {modal}
    </>
  );
}

/**
 * Modal template to display error.
 * @param triggerTitle title of modal trigger button
 * @param error error to display
 * @param onClose hook on close modal
 */
export function ErrorModal(props: {
  triggerTitle: string;
  error: Error;
  onClose?: () => void;
}): JSX.Element {
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    if (props.onClose) {
      props.onClose();
    }
  };
  const handleShow = () => setShow(true);
  const triggerButton = (
    <Button onClick={handleShow}>{props.triggerTitle}</Button>
  );
  const okButton = <Button onClick={handleClose}>OK</Button>;
  const modal = (
    <Modal show={show} onHide={handleClose} animation scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{props.error.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="error-modal-body-container container">
          <div className="row">
            <div className="col">{props.error.message}</div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="error-modal-footer-container container">
          <div className="row">
            <div className="col">{okButton}</div>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
  return (
    <>
      {triggerButton}
      {modal}
    </>
  );
}

/**
 * Modal to confirm.
 * @param title title of modal
 * @param triggerTitle title of modal trigger button
 * @param triggerStyle style of modal trigger button
 * @param okTitle title of ok button
 * @param okStyle style of ok button
 * @param cancelTitle title of cancel button
 * @param cancelStyle style of cancel button
 * @param onOk hook on ok button click
 * @param onCancel hook on cancel button click
 * @param withoutCancel no cancel button if true
 */
export function ConfirmModal(props: {
  title: string;
  triggerTitle: string;
  triggerStyle?: string;
  okTitle?: string;
  okStyle?: string;
  cancelTitle?: string;
  cancelStyle?: string;
  onOk?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  withoutCancel?: boolean;
}): JSX.Element {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const disabled = props.disabled !== undefined && props.disabled;
  const triggerVariant = props.triggerStyle || "primary";
  const triggerButton = (
    <Button variant={triggerVariant} onClick={handleShow} disabled={disabled}>
      {props.triggerTitle}
    </Button>
  );

  const okTitle = props.okTitle || "OK";
  const okStyle = props.okStyle || "success";
  const onOkClick = () => {
    if (props.onOk) {
      props.onOk();
    }
    handleClose();
  };
  const okButton = (
    <Button variant={okStyle} onClick={onOkClick} className="col-4">
      {okTitle}
    </Button>
  );

  const withoutCancel =
    props.withoutCancel !== undefined && props.withoutCancel;
  const cancelTitle = props.cancelTitle || "Cancel";
  const cancelStyle = props.cancelStyle || "secondary";
  const onCancelClick = () => {
    if (props.onCancel) {
      props.onCancel();
    }
    handleClose();
  };
  const cancelButton = withoutCancel
    ? None
    : Some(
        <Button variant={cancelStyle} onClick={onCancelClick} className="col-4">
          {cancelTitle}
        </Button>
      );

  const modalHeader = (
    <Modal.Header closeButton>
      <Modal.Title>{props.title}</Modal.Title>
    </Modal.Header>
  );
  const modalBody = (
    <Modal.Body>
      <div className="confirm-modal-body-container container">
        <div className="row justify-content-evenly">
          {okButton}
          {cancelButton.ok && cancelButton.value}
        </div>
      </div>
    </Modal.Body>
  );
  const modal = (
    <Modal show={show} onHide={handleClose} animation>
      {modalHeader}
      {modalBody}
    </Modal>
  );
  return (
    <>
      {triggerButton}
      {modal}
    </>
  );
}

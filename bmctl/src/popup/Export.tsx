import React from "react";
import * as BCommon from "@/bookmarks/Common";
import * as CommonComponent from "@/common/Component";

/** Export search result as a json. */
export function ExportModal(props: {
  id: string;
  items: BCommon.INodeList;
}): JSX.Element {
  const disabled = props.items.length == 0;
  const json = JSON.stringify(props.items, null, 2);
  const contentId = "data-modal-export-modal-textarea";
  const content = (
    <textarea
      id={contentId}
      className="data-modal-export-modal-textarea"
      value={json}
      rows={20}
      readOnly
    />
  );
  const onCopyButtonClick = () => {
    // copy to clipboard
    const t = document.getElementById(contentId) as HTMLTextAreaElement;
    t.select();
    document.execCommand("copy");
  };
  const body = (
    <div className="container-fluid">
      <div className="row">
        <div className="col">{content}</div>
      </div>
    </div>
  );
  const copyButton = (
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => onCopyButtonClick()}
    >
      Copy
    </button>
  );
  const footer = (
    <div className="container-fluid">
      <div className="row">
        <div className="col data-modal-export-modal-copy-button">
          {copyButton}
        </div>
      </div>
    </div>
  );
  return (
    <CommonComponent.LightModal
      id={props.id}
      triggerTitle="Export"
      title="Export Items"
      body={body}
      footer={footer}
      disabled={disabled}
    />
  );
}

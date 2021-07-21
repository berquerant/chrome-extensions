import React from "react";
import * as CommonComponent from "../common/Component";
import * as BCommon from "../bookmarks/Common";
import * as Write from "../bookmarks/Write";
import { ISet, newISet } from "../collections/Set";
import { CheckItem } from "./Item";
import { ExportModal } from "./Export";
import { ImportModal } from "./Import";

export interface IDataModalProps {
  id: string;
  /** data source */
  items: BCommon.INodeList;
  /** title of modal */
  title: string;
  /** title of modal trigger button */
  triggerTitle: string;
  /** hook on modal close */
  onClose?: () => void;
  remover: Write.IRemover;
  creator: Write.ICreator;
  folders: BCommon.INodeList;
}

interface IDataModalState {
  /** target of operation */
  target: ISet<BCommon.NodeId>;
}

/** Modal for data operation. */
export class DataModal extends React.Component<
  IDataModalProps,
  IDataModalState
> {
  constructor(props: IDataModalProps) {
    super(props);
    this.state = {
      target: newISet(),
    };
  }
  private genHandleItemOnChange(itemId: string): (checked: boolean) => void {
    return (checked: boolean) => {
      const t = this.state.target.clone();
      if (checked) {
        t.add(itemId);
      } else {
        t.delete(itemId);
      }
      this.setState({
        target: t,
      });
    };
  }
  private handleAllCheckAction(checked: boolean): void {
    const t = newISet<BCommon.NodeId>();
    if (checked) {
      this.props.items.forEach((x) => {
        t.add(x.id);
      });
    }
    this.setState({
      target: t,
    });
  }
  private handleDeleteAction(): void {
    Array.from(this.state.target.values()).forEach((x) => {
      this.props.remover.remove(x);
    });
    this.closeThisModal();
  }
  private handleOnClose(): void {
    // reset target
    this.setState({
      target: newISet(),
    });
    if (this.props.onClose) {
      this.props.onClose();
    }
  }
  private closeThisModal(): void {
    // get close button on modal header (x)
    const modal = document.getElementById(this.props.id);
    const closeButton = modal.getElementsByClassName(
      "close"
    )[0] as HTMLButtonElement;
    // close parent modal
    closeButton.click();
  }
  render(): JSX.Element {
    // items with checkbox
    const items = this.props.items.map((x) => {
      const checked = this.state.target.has(x.id);
      const onChange = this.genHandleItemOnChange(x.id);
      const id = `data-modal-checkbox-${x.id}`;
      return (
        <CheckItem
          key={id}
          id={id}
          item={x}
          checked={checked}
          onChange={(c) => onChange(c)}
        />
      );
    });
    const body = <div>{items}</div>;
    // label to display number of items
    const counter = (
      <label>
        {this.state.target.size()} / {this.props.items.length} selected
      </label>
    );
    // button to check all items
    const allButton = (
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => this.handleAllCheckAction(true)}
      >
        All
      </button>
    );
    // button to uncheck all items
    const clearButton = (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => this.handleAllCheckAction(false)}
      >
        Clear
      </button>
    );
    // button to delete items
    // disable if no targets
    const deleteButton = (
      <CommonComponent.ConfirmModal
        title="Are you sure?"
        triggerTitle="Delete"
        triggerStyle="danger"
        okTitle="Delete"
        okStyle="danger"
        onOk={() => this.handleDeleteAction()}
        disabled={this.state.target.size() == 0}
      />
    );
    // button to display items as json
    const exportButton = (
      <ExportModal
        id="data-modal-export-modal"
        items={this.props.items.filter((x) => this.state.target.has(x.id))}
      />
    );
    // button to import items
    const importButton = (
      <ImportModal
        id="data-modal-import-modal"
        folders={this.props.folders}
        creator={this.props.creator}
        onImportDone={() => this.closeThisModal()}
      />
    );
    const footer = (
      <div className="data-modal-footer container">
        <div className="data-modal-footer-buttons row">
          <div className="data-modal-footer-button-all col-2">{allButton}</div>
          <div className="data-modal-footer-button-clear col">
            {clearButton}
          </div>
          <div className="data-modal-footer-button-export col">
            {exportButton}
          </div>
          <div className="data-modal-footer-button-import col">
            {importButton}
          </div>
          <div className="data-modal-footer-button-delete col">
            {deleteButton}
          </div>
        </div>
        <div className="data-modal-footer-info row">{counter}</div>
      </div>
    );
    return (
      <CommonComponent.LightModal
        id={this.props.id}
        triggerTitle={this.props.triggerTitle}
        title={this.props.title}
        body={body}
        footer={footer}
        disabled={this.props.items.length == 0}
        onClose={() => this.handleOnClose()}
      />
    );
  }
}

import React from "react";
import * as BCommon from "../bookmarks/Common";
import * as Write from "../bookmarks/Write";
import * as CommonComponent from "../common/Component";
import {
  Option,
  Some,
  None,
  Result,
  Ok,
  Err,
  Try,
  asOptional,
} from "../common/Function";
import * as Item from "./Item";
import { BaseError } from "../common/Err";

/** Modal to display bookmarks. */
function DisplayItemsModal(props: {
  id: string;
  items: BCommon.INodeList;
}): JSX.Element {
  const disabled = props.items.length == 0;
  const items = <Item.ItemList items={props.items} />;
  const body = (
    <div className="display-items-modal-body container-fluid">
      <div className="row">
        <div className="col">{items}</div>
      </div>
    </div>
  );
  return (
    <CommonComponent.LightModal
      id={props.id}
      triggerTitle="Show"
      title="Show Items"
      body={body}
      disabled={disabled}
    />
  );
}

function SelectFolders(props: {
  id: string;
  items: BCommon.INodeList;
  value?: BCommon.NodeId;
  onChange?: (v: string) => void;
}) {
  const d = props.items.reduce((acc, x) => {
    acc[x.info.title] = x.id;
    return acc;
  }, {} as { [key: string]: string });
  return (
    <CommonComponent.SelectItems
      id={props.id}
      items={d}
      value={props.value}
      onChange={props.onChange}
      className="data-import-modal-select-folders"
    />
  );
}

class NotImportableError extends BaseError {}

export interface IImportModalProps {
  id: string;
  creator: Write.ICreator;
  folders: BCommon.INodeList;
  onImportDone: () => void;
}

interface IImportModalState {
  content: string;
  targetFolder?: BCommon.NodeId;
}

/** Modal to import bookmarks. */
export class ImportModal extends React.Component<
  IImportModalProps,
  IImportModalState
> {
  constructor(props: IImportModalProps) {
    super(props);
    this.state = {
      content: "",
      targetFolder: asOptional(this.getDefaultFolder()),
    };
  }
  private closeThisModal(): void {
    const modal = document.getElementById(this.props.id);
    // get close button on modal header (x)
    const closeButton = modal.getElementsByClassName(
      "close"
    )[0] as HTMLButtonElement;
    // close parent modal
    closeButton.click();
  }
  private getDefaultFolder(): Option<BCommon.NodeId> {
    if (this.props.folders.length == 0) {
      return None;
    }
    return Some(this.props.folders[0].id);
  }
  private handleFolderChange(f: string) {
    this.setState({
      targetFolder: f,
    });
  }
  private showItemsModal() {
    const items = this.parse();
    return (
      <DisplayItemsModal
        items={items.ok ? items.value : []}
        id="data-import-modal-show-items"
      />
    );
  }
  private importItems(items: BCommon.INodeList) {
    items
      .map((x) => {
        return {
          parentId: this.state.targetFolder,
          title: x.info.title,
          url: x.info.url,
        };
      })
      .forEach((x, i) => {
        try {
          this.props.creator.create(x);
        } catch (e) {
          throw new NotImportableError(
            `${e} at element[${i}] = ${JSON.stringify(x)}`
          );
        }
      });
  }
  private importItemsModal() {
    const alertModal = (e: Error) => (
      <CommonComponent.ErrorModal triggerTitle="Import" error={e} />
    );
    const v = this.parse();
    if (!v.ok) {
      return alertModal(v.value as Error);
    }
    const f = Try(
      () => this.props.folders.filter((x) => x.id == this.state.targetFolder)[0]
    );
    if (!(f.ok && f.value)) {
      return alertModal(new NotImportableError("No target folder"));
    }
    const title = `Import ${v.value.length} items into ${f.value.info.title}?`;
    const disabled =
      v.value.length == 0 ||
      this.state.targetFolder === undefined ||
      this.state.targetFolder == "";
    return (
      <CommonComponent.ConfirmModal
        title={title}
        triggerTitle="Import"
        okTitle="Import"
        onOk={() => {
          this.importItems(v.value);
          this.closeThisModal();
        }}
        disabled={disabled}
      />
    );
  }
  private parse(): Result<BCommon.INodeList> {
    try {
      const v = JSON.parse(this.state.content);
      if (BCommon.isINodeList(v)) {
        return Ok(v);
      }
      return Err(new NotImportableError("not node list"));
    } catch (e) {
      return Err(new NotImportableError(e));
    }
  }
  render(): JSX.Element {
    // accept bookmarks as json
    const content = (
      <textarea
        className="data-import-modal-textarea"
        rows={20}
        value={this.state.content}
        onChange={(e) => {
          this.setState({
            content: e.currentTarget.value,
          });
        }}
      />
    );
    const body = (
      <div className="container-fluid">
        <div className="row">
          <div className="col">{content}</div>
        </div>
      </div>
    );
    // FIXME: sync displayed folder and selected folder immediately
    // selected folder is displayed after next rendering
    const selectFolders = (
      <SelectFolders
        id="data-import-modal-select-folder"
        items={this.props.folders}
        value={this.state.targetFolder}
        onChange={(v) => this.handleFolderChange(v)}
      />
    );
    const footer = (
      <div className="data-import-modal-footer container-fluid">
        <div className="data-import-modal-footer-buttons row">
          <div className="data-import-modal-footer-select-folder col">
            {selectFolders}
          </div>
          <div className="data-import-modal-footer-show-items col">
            {this.showItemsModal()}
          </div>
          <div className="data-import-modal-footer-import-items col">
            {this.importItemsModal()}
          </div>
        </div>
      </div>
    );
    return (
      <CommonComponent.LightModal
        id={this.props.id}
        triggerTitle="Import"
        title="Import Items"
        body={body}
        footer={footer}
        onClose={() => {
          this.setState({
            targetFolder: asOptional(this.getDefaultFolder()),
          });
        }}
        disabled={this.props.folders.length == 0}
      />
    );
  }
}

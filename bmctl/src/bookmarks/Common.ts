import { Option, Some, None } from "@/common/Function";

/** The ID of [[INode]]. */
export type NodeId = string;

/** Info of a bookmark except [[NodeId]]. */
export interface INodeInfo {
  /** This Node is a folder if undefined. */
  readonly url?: string;
  readonly title: string;
  readonly dateAdded?: number;
}

export function isINodeInfo(x: any): x is INodeInfo {
  return (
    x &&
    x.title &&
    typeof x.title == "string" &&
    (!x.url || typeof x.url == "string") &&
    (!x.dateAdded || typeof x.dateAdded == "number")
  );
}

/** A flatten bookmark. */
export interface INode {
  readonly id: NodeId;
  readonly parentId?: NodeId;
  readonly info: INodeInfo;
}

export function isINode(x: any): x is INode {
  return (
    x &&
    x.id &&
    typeof x.id == "string" &&
    isINodeInfo(x.info) &&
    (!x.parentId || typeof x.parentId == "string")
  );
}

/** A request to create node. */
export interface ICreateNode {
  readonly parentId?: NodeId;
  readonly title: string;
  /** For folder if undefined. */
  readonly url?: string;
}

export type INodeList = Array<INode>;

export function isINodeList(x: any): x is INodeList {
  return x && Array.isArray(x) && Array.from(x).every((e) => isINode(e));
}

export function nodeListToMap(xs: INodeList): INodeMap {
  return xs.reduce((d, x) => {
    d.set(x);
    return d;
  }, newINodeMap());
}

/** A `Map<NodeId, INode>` wrapper. */
export interface INodeMap {
  get(id: NodeId): Option<INode>;
  set(node: INode): void;
  delete(id: NodeId): void;
  size(): number;
  values(): Iterator<INode> & Iterable<INode>;
}

export function newINodeMap(): INodeMap {
  return new NodeMap();
}

class NodeMap implements INodeMap {
  private d: Map<NodeId, INode>;
  constructor() {
    this.d = new Map();
  }
  get(id: NodeId): Option<INode> {
    const v = this.d.get(id);
    return v !== undefined ? Some(v) : None;
  }
  set(node: INode): void {
    this.d.set(node.id, node);
  }
  delete(id: NodeId): void {
    this.d.delete(id);
  }
  size(): number {
    return this.d.size;
  }
  values(): Iterator<INode> & Iterable<INode> {
    return this.d.values();
  }
}

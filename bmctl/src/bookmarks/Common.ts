/** The ID of [[INode]]. */
export type NodeId = string;

/** Info of a bookmark except [[NodeId]]. */
export interface INodeInfo {
  readonly url?: string;
  readonly title: string;
  readonly dateAdded?: number;
}

/** A flatten bookmark. */
export interface INode {
  readonly id: NodeId;
  readonly parentId?: NodeId;
  readonly info: INodeInfo;
}

export type INodeList = Array<INode>;

export function nodeListToMap(xs: INodeList): INodeMap {
  return xs.reduce((d, x) => {
    d.set(x);
    return d;
  }, newINodeMap());
}

/** A `Map<NodeId, INode>` wrapper. */
export interface INodeMap {
  get(id: NodeId): { ok: boolean; node?: INode };
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
  get(id: NodeId): { ok: boolean; node?: INode } {
    const v = this.d.get(id);
    if (v === undefined) {
      return { ok: false };
    }
    return { ok: true, node: v };
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

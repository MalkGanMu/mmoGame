import { NodeStatus } from "./enum";

 
export default abstract class BTNode {
    // _node: Node;
 
    // constructor(node?: Node) {
    //     this._node = node;
    // }
 
    private _status: NodeStatus = NodeStatus.Inactive;
 
    get status() {
        return this._status;
    }
 
    set status(newStatus) {
        this._status = newStatus;
    }
 
    // status:NodeStatus = NodeStatus.Inactive;

    run() {
        if (this.status === NodeStatus.Inactive) {
            this.onStart();
        }
 
        let nodeState = this.onUpdate();//具体业务逻辑
        if (nodeState !== NodeStatus.Running) {
            this.onEnd();
        }
 
        return nodeState;
    }
 
    onStart() {
        this.status = NodeStatus.Running;
    }
 
    onUpdate(): NodeStatus {
        return NodeStatus.Success;
    }
 
    onEnd() {
        this.status = NodeStatus.Inactive;
    }
}
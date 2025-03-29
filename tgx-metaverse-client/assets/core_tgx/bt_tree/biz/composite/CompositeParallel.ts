import { _decorator, Component, Node } from 'cc';
import BTComposite from '../../BTComposite';
import { NodeStatus } from '../../enum';
const { ccclass, property } = _decorator;

@ccclass('CompositeParallel')
export default class CompositeParallel extends BTComposite {
    executionStatus:Array<NodeStatus> = []

    get status() {
        let childrenComplete = true;
        for (let i = 0; i < this.executionStatus.length; i++) {
            if (this.executionStatus[i] === NodeStatus.Running) {
                childrenComplete = false;
            } else if (this.executionStatus[i] === NodeStatus.Failure) {
                return NodeStatus.Failure;
            }
        }
        return childrenComplete?NodeStatus.Success:NodeStatus.Running;
    }
 
    set status(_) {
    }

    onStart() {
        super.onStart();
        this.executionStatus = new Array(this.childrens.length);
        this.index = 0;
        for (let i = 0; i < this.executionStatus.length; i++) {
            this.executionStatus[i] = NodeStatus.Inactive;
        }
    }
    canExecute(): boolean {
        return this.index < this.childrens.length;
    }
    
    onChildExecuted(status: NodeStatus, index:number): void {
        this.executionStatus[index] = status;
    }

    onConditionalAbort(index: number){
        this.index = 0;
        for (let i = 0; i < this.executionStatus.length; i++) {
            this.executionStatus[i] = NodeStatus.Inactive;
        }
    }

    canRunParallelChildren() {
        return true
    }
    
    onChildStarted() {
        this.executionStatus[this.index] = NodeStatus.Running
        this.index++
    }
}



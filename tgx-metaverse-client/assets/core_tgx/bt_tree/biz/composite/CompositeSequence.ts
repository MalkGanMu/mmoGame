import { _decorator, Component, Node } from 'cc';
import BTComposite from '../../BTComposite';
import { NodeStatus } from '../../enum';
const { ccclass, property } = _decorator;

@ccclass('CompositeSequence')
export default class CompositeSequence extends BTComposite {
    
    onStart() {
        super.onStart();
        this.index = 0;
    }
    canExecute(): boolean {
        return this.index < this.childrens.length && this.status!== NodeStatus.Failure
    }
    
    onChildExecuted(status: NodeStatus, _:number): void {
        switch (status) {
            case NodeStatus.Success:
                this.index++;
                if (this.index >= this.childrens.length) {
                    this.status = NodeStatus.Success
                } else {
                    this.status = NodeStatus.Running
                }
                break;
            case NodeStatus.Failure:
                this.status = NodeStatus.Failure
                break;
            case NodeStatus.Running:
                this.status = NodeStatus.Running
                break;
            default:
                break
        }
    }

    onConditionalAbort(index: number){
        this.index = index;
        this.status = NodeStatus.Inactive;
    }
    // onUpdate() {
    //     if (this.status === NodeStatus.Failure) {
    //         return NodeStatus.Failure;
    //     }
    //     if (this.index >= this.childrens.length) {
    //         this.status = NodeStatus.Success;
    //         return NodeStatus.Success;
    //     }
    //     const child = this.childrens[this.index];
    //     const res = child.run();

    //     if (res === NodeStatus.Failure) {
    //         this.status = NodeStatus.Failure;
    //         return NodeStatus.Failure;
    //     }

    //     if (res === NodeStatus.Success) {
    //         this.index++;
    //     }

    //     return NodeStatus.Running;
    // }
}



import { _decorator, Component, Node } from 'cc';
import BTComposite from '../../BTComposite';
import { NodeStatus } from '../../enum';
const { ccclass, property } = _decorator;

@ccclass('CompositeRandomSelector')
export class CompositeRandomSelector extends BTComposite {
    executionOrder:Array<number> = [];

    get index(){
        return this.executionOrder[this.executionOrder.length - 1];
    }
    onStart() {
        super.onStart();
        this.shuffle();
    }

    shuffle() {
        this.executionOrder = [];
        const indexList = Array.from({length:this.childrens.length}, (e, i) => i);
        for (let i = indexList.length - 1; i >= 0; i--) {
            const randomIndex = Math.floor(Math.random() * indexList.length)
            this.executionOrder.push(indexList.splice(randomIndex, 1)[0]);
        }
    }
    canExecute(): boolean {
        return this.executionOrder.length && this.status!== NodeStatus.Success
    }
    onChildExecuted(status: NodeStatus, _:number): void {
        switch (status) {
            case NodeStatus.Success:
                this.status = NodeStatus.Success;
                break;
            case NodeStatus.Failure:
                this.executionOrder.pop();
                if (!this.executionOrder.length) {
                    this.status = NodeStatus.Failure;
                } else {
                    this.status = NodeStatus.Running;
                }
                break;
            case NodeStatus.Running:
                this.status = NodeStatus.Running;
                break;
            default:
                break;
        }
    }
    onConditionalAbort(index: number){
        this.status = NodeStatus.Inactive;
        this.shuffle();
    }
    // onUpdate() {
    //     if (this.status === NodeStatus.Success) {
    //         return NodeStatus.Success;
    //     }

    //     if (!this.executionOrder.length) {
    //         this.status = NodeStatus.Failure;
    //         return NodeStatus.Failure;
    //     }
    //     const child = this.childrens[this.index];
    //     const res = child.run();

    //     if (res === NodeStatus.Success) {
    //         this.status = NodeStatus.Success;
    //         return NodeStatus.Success;
    //     }

    //     if (res === NodeStatus.Failure) {
    //         this.executionOrder.pop();
    //     }

    //     return NodeStatus.Running;
    // }
}



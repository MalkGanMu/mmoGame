import { _decorator, Component, Node } from 'cc';
import { BTDecorator } from '../../BTDecorator';
import BTNode from '../../BTNode';
import { NodeStatus } from '../../enum';
const { ccclass, property } = _decorator;

@ccclass('DecoratorRepeater')
export class DecoratorRepeater extends BTDecorator {
    private repeatCount = Infinity
    private curCount = 0
    private endOnFailure = false

    constructor(childrens: Array<BTNode>, repeatCount = Infinity, endOnFailure = false){
        super(childrens);
        this.repeatCount = repeatCount;
        this.endOnFailure = endOnFailure;
    }

    canExecute(): boolean {
        return this.curCount < this.repeatCount && (!this.endOnFailure || (this.endOnFailure && this.status !== NodeStatus.Failure))
    }
    onChildExecuted(status: NodeStatus): void {
        this.curCount++;
        this.status = status;
    }

    onStart(){
        super.onStart();
        this.curCount = 0;
    }
}



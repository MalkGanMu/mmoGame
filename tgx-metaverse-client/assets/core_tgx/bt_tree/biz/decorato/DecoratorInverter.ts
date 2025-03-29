import { _decorator, Component, Node } from 'cc';
import { BTDecorator } from '../../BTDecorator';
import { NodeStatus } from '../../enum';
const { ccclass, property } = _decorator;

@ccclass('DecoratorInverter')
export class DecoratorInverter extends BTDecorator {
    canExecute(): boolean {
        return this.status === NodeStatus.Inactive || this.status === NodeStatus.Running;
    }
    onChildExecuted(status: NodeStatus): void {
        this.status = status;
    }

    decorate(status:NodeStatus){
        switch(status){
            case NodeStatus.Failure:
                return NodeStatus.Success;
            case NodeStatus.Success:
                return NodeStatus.Failure;
            default:
                return status;
        }
    }
}



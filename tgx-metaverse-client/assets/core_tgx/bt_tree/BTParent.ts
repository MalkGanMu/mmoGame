import { _decorator, Component, Node } from 'cc';
import BTNode from './BTNode';
import { NodeStatus } from './enum';
const { ccclass, property } = _decorator;

@ccclass('BTParent')
export default abstract class BTParent extends BTNode {
    childrens: Array<BTNode> = [];
    private _index = 0;

    get index(){
        return this._index;
    }

    set index(index:number){
        this._index = index;
    }

    constructor(childrens: Array<BTNode>){
        super();
        this.childrens = childrens;
    }
    abstract canExecute(): boolean
    abstract onChildExecuted(status: NodeStatus, index:number): void
    decorate(status:NodeStatus){
        return status;
    }

    onConditionalAbort(index:number){

    }
    canRunParallelChildren() {
        return false
    }
    
    onChildStarted() {
    }
}



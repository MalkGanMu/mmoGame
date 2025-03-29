import { _decorator, Component, Node } from 'cc';
import MyTree from '../../core_tgx/bt_tree/biz/tree/MyTree';
import BTComposite from '../../core_tgx/bt_tree/BTComposite';
import BTConditional from '../../core_tgx/bt_tree/BTConditional';
import BTNode from '../../core_tgx/bt_tree/BTNode';
import BTParent from '../../core_tgx/bt_tree/BTParent';
import BTTree from '../../core_tgx/bt_tree/BTTree';
import { AbortType, NodeStatus } from '../../core_tgx/bt_tree/enum';
import BlackBoard from './BlackBoard';
const { ccclass, property } = _decorator;

@ccclass('BehaviorManager')
export class BehaviorManager extends Component {
    reStartWhenComplete = false
    tree?: BTTree
    nodeList: Array<BTNode> = []
    activeStack: Array<Array<number>> = []
    parentIndex: Array<number> = []
    childrenIndex: Array<Array<number>> = []

    relativeChildIndex: Array<number> = []
    parentCompositeIndex: Array<number> = []
    childConditionalIndex: Array<Array<number>> = []

    conditionalReevaluate: Array<ConditionalReevaluate> = []
    conditionalReevaluateMap: Map<number, ConditionalReevaluate> = new Map()

    start() {
        this.enableBehavior();

        // this.schedule(()=>{
        //     console.log("加蓝");
        //     BlackBoard.Instance.hp = 1000;
        // }, 1)
    }

    reStart() {
        console.log("重启行为树");
        this.removeChildConditionalReevaluate(-1);
        this.pushNode(0, 0);
    }
    enableBehavior() {
        this.tree = new MyTree();
        this.activeStack.push([]);
        this.parentIndex.push(-1);
        this.relativeChildIndex.push(-1);
        this.parentCompositeIndex.push(-1);
        this.addToNodeList(this.tree.root, { parentCompositeIndex: -1 });
        this.pushNode(0, 0);

        // console.log(this.relativeChildIndex);
        // console.log(this.parentCompositeIndex);
        // console.log(this.childConditionalIndex);

    }

    addToNodeList(node: BTNode, data: { parentCompositeIndex: number }) {
        this.nodeList.push(node);
        const index = this.nodeList.length - 1;
        if (node instanceof BTParent) {
            this.childrenIndex.push([]);
            this.childConditionalIndex.push([]);
            for (let i = 0; i < node.childrens.length; i++) {
                this.parentIndex.push(index);
                this.relativeChildIndex.push(i);
                this.childrenIndex[index].push(this.nodeList.length);
                if (node instanceof BTComposite) {
                    data.parentCompositeIndex = index;
                }
                this.parentCompositeIndex.push(data.parentCompositeIndex);
                this.addToNodeList(node.childrens[i], data);
            }
        } else {
            this.childrenIndex.push(null);
            this.childConditionalIndex.push(null);
            if (node instanceof BTConditional) {
                const parentCompositeIndex = this.parentCompositeIndex[index];
                if (parentCompositeIndex !== -1) {
                    this.childConditionalIndex[parentCompositeIndex].push(index);
                }
            }

        }
    }

    update(deltaTime: number) {
        // this.tree.root.run();
        this.tick();
    }
    tick() {
        this.reevaluateConditionalNode();

        for (let i = this.activeStack.length - 1; i >= 0; i--) {
            const stack = this.activeStack[i];
            let prevIndex = -1;
            let prevStatus = NodeStatus.Inactive;
            while (prevStatus !== NodeStatus.Running && i < this.activeStack.length && stack.length) {
                const curIndex = stack[stack.length - 1];
                if (curIndex === prevIndex) {
                    break;
                }
                prevIndex = curIndex;
                prevStatus = this.runNode(curIndex, i, prevStatus);
            }
        }


    }

    runNode(index: number, stackIndex: number, prevStatus: NodeStatus) {
        this.pushNode(index,stackIndex);
        const node = this.nodeList[index];
        let status = prevStatus;
        if (node instanceof BTParent) {
            status = this.runParentNode(index, stackIndex, status);
            if (node.canRunParallelChildren()) {
                status = node.status;
            }
        } else {
            status = node.onUpdate();
        }

        if (status !== NodeStatus.Running) {
            status = this.popNode(index, stackIndex, status);
        }

        return status;
    }

    runParentNode(index: number, stackIndex: number, status: NodeStatus) {
        const node = this.nodeList[index] as BTParent;

        if (!node.canRunParallelChildren() || node.status !== NodeStatus.Running) {
            let childStatus = NodeStatus.Inactive;
            while (node.canExecute() && (childStatus !== NodeStatus.Running || node.canRunParallelChildren())) {
                const childIndex = node.index;
                if (node.canRunParallelChildren()) {
                    this.activeStack.push([]);
                    stackIndex = this.activeStack.length - 1;
                    node.onChildStarted()
                }

                childStatus = status = this.runNode(this.childrenIndex[index][childIndex], stackIndex, status);
            }
        }


        return status;
    }

    pushNode(index: number, stackIndex: number) {
        const stack = this.activeStack[stackIndex];
        if (stack.length === 0 || stack[stack.length - 1] !== index) {
            stack.push(index);
            const node = this.nodeList[index];
            console.log("pushNode", node);
            node.onStart();
        }
    }

    popNode(index: number, stackIndex: number, status: NodeStatus, popChildren = true) {
        const stack = this.activeStack[stackIndex];

        stack.pop();
        const node = this.nodeList[index];
        node.onEnd();
        console.log("popNode", node);
        const parentIndex = this.parentIndex[index];
        if (parentIndex !== -1) {
            if (node instanceof BTConditional) {
                const parentCompositeIndex = this.parentCompositeIndex[index];
                if (parentCompositeIndex !== -1) {
                    const compositeNode = this.nodeList[parentCompositeIndex] as BTComposite;
                    if (compositeNode.abortType !== AbortType.None) {
                        if (this.conditionalReevaluateMap.has(index)) {
                            const conditionalReevaluate = this.conditionalReevaluateMap.get(index);
                            conditionalReevaluate.compositeIndex = -1;
                            conditionalReevaluate.status = status;
                        } else {
                            const conditionalReevaluate = new ConditionalReevaluate(index, status,compositeNode.abortType === AbortType.LowPriority ? -1:parentCompositeIndex);
                            console.log("生成conditionalReevaluate",conditionalReevaluate);
                            this.conditionalReevaluate.push(conditionalReevaluate);
                            this.conditionalReevaluateMap.set(index, conditionalReevaluate);
                        }
                    }
                }
            }

            const parentNode = this.nodeList[parentIndex] as BTParent;
            if (node instanceof BTParent) {
                status = node.decorate(status);
            }

            parentNode.onChildExecuted(status, this.relativeChildIndex[index]);
        }

        if (node instanceof BTComposite) {
            if (node.abortType === AbortType.Self || node.abortType === AbortType.None || !stack.length) {
                this.removeChildConditionalReevaluate(index);
            }else if(node.abortType === AbortType.LowPriority || node.abortType === AbortType.Both) {
                for (let i = 0; i < this.childConditionalIndex[index].length; i++) {
                    const childConditionalIndex = this.childConditionalIndex[index][i];
                    if (this.conditionalReevaluateMap.has(childConditionalIndex)) {
                        const conditionalReevaluate = this.conditionalReevaluateMap.get(childConditionalIndex);
                        conditionalReevaluate.compositeIndex = this.parentCompositeIndex[index];
                    }
                }

                for (let i = 0; i < this.conditionalReevaluate.length; i++) {
                    const conditionalReevaluate = this.conditionalReevaluate[i];
                    if (conditionalReevaluate.compositeIndex === index) {
                        conditionalReevaluate.compositeIndex = this.parentCompositeIndex[index];
                    }
                }
            }
        }

        if (popChildren) {
            for (let i = this.activeStack.length - 1; i > stackIndex; i--) {
                const stack = this.activeStack[i];
                if (stack.length >= 0 && this.isParentNode(index, stack[stack.length - 1])) {
                    for (let j = stack.length - 1; j >= 0; j--) {
                        this.popNode(stack[stack.length - 1], i, NodeStatus.Failure, false);
                    }
                }
            }
        }

        if (stack.length === 0) {
            if (stackIndex === 0) {
                if (this.reStartWhenComplete) {
                    this.reStart();
                }
            }else {
                this.activeStack.splice(stackIndex, 1);
            }
        }

        return status;
    }

    reevaluateConditionalNode(){
        for (let i = this.conditionalReevaluate.length - 1; i >= 0; i--) {
            const {index, status:prevStatus,compositeIndex} = this.conditionalReevaluate[i];
            
            if (compositeIndex === -1) {
                continue;
            }

            const status = this.nodeList[index].onUpdate();
            if (status === prevStatus) {
                continue;
            }


            for (let j = this.activeStack.length - 1; j >=0; j--) {
                const stack = this.activeStack[j];
                let curNodeIndex = stack[stack.length - 1];
                const commonParentIndex = this.findCommonParentIndex(curNodeIndex, index);
                if (this.isParentNode(compositeIndex, commonParentIndex)) {
                    const stackLen = this.activeStack.length;
                    while (curNodeIndex !== -1 && commonParentIndex !== curNodeIndex && stackLen === this.activeStack.length) {
                        this.popNode(curNodeIndex, j, NodeStatus.Failure, false);
                        curNodeIndex = this.parentIndex[curNodeIndex];
                    }
                }

            }


            for (let j = this.conditionalReevaluate.length - 1; j >= i; j--) {
                const conditionalReevaluate = this.conditionalReevaluate[j];
                if (this.isParentNode(compositeIndex, conditionalReevaluate.index)) {
                    this.conditionalReevaluateMap.delete(conditionalReevaluate.index);
                    this.conditionalReevaluate.splice(j, 1);
                }
            }

            const compositeNode = this.nodeList[this.parentCompositeIndex[index]] as BTComposite;
            for (let j = i - 1; j >= 0; j--){
                const conditionalReevaluate = this.conditionalReevaluate[j];
                if (this.parentCompositeIndex[conditionalReevaluate.index] === this.parentCompositeIndex[index]) {
                    if (compositeNode.abortType === AbortType.LowPriority) {
                        conditionalReevaluate.compositeIndex = -1;
                    }
                }       
            }

            const conditionalParentIndex = [];
            for (let j = this.parentIndex[index]; j !== compositeIndex; j = this.parentIndex[j]) {
                conditionalParentIndex.push(j);
            }
            conditionalParentIndex.push(compositeIndex);
            
            for (let j = conditionalParentIndex.length - 1; j >= 0; j--) {
                const parentNode = this.nodeList[conditionalParentIndex[j]] as BTParent;
                if (j === 0) {
                    parentNode.onConditionalAbort(this.relativeChildIndex[index]);
                } else {
                    parentNode.onConditionalAbort(this.relativeChildIndex[conditionalParentIndex[j-1]]);
                }

            }
        }
    }

    removeChildConditionalReevaluate(index:number){
        for (let i = this.conditionalReevaluate.length - 1; i >= 0; i--) {
            const conditionalReevaluate = this.conditionalReevaluate[i];
            if (conditionalReevaluate.compositeIndex === index) {
                console.log("移除conditionalReevaluate",conditionalReevaluate);
                this.conditionalReevaluateMap.delete(conditionalReevaluate.index);
                this.conditionalReevaluate.splice(i, 1);
            }
        }
    }

    findCommonParentIndex(index1:number, index2:number){
        const set = new Set();
        let num = index1;
        while (num !== -1) {
            set.add(num);
            num = this.parentIndex[num];
        }

        num = index2;
        while (!set.has(num)) {
            num = this.parentIndex[num];
        }

        return num;
    }

    isParentNode(parentIndex:number, childIndex:number){
        for (let i = childIndex; i !== -1; i = this.parentIndex[i]) {
            if (i === parentIndex) {
                return true;
            }
        }
        return false;
    }
}


class ConditionalReevaluate {
    constructor(public index: number, public status: NodeStatus, public compositeIndex: number) {
    }
}
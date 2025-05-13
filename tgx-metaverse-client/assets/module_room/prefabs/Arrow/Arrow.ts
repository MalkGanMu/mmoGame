import { _decorator, Component, Node, Collider2D, Contact2DType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Arrow')
export class Arrow extends Component {
    start() {
        // 获取角色的碰撞器组件
        const collider = this.node.getComponent(Collider2D);
        if (collider) {
            // 监听碰撞开始事件
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            // 监听碰撞结束事件
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }
    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        console.log(otherCollider);
    }
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        console.log(otherCollider);
        if (otherCollider.tag === 2) { // 怪物的 tag 为 2 
            console.log('击中怪物');
        }
    }
    onDestroy() {
        const collider = this.node.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }
}



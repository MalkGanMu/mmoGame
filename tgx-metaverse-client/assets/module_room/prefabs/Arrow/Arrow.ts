import { _decorator, Component, Node, Collider2D, Contact2DType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Arrow')
export class Arrow extends Component {
    @property
    private destroyDelay: number = 0.05; // 碰撞后延迟销毁时间（秒）

    start() {
        const collider = this.node.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        // 碰撞结束逻辑，这里暂时为空，你可以根据需要添加
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        if (otherCollider.tag === 2) { // 怪物的 tag 为 2
            console.log('击中怪物');
            // 禁用碰撞器以防止多次触发
            selfCollider.enabled = false;

            // 延迟销毁箭矢和怪物
            this.scheduleOnce(() => {
                if (otherCollider.node) {
                    otherCollider.node.destroy();
                }
                this.node.destroy();
            }, this.destroyDelay);
        } else {
            // 与其他物体碰撞时只销毁箭矢
            selfCollider.enabled = false;
            this.scheduleOnce(() => {
                this.node.destroy();
            }, this.destroyDelay);
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
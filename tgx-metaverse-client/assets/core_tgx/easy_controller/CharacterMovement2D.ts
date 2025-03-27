// 原始版本
// import { _decorator, Component, Node, Vec2, v2, Prefab, Vec3 } from 'cc';
// import { EasyController, EasyControllerEvent } from './EasyController';
// const { ccclass, property } = _decorator;

// const tempV2 = v2();

// @ccclass('tgxCharacterMovement2D')
// export class CharacterMovement2D extends Component {
//     @property
//     moveSpeed: number = 100;

//     @property
//     needRotation: boolean = false;

//     // 添加一个标识来表示是否是当前玩家
//     @property({
//         type: Boolean,
//         displayName: 'Is Current Player'
//     })
//     isCurrentPlayer: boolean = false;

//     start() {
//         // 只有当前玩家才绑定移动事件
//         if (this.isCurrentPlayer) {
//             EasyController.on(EasyControllerEvent.MOVEMENT, this.onMovement, this);
//             EasyController.on(EasyControllerEvent.MOVEMENT_STOP, this.onMovementStop, this);
//         }
//     }

//     private _moveFactor: number = 0;
//     private _moveDir: Vec2 = v2(1, 0);

//     public get moveDir(): Vec2 {
//         return this._moveDir;
//     }

//     public get realSpeed(): number {
//         return this.moveSpeed * this._moveFactor;
//     }

//     onMovement(degree, strengthen) {
//         if (!this.isCurrentPlayer) {
//             return;
//         }
//         let angle = degree / 180 * Math.PI;
//         if (this.needRotation) {
//             this.node.setRotationFromEuler(0, 0, degree);
//         }
//         this._moveDir.set(Math.cos(angle), Math.sin(angle));
//         this._moveDir.normalize();
//         this._moveFactor = strengthen;
//     }

//     onMovementStop() {
//         if (!this.isCurrentPlayer) {
//             return;
//         }
//         this._moveFactor = 0;
//     }

//     onDestroy() {
//         if (this.isCurrentPlayer) {
//             EasyController.off(EasyControllerEvent.MOVEMENT, this.onMovement, this);
//             EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this.onMovementStop, this);
//         }
//     }

//     update(deltaTime: number) {
//         if (this.isCurrentPlayer && this._moveFactor) {
//             Vec2.multiplyScalar(tempV2, this._moveDir, this.realSpeed * deltaTime);
//             let pos = this.node.position;
//             this.node.setPosition(pos.x + tempV2.x, pos.y + tempV2.y, pos.z);
//         }
//     }
// }





// 向量计算+setpos版本 
// import { _decorator, Component, Node, Vec2, v2, Prefab, Vec3 } from 'cc';
// import { EasyController, EasyControllerEvent } from './EasyController';
// const { ccclass, property } = _decorator;

// const tempV2 = v2();

// @ccclass('tgxCharacterMovement2D')
// export class CharacterMovement2D extends Component {
//     @property
//     moveSpeed: number = 100; // 基础移动速度

//     @property
//     needRotation: boolean = false;

//     // 添加一个标识来表示是否是当前玩家
//     @property({
//         type: Boolean,
//         displayName: 'Is Current Player'
//     })
//     isCurrentPlayer: boolean = false;

//     // 定义表示方向的属性，使用 Vec2 表示二维方向向量
//     private _direction: Vec2 = v2(1, 0); 
//     // 定义表示速度的属性
//     private _currentSpeed: number = 0; 

//     start() {
//         // 只有当前玩家才绑定移动事件
//         if (this.isCurrentPlayer) {
//             EasyController.on(EasyControllerEvent.MOVEMENT, this.onMovement, this);
//             EasyController.on(EasyControllerEvent.MOVEMENT_STOP, this.onMovementStop, this);
//         }
//     }

//     onMovement(degree, strengthen) {
//         if (!this.isCurrentPlayer) {
//             return;
//         }
//         let angle = degree / 180 * Math.PI;
//         // 根据输入的角度更新方向向量
//         this._direction.set(Math.cos(angle), Math.sin(angle)); 
//         this._direction.normalize();
//         // 根据输入的强度更新当前速度
//         this._currentSpeed = this.moveSpeed * strengthen; 
//         if (this.needRotation) {
//             this.node.setRotationFromEuler(0, 0, degree);
//         }
//     }

//     onMovementStop() {
//         if (!this.isCurrentPlayer) {
//             return;
//         }
//         // 移动停止时，将速度设置为 0
//         this._currentSpeed = 0; 
//     }

//     onDestroy() {
//         if (this.isCurrentPlayer) {
//             EasyController.off(EasyControllerEvent.MOVEMENT, this.onMovement, this);
//             EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this.onMovementStop, this);
//         }
//     }

//     update(deltaTime: number) {
//         if (this.isCurrentPlayer && this._currentSpeed > 0) {
//             // 根据方向和速度计算位置变化
//             Vec2.multiplyScalar(tempV2, this._direction, this._currentSpeed * deltaTime); 
//             let pos = this.node.position;
//             // 使用计算出的位置变化更新角色位置
//             this.node.setPosition(pos.x + tempV2.x, pos.y + tempV2.y, pos.z); 
//         }
//     }
// }


import { _decorator, Component, Node, Vec2, v2, Vec3, PhysicsSystem2D, Collider2D, Contact2DType, RigidBody2D } from 'cc';
import { EasyController, EasyControllerEvent } from './EasyController';
const { ccclass, property } = _decorator;

const tempV2 = v2();

@ccclass('tgxCharacterMovement2D')
export class CharacterMovement2D extends Component {
    @property
    moveSpeed: number = 0.5; // 基础移动速度

    @property
    needRotation: boolean = false;

    // 添加一个标识来表示是否是当前玩家
    @property({
        type: Boolean,
        displayName: 'Is Current Player'
    })
    isCurrentPlayer: boolean = false;

    // 定义表示方向的属性，使用 Vec2 表示二维方向向量
    private _direction: Vec2 = v2(1, 0); 
    // 定义表示速度的属性
    private _currentSpeed: number = 0; 

    // 标记是否碰撞到墙壁
    private _isColliding: boolean = false; 

    // 存储 RigidBody2D 组件的引用
    private _rigidBody: RigidBody2D | null = null; 

    start() {
        // 只有当前玩家才绑定移动事件
        if (this.isCurrentPlayer) {
            EasyController.on(EasyControllerEvent.MOVEMENT, this.onMovement, this);
            EasyController.on(EasyControllerEvent.MOVEMENT_STOP, this.onMovementStop, this);
        }

        // 获取角色的碰撞器组件
        const collider = this.node.getComponent(Collider2D);
        if (collider) {
            // 监听碰撞开始事件
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            // 监听碰撞结束事件
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        // 获取角色的刚体组件
        this._rigidBody = this.node.getComponent(RigidBody2D); 
    }

    onMovement(degree, strengthen) {
        if (!this.isCurrentPlayer) {
            return;
        }
        let angle = degree / 180 * Math.PI;
        // 根据输入的角度更新方向向量
        this._direction.set(Math.cos(angle), Math.sin(angle)); 
        this._direction.normalize();
        // 根据输入的强度更新当前速度
        this._currentSpeed = this.moveSpeed * strengthen; 

        if (this._rigidBody) {
            // 设置刚体的线速度
            this._rigidBody.linearVelocity = this._direction.multiplyScalar(this._currentSpeed / 10); 
        }

        if (this.needRotation) {
            this.node.setRotationFromEuler(0, 0, degree);
        }
    }

    onMovementStop() {
        if (!this.isCurrentPlayer) {
            return;
        }
        // 移动停止时，将速度设置为 0
        this._currentSpeed = 0; 

        if (this._rigidBody) {
            // 设置刚体的线速度为 0
            this._rigidBody.linearVelocity = v2(0, 0); 
        }
    }

    onDestroy() {
        if (this.isCurrentPlayer) {
            EasyController.off(EasyControllerEvent.MOVEMENT, this.onMovement, this);
            EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this.onMovementStop, this);
        }

        const collider = this.node.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        console.log('正在碰撞');
        // 当开始碰撞时，标记为正在碰撞
        if (otherCollider.tag === 1) { // 假设墙壁的 tag 为 1
            this._isColliding = true;
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        console.log('结束碰撞');
        // 当碰撞结束时，标记为不再碰撞
        if (otherCollider.tag === 1) { 
            this._isColliding = false;
        }
    }

    update(deltaTime: number) {
        // 因为已经通过设置刚体线速度来移动角色，这里不需要再手动更新位置
        // 可以根据需要添加其他逻辑，比如根据刚体状态进行一些处理
    }
}
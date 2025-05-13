import { _decorator, Component, Node, Prefab, instantiate, Canvas, assetManager, AssetManager, director, TweenSystem, tween, CameraComponent, Camera, random, Vec3, RigidBody2D, Vec2 } from 'cc';
import { DIYFloowCamera2D } from '../../core_tgx/easy_camera/DIYFloowCamera2D';
import { CharacterMovement2D } from '../../core_tgx/easy_controller/CharacterMovement2D';
import { tgxEasyController, tgxEasyControllerEvent } from '../../core_tgx/tgx';
import { SubWorldMonsterState } from '../../module_basic/shared/types/SubWorldMonsterState';
import { SubWorldArrowState } from '../../module_basic/shared/types/SubWorldArrowState';
import { SubWorldUserState } from '../../module_basic/shared/types/SubWorldUserState';
import { SceneUtil } from '../../scripts/SceneDef';
import { Monster } from '../prefabs/Monsters/Monster';
import { Player } from '../prefabs/Players/Player';
import { RoomMgr } from './RoomMgr';
import { Arrow } from '../prefabs/Arrow/Arrow';
const { ccclass, property } = _decorator;

@ccclass('room')
export class room extends Component {
    @property(Prefab)
    prefabMonster!: Prefab;

    @property(Node)
    Monsters!: Node;

    selfPlayer?: Player;

    // 玩家预制体，用于创建新的玩家节点，通过属性面板赋值
    @property(Prefab)
    prefabPlayer!: Prefab;

    // 箭预制体
    @property(Prefab)
    prefabArrow!: Prefab;

    @property(Node)
    Arrows!: Node;

    @property(Node)
    players!: Node;

    // // 第三人称相机控制器，用于跟随玩家，通过属性面板赋值
    @property(Node)
    followCamera!: Node;

    // 记录玩家的上一个动画状态，用于判断是否需要向服务器上报状态
    private _playerLastState: string = '';

    private playersState: {
        [uid: string]: SubWorldUserState
    } = {};

    async start() {
        // 初始化客户端
        this._initClient();

        // 确保与服务器建立连接
        await RoomMgr.ensureConnected();

        // 生成怪物
        const newMonsterState =  this.spawnMonster();
        RoomMgr.addMonster(newMonsterState);

        // 使用 scheduleOnce 方法，确保删除操作只执行一次
        // this.scheduleOnce(() => {
        //     RoomMgr.delMonster(newMonsterState);
        // }, 10);

        // 定时向服务器上报玩家状态，每 0.1 秒执行一次
        this.schedule(() => {
            // 如果当前玩家实例不存在，直接返回
            if (!this.selfPlayer) {
                return;
            }

            // 获取当前玩家的动画状态
            let curState = this.selfPlayer.aniState;
            // 如果当前状态为 walking 或者与上一个状态不同
            if (curState == 'walking' || curState != this._playerLastState) {
                // 向服务器发送玩家状态消息
                RoomMgr.worldConn.sendMsg('c2sMsg/UserState', {
                    aniState: this.selfPlayer.aniState,
                    pos: this.selfPlayer.node.position,
                    rotation: this.selfPlayer.node.rotation
                });
                // 更新上一个状态为当前状态
                this._playerLastState = curState;
            }
        }, 0.1);

        // 监听控制器的移动事件
        tgxEasyController.on(tgxEasyControllerEvent.MOVEMENT, this.onMovement, this);
        // 监听控制器的移动停止事件
        tgxEasyController.on(tgxEasyControllerEvent.MOVEMENT_STOP, this.onMovmentStop, this);
        // 监听控制器的点击屏幕事件
        tgxEasyController.on(tgxEasyControllerEvent.CLICK_VECTOR, this.onClick, this);

    }
    //处理玩家移动事件
    onMovement(degree: number, strengthen: number) {
        // 如果当前玩家实例不存在，直接返回
        if (!this.selfPlayer) {
            return;
        }
        // 设置玩家的动画状态为 walking
        this.selfPlayer.aniState = 'walking';
    }

    //处理玩家停止移动事件
    onMovmentStop() {
        // 如果当前玩家实例不存在，直接返回
        if (!this.selfPlayer) {
            return;
        }
        // 设置玩家的动画状态为 idle
        this.selfPlayer.aniState = 'idle';
    }

    // 处理屏幕点击事件
    onClick(vector) {
        const newArrowState = this.spawnArrow(vector)
        RoomMgr.addArrow(newArrowState)
    }

    update(deltaTime: number) { }

    private _initClient() {
        // 创建世界连接
        RoomMgr.createWorldConnection(SceneUtil.sceneParams);

        // 监听服务器的用户状态更新消息
        RoomMgr.worldConn.listenMsg('s2cMsg/UserStates', v => {
            // 遍历所有用户状态
            for (let uid in v.userStates) {
                // 更新用户状态
                this._updateUserState(v.userStates[uid]);
                this.playersState[uid] = v.userStates[uid];
            }
            // 更新玩家数量
            RoomMgr.playerNum = this.players.children.length;
        });

        // 监听服务器的用户加入消息
        RoomMgr.worldConn.listenMsg('s2cMsg/UserJoin', v => {
            // 将新用户信息添加到子世界数据中
            RoomMgr.subWorldData.users.push({
                ...v.user
            });
            // 更新玩家数量
            RoomMgr.playerNum = this.players.children.length;
        });

        // 监听服务器的用户退出消息
        RoomMgr.worldConn.listenMsg('s2cMsg/UserExit', v => {
            // 从子世界数据中移除退出的用户
            RoomMgr.subWorldData.users.remove(v1 => v1.uid === v.user.uid);
            // 从玩家节点父节点中移除退出的玩家节点
            this.players.getChildByName(v.user.uid)?.removeFromParent();
            // 更新玩家数量
            RoomMgr.playerNum = this.players.children.length;
        });

        // 监听服务器的敌人状态更新消息
        RoomMgr.worldConn.listenMsg('s2cMsg/MonsterStates', v => {
            this._updateMonsterState(v.monsterStates);
        });

        // 监听子弹
        RoomMgr.worldConn.listenMsg('s2cMsg/ArrowStates', v => {
            this._updateArrowState(v.arrowStates);
        });
    }

    private _updateArrowState(arrowStates: { [uid: string]: SubWorldArrowState }) {
        // // 用于存储 this.Monsters 中所有怪物节点的 uid
        // const existingArrowUids = new Set<string>();
        // this.Arrows.children.forEach(child => {
        //     existingArrowUids.add(child.name);
        // });
    
        // 处理需要添加的子弹并更新所有子弹状态
        for (let uid in arrowStates) {
            let node = this.Arrows.getChildByName(uid);
            if (node) {
                return
            }
            node = instantiate(this.prefabArrow);
            node.name = uid;
            this.Arrows.addChild(node);
            node.setWorldPosition(arrowStates[uid].pos.x, arrowStates[uid].pos.y, arrowStates[uid].pos.z);
            node.getComponent(RigidBody2D).linearVelocity = new Vec2(
                arrowStates[uid].v.x * 10,
                arrowStates[uid].v.y * 10
            );
            // 计算箭矢在2D平面上的旋转角度
            const angle = Math.atan2(arrowStates[uid].v.y, arrowStates[uid].v.x) * 180 / Math.PI;
            // 设置箭矢旋转（2D游戏绕Z轴旋转）
            node.setRotationFromEuler(0, 0, angle + 90);
            // 从 existingMonsterUids 中移除已处理的 uid
            // existingArrowUids.delete(uid);
        }
    
        // // 处理需要删除的子弹
        // existingArrowUids.forEach(uid => {
        //     let node = this.Arrows.getChildByName(uid);
        //     if (node) {
        //         const delArrowState:SubWorldArrowState = {
        //             uid: node.name,
        //             pos: {
        //                 x: 0,
        //                 y: 0,
        //                 z: 0
        //             },
        //             v: {
        //                 x: 0,
        //                 y: 0,
        //                 z: 0
        //             }
        //         };
        //         RoomMgr.delArrow(delArrowState);
        //         node.destroy();
        //     }
        // });
    }

    private spawnArrow(vector): SubWorldArrowState {
        let node = instantiate(this.prefabArrow);
        node.name = 'arrow_' + Date.now();
        this.Arrows.addChild(node);
        this.players.getChildByName(this.selfPlayer.name);

        const newArrowState:SubWorldArrowState = {
            uid: node.name,
            pos: this.selfPlayer.node.getWorldPosition(),
            v: {
                x: vector.x,
                y: vector.y,
                z: vector.z
            }
        }
        node.setWorldPosition(newArrowState.pos.x, newArrowState.pos.y, newArrowState.pos.z);
        // 计算箭矢在2D平面上的旋转角度
        const angle = Math.atan2(newArrowState.v.y, newArrowState.v.x) * 180 / Math.PI;
        // 设置箭矢旋转（2D游戏绕Z轴旋转）
        node.setRotationFromEuler(0, 0, angle + 90);
        const speed = 10; // 调整速度参数
        node.getComponent(RigidBody2D).linearVelocity = new Vec2(
            newArrowState.v.x * speed,
            newArrowState.v.y * speed
        );
        console.log(' ', newArrowState.v.x, newArrowState.v.y)
        this.Arrows.addChild(node);
        return newArrowState
    }

    private spawnMonster(): SubWorldMonsterState {
        let node = instantiate(this.prefabMonster);
        node.name = 'monster_' + Date.now();
        const newMonsterState:SubWorldMonsterState = {
            uid: node.name,
            pos: {
                x: 0,
                y: 0,
                z: 0
            },
            health: 100,
            aniState: 'idle'
        };
        node.setPosition(newMonsterState.pos.x, newMonsterState.pos.y, newMonsterState.pos.z);
        this.Monsters.addChild(node);
        return newMonsterState;
    }

    private _updateMonsterState(monsterStates: { [uid: string]: SubWorldMonsterState }) {
        // 用于存储 this.Monsters 中所有怪物节点的 uid
        const existingMonsterUids = new Set<string>();
        this.Monsters.children.forEach(child => {
            existingMonsterUids.add(child.name);
        });
    
        // 处理需要添加的怪物并更新所有怪物状态
        for (let uid in monsterStates) {
            let node = this.Monsters.getChildByName(uid);
            if (!node) {
                node = instantiate(this.prefabMonster);
                node.name = uid;
                this.Monsters.addChild(node);
            }
            const monster = node.getComponent(Monster)!;
            // monster.updateState(monsterStates[uid]);
            // 从 existingMonsterUids 中移除已处理的 uid
            existingMonsterUids.delete(uid);
        }
    
        // 处理需要删除的怪物
        existingMonsterUids.forEach(uid => {
            let node = this.Monsters.getChildByName(uid);
            if (node) {
                const delMonsterState:SubWorldMonsterState = {
                    uid: node.name,
                    pos: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    health: 100,
                    aniState: 'idle'
                };
                RoomMgr.delMonster(delMonsterState);
                node.destroy();
            }
        });
    }

    /**
     * 更新用户状态的方法
     * @param state 子世界用户状态
     */
    private _updateUserState(state: SubWorldUserState) {
        // 根据用户 ID 获取玩家节点
        let node = this.players.getChildByName(state.uid);

        // 如果节点不存在，创建新的玩家节点
        if (!node) {
            // 实例化玩家预制体
            node = instantiate(this.prefabPlayer);
            // 设置节点名称为用户 ID
            node.name = state.uid;
            // 将节点添加到玩家节点父节点中
            this.players.addChild(node);
            // 设置节点的位置
            node.setPosition(state.pos.x, state.pos.y, state.pos.z);

            // 获取 CharacterMovement2D 组件
            const movementComponent = node.getComponent(CharacterMovement2D)!;
            // 获取节点的 Player 组件
            const player = node.getComponent(Player)!;
            // 设置玩家的动画状态
            player.aniState = state.aniState;

            // 如果是当前用户
            if (state.uid === RoomMgr.currentUser.uid) {
                // 设置当前玩家实例
                this.selfPlayer = player;
                // 标记该节点为当前玩家节点
                this.selfPlayer.node['_isMyPlayer_'] = true;
                this.selfPlayer.node.setPosition(state.pos.x, state.pos.y, state.pos.z);
                // 设置 CharacterMovement2D 组件的 isCurrentPlayer 属性为 true
                movementComponent.isCurrentPlayer = true;


                // 获取 tgxFollowCamera2D 脚本组件实例
                const followCameraScript = this.followCamera.getComponent(DIYFloowCamera2D);
                if (followCameraScript) {
                    followCameraScript.target = node;
                }
            }
            return;
        }

        // 如果是当前用户，不进行服务端状态同步
        if (state.uid === RoomMgr.currentUser.uid) {
            return;
        }
        // 更新其他玩家的动画状态
        node.getComponent(Player)!.aniState = state.aniState;

        if (state.aniState == 'walking') {
            node.setPosition(state.pos.x, state.pos.y, state.pos.z);
            console.log(`移动玩家: ${node.name}`);
        }

    }

    /**
    * 组件销毁时调用的生命周期方法
    */
    onDestroy() {
        // 取消监听服务器的用户状态更新消息
        RoomMgr.worldConn.unlistenMsgAll('s2cMsg/UserStates');
        // 取消监听服务器的用户加入消息
        RoomMgr.worldConn.unlistenMsgAll('s2cMsg/UserJoin');
        // 取消监听服务器的用户退出消息
        RoomMgr.worldConn.unlistenMsgAll('s2cMsg/UserExit');
        // 断开与服务器的连接
        RoomMgr.worldConn.disconnect(3456, 'normal');
        // 移除所有标签为 99 的动画
        TweenSystem.instance.ActionManager.removeAllActionsByTag(99);
    }
}



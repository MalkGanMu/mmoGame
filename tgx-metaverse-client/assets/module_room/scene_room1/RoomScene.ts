import { _decorator, Component, Node, Prefab, instantiate, Canvas, assetManager, AssetManager, director, TweenSystem, tween } from 'cc';
import { CharacterMovement2D } from '../../core_tgx/easy_controller/CharacterMovement2D';
import { tgxEasyController, tgxEasyControllerEvent } from '../../core_tgx/tgx';
import { SubWorldUserState } from '../../module_basic/shared/types/SubWorldUserState';
import { SceneUtil } from '../../scripts/SceneDef';
import { Player } from '../prefabs/Players/Player';
import { RoomMgr } from './RoomMgr';
const { ccclass, property } = _decorator;

@ccclass('room')
export class room extends Component {

    selfPlayer?: Player;
    
    // 玩家预制体，用于创建新的玩家节点，通过属性面板赋值
    @property(Prefab)
    prefabPlayer!: Prefab;
    @property(Node)
    players!: Node;
    // 记录玩家的上一个动画状态，用于判断是否需要向服务器上报状态
    private _playerLastState: string = '';

    async start() {
        // 初始化客户端
        this._initClient();

        // 确保与服务器建立连接
        await RoomMgr.ensureConnected();

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
        
    }
    /**
     * 处理玩家移动事件
     * @param degree 移动的角度
     * @param strengthen 移动的强度
     */
    onMovement(degree: number, strengthen: number) {
        // 如果当前玩家实例不存在，直接返回
        if (!this.selfPlayer) {
            return;
        }
        // 设置玩家的动画状态为 walking
        this.selfPlayer.aniState = 'walking';
    }

    /**
     * 处理玩家停止移动事件
     */
    onMovmentStop() {
        // 如果当前玩家实例不存在，直接返回
        if (!this.selfPlayer) {
            return;
        }
        // 设置玩家的动画状态为 idle
        this.selfPlayer.aniState = 'idle';
    }
    update(deltaTime: number) {
        
    }

    private _initClient() {
        // 创建世界连接
        RoomMgr.createWorldConnection(SceneUtil.sceneParams);

        // 监听服务器的用户状态更新消息
        RoomMgr.worldConn.listenMsg('s2cMsg/UserStates', v => {
            // 遍历所有用户状态
            for (let uid in v.userStates) {
                // 更新用户状态
                this._updateUserState(v.userStates[uid]);
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
                // 设置 CharacterMovement2D 组件的 isCurrentPlayer 属性为 true
                movementComponent.isCurrentPlayer = true;
            // 设置相机的跟随目标
                // this.followCamera.target = node.getChildByName('focusTarget')!;
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
        // // 移除节点位置上的所有动画
        // TweenSystem.instance.ActionManager.removeAllActionsFromTarget(node.position as any);
        // // 使用插值动画平滑更新节点的位置和旋转
        // tween(node.position).to(0.1, state.pos, {
        //     onUpdate: (v, ratio) => {
        //         // 这里原代码可能有误，node!.position = node!.position; 可删除
        //         // 更新节点的旋转
        //         // node!.rotation = Quat.slerp(tmpQuat, node!.rotation, state.rotation, ratio!);
        //     }
        // }).tag(99).start();
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



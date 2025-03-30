// 导入用于浏览器环境的 WebSocket 客户端类
import { WsClient } from "tsrpc-browser";
// 导入自定义的 UI 提示组件
import { tgxUIAlert } from "../../core_tgx/tgx";
// 导入场景定义、场景工具类和子世界场景参数类型
import { SceneDef, SceneUtil, SubWorldSceneParams } from "../../scripts/SceneDef";
// 导入世界服务器的服务协议类型
import { ServiceType } from "../../module_basic/shared/protocols/serviceProto_worldServer";
// 导入子世界配置类和子世界配置项类型
import { SubWorldConfig, SubWorldConfigItem } from "../../module_basic/shared/SubWorldConfig";
// 导入子世界数据类型
import { SubWorldData } from "../../module_basic/shared/types/SubWorldData";
// 导入用户信息类型
import { UserInfo } from "../../module_basic/shared/types/UserInfo";
// 导入用户管理类
import { UserMgr } from "../../module_basic/scripts/UserMgr";
// 导入加入子世界的响应结果类型
import { ResJoinSubWorld } from "../../module_basic/shared/protocols/worldServer/PtlJoinSubWorld";
// 导入网络工具类
import { NetUtil } from "../../module_basic/scripts/NetUtil";
import { SubWorldMonsterState } from "../../module_basic/shared/types/SubWorldMonsterState";
import { ReqAddMonster, ResAddMonster } from "../../module_basic/shared/protocols/worldServer/PtlAddMonster";
import { ReqDelMonster, ResDelMonster } from "../../module_basic/shared/protocols/worldServer/PtlDelMonster";

// 用于与世界服务器通信的 WebSocket 客户端实例
let _worldConn: WsClient<ServiceType> = null;
// 世界服务器的 URL
let _worldServerUrl = '';
// 子世界中的玩家数量
let _playerNum: number = 0;
// 子世界的 ID
let _subWorldId: string;
// 子世界的配置信息
let _subWorldConfig: SubWorldConfigItem;
// 子世界的显示名称
let _subWorldDisplayName: string;

// 进入子世界的参数
let _params: SubWorldSceneParams;
// 当前用户的信息
let _currentUser: UserInfo;
// 子世界的数据
let _subWorldData: SubWorldData;

/**
 * WorldMgr 类，用于管理与子世界服务器的连接和相关数据
 */
export class RoomMgr {
    /**
     * 创建与世界服务器的连接
     * @param params 进入子世界的参数
     */
    public static createWorldConnection(params: SubWorldSceneParams) {
        // 保存进入子世界的参数
        _params = params;
        // 保存世界服务器的 URL
        _worldServerUrl = params.worldServerUrl;
        // 使用网络工具类创建 WebSocket 客户端实例
        _worldConn = NetUtil.createWorldClient(_worldServerUrl);
        // 根据参数中的子世界配置 ID 获取子世界的配置信息
        _subWorldConfig = SubWorldConfig.getSubWorldConfig(_params.subWorldConfigId);

        // 为 WebSocket 客户端的断开连接后处理流程添加回调函数
        _worldConn.flows.postDisconnectFlow.push(v => {
            // 如果断开连接的原因是正常断开，则不做处理
            if (v.reason == 'normal') {
                return;
            }
            // 如果不是手动断开连接，则返回登录界面
            if (!v.isManual) {
                this.backToLogin();
            }
            return v;
        });
    }

    /**
     * 显示提示信息并返回登录界面
     */
    public static backToLogin() {
        // 显示提示框，提示用户连接已断开，需要重新登录
        tgxUIAlert.show("链接已断开，请重新登录").onClick(() => {
            // 点击提示框后，加载登录场景
            SceneUtil.loadScene(SceneDef.LOGIN);
        });
    }

    /**
     * 确保与服务器建立连接并加入子世界
     * @returns 加入子世界的响应结果的 Promise
     */
    public static async ensureConnected(): Promise<ResJoinSubWorld> {
        // 尝试连接到服务器并加入子世界
        let ret = await this._connect();
        // 如果连接或加入失败
        if (!ret.isSucc) {
            // 显示错误信息
            tgxUIAlert.show(ret.errMsg).onClick(() => {
                // 点击提示框后，返回登录界面
                this.backToLogin();
            });
            // 返回一个永远不会解决的 Promise
            return new Promise(rs => { });
        }
        // 如果连接和加入成功，返回响应结果
        return ret.res;
    }

    /**
     * 尝试连接到服务器并加入子世界的私有方法
     * @returns 包含连接和加入结果的对象的 Promise
     */
    private static async _connect(): Promise<{ isSucc: boolean, res?: ResJoinSubWorld, errMsg?: string }> {
        // 尝试连接到世界服务器
        let resConnect = await RoomMgr.worldConn.connect();
        // 如果连接失败
        if (!resConnect.isSucc) {
            // 返回包含失败信息的对象
            return { isSucc: false, errMsg: '连接到服务器失败: ' + resConnect.errMsg };
        }

        // 尝试加入子世界
        let retJoin = await RoomMgr.worldConn.callApi('JoinSubWorld', {
            token: _params.token,
            uid: UserMgr.inst.uid,
            time: _params.time,
            subWorldId: _params.subWorldId,
        });
        // 如果加入失败
        if (!retJoin.isSucc) {
            // 返回包含失败信息的对象
            return { isSucc: false, errMsg: '加入房间失败: ' + retJoin.err.message };
        }

        // 保存当前用户的信息
        _currentUser = retJoin.res.currentUser;
        // 保存子世界的数据
        _subWorldData = retJoin.res.subWorldData;

        // 返回包含成功信息和响应结果的对象
        return { isSucc: true, res: retJoin.res };
    }

    /**
         * 调用添加怪物的 API
         * @param monsterState 怪物的状态
         * @returns 添加怪物的响应结果的 Promise
         */
    public static async addMonster(monsterState: SubWorldMonsterState): Promise<ResAddMonster> {
        if (!_worldConn) {
            throw new Error('World connection is not established.');
        }
        const req: ReqAddMonster = {
            monsterState,
            subWorldId: _params.subWorldId
        };
        const ret = await _worldConn.callApi('AddMonster', req);
        if (!ret.isSucc) {
            tgxUIAlert.show('添加怪物失败: ' + ret.err.message);
            throw new Error('添加怪物失败: ' + ret.err.message);
        }
        return ret.res;
    }

    /**
     * 调用删除怪物的 API
     * @param req 删除怪物的请求参数，包含子世界 ID 和怪物状态
     * @returns 删除怪物的响应结果的 Promise
     */
    public static async delMonster(monsterState: SubWorldMonsterState): Promise<ResDelMonster> {
        if (!_worldConn) {
            throw new Error('World connection is not established.');
        }
        const req: ReqAddMonster = {
            monsterState,
            subWorldId: _params.subWorldId
        };
        const ret = await _worldConn.callApi('DelMonster', req);
        if (!ret.isSucc) {
            tgxUIAlert.show('删除怪物失败: ' + ret.err.message);
            throw new Error('删除怪物失败: ' + ret.err.message);
        }
        return ret.res;
    }








    /**
     * 获取进入子世界的参数
     */
    public static get params(): SubWorldSceneParams {
        return _params;
    }

    /**
     * 获取当前用户的信息
     */
    public static get currentUser(): UserInfo {
        return _currentUser;
    }

    /**
     * 获取子世界的数据
     */
    public static get subWorldData(): SubWorldData {
        return _subWorldData;
    }

    /**
     * 设置子世界中的玩家数量
     * @param v 玩家数量
     */
    public static set playerNum(v: number) {
        _playerNum = v;
    }

    /**
     * 获取子世界中的玩家数量
     */
    public static get playerNum() {
        return _playerNum;
    }

    /**
     * 获取 WebSocket 客户端实例
     */
    public static get worldConn() {
        return _worldConn;
    }

    /**
     * 获取世界服务器的 URL
     */
    public static get worldServerUrl() {
        return _worldServerUrl;
    }

    /**
     * 设置子世界的 ID
     * @param v 子世界的 ID
     */
    public static set subWorldId(v: string) {
        _subWorldId = v;
    }

    /**
     * 获取子世界的 ID
     */
    public static get subWorldId(): string {
        return _subWorldId;
    }

    /**
     * 设置子世界的配置信息
     * @param v 子世界的配置信息
     */
    public static set subWorldConfig(v: SubWorldConfigItem) {
        _subWorldConfig = v;
    }

    /**
     * 获取子世界的配置信息
     */
    public static get subWorldConfig() {
        return _subWorldConfig;
    }

    /**
     * 设置子世界的显示名称
     * @param v 子世界的显示名称
     */
    public static set subWorldDisplayName(v: string) {
        _subWorldDisplayName = v;
    }

    /**
     * 获取子世界的显示名称
     */
    public static get subWorldDisplayName() {
        return this.subWorldDisplayName;
    }
}
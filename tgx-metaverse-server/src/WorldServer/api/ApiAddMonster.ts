import { ApiCall } from "tsrpc";
import { ReqAddMonster, ResAddMonster } from "../../shared/protocols/worldServer/PtlAddMonster";
import { worldServer } from "../../WorldServerMain";

export async function ApiAddMonster(call: ApiCall<ReqAddMonster, ResAddMonster>) {
    let req = call.req;
    let subWorld = worldServer.id2SubWorld.get(req.subWorldId);
    if (!subWorld) {
        return call.error('子世界不存在', { code: 'SUB_WORLD_NOT_EXISTS' });
    }
    subWorld.monsterStates[req.monsterState.uid] = req.monsterState;
    // TODO
    call.succ({});

    subWorld.broadcastMsg('s2cMsg/MonsterStates', {
        monsterStates: subWorld.monsterStates
    });
}
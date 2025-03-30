import { ApiCall } from "tsrpc";
import { ReqDelMonster, ResDelMonster } from "../../shared/protocols/worldServer/PtlDelMonster";
import { worldServer } from "../../WorldServerMain";

export async function ApiDelMonster(call: ApiCall<ReqDelMonster, ResDelMonster>) {
    let req = call.req;
    let subWorld = worldServer.id2SubWorld.get(req.subWorldId);
    if (!subWorld) {
        return call.error('子世界不存在', { code: 'SUB_WORLD_NOT_EXISTS' });
    }
    delete subWorld.monsterStates[req.monsterState.uid];
    // TODO
    call.succ({});

    subWorld.broadcastMsg('s2cMsg/MonsterStates', {
        monsterStates: subWorld.monsterStates
    });
}
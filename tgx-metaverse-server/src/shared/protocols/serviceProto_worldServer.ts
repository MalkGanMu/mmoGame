import { ServiceProto } from 'tsrpc-proto';
import { MsgUpdateSubWorldState } from './worldServer/admin/MsgUpdateSubWorldState';
import { ReqAuth, ResAuth } from './worldServer/admin/PtlAuth';
import { ReqCreateSubWorld, ResCreateSubWorld } from './worldServer/admin/PtlCreateSubWorld';
import { MsgUserState } from './worldServer/c2sMsg/MsgUserState';
import { ReqAddArrow, ResAddArrow } from './worldServer/PtlAddArrow';
import { ReqAddMonster, ResAddMonster } from './worldServer/PtlAddMonster';
import { ReqDelArrow, ResDelArrow } from './worldServer/PtlDelArrow';
import { ReqDelMonster, ResDelMonster } from './worldServer/PtlDelMonster';
import { ReqExitSubWorld, ResExitSubWorld } from './worldServer/PtlExitSubWorld';
import { ReqJoinSubWorld, ResJoinSubWorld } from './worldServer/PtlJoinSubWorld';
import { ReqSendChat, ResSendChat } from './worldServer/PtlSendChat';
import { MsgArrowStates } from './worldServer/s2cMsg/MsgArrowStates';
import { MsgChat } from './worldServer/s2cMsg/MsgChat';
import { MsgMonsterStates } from './worldServer/s2cMsg/MsgMonsterStates';
import { MsgUserExit } from './worldServer/s2cMsg/MsgUserExit';
import { MsgUserJoin } from './worldServer/s2cMsg/MsgUserJoin';
import { MsgUserStates } from './worldServer/s2cMsg/MsgUserStates';

export interface ServiceType {
    api: {
        "admin/Auth": {
            req: ReqAuth,
            res: ResAuth
        },
        "admin/CreateSubWorld": {
            req: ReqCreateSubWorld,
            res: ResCreateSubWorld
        },
        "AddArrow": {
            req: ReqAddArrow,
            res: ResAddArrow
        },
        "AddMonster": {
            req: ReqAddMonster,
            res: ResAddMonster
        },
        "DelArrow": {
            req: ReqDelArrow,
            res: ResDelArrow
        },
        "DelMonster": {
            req: ReqDelMonster,
            res: ResDelMonster
        },
        "ExitSubWorld": {
            req: ReqExitSubWorld,
            res: ResExitSubWorld
        },
        "JoinSubWorld": {
            req: ReqJoinSubWorld,
            res: ResJoinSubWorld
        },
        "SendChat": {
            req: ReqSendChat,
            res: ResSendChat
        }
    },
    msg: {
        "admin/UpdateSubWorldState": MsgUpdateSubWorldState,
        "c2sMsg/UserState": MsgUserState,
        "s2cMsg/ArrowStates": MsgArrowStates,
        "s2cMsg/Chat": MsgChat,
        "s2cMsg/MonsterStates": MsgMonsterStates,
        "s2cMsg/UserExit": MsgUserExit,
        "s2cMsg/UserJoin": MsgUserJoin,
        "s2cMsg/UserStates": MsgUserStates
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 11,
    "services": [
        {
            "id": 13,
            "name": "admin/UpdateSubWorldState",
            "type": "msg"
        },
        {
            "id": 1,
            "name": "admin/Auth",
            "type": "api",
            "conf": {
                "allowGuest": true
            }
        },
        {
            "id": 12,
            "name": "admin/CreateSubWorld",
            "type": "api",
            "conf": {
                "allowGuest": true
            }
        },
        {
            "id": 16,
            "name": "c2sMsg/UserState",
            "type": "msg"
        },
        {
            "id": 24,
            "name": "AddArrow",
            "type": "api",
            "conf": {}
        },
        {
            "id": 21,
            "name": "AddMonster",
            "type": "api",
            "conf": {}
        },
        {
            "id": 25,
            "name": "DelArrow",
            "type": "api",
            "conf": {}
        },
        {
            "id": 23,
            "name": "DelMonster",
            "type": "api",
            "conf": {}
        },
        {
            "id": 14,
            "name": "ExitSubWorld",
            "type": "api",
            "conf": {}
        },
        {
            "id": 15,
            "name": "JoinSubWorld",
            "type": "api",
            "conf": {}
        },
        {
            "id": 6,
            "name": "SendChat",
            "type": "api",
            "conf": {}
        },
        {
            "id": 26,
            "name": "s2cMsg/ArrowStates",
            "type": "msg"
        },
        {
            "id": 17,
            "name": "s2cMsg/Chat",
            "type": "msg"
        },
        {
            "id": 22,
            "name": "s2cMsg/MonsterStates",
            "type": "msg"
        },
        {
            "id": 18,
            "name": "s2cMsg/UserExit",
            "type": "msg"
        },
        {
            "id": 19,
            "name": "s2cMsg/UserJoin",
            "type": "msg"
        },
        {
            "id": 20,
            "name": "s2cMsg/UserStates",
            "type": "msg"
        }
    ],
    "types": {
        "admin/MsgUpdateSubWorldState/MsgUpdateSubWorldState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "connNum",
                    "type": {
                        "type": "Number",
                        "scalarType": "uint"
                    }
                },
                {
                    "id": 1,
                    "name": "subWorlds",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Interface",
                            "properties": [
                                {
                                    "id": 0,
                                    "name": "id",
                                    "type": {
                                        "type": "String"
                                    }
                                },
                                {
                                    "id": 1,
                                    "name": "name",
                                    "type": {
                                        "type": "String"
                                    }
                                },
                                {
                                    "id": 2,
                                    "name": "userNum",
                                    "type": {
                                        "type": "Number",
                                        "scalarType": "uint"
                                    }
                                },
                                {
                                    "id": 3,
                                    "name": "maxUserNum",
                                    "type": {
                                        "type": "Number",
                                        "scalarType": "uint"
                                    }
                                },
                                {
                                    "id": 4,
                                    "name": "startMatchTime",
                                    "type": {
                                        "type": "Number",
                                        "scalarType": "uint"
                                    },
                                    "optional": true
                                },
                                {
                                    "id": 5,
                                    "name": "updateTime",
                                    "type": {
                                        "type": "Number",
                                        "scalarType": "uint"
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        },
        "admin/PtlAuth/ReqAuth": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "adminToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "MasterServer"
                    }
                }
            ]
        },
        "admin/PtlAuth/ResAuth": {
            "type": "Interface"
        },
        "admin/PtlCreateSubWorld/ReqCreateSubWorld": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "adminToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 4,
                    "name": "subWorldId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 5,
                    "name": "subWorldName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 6,
                    "name": "subWorldConfigId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "admin/PtlCreateSubWorld/ResCreateSubWorld": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "subWorldId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "c2sMsg/MsgUserState/MsgUserState": {
            "target": {
                "type": "Reference",
                "target": "../../types/SubWorldUserState/SubWorldUserState"
            },
            "keys": [
                "uid"
            ],
            "type": "Omit"
        },
        "../../types/SubWorldUserState/SubWorldUserState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "uid",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "pos",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 2,
                                "name": "z",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 2,
                    "name": "rotation",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 2,
                                "name": "z",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 3,
                                "name": "w",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 3,
                    "name": "aniState",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/SubWorldUserState/PlayerAniState"
                    }
                }
            ]
        },
        "../../types/SubWorldUserState/PlayerAniState": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "type": "Literal",
                        "literal": "idle"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Literal",
                        "literal": "walking"
                    }
                },
                {
                    "id": 2,
                    "type": {
                        "type": "Literal",
                        "literal": "wave"
                    }
                },
                {
                    "id": 3,
                    "type": {
                        "type": "Literal",
                        "literal": "punch"
                    }
                },
                {
                    "id": 4,
                    "type": {
                        "type": "Literal",
                        "literal": "dance"
                    }
                }
            ]
        },
        "PtlAddArrow/ReqAddArrow": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "arrowState",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/SubWorldArrowState/SubWorldArrowState"
                    }
                },
                {
                    "id": 1,
                    "name": "subWorldId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "../base/BaseRequest": {
            "type": "Interface"
        },
        "../../types/SubWorldArrowState/SubWorldArrowState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "uid",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "pos",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 2,
                                "name": "z",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 2,
                    "name": "v",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 2,
                                "name": "z",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "PtlAddArrow/ResAddArrow": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "../base/BaseResponse": {
            "type": "Interface"
        },
        "PtlAddMonster/ReqAddMonster": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "monsterState",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/SubWorldMonsterState/SubWorldMonsterState"
                    }
                },
                {
                    "id": 1,
                    "name": "subWorldId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        
        "../../types/SubWorldMonsterState/SubWorldMonsterState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "uid",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "pos",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 2,
                                "name": "z",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 2,
                    "name": "health",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "aniState",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/SubWorldMonsterState/PlayerAniState"
                    }
                }
            ]
        },
        "../../types/SubWorldMonsterState/PlayerAniState": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "type": "Literal",
                        "literal": "idle"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Literal",
                        "literal": "walking"
                    }
                },
                {
                    "id": 2,
                    "type": {
                        "type": "Literal",
                        "literal": "wave"
                    }
                },
                {
                    "id": 3,
                    "type": {
                        "type": "Literal",
                        "literal": "punch"
                    }
                },
                {
                    "id": 4,
                    "type": {
                        "type": "Literal",
                        "literal": "dance"
                    }
                }
            ]
        },
        "PtlAddMonster/ResAddMonster": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlDelArrow/ReqDelArrow": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "arrowState",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/SubWorldArrowState/SubWorldArrowState"
                    }
                },
                {
                    "id": 1,
                    "name": "subWorldId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlDelArrow/ResDelArrow": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlDelMonster/ReqDelMonster": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "monsterState",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/SubWorldMonsterState/SubWorldMonsterState"
                    }
                },
                {
                    "id": 1,
                    "name": "subWorldId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlDelMonster/ResDelMonster": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlExitSubWorld/ReqExitSubWorld": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ]
        },
        "PtlExitSubWorld/ResExitSubWorld": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlJoinSubWorld/ReqJoinSubWorld": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "token",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "uid",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "time",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "subWorldId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlJoinSubWorld/ResJoinSubWorld": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "currentUser",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "subWorldData",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/SubWorldData/SubWorldData"
                    }
                }
            ]
        },
        "../../types/UserInfo/UserInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 2,
                    "name": "uid",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "name",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 4,
                    "name": "visualId",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../../types/SubWorldData/SubWorldData": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "name",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "maxUser",
                    "type": {
                        "type": "Number",
                        "scalarType": "uint"
                    }
                },
                {
                    "id": 4,
                    "name": "users",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../types/UserInfo/UserInfo"
                        }
                    }
                },
                {
                    "id": 5,
                    "name": "messages",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Interface",
                            "properties": [
                                {
                                    "id": 0,
                                    "name": "user",
                                    "type": {
                                        "type": "Reference",
                                        "target": "../../types/UserInfo/UserInfo"
                                    }
                                },
                                {
                                    "id": 1,
                                    "name": "time",
                                    "type": {
                                        "type": "Date"
                                    }
                                },
                                {
                                    "id": 2,
                                    "name": "content",
                                    "type": {
                                        "type": "String"
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        },
        "PtlSendChat/ReqSendChat": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "content",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "PtlSendChat/ResSendChat": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "s2cMsg/MsgArrowStates/MsgArrowStates": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "arrowStates",
                    "type": {
                        "type": "Interface",
                        "indexSignature": {
                            "keyType": "String",
                            "type": {
                                "type": "Reference",
                                "target": "../../types/SubWorldArrowState/SubWorldArrowState"
                            }
                        }
                    }
                }
            ]
        },
        "s2cMsg/MsgChat/MsgChat": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "time",
                    "type": {
                        "type": "Date"
                    }
                },
                {
                    "id": 1,
                    "name": "user",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "content",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "s2cMsg/MsgMonsterStates/MsgMonsterStates": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "monsterStates",
                    "type": {
                        "type": "Interface",
                        "indexSignature": {
                            "keyType": "String",
                            "type": {
                                "type": "Reference",
                                "target": "../../types/SubWorldMonsterState/SubWorldMonsterState"
                            }
                        }
                    }
                }
            ]
        },
        "s2cMsg/MsgUserExit/MsgUserExit": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "time",
                    "type": {
                        "type": "Date"
                    }
                },
                {
                    "id": 1,
                    "name": "user",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/UserInfo/UserInfo"
                    }
                }
            ]
        },
        "s2cMsg/MsgUserJoin/MsgUserJoin": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "time",
                    "type": {
                        "type": "Date"
                    }
                },
                {
                    "id": 1,
                    "name": "user",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "color",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "r",
                                "type": {
                                    "type": "Number",
                                    "scalarType": "uint"
                                }
                            },
                            {
                                "id": 1,
                                "name": "g",
                                "type": {
                                    "type": "Number",
                                    "scalarType": "uint"
                                }
                            },
                            {
                                "id": 2,
                                "name": "b",
                                "type": {
                                    "type": "Number",
                                    "scalarType": "uint"
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "s2cMsg/MsgUserStates/MsgUserStates": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "userStates",
                    "type": {
                        "type": "Interface",
                        "indexSignature": {
                            "keyType": "String",
                            "type": {
                                "type": "Reference",
                                "target": "../../types/SubWorldUserState/SubWorldUserState"
                            }
                        }
                    }
                }
            ]
        }
    }
};
import { _decorator, Component, Node } from 'cc';
import BTTree from '../../BTTree';
import { AbortType } from '../../enum';
import ActionAttack from '../action/ActionAttack';
import { ActionFailure } from '../action/ActionFailure';
import ActionLog from '../action/ActionLog';
import ActionSkill from '../action/ActionSkill';
import ActionSleep from '../action/ActionSleep';
import ActionWait from '../action/ActionWait';
import ActionWork from '../action/ActionWork';
import CompositeParallel from '../composite/CompositeParallel';
import { CompositeRandomSelector } from '../composite/CompositeRandomSelector';
import { CompositeRandomSequence } from '../composite/CompositeRandomSequence';
import { CompositeSelector } from '../composite/CompositeSelector';
import CompositeSequence from '../composite/CompositeSequence';
import ConditionalHP from '../conditional/ConditionalHP';
import ConditionalMP from '../conditional/ConditionalMP';
import { DecoratorInverter } from '../decorato/DecoratorInverter';
import { DecoratorRepeater } from '../decorato/DecoratorRepeater';

const { ccclass, property } = _decorator;

@ccclass('MyTree')
export default class MyTree extends BTTree {
    constructor() {
        super();
        this.init();
    }

    init() {

        this.root = new CompositeSelector([
            new DecoratorRepeater([
                new ConditionalMP()
            ], 3, false)
        ])

        // this.root = new CompositeSequence([
        //     new CompositeSelector([
        //         new CompositeSequence([
        //             new ConditionalMP(),
        //             new CompositeSequence([
        //                 new ActionWait(),
        //                 new ActionSkill()
        //             ])
        //         ], AbortType.Self),
        //         new CompositeSequence([
        //             new ConditionalHP(),
        //             new ActionAttack()
        //         ]),
        //         new CompositeRandomSequence([
        //             new ActionWork(),
        //             new ActionSleep()
        //         ])
        //     ])
        // ])

        
        // this.root = new CompositeSequence([
        //     new DecoratorInverter([new DecoratorInverter([new ActionLog("haha" )])]),
        //     new ActionLog("heihei")
        // ]);
    }
}



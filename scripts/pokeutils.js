export { GETmoveTooltip, GETabilityTooltip, GETitemTooltip }

import {POKEROLE} from "../../../systems/pokerole/module/helpers/config.mjs";

async function GETmoveTooltip(actor, move) {
    let title = move.name;
    let description = move.system.effect;
    let subtitle = "Move";
    let subtitlecolor = "#3B5875";
    let details = [];
    let properties = [];
    let propertiesLabel = "Properties";
    let footerText = move.system.description;
 
    details.push(
        {
            label: "Type",
            value: game.i18n.localize(POKEROLE.i18n.types[move.system.type])
        },
        {
            label: "ACC.",
            value: actor.getAccuracyPoolForMove(move)
        },
        {
            label: "DAMAGE",
            value: actor.getDamagePoolForMove(move)
        },
        {
            label: "Category",
            value: game.i18n.localize(POKEROLE.i18n.moveCategories[move.system.category])
        },
        {
            label: "Target",
            value: game.i18n.localize(POKEROLE.i18n.targets[move.system.target]) 
        },
        
    )


    // Moves attributes into Properties
    if (move.system.attributes.maneuver) {
        properties.push(
            {
                label: "Maneuver",
                isPrimary: false,
                color: "grey"
            }
        )
    }

    if (move.system.attributes.physicalRanged || move.system.category == "special") {
        properties.push(
            {
                label: "Ranged",
                isPrimary: true,
                color: "black"
            }
        )
    } else if (move.system.category == "physical") {
        properties.push(
            {
                label: "Melee",
                isPrimary: true,
                color: "black"
            }
        )
    }

    if (move.system.attributes.shieldMove) {
        properties.push(
            {
                label: "Shield Move",
                isPrimary: true,
                color: "black"
            }
        )
    }

    if (move.system.attributes.switcherMove) {
        properties.push(
            {
                label: "Switch Move",
                isPrimary: true,
                color: "black"
            }
        )
    }

    if (move.system.attributes.rampage) {
        properties.push(
            {
                label: "Rampage",
                isPrimary: true,
                color: "black"
            }
        )
    }

    if (move.system.heal.type == "basic") {
        properties.push(
            {
                label: "Basic Heal",
                isPrimary: true,
                color: "green"
            }
        )
    }

    if (move.system.heal.type == "complete") {
        properties.push(
            {
                label: "Complete Heal",
                isPrimary: true,
                color: "green"
            }
        )
    }

    if (move.system.heal.type == "leech") {
        properties.push(
            {
                label: "Drain Move",
                isPrimary: true,
                color: "green"
            }
        )
    }

    if (move.system.heal.type == "custom") {
        properties.push(
            {
                label: "Healing",
                isPrimary: true,
                color: "green"
            }
        )
    }

    if (move.system.attributes.accuracyReduction >= 0 && move.system.attributes.accuracyReduction) {
        properties.push(
            {
                label: "Accuracy -" + move.system.attributes.accuracyReduction,
                isPrimary: true,
                color: "red"
            }
        )
    }

    if (move.system.attributes.priority != 0 && move.system.attributes.priority) {
        properties.push(
            {
                label: "Priority " + move.system.attributes.priority,
                isPrimary: true,
                color: "blue"
            }
        )
    }

    if (move.system.attributes.doubleAction) {
        properties.push(
            {
                label: "Double Move",
                isPrimary: false,
                color: "green"
            }
        )
    }

    if (move.system.attributes.successiveActions) {
        properties.push(
            {
                label: "Multi-Move",
                isPrimary: false,
                color: "green"
            }
        )
    }

    if (move.system.attributes.highCritical) {
        properties.push(
            {
                label: "High Critical",
                isPrimary: false,
                color: "green"
            }
        )
    }

    if (move.system.attributes.neverFail || move.system.attributes?.neverMiss) {
        properties.push(
            {
                label: "Never Miss",
                isPrimary: false,
                color: "green"
            }
        )
    }

    if (move.system.attributes.charge) {
        properties.push(
            {
                label: "Charge Move",
                isPrimary: false,
                color: "darkgrey"
            }
        )
    }

    if (move.system.attributes.mustRecharge) {
        properties.push(
            {
                label: "Must Recharge",
                isPrimary: false,
                color: "red"
            }
        )
    }

    if (move.system.attributes.recoil) {
        properties.push(
            {
                label: "Recoil",
                isPrimary: false,
                color: "red"
            }
        )
    }

    if (move.system.attributes.fistBased) {
        properties.push(
            {
                label: "Fist Move",
                isPrimary: false,
                color: "orange"
            }
        )
    }

    if (move.system.attributes.soundBased) {
        properties.push(
            {
                label: "Sound Move",
                isPrimary: false,
                color: "orange"
            }
        )
    }

    if (move.system.attributes.ignoreDefenses) {
        properties.push(
            {
                label: "Ignore Defense",
                isPrimary: false,
                color: "grey"
            }
        )
    }

    if (move.system.attributes.resistedWithDefense && move.system.category == "special") {
        properties.push(
            {
                label: "Hits Defense",
                isPrimary: false,
                color: "grey"
            }
        )
    }

    // Moves Added Effects into Properties

    for (const effects of move.system.effectGroups){
        for (const changes of effects.effects){
            if (changes.type == "statChange"){
                properties.push({
                    label: (changes.amount < 0 ? "-" : "+") + game.i18n.localize(POKEROLE.i18n.effectStats[changes.stat]),
                    isPrimary: false,
                    color: (changes.amount < 0 ? "red" : "green")
                })
            }
            if (changes.type == "ailment"){
                properties.push({
                    label: game.i18n.localize(POKEROLE.i18n.ailments[changes.ailment]),
                    isPrimary: false,
                    color: POKEROLE.getAilments()[changes.ailment].tint
                })
            }
        }

    }

    return { title, description, subtitle, subtitlecolor, details, properties , propertiesLabel, footerText }
}

async function GETitemTooltip(item) {
    let title = item.name;
    let description = item.system.description;
    let subtitle = "Item";
    let subtitlecolor = "#453B75E6";
    let details = [];
    let properties = [];
    let propertiesLabel = null;
    let footerText = null;
 
    details.push(
        {
            label: "Quantity",
            value: item.system.quantity
        },
        {
            label: "Price",
            value: item.system.price
        },
        
    )

    properties.push(
        {
            label: POKEROLE.itemCategory[item.system.pocket] ?? "Misc Item",
            isPrimary: false,
            color: "orange"
        }
    )

    return { title, description, subtitle, subtitlecolor, details, properties , propertiesLabel, footerText }
}

async function GETabilityTooltip(item) {
    let title = item.name;
    let description = item.system.description;
    let subtitle = "Ability";
    let subtitlecolor = "#453B75E6";
    let details = [];
    let properties = [];
    let propertiesLabel = null;
    let footerText = null;

    return { title, description, subtitle, subtitlecolor, details, properties , propertiesLabel, footerText }
}

/*
{
    "lethal": false,
    "alwaysCrit": false,
    "destroyShield": false,
    "userFaints": false,
    "resetTerrain": false,
    "resistedWithDefense": false,
}
    */
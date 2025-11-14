import { successRollAttributeDialog, successRollSkillDialog } from "../../../systems/pokerole/module/helpers/roll.mjs";
import { GETmoveTooltip, GETabilityTooltip, GETitemTooltip } from "./pokeutils.js";

import {POKEROLE} from "../../../systems/pokerole/module/helpers/config.mjs";

const ModuleName = "enhancedcombathud-pokerole";
const SystemName = "pokerole";

Hooks.on("argonInit", (CoreHUD) => {
    const ARGON = CoreHUD.ARGON;
    
    class POKEROLEPortraitPanel extends ARGON.PORTRAIT.PortraitPanel {
        
        constructor(...args) {
                super(...args);
        }

    async _getButtons() {
        return [
            {
                id: "toggle-minimize",
                icon: "fas fa-caret-down",
                label: "Minimize",
                onClick: (e) => ui.ARGON.toggleMinimize(),
            },
            {
                id: "open-sheet",
                icon: "fas fa-suitcase",
                label: "Open Character Sheet",
                onClick: (e) => this.actor.sheet.render(true),
            },
            {
                id: "roll-initiative",
                icon: "fas fa-dice-d20",
                label: "Roll Initiative",
                onClick: (e) => this.actor.rollInitiative({ rerollInitiative: true, createCombatants: true }),
            },
        ];
    }

        get description() {
            return this.actor.system.rank.toUpperCase() + " - " + this.actor.system.species ;
        }

        get isDead() {
            return (this.actor.system.hp.value == 0);
        }

        get effectClass() {
            return POKEROLEeffects;
        }

        async getEffects() {
            const effects = [];
            for(const effect of this.actor.temporaryEffects) {
                effects.push({img: effect.img, name: effect.name, tooltip: await TextEditor.enrichHTML(effect.tooltip), tint: effect.tint});
            }
            return effects;
        }

        async getStatBlocks() { 

            let hpcolor = "rgb(0 255 170)";
            if (this.actor.system.hp.value <= 1) {
                hpcolor = "rgb(255 0 0)";
            } else if (this.actor.system.hp.value <= (this.actor.system.hp.max / 2)) {
                hpcolor = "rgb(230 250 0)";
            };

            return [
                [
                    {
                        text: `${this.actor.system.hp.value}`,
                        color: hpcolor,
                    },
                    {
                        text: `/`,
                    },
                    {
                        text: `${this.actor.system.hp.max}`,
                        color: hpcolor,
                    },
                    {
                        text: "HP",
                    },
                ],
                [
                    {
                        text: `${this.actor.system.will.value}`,
                        color: "rgb(0 182 255)",
                    },
                    {
                        text: `/`,
                    },
                    {
                        text: `${this.actor.system.will.max}`,
                        color: "rgb(0 182 255)",
                    },
                    {
                        text: "WP",
                    },
                ],
                
            ];
        };

        async _renderInner(data) {
			await super._renderInner(data);
            // Player Button mod
            const actormenu = this.element.querySelector(".player-buttons")
            actormenu.style = "left: 0px; justify-content: unset;"
            const imagesin = this.element.querySelector(".portrait-hud-image")
            imagesin.classList.add("pokerole-portrait-fix")
            // Added Icon Type
            let types = []

            let type1 = this.actor.system.type1
            let type2 = this.actor.system.type2
            let type3 = this.actor.system.type3

            if (type1 && type1 != "none" && type1 != ""){
                types.push(type1)
            }
            if (type2 && type2 != "none" && type2 != ""){
                types.push(type2)
            }
            if (type3 && type3 != "none" && type3 != "" && this.actor.system.hasThirdType){
                types.push(type3)
            }

            const typecontainer = document.createElement("div");

            typecontainer.style = `position: absolute; top: 5px; left: 3px; z-index: 10; display: flex; gap: 1px; opacity: 75%;`;

            for (let symbol of types) {
                let typesymbol = document.createElement("div");
                typesymbol.style = `background-image: url(systems/pokerole/images/types/${symbol}.svg);width: 60px;height: 60px;`
                typecontainer.appendChild(typesymbol)
            }

            this.element.appendChild(typecontainer)
            
        }

	}

    class POKEROLEeffects extends ARGON.PORTRAIT.Effect {
        constructor(effect) {
            super(effect);
            this.effect = effect;
        }

        get template() {
            return `modules/enhancedcombathud-pokerole/templates/effects.hbs`;
        }

        async getData() {
            return {
                label: this.label,
                icon: this.icon,
                tint: this.effect.tint
            };
        }
	}

    class POKEROLEDrawerButton extends ARGON.DRAWER.DrawerButton {
        constructor(buttons, item, type) {
            super(buttons);
            this.item = item;
            this.type = type;
        }
    }

    class POKEROLEDrawerPanel extends ARGON.DRAWER.DrawerPanel {
        constructor(...args) {
            super(...args);

            Hooks.on("updateActor", (actor, changes, infos, userid) => {
				if (this.actor == actor) {
					this.render();
				}
			});

        }

        get categories() {
            const attributes = {...this.actor.system.attributes};
            const skills = this.actor.system.skills;
            const derivedmod = this.actor.system.derived;

            let returncategories = [];

            const attributesButtons = Object.keys(attributes).map((attribute) => {
				
				let valuelabel = this.actor.getAnyAttribute(attribute).value;
				let attributename = game.i18n.localize(POKEROLE.i18n.attributes[attribute]);
				return new POKEROLEDrawerButton([
					{
						label: `${attributename}`,
						onClick: () => successRollAttributeDialog(
                            { name: attribute, value: valuelabel },
                            {
                                painPenalty: this.actor.system.painPenalty,
                                confusionPenalty: this.actor.hasAilment('confused'),
                                userRank: this.actor.system.rank,
                            },
                            {
                                speaker: ChatMessage.implementation.getSpeaker({ actor: this.actor })
                            }
                        ),
                        style: "display: flex; font-size: 20px;",
					},
					{
						label: valuelabel,
						style: "display: flex; justify-content: flex-end; font-size: 20px;",
					}
				],
                attribute,
                "attribute"
                );
			});

            returncategories.push({
						gridCols: "7fr 2fr",
						captions: [
							{
								label: "Attributes"
							},
							{
								label: "Rolls",
							},
						],
						buttons: attributesButtons
			});

            const skillsButtons = Object.keys(skills).map((skill) => {
                const skillData = skills[skill];
                let value = this.actor.getSkill(skill).value;
                let skillname = game.i18n.localize(POKEROLE.i18n.skills[skill]);
                return new POKEROLEDrawerButton(
                    [
                        {
                            label: `${skillname}`,
                            onClick: () => successRollSkillDialog(
                                    { name: skill, value },
                                    this.actor.getIntrinsicOrSocialAttributes(),
                                    {
                                    painPenalty: this.actor.system.painPenalty,
                                    confusionPenalty: this.actor.hasAilment('confused'),
                                    userRank: this.actor.system.rank,
                                    },
                                    {
                                    speaker: ChatMessage.implementation.getSpeaker({ actor: this.actor })
                                    }
                                  ),
                            style: "display: flex; font-size: 20px;"
                        },
                        {
                            label: `${skillData.value}`,
                            style: "display: flex; justify-content: flex-end; font-size: 20px;",
                        },
                    ],
                    skill,
                    "skill",
                );
            });

            returncategories.push({
                    gridCols: "7fr 2fr",
                    captions: [
                        {
                            label: "Skills",
                        },
                        {
                            label: "Rolls",
                        },
                    ],
                    buttons: skillsButtons,
            });

            const derivedButtons = Object.keys(derivedmod).map((derived) => {
                let valuelabel = this.actor.getAnyAttribute(derived).value;
                let derivedname = game.i18n.localize(POKEROLE.i18n.derived[derived]);
                return new POKEROLEDrawerButton(
                    [
                        {
                            label: `${derivedname}`,
                            onClick: () => successRollAttributeDialog(
                            { name: derived, value: valuelabel },
                            {
                                painPenalty: this.actor.system.painPenalty,
                                confusionPenalty: this.actor.hasAilment('confused'),
                                userRank: this.actor.system.rank,
                            },
                            {
                                speaker: ChatMessage.implementation.getSpeaker({ actor: this.actor })
                            }
                        ),
                            style: "display: flex; font-size: 20px;"
                        },
                        {
                            label: `${valuelabel}`,
                            style: "display: flex; justify-content: flex-end; font-size: 20px;",
                        },
                    ],
                    derived,
                    "Derived",
                );
            });

            returncategories.push({
                    gridCols: "7fr 2fr",
                    captions: [
                        {
                            label: "References",
                        },
                        {
                            label: "Rolls",
                        },
                    ],
                    buttons: derivedButtons,
            });

            return returncategories
        }

        get title() {
            return `Attributes / Skills / References`;
        }

        async _renderInner(data) {
			await super._renderInner(data);

		}

    }

    class POKEROLEitembutton extends ARGON.MAIN.BUTTONS.ItemButton {
		constructor(...args) {
			super(...args);
		}

		get hasTooltip() {
			return true;
		}

        async getTooltipData() {
            return GETmoveTooltip(this.actor, this.item)
        }

        get icon() {
            if (this.item.type == "ability"){
                return "modules/enhancedcombathud-pokerole/icons/ability.svg";
            }

			return this.item.img;
		}

        get isWeaponSet() {
            return false;
        }

		get targets() {
			return null;
		}

		get quantity() {
			return null;
		}

        async _onLeftClick(event) {
			
			ui.ARGON.interceptNextDialog(event.currentTarget.closest(".item-button"));
			
			if (this.item.type == "move" || this.item.type == "item" || this.item.type == "ability") {
				this.item.use()
		    }
        }
	
		async _renderInner(data) {
			await super._renderInner(data);

            let titlepanel = this.element.querySelector("span");

            titlepanel.style.setProperty("backdrop-filter","none")

            switch (this.item?.type){
                case "move":
                    if (this.item?.system.usedInRound == true) {
                        titlepanel.parentElement.style.setProperty('opacity', '60%');
                    } else {
                        titlepanel.parentElement.style.setProperty('opacity', '100%');
                    }
                    titlepanel.parentElement.style.setProperty("background-color","var(--ech-mainAction-base-background)");
                    titlepanel.parentElement.style.setProperty("border", "1px solid var(--ech-mainAction-base-border)");
                    titlepanel.parentElement.style.setProperty("color", "var(--ech-mainAction-base-color)");
                    break;
                case "item":
                    titlepanel.parentElement.style.setProperty("background-color","var(--ech-freeAction-base-background)");
                    titlepanel.parentElement.style.setProperty("border", "1px solid var(--ech-freeAction-base-border)");
                    titlepanel.parentElement.style.setProperty("color", "var(--ech-freeAction-base-color)");
                    break;

                case "ability":
                    titlepanel.parentElement.style.setProperty("background-color","var(--ech-freeAction-base-background)");
                    titlepanel.parentElement.style.setProperty("border", "1px solid var(--ech-freeAction-base-border)");
                    titlepanel.parentElement.style.setProperty("color", "var(--ech-freeAction-base-color)");
                    break;
            }

		}

	}

    class POKEROLEactionbutton extends ARGON.MAIN.BUTTONS.ActionButton {
		constructor({action,labelplate,color,item = {}}) {
			super();
            this.action = action;
            this.labelplate = labelplate;
            this.color = color;
            this.item = item;
		}

        get classes() {
            return ["action-element"];
        }

        get hasTooltip() {
			return true;
		}

        async getTooltipData() {
            let title = "No item";
            let description = null;
            let subtitle = null;
            let subtitlecolor = null;
            let details = [];
            let properties = null;
            let propertiesLabel = null;
            let footerText = null;

            

            if (this.action == "clash") {
                title = "Clash";
                details.push({label: "Physical Clash", value: this.actor.system.derived.clashPhysical.value}, {label: "Special Clash", value: this.actor.system.derived.clashSpecial.value})
            }
            if (this.action == "evade") {
                title = "Evasion";
                details.push({label: "Evasion", value: this.actor.system.derived.evade.value})
            }
    
            return { title, description, subtitle, subtitlecolor, details, properties , propertiesLabel, footerText }
        }

        get colorScheme() {
            
            return this.color;
        }

        get spendItem() {
            if (this.action == "clash"){
                return this.actor.system.canClash
            }
            if (this.action == "evade"){
                return this.actor.system.canEvade
            }
            return true
        }

        get label() {
            return this.labelplate;
        }

        async getData() {
            return {
            label: this.label,
            icon: this.icon
            }
        }

        async _onLeftClick(event) {

            switch (this.action) {
                case "clash":
                    return this.actor.update({ 'system.canClash': !this.actor.system.canClash });
                case "evade":
                    return this.actor.update({ 'system.canEvade': !this.actor.system.canEvade });
            }

        }

        get icon() {
            switch (this.action) {
                case "clash":
                    return "modules/enhancedcombathud-pokerole/icons/clash.svg";
                case "evade":
                    return "modules/enhancedcombathud-pokerole/icons/evade.svg";
                default:
                    return "modules/enhancedcombathud-pokerole/icons/moves.svg";
            }
        
        }

        async _renderInner(data) {
            await super._renderInner(data);
            if (!this.spendItem) {
                this.element.classList.add("spend-item")
            }
        }

	}


    class POKEROLEactionbuttonitem extends ARGON.MAIN.BUTTONS.ActionButton {
		constructor({item = {}, color}) {
			super();
            this.color = color;
            this.item = item;
		}

        get classes() {
            return ["action-element"];
        }

        get colorScheme() {
            return this.color;
        }

        get hasTooltip() {
			return true;
		}

        async getTooltipData() {
            if (this.item.type == "item"){
                return GETitemTooltip(this.item)
            }
            if (this.item.type == "ability") {
                return GETabilityTooltip(this.item)
            }
            return null
        }

        get label() {
            if (this.item?.name){
                return this.item.name
            }
            return "[ Empty ]";
        }

        async getData() {
            return {
            label: this.label,
            icon: this.icon
            }
        }

        async _onLeftClick(event) {
			
			ui.ARGON.interceptNextDialog(event.currentTarget.closest(".item-button"));

			if (this.item?.name){
                this.item.use()
            }

        }

        get icon() {
            if (this.item.type == "ability"){
                return "modules/enhancedcombathud-pokerole/icons/ability.svg";
            }
            if (this.item?.img) {
                return this.item.img;
            }   
            return "modules/enhancedcombathud-pokerole/icons/item.svg"
        }


	}

    class POKEROLEitempanel extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
		constructor({type, subtype, color}) {
			super();
			this.type = type;
			this.color = color;
			this.subtype = subtype;
		}

		get colorScheme() {
			return this.color;
		}

		get label() {

            if (this.type == "move") {
				switch (this.subtype) {
					case "learned" : return "Moves";
                    case "maneuver": return "Maneuvers";
				}
			}

			return "Panel"
		}

		get icon() {

            if (this.type == "move") {
				switch (this.subtype) {
					case "learned" : return "modules/enhancedcombathud-pokerole/icons/moves.svg";
                    case "maneuver": return "modules/enhancedcombathud-pokerole/icons/maneuver.svg";
				}
			}

			return "modules/enhancedcombathud-pokerole/icons/null.png"
		}

        _onNewRound(combat) {
            super._onNewRound(combat);
            this.updateActionUse();
		}
		
		async _getPanel() {

			let validitems = this.actor.items.filter(item => item.type == this.type);

            if (this.type == "move") {

				switch (this.subtype) {
					case "learned" :
						validitems = validitems.filter(item => (item.system.learned == true && item.system.attributes.maneuver == false));
					break;
                    case "maneuver":
                       validitems = validitems.filter(item => item.system.attributes.maneuver == true);
					break;
				}
			}
			
			return new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({buttons: validitems.map(item => new POKEROLEitembutton({item}))});
		}
    }

    class POKEROLEactionssection extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);

			Hooks.on("updateItem", (item, changes, infos, userid) => {
				if (item.type == "move" && changes?.system?.usedInRound) {
                    if (item.actor == this.actor) {
                        this.render();
                    }
                }
			});

            Hooks.on("updateActor", (actor, changes, infos, userid) => {
				if (this.actor == actor) {
                    if (changes?.system){
  					    this.render();                  
                    }
				}
			});
		}

		get label() {
			return "Actions"
		}
		
        get maxActions() {
            return this.actor.system.actionCount.max;
        }

        get currentActions() {
			return this.actor.system.actionCount.max - this.actor.system.actionCount.value;
		}
		
		async _getButtons() {

			let buttons = [];
			
			buttons.push(new POKEROLEitempanel({type: "move", subtype: "learned", color: 0}));

            buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new POKEROLEactionbutton({action: "clash", labelplate: "Clash", color: 3}), new POKEROLEactionbutton({action: "evade", labelplate: "Evasion", color: 3})));

            buttons.push(new POKEROLEitempanel({type: "move", subtype: "maneuver", color: 1}));

			return buttons;
		}
    }

    class POKEROLEpasivessection extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);

            Hooks.on("updateActor", (actor, changes, infos, sender) => {

                    if (changes?.system?.activeItem || changes?.system?.activeAbility){
                        if (this.actor == actor) {
							this.render();
						}
                    }
						
		    });
		}

		get label() {
			return "Held Item / Ability"
		}
		
        get maxActions() {
            return 0;
        }

        get currentActions() {
			return 0;
		}
		
		async _getButtons() {

			let buttons = [];

            let helditem = this.actor.items.find((item) => item._id == this.actor.system.activeItem)

            let heldability = this.actor.items.find((item) => item._id == this.actor.system.activeAbility)
			
			buttons.push(new POKEROLEactionbuttonitem({item: helditem, color: 1}));

            buttons.push(new POKEROLEactionbuttonitem({item: heldability, color: 1}));

			return buttons;
		}
    }

     class POKEROLEbuttonHUD extends ARGON.ButtonHud {
        constructor(...args) {
            super(...args);
        }

        get visible() {
            return true;
        }

        async _getButtons() {

            return [
                {
                    label: "Action +",
                    onClick: (event) => (this.actor.increaseActionCount()),
                    icon: "fas fa-plus",
                    color: "white"
                },
                {
                    label: "Reset",
                    onClick: (event) => (this.actor.resetRoundBasedResources()),
                    icon: "fas fa-recycle",
                    color: "white"
                },
            ];
        }
    }

    class POKEROLEnullweapons extends ARGON.WeaponSets {
        constructor(...args) {
            super(...args);
        }

        async _onSetChange({sets, active}) {
        }

        async _onDrop(event) {

        }

        get visible() {
                return false;
            }

    }

    class POKEROLEmovementHUD extends ARGON.MovementHud {
        constructor(...args) {
            super(...args);
        }

        get visible() {
            return false;
        }

        get movementMode() {
            return "walk";
        }

        get movementMax() {
            return 5;
        }
    }

  
    CoreHUD.definePortraitPanel(POKEROLEPortraitPanel);
    CoreHUD.defineDrawerPanel(POKEROLEDrawerPanel);
    CoreHUD.defineMainPanels([POKEROLEactionssection, POKEROLEpasivessection, ARGON.PREFAB.PassTurnPanel]);  
	CoreHUD.defineMovementHud(POKEROLEmovementHUD);
    CoreHUD.defineWeaponSets(POKEROLEnullweapons);
    CoreHUD.defineButtonHud(POKEROLEbuttonHUD);

});
/*:
 * @target MZ
 * @plugindesc This mod adds contract clauses affecting Liora's hairstyle and dye to make them automatically vary.
 * @author HydraCat
 * 
 * @help
 * This mod adds contract clauses affecting Liora's hairstyle and dye to make them automatically vary.
 * 
 */

(($) => {
    // Indicate that the mod is active
    if (!AuraMZ.gameVersion.includes("-modded")){
        AuraMZ.gameVersion = AuraMZ.gameVersion + "-modded";
    }

    $.hairstyles = {0:[0,3,1,2], 1:[3,1,2]};
    $.hairdyes = {0:[0,1,2], 1:[1,2]};

    //Load plugin after liora_proposals
	const checkInterval = setInterval(() => {
		if (PluginManagerEx.isExistPlugin("liora_proposals")) {
            clearInterval(checkInterval);

            const hair1Script = `
            let option = $.hairstyles[0][Math.floor(Math.random() * $.hairstyles[0].length)];
            const costume = Liora.costume(option, 3);
            const armorId = costume.id;
            if ($gameActors.actor(1).equips()[2] == costume){//Lia is already wearing the chosen hairstyle
            }else {
                //Make sure Liora has the required costume (Hair stuff gets deleted each time)
                if (!Liora.hasCostume(costume.id)) {
                    $gameParty.gainItem(costume, 1);
                }
                //Equip the new hairstyle
                let interpreter = context.interpreter;
                if (interpreter._childInterpreter){
                    interpreter = interpreter._childInterpreter;
                }
                interpreter.setupChild([{"code":122,"indent":0,"parameters":[$.EVENT_TMP_VARIABLE_ID,$.EVENT_TMP_VARIABLE_ID,0,0,armorId]},{"code":117,"indent":0,"parameters":[$.UPDATE_COSTUME_PART_COMMON_EVENT_ID]}], 0);
            }
            `
            const hairdye1Script = `
            let option = $.hairdyes[0][Math.floor(Math.random() * $.hairdyes[0].length)];
            const costume = Liora.costume(option, 5);
            const armorId = costume.id;
            if ($gameActors.actor(1).equips()[4] == costume){//Lia is already wearing the chosen hairdye
            }else {
                //Make sure Liora has the required costume (Hair stuff gets deleted each time)
                if (!Liora.hasCostume(costume.id)) {
                    $gameParty.gainItem(costume, 1);
                }
                //Equip the new hairdye
                let interpreter = context.interpreter;
                if (interpreter._childInterpreter){
                    interpreter = interpreter._childInterpreter;
                }
                interpreter.setupChild([{"code":122,"indent":0,"parameters":[$.EVENT_TMP_VARIABLE_ID,$.EVENT_TMP_VARIABLE_ID,0,0,armorId]},{"code":117,"indent":0,"parameters":[$.UPDATE_COSTUME_PART_COMMON_EVENT_ID]}], 0);
            }
            `
            const effectToString = "\\c[10]%1\\c[0] shall change to a \\c[10]TIER %3\\c[0] %4 of \\c[10]%2's\\c[0] choice."
            const hair1Effect = { id: $.EFFECTS.SCRIPT.id, params: [hair1Script, effectToString.format("LIORA", "EDGAR", 1, "Hairstyle"), "400", $.COSTUME_ICON_ID]}
            const hairdye1Effect = { id: $.EFFECTS.SCRIPT.id, params: [hairdye1Script, effectToString.format("LIORA", "EDGAR", 1, "Hairdye"), "900", $.COSTUME_ICON_ID]}
            //Add proposals to trigger randomization every Moonday
            proposals = $.Proposals.data["1"]
            newProposals = [
                {
                    id: "hair-1-randomize",
                    category: "Looks", subjectIds: [14], targetId: 1,
                    conditions: [{ id: $.TRIGGERS.DIALOGUE.id, params: ["dayStart"] }],
                    effects: [hair1Effect],
                    requires: () => $.getClauseWithEffect({ id: $.EFFECTS.COSTUME.id, params: [undefined, 3] }) && !$.getClauseWithEffect(hair1Effect),
                    prerestriction: { id: $.TRIGGERS.RESTRICT_DAY.id, params: [6] }
                },
                {
                    id: "hairdye-1-randomize",
                    category: "Looks", subjectIds: [14], targetId: 1,
                    conditions: [{ id: $.TRIGGERS.DIALOGUE.id, params: ["dayStart"] }],
                    effects: [hairdye1Effect],
                    requires: () => $.getClauseWithEffect({ id: $.EFFECTS.COSTUME.id, params: [undefined, 5] }) && !$.getClauseWithEffect(hairdye1Effect),
                    prerestriction: { id: $.TRIGGERS.RESTRICT_DAY.id, params: [6] }
                }
            ]
            $.Proposals.data["1"] = $.Proposals.data["1"].concat(newProposals);
            
            //Add text value for dayStart to the proposal params
            $.Proposals.Params["triggerDialogueTagTexts"] = JSON.stringify(JSON.parse($.Proposals.Params["triggerDialogueTagTexts"]).concat(["{\"key\":\"dayStart\",\"value\":\"1\",\"text_cte\":\"-Shouldn't Appear-\"}"]));
            //Reset Clauses
            $.defaultClauses = $.instantiateClausesFromDatabase($.Proposals.data);
            $.backupClauses = $.instantiateClausesFromDatabase($.Proposals.data_backup);
            $.valuedTexts.forEach(valuedText => $.parseValuedTextParam(valuedText));
            $.endCachingAvailableClauses();
		}
	}, 50);

})(Liora.Contract);
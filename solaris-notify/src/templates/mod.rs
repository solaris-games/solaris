use serde_json::Value;

/// Generate a human-readable (title, body) for each event type.
pub fn render(event_type: &str, data: &Value) -> (String, String) {
    match event_type {
        // Game lifecycle
        "gameStarted" => ("Game Started".into(), "The game has started. Good luck!".into()),
        "gameEnded" => ("Game Ended".into(), "The game has ended.".into()),
        "playerJoined" => {
            let alias = str_field(data, "playerAlias");
            ("Player Joined".into(), format!("{alias} has joined the game."))
        }
        "playerQuit" => {
            let alias = str_field(data, "playerAlias");
            ("Player Quit".into(), format!("{alias} has quit the game."))
        }
        "playerDefeated" => {
            let alias = str_field(data, "playerAlias");
            ("Player Defeated".into(), format!("{alias} has been defeated."))
        }
        "playerAfk" => {
            let alias = str_field(data, "playerAlias");
            ("Player AFK".into(), format!("{alias} is now AFK."))
        }

        // Combat
        "playerCombatStar" => {
            let star = str_field(data, "starName");
            ("Star Combat".into(), format!("Combat occurred at {star}."))
        }
        "playerCombatCarrier" => ("Carrier Combat".into(), "A carrier combat has occurred.".into()),

        // Economy
        "playerGalacticCycleComplete" => {
            let credits = num_field(data, "credits");
            ("Cycle Complete".into(), format!("Galactic cycle complete. Credits: ${credits}."))
        }
        "playerBulkInfrastructureUpgraded" => (
            "Infrastructure Upgraded".into(),
            "Bulk infrastructure upgrade complete.".into(),
        ),

        // Research
        "playerResearchComplete" => {
            let tech = str_field(data, "technologyKey");
            let level = num_field(data, "technologyLevel");
            (
                "Research Complete".into(),
                format!("Finished researching {tech} level {level}."),
            )
        }

        // Trade
        "playerCreditsReceived" => {
            let amount = num_field(data, "credits");
            let from = str_field(data, "fromPlayerAlias");
            ("Credits Received".into(), format!("Received ${amount} from {from}."))
        }
        "playerCreditsSent" => {
            let amount = num_field(data, "credits");
            let to = str_field(data, "toPlayerAlias");
            ("Credits Sent".into(), format!("Sent ${amount} to {to}."))
        }
        "playerTechnologyReceived" => {
            let tech = str_field(data, "technologyKey");
            let from = str_field(data, "fromPlayerAlias");
            ("Technology Received".into(), format!("Received {tech} from {from}."))
        }
        "playerTechnologySent" => {
            let tech = str_field(data, "technologyKey");
            let to = str_field(data, "toPlayerAlias");
            ("Technology Sent".into(), format!("Sent {tech} to {to}."))
        }
        "playerRenownReceived" => {
            let amount = num_field(data, "renown");
            let from = str_field(data, "fromPlayerAlias");
            ("Renown Received".into(), format!("Received {amount} renown from {from}."))
        }
        "playerRenownSent" => ("Renown Sent".into(), "You sent renown.".into()),
        "playerCreditsSpecialistsReceived" => {
            let from = str_field(data, "fromPlayerAlias");
            ("Specialist Tokens Received".into(), format!("Received specialist tokens from {from}."))
        }
        "playerCreditsSpecialistsSent" => ("Specialist Tokens Sent".into(), "You sent specialist tokens.".into()),

        // Gifts
        "playerGiftReceived" => {
            let from = str_field(data, "fromPlayerAlias");
            ("Gift Received".into(), format!("Received a carrier gift from {from}."))
        }
        "playerGiftSent" => ("Gift Sent".into(), "You sent a carrier gift.".into()),

        // Diplomacy
        "playerDiplomaticStatusChanged" => ("Diplomacy Changed".into(), "A diplomatic status has changed.".into()),
        "gameDiplomacyWarDeclared" => ("War Declared".into(), "War has been declared!".into()),
        "gameDiplomacyPeaceDeclared" => ("Peace Declared".into(), "Peace has been declared.".into()),

        // Stars
        "playerStarAbandoned" => {
            let star = str_field(data, "starName");
            ("Star Abandoned".into(), format!("Star {star} has been abandoned."))
        }
        "playerStarDied" => {
            let star = str_field(data, "starName");
            ("Star Died".into(), format!("Star {star} has died."))
        }
        "playerStarReignited" => {
            let star = str_field(data, "starName");
            ("Star Reignited".into(), format!("Star {star} has been reignited!"))
        }

        // Debt
        "playerDebtForgiven" => ("Debt Forgiven".into(), "A debt has been forgiven.".into()),
        "playerDebtSettled" => ("Debt Settled".into(), "A debt has been settled.".into()),

        // Conversations
        "playerConversationCreated" => ("Conversation Created".into(), "A new conversation has been created.".into()),
        "playerConversationInvited" => ("Conversation Invite".into(), "You've been invited to a conversation.".into()),
        "conversationMessageSent" => {
            let from = str_field(data, "fromPlayerAlias");
            ("New Message".into(), format!("Message from {from}."))
        }
        "playerConversationLeft" => ("Left Conversation".into(), "A player left the conversation.".into()),

        // Specialists
        "playerCarrierSpecialistHired" => ("Specialist Hired".into(), "A carrier specialist has been hired.".into()),
        "playerStarSpecialistHired" => ("Specialist Hired".into(), "A star specialist has been hired.".into()),

        // Badges
        "playerBadgePurchased" => ("Badge Purchased".into(), "A badge has been purchased.".into()),

        // Fallback
        _ => {
            let title = event_type
                .replace("player", "")
                .replace("game", "")
                .chars()
                .fold(String::new(), |mut acc, c| {
                    if c.is_uppercase() && !acc.is_empty() {
                        acc.push(' ');
                    }
                    acc.push(c);
                    acc
                });
            (title, format!("Event: {event_type}"))
        }
    }
}

fn str_field(data: &Value, key: &str) -> String {
    data.get(key)
        .and_then(|v| v.as_str())
        .unwrap_or("Unknown")
        .to_string()
}

fn num_field(data: &Value, key: &str) -> String {
    data.get(key)
        .and_then(|v| v.as_f64().or_else(|| v.as_i64().map(|i| i as f64)))
        .map(|n| format!("{n}"))
        .unwrap_or_else(|| "0".to_string())
}

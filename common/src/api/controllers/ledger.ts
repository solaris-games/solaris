import { GetRoute, PutRoute } from "./index";
import type { PlayerLedgerDebt } from "../../types/common/player";

export type LedgerModificationResponse<ID> = {
    isNew: boolean;
    ledger: PlayerLedgerDebt<ID>;
};

export const createLedgerRoutes = <ID>() => ({
    detailLedgerCredits: new GetRoute<
        { gameId: ID },
        {},
        PlayerLedgerDebt<ID>[]
    >("/api/game/:gameId/ledger/credits"),
    forgiveLedgerCredits: new PutRoute<
        { gameId: ID; playerId: ID },
        {},
        {},
        LedgerModificationResponse<ID>
    >("/api/game/:gameId/ledger/credits/forgive/:playerId"),
    settleLedgerCredits: new PutRoute<
        { gameId: ID; playerId: ID },
        {},
        {},
        LedgerModificationResponse<ID>
    >("/api/game/:gameId/ledger/credits/settle/:playerId"),
    detailLedgerSpecialistTokens: new GetRoute<
        { gameId: ID },
        {},
        PlayerLedgerDebt<ID>[]
    >("/api/game/:gameId/ledger/creditsSpecialists"),
    forgiveLedgerSpecialistTokens: new PutRoute<
        { gameId: ID; playerId: ID },
        {},
        {},
        LedgerModificationResponse<ID>
    >("/api/game/:gameId/ledger/creditsSpecialists/forgive/:playerId"),
    settleLedgerSpecialistTokens: new PutRoute<
        { gameId: ID; playerId: ID },
        {},
        {},
        LedgerModificationResponse<ID>
    >("/api/game/:gameId/ledger/creditsSpecialists/settle/:playerId"),
});

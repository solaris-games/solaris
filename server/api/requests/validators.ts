import {
    GameSettingEnabledDisabled,
    stringEnumeration
} from "@solaris/common";

export const enabledDisabled = stringEnumeration<GameSettingEnabledDisabled, GameSettingEnabledDisabled[]>(['enabled', 'disabled']);

import { type Ref, computed } from "vue";
import { type SortInfo } from "@/services/data/sortInfo";
import type {Game, Player} from "@/types/game";
import type {MapObject} from "@solaris/common";
import GameHelper from "@/services/gameHelper";
import {useSorted} from "@/util/sort";

export const useSortedMapObjectData = <A extends MapObject<string>>(tableData: Ref<A[]>, sortInfo: Ref<SortInfo>, showAll: Ref<boolean>, game: Ref<Game>, searchFilter: (v: A) => boolean) => {
  const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));

  const filteredTableData = computed(() => {
    let td = tableData.value;

    if (!showAll.value && userPlayer.value !== undefined) {
      td = tableData.value.filter(s => s.ownedByPlayerId === userPlayer.value!._id && searchFilter(s));
    }
    else {
      return tableData.value.filter(searchFilter);
    }

    return td;
  })

  return useSorted(game, filteredTableData, sortInfo);
};

export const useSortedPlayerData = (tableData: Ref<Player[]>, sortInfo: Ref<SortInfo>, showAll: Ref<boolean>, game: Ref<Game>, searchFilter: (v: Player) => boolean) => {
  const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));

  const filteredTableData = computed(() => {
    let td = tableData.value;

    if (!showAll.value && userPlayer.value !== undefined) {
      td = tableData.value.filter(s => s._id === userPlayer.value!._id && searchFilter(s));
    }
    else {
      return tableData.value.filter(searchFilter);
    }

    return td;
  })

  return useSorted(game, filteredTableData, sortInfo);
};

export type SortInfo = {
  propertyPaths: string[][];
  sortAscending: boolean;
};

export const createSortInfo = (
  propertyPaths: string[][],
  sortAscending: boolean,
): SortInfo => ({
  propertyPaths,
  sortAscending,
});

export const swapSort = (
  sortInfo: SortInfo,
  propertyPaths: string[][] | string[],
): SortInfo => {
  if (
    JSON.stringify(sortInfo.propertyPaths) !== JSON.stringify(propertyPaths)
  ) {
    if (Array.isArray(propertyPaths[0])) {
      return {
        sortAscending: true,
        propertyPaths: propertyPaths as string[][],
      };
    } else {
      return {
        sortAscending: true,
        propertyPaths: propertyPaths as string[][],
      };
    }
  } else {
    // Otherwise if we are sorting by the same column, flip the sort direction.
    return { ...sortInfo, sortAscending: !sortInfo.sortAscending };
  }
};

export const fromJSON = (jsonSortInfo: string, defaultSortInfo: SortInfo) => {
  let parsedSortInfo: SortInfo | null = null;

  try {
    parsedSortInfo =
      jsonSortInfo != undefined ? JSON.parse(jsonSortInfo) : null;
  } catch (e) {
    console.warn(
      `SortInfo.fromJSON failed to parse the following JSON: ${jsonSortInfo}`,
    );
    console.warn(e);
  }

  // Fall back to defaults if we have them!
  if (
    parsedSortInfo &&
    parsedSortInfo?.propertyPaths != null &&
    parsedSortInfo?.sortAscending != null
  ) {
    return {
      propertyPaths: parsedSortInfo.propertyPaths,
      sortAscending: parsedSortInfo.sortAscending,
    };
  } else {
    return {
      propertyPaths: defaultSortInfo?.propertyPaths,
      sortAscending: defaultSortInfo?.sortAscending,
    };
  }
};

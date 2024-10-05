export default class SortInfo {
  propertyPaths;
  sortAscending;

  constructor(propertyPaths, sortAscending) {
    this.propertyPaths = propertyPaths ?? null;
    this.sortAscending = sortAscending ?? true;
  }

  swapSort(propertyPaths) {
    // If sorting by a new column, reset the sort.
    if (JSON.stringify(this.propertyPaths) !== JSON.stringify(propertyPaths)) {
      this.propertyPaths = !Array.isArray(propertyPaths[0]) ? [propertyPaths] : propertyPaths;
      this.sortAscending = true
    } else {
      // Otherwise if we are sorting by the same column, flip the sort direction.
      this.sortAscending = !this.sortAscending
    }
  }

  static fromJSON(jsonSortInfo, defaultSortInfo) {
    let parsedSortInfo = null;

    try {
      parsedSortInfo = jsonSortInfo != undefined ? JSON.parse(jsonSortInfo) : null;
    }
    catch (e) {
      console.warn(`SortInfo.fromJSON failed to parse the following JSON: ${jsonSortInfo}`);
      console.warn(e);
    }

    // Fall back to defaults if we have them!
    if (parsedSortInfo?.propertyPaths != null && parsedSortInfo?.sortAscending != null) {
      return new SortInfo(parsedSortInfo?.propertyPaths, parsedSortInfo?.sortAscending);
    }
    else {
      return new SortInfo(defaultSortInfo?.propertyPaths, defaultSortInfo?.sortAscending);
    }
  }
}

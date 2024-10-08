class GridHelper {
  getNestedObject(nestedObj, pathArr) {
    if (!Array.isArray(pathArr)) {
      pathArr = pathArr.split(',')
    }

    return pathArr.reduce((obj, key) =>
      (obj && obj[key] !== undefined) ? obj[key] : null, nestedObj)
  }

  dynamicSort(data, sortInfo) {
    if (sortInfo?.propertyPaths != null) {
      data = data.sort((a, b) => this.dynamicCompare(a, b, sortInfo));
    }

    return data;
  }

  dynamicCompare(a, b, sortInfo) {
    let result = 0;

    for (let propertyPath of sortInfo.propertyPaths) {
      let bo = this.getNestedObject(b, propertyPath);
      let ao = this.getNestedObject(a, propertyPath);

      result = this.compare(ao, bo);

      if (result !== 0) {
        break;
      }
    }

    return sortInfo.sortAscending ? result : -result;
  }

  compare(a, b) {
      if (a === b) {
        return 0;
      }
      // Sort null values after everything else
      else if (a === null) {
        return 1;
      }
      else if (b === null) {
        return -1;
      }
      else {

        let result = a < b ? -1 : 1;

        // Invert booleans - we want true values to come first.
        if (typeof a === 'boolean' && typeof b === 'boolean') {
          result = -result;
        }

        return result;
      }
  }
}

export default new GridHelper()

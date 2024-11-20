class GridHelper {
  getNestedObject(nestedObj, pathArr, missingPropertyFallbackFunc) {
    if (!Array.isArray(pathArr)) {
      pathArr = pathArr.split(',')
    }

    return pathArr.reduce((obj, key) =>
                          this.getObjValue(obj, key, missingPropertyFallbackFunc),
                          nestedObj);
  }

  dynamicSort(data, sortInfo, missingPropertyFallbackFunc) {
    if (sortInfo?.propertyPaths != null) {
      data = [...data].sort((a, b) => this.dynamicCompare(a, b, sortInfo, missingPropertyFallbackFunc));
    }

    return data;
  }

  dynamicCompare(a, b, sortInfo, missingPropertyFallbackFunc) {
    let result = 0;

    for (let propertyPath of sortInfo.propertyPaths) {
      let bo = this.getNestedObject(b, propertyPath, missingPropertyFallbackFunc);
      let ao = this.getNestedObject(a, propertyPath, missingPropertyFallbackFunc);

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
      // Treat null values as smaller than anything else.
      else if (a === null) {
        return -1;
      }
      else if (b === null) {
        return 1;
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

  getObjValue(obj, key, missingPropertyFallbackFunc) {
    return ((obj != null && obj[key] === undefined && missingPropertyFallbackFunc != null) ? missingPropertyFallbackFunc(obj, key) : obj?.[key]) ?? null;
  }
}

export default new GridHelper()

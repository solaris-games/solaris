import type { SortInfo } from "@/services/data/sortInfo";

type FallbackF<A> = (o: Object, k: string) => A;

class GridHelper {
  getNestedObject<A>(
    nestedObj: Object,
    pathArr: string[] | string,
    missingPropertyFallbackFunc: FallbackF<A>,
  ) {
    if (!Array.isArray(pathArr)) {
      pathArr = pathArr.split(",");
    }

    return pathArr.reduce(
      (obj, key) => this.getObjValue(obj, key, missingPropertyFallbackFunc),
      nestedObj,
    );
  }

  dynamicSort<A, El extends Object>(
    data: Array<El>,
    sortInfo: SortInfo,
    missingPropertyFallbackFunc: FallbackF<A>,
  ) {
    if (sortInfo?.propertyPaths != null) {
      data = [...data].sort((a, b) =>
        this.dynamicCompare(a, b, sortInfo, missingPropertyFallbackFunc),
      );
    }

    return data;
  }

  dynamicCompare<A, B extends Object>(
    a: B,
    b: B,
    sortInfo: SortInfo,
    missingPropertyFallbackFunc: FallbackF<A>,
  ) {
    let result = 0;

    for (let propertyPath of sortInfo.propertyPaths) {
      let bo = this.getNestedObject(
        b,
        propertyPath,
        missingPropertyFallbackFunc,
      );
      let ao = this.getNestedObject(
        a,
        propertyPath,
        missingPropertyFallbackFunc,
      );

      result = this.compare(ao, bo);

      if (result !== 0) {
        break;
      }
    }

    return sortInfo.sortAscending ? result : -result;
  }

  compare<A>(a: A, b: A) {
    if (a === b) {
      return 0;
    }
    // Treat null values as smaller than anything else.
    else if (a === null || a === undefined) {
      return -1;
    } else if (b === null || b === undefined) {
      return 1;
    } else {
      let result = a < b ? -1 : 1;

      // Invert booleans - we want true values to come first.
      if (typeof a === "boolean" && typeof b === "boolean") {
        result = -result;
      }

      return result;
    }
  }

  getObjValue<A>(
    obj: Object,
    key: string,
    missingPropertyFallbackFunc: FallbackF<A>,
  ) {
    return (
      (obj != null &&
      obj[key] === undefined &&
      missingPropertyFallbackFunc != null
        ? missingPropertyFallbackFunc(obj, key)
        : obj?.[key]) ?? null
    );
  }
}

export default new GridHelper();

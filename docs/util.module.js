export const importUmd = async (url, module = {exports:{}}) =>
    (Function('module', 'exports', await (await fetch(url)).text()).call(module, module, module.exports), module).exports

export function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

export function getAllCombinations(list, n = 0, result = [], current = []) {
    if (n === list.length) result.push(current)
    else list[n].forEach(item => getAllCombinations(list, n + 1, result, [...current, item]))

    return result
}

let importUmd = async (url, module = {exports: {}}) =>
    (Function('module', 'exports', await (await fetch(url)).text()).call(module, module, module.exports), module).exports;

export default importUmd;

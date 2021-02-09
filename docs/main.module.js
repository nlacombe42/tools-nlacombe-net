const importUmd = async (url, module = {exports:{}}) =>
    (Function('module', 'exports', await (await fetch(url)).text()).call(module, module, module.exports), module).exports

async function init() {
    const randomWords = await importUmd('https://unpkg.com/random-words@1.1.1');

    let hashModElement = document.querySelector('[data-automation-id="hashMod"]');
    let textInputElement = hashModElement.querySelector(`[data-automation-id="text"]`);
    let moduloInputElement = hashModElement.querySelector(`[data-automation-id="modulo"]`);
    let resultElement = hashModElement.querySelector(`[data-automation-id="result"]`);

    textInputElement.value = randomWords();
    moduloInputElement.value = Number.MAX_SAFE_INTEGER;
    updateResult(textInputElement, moduloInputElement, resultElement);

    textInputElement.addEventListener('input', () => updateResult(textInputElement, moduloInputElement, resultElement));
    moduloInputElement.addEventListener('input', () => updateResult(textInputElement, moduloInputElement, resultElement));
}

function updateResult(textInputElement, moduloInputElement, resultElement) {
    const textInput = textInputElement.value;
    const modulo = moduloInputElement.value;

    resultElement.textContent = '' + simpleHash(textInput, modulo);
}

function simpleHash(string, modulo = Number.MAX_SAFE_INTEGER) {
    if (typeof string !== 'string')
        throw 'only hashes strings';

    let hash = 0;

    for (let i = 0; i < string.length; ++i) {
        const charCode = string.charCodeAt(i);

        hash = (31 * hash + (charCode & 255)) % modulo;
    }

    return hash;
}

init().then();

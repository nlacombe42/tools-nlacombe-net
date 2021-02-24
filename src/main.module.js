import {hashModComponent} from "./hashMod.module.js";
import {portfolioBalancingComponent} from "./portfolioBalancing.module.js";

async function init() {
    hashModComponent(document.querySelector('[data-automation-id="hashMod"]'));
    portfolioBalancingComponent(document.querySelector('[data-automation-id="portfolioBalancing"]'));
}

init().then();

import {getAllCombinations, importUmd, range} from "./util.module.js";

export async function portfolioBalancingComponent(element) {
    const lowdash = await importUmd('https://unpkg.com/lodash@4.17.21');
    const inputElement = element.querySelector('[data-automation-id="input"]');
    const resultElement = element.querySelector('[data-automation-id="result"]');
    const calculateElement = element.querySelector('[data-automation-id="calculate"]');

    const calculateAndShowResult = () => {
        const securitiesInfo = JSON.parse(inputElement.value);
        const result = getHowManySharesToBuyOfEach(lowdash, securitiesInfo, 2000);

        resultElement.innerText = JSON.stringify(result, undefined, 4);
    };

    inputElement.value = JSON.stringify(getDefaultInput(), undefined, 4);
    calculateElement.addEventListener('click', () => calculateAndShowResult());

    calculateAndShowResult();
}

function getDefaultInput() {
    return [
        {
            label: 'susa',
            price: 85.66,
            currentQuantity: 23,
            targetRatio: 0.25
        },
        {
            label: 'vegn',
            price: 35.77,
            currentQuantity: 55,
            targetRatio: 0.25
        },
        {
            label: 'voo',
            price: 356.22,
            currentQuantity: 6,
            targetRatio: 0.25
        },
        {
            label: 'vti',
            price: 203.98,
            currentQuantity: 9,
            targetRatio: 0.25
        }
    ];
}

function getHowManySharesToBuyOfEach(lowdash, securitiesInfo, cashAmountToInvest) {
    const currentInvestmentMoney = securitiesInfo
        .map(securityInfo => securityInfo.currentQuantity * securityInfo.price)
        .reduce((aggregate, currentValue) => aggregate + currentValue);
    const targetTotalAmount = cashAmountToInvest + currentInvestmentMoney;
    const answersForPartialQuantities = securitiesInfo.map(securityInfo => {
        const wantedTotalAmount = targetTotalAmount * securityInfo.targetRatio;
        const wantedTotalQuantity = wantedTotalAmount / securityInfo.price;
        return {
            label: securityInfo.label,
            wantedTotalAmount: wantedTotalAmount,
            wantedTotalQuantity: wantedTotalQuantity,
            amountToBuy: wantedTotalQuantity - securityInfo.currentQuantity
        };
    });
    const interestingCombinationParameters = getInterestingCombinationParameters(securitiesInfo, cashAmountToInvest, answersForPartialQuantities);
    const interestingCombinations = getAllCombinations(interestingCombinationParameters);
    const combinationsScoreInfoSorted = interestingCombinations
        .filter(combination => getTotalSpendForCombination(combination, securitiesInfo, targetTotalAmount) <= cashAmountToInvest)
        .map(combination => getScoreInfoForCombo(combination, securitiesInfo, targetTotalAmount))
        .sort((leftCombinationsScoreInfo, rightCombinationsScoreInfo) =>
            leftCombinationsScoreInfo.comboScore - rightCombinationsScoreInfo.comboScore
        );
    const allInfo = combinationsScoreInfoSorted.map(combinationScoreInfo => {
        const securitiesScoreInfo = combinationScoreInfo.securitiesScoreInfo.map(scoreInfo => {
            const securityInfo = lowdash.find(securitiesInfo, {label: scoreInfo.label}) || {};
            const partialInfo = lowdash.find(answersForPartialQuantities, {label: scoreInfo.label}) || {};

            return {
                label: scoreInfo.label,
                securityInfo,
                partialInfo,
                scoreInfo,
            };
        });

        return {
            securitiesScoreInfo,
            comboScore: combinationScoreInfo.comboScore,
        };
    });

    return allInfo[0];
}

function getInterestingCombinationParameters(securitiesInfo, cashAmountToInvest, answersForPartialQuantities) {
    return answersForPartialQuantities.map(partialInfo => range(Math.ceil(partialInfo.amountToBuy) + 1));
}

function getTotalSpendForCombination(combination, securitiesInfo) {
    return combination
        .map((amountToBuy, index) => {
            const security = securitiesInfo[index];

            return amountToBuy * security.price;
        })
        .reduce((aggregate, value) => aggregate + value);
}

function getScoreInfoForCombo(combination, securitiesInfo, targetTotalAmount) {
    const securitiesScoreInfo = combination.map((amountToBuy, index) =>
        getScoreInfoForSecurity(securitiesInfo, index, targetTotalAmount, amountToBuy)
    );

    return {
        securitiesScoreInfo,
        comboScore: securitiesScoreInfo
            .map(securityScoreInfo => securityScoreInfo.score)
            .reduce((aggregate, value) => aggregate + value)
    };
}

function getScoreInfoForSecurity(securitiesInfo, index, targetTotalAmount, amountToBuy) {
    const security = securitiesInfo[index];
    const totalTargetValue = (amountToBuy + security.currentQuantity) * security.price;
    const comboRatio =  totalTargetValue / targetTotalAmount;

    return {
        label: security.label,
        amountToBuy,
        totalTargetValue,
        targetRatio: security.targetRatio,
        comboRatio,
        score: Math.abs(security.targetRatio - comboRatio),
    };
}

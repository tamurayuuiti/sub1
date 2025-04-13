const elements = {
    base: document.getElementById("base"),
    exponent: document.getElementById("exponent"),
    error: document.getElementById("errorMessage"),
    result: document.getElementById("result"),
    exponentResult: document.getElementById("exponentResult")
};

const BASE_LIMIT = 1e1000;
const EXPONENT_LIMIT = 1000000;

async function calculatePower() {
    elements.error.style.display = "none";

    let baseInput = elements.base.value;
    let exponentInput = elements.exponent.value;
    let base = parseFloat(baseInput);
    let exponent = parseFloat(exponentInput);

    if (isNaN(base) || isNaN(exponent)) {
        showError("\u26A0 数字を入力してください", elements);
        return;
    }

    if (base < -BASE_LIMIT || base > BASE_LIMIT || exponent < -EXPONENT_LIMIT || exponent > EXPONENT_LIMIT) {
        showError("\u26A0 許容範囲を超えています (底は±1e1000以内, 指数は±1000000以内)", elements);
        return;
    }

    setTimeout(() => {
        try {
            if (base < 0 && !Number.isInteger(exponent)) {
                handleComplex(base, exponent, elements);
            } else {
                handleDecimal(baseInput, exponentInput, elements);
            }

            window.parent.postMessage({ type: 'calculation' }, '*');

        } catch (error) {
            showElement(elements.result, "\u26A0 計算エラー: INFINITY");
            hideElement(elements.exponentResult);
            console.error("計算エラー:", error);
            return;
        }
    }, 10);
}

function handleComplex(base, exponent, elements) {
    let complexBase = new Complex(base, 0);
    let complexResult = complexBase.pow(exponent);

    if (!isFinite(complexResult.re) || !isFinite(complexResult.im)) {
        showElement(elements.exponentResult, "計算結果: INFINITY");
    } else {
        let re = complexResult.re.toExponential(5);
        let im = complexResult.im.toExponential(5);
        let sign = complexResult.im >= 0 ? '+' : '-';
        let formatted = `${re} ${sign} ${Math.abs(complexResult.im).toExponential(5)}i`;
        showElement(elements.exponentResult, `計算結果: ${formatted}`);
    }
    hideElement(elements.result);
}

function handleDecimal(baseInput, exponentInput, elements) {
    Decimal.set({ precision: 1000 });
    let decimalBase = new Decimal(baseInput);
    let decimalExponent = new Decimal(exponentInput);
    let decimalResult = decimalBase.pow(decimalExponent);

    if (!decimalResult.isFinite()) {
        showElement(elements.exponentResult, "計算結果: INFINITY");
        return;
    }

    let parts = decimalResult.toExponential(20).split('e');
    let mantissa = parts[0].replace(/(\d*\.\d*?[1-9])0+$/, '$1');
    let exponentialForm = `${mantissa}e${parts[1]}`;
    showElement(elements.exponentResult, `計算結果: ${exponentialForm}`);

    let digitCount = Decimal.log10(decimalResult.abs()).floor().plus(1).toString();
    showElement(elements.result, `桁数: 約 ${digitCount} 桁`);
}

function showElement(el, html) {
    el.innerHTML = html;
    el.style.display = "block";
}

function hideElement(el) {
    el.innerHTML = "";
    el.style.display = "none";
}

function showError(message, elements) {
    elements.error.textContent = message;
    elements.error.style.display = "block";
    hideElement(elements.result);
    hideElement(elements.exponentResult);
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        calculatePower();
    }
});

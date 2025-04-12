const errorMessage = document.getElementById("errorMessage");
const resultElement = document.getElementById("result");
const exponentResultElement = document.getElementById("exponentResult");

async function calculatePower() {
    let baseInput = document.getElementById("base").value;
    let exponentInput = document.getElementById("exponent").value;
    let base = parseFloat(baseInput);
    let exponent = parseFloat(exponentInput);

    if (isNaN(base) || isNaN(exponent)) {
        showError("\u26A0 数字を入力してください", resultElement, exponentResultElement, errorMessage);
        return;
    }

    if (base < -1e1000 || base > 1e1000 || exponent < -1000000 || exponent > 1000000) {
        showError("\u26A0 許容範囲を超えています (底は±1e1000以内, 指数は±1000000以内)", resultElement, exponentResultElement, errorMessage);
        return;
    }

    setTimeout(() => {
        try {
            errorMessage.style.display = "none";

            if (base < 0 && !Number.isInteger(exponent)) {
                handleComplex(base, exponent, resultElement, exponentResultElement);
            } else {
                handleDecimal(baseInput, exponentInput, resultElement, exponentResultElement);
            }

            window.parent.postMessage({ type: 'calculation' }, '*');

        } catch (error) {
            showElement(resultElement, "\u26A0 計算エラー: INFINITY");
            hideElement(exponentResultElement);
            console.error("計算エラー:", error);
            return;
        }
    }, 10);
}

function handleComplex(base, exponent, resultElement, exponentResultElement) {
    let complexBase = new Complex(base, 0);
    let complexResult = complexBase.pow(exponent);

    if (!isFinite(complexResult.re) || !isFinite(complexResult.im)) {
        showElement(exponentResultElement, "計算結果: INFINITY");
    } else {
        let re = complexResult.re.toExponential(5);
        let im = complexResult.im.toExponential(5);
        let sign = complexResult.im >= 0 ? '+' : '-';
        let formatted = `${re} ${sign} ${Math.abs(complexResult.im).toExponential(5)}i`;
        showElement(exponentResultElement, `計算結果: ${formatted}`);
    }
    hideElement(resultElement);
}

function handleDecimal(baseInput, exponentInput, resultElement, exponentResultElement) {
    Decimal.set({ precision: 1000 });
    let decimalBase = new Decimal(baseInput);
    let decimalExponent = new Decimal(exponentInput);
    let decimalResult = decimalBase.pow(decimalExponent);

    if (!decimalResult.isFinite()) {
        showElement(exponentResultElement, "計算結果: INFINITY");
        return;
    }

    let parts = decimalResult.toExponential(20).split('e');
    let mantissa = parts[0].replace(/(\d*\.\d*?[1-9])0+$/, '$1');
    let exponentialForm = `${mantissa}e${parts[1]}`;
    showElement(exponentResultElement, `計算結果: ${exponentialForm}`);

    let digitCount = Decimal.log10(decimalResult.abs()).floor().plus(1).toString();
    showElement(resultElement, `桁数: 約 ${digitCount} 桁`);
}

function showElement(el, html) {
    el.innerHTML = html;
    el.style.display = "block";
}

function hideElement(el) {
    el.innerHTML = "";
    el.style.display = "none";
}

function showError(message, resultElement, exponentResultElement, errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    hideElement(resultElement);
    hideElement(exponentResultElement);
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        calculatePower();
    }
});

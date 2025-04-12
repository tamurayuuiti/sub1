async function calculatePower() {
    let baseInput = document.getElementById("base").value;
    let exponentInput = document.getElementById("exponent").value;
    let resultElement = document.getElementById("result");
    let exponentResultElement = document.getElementById("exponentResult");

    let base = parseFloat(baseInput);
    let exponent = parseFloat(exponentInput);

    if (isNaN(base) || isNaN(exponent)) {
        exponentResultElement.innerHTML = "\u26A0 数字を入力してください";
        resultElement.style.display = "none";
        exponentResultElement.style.display = "block";
        return;
    }

    if (base < -1e1000 || base > 1e1000 || exponent < -1000000 || exponent > 1000000) {
        exponentResultElement.innerHTML = "\u26A0 許容範囲を超えています (底は±1e1000以内, 指数は±1000000以内)";
        resultElement.style.display = "none";
        exponentResultElement.style.display = "block";
        return;
    }

    setTimeout(() => {
        try {
            if (base < 0 && !Number.isInteger(exponent)) {
                let complexBase = new Complex(base, 0);
                let complexResult = complexBase.pow(exponent);

                if (!isFinite(complexResult.re) || !isFinite(complexResult.im)) {
                    exponentResultElement.innerHTML = `計算結果: INFINITY`;
                } else {
                    let re = complexResult.re.toExponential(5);
                    let im = complexResult.im.toExponential(5);
                    let sign = complexResult.im >= 0 ? '+' : '-';
                    let formatted = `${re} ${sign} ${Math.abs(complexResult.im).toExponential(5)}i`;
                    exponentResultElement.innerHTML = `計算結果: ${formatted}`;
                    exponentResultElement.style.display = "block";
                }
                resultElement.style.display = "none";
                return;
            }

            Decimal.set({ precision: 1000 });
            let decimalBase = new Decimal(baseInput);
            let decimalExponent = new Decimal(exponentInput);
            let decimalResult = decimalBase.pow(decimalExponent);

            if (!decimalResult.isFinite()) {
                exponentResultElement.innerHTML = "計算結果: INFINITY";
                exponentResultElement.style.display = "block";
                return;
            }

            let parts = decimalResult.toExponential(20).split('e');
            let mantissa = parts[0].replace(/(\d*\.\d*?[1-9])0+$/, '$1');
            let exponentialForm = `${mantissa}e${parts[1]}`;
            exponentResultElement.innerHTML = `計算結果: ${exponentialForm}`;
            exponentResultElement.style.display = "block";

            // 桁数を算出して表示（log10の整数部分 + 1）
            let digitCount = Decimal.log10(decimalResult.abs()).floor().plus(1).toString();
            resultElement.innerHTML = `桁数: 約 ${digitCount} 桁`;
            resultElement.style.display = "block";

            window.parent.postMessage({ type: 'calculation' }, '*');

        } catch (error) {
            resultElement.innerHTML = "\u26A0 計算エラー: INFINITY";
            exponentResultElement.innerHTML = "";
            resultElement.style.display = "block";
            console.error("計算エラー:", error);
            return;
        }
    }, 10);
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        calculatePower();
    }
});

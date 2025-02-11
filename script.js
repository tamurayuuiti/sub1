function calculatePower() {
    let base = parseFloat(document.getElementById("base").value);
    let exponent = parseFloat(document.getElementById("exponent").value);
    let resultElement = document.getElementById("result");
    let exponentResultElement = document.getElementById("exponentResult");

    if (isNaN(base) || isNaN(exponent)) {
        resultElement.innerHTML = "⚠ 数字を入力してください";
        exponentResultElement.innerHTML = "";
        return;
    }

    if (base < -1e308 || base > 1e308 || exponent < -100000 || exponent > 100000) {
        resultElement.innerHTML = "⚠ 許容範囲を超えています (底は-1e308以上, 指数は-100000以上)";
        exponentResultElement.innerHTML = "";
        return;
    }

    try {
        if (base < 0 && !Number.isInteger(exponent)) {
            resultElement.innerHTML = "⚠ 負の底に対して小数の指数は計算できません";
            exponentResultElement.innerHTML = "";
            return;
        }

        let floatResult = Math.pow(base, exponent);
        let logResult = Math.log10(Math.abs(base)) * exponent; // NaN不具合修正済み

        if (!Number.isFinite(logResult)) {
            exponentResultElement.innerHTML = "計算結果: Infinity";
            return;
        }

        let newExponent = Math.floor(logResult);
        let coefficient = Math.pow(10, logResult % 1).toPrecision(5);

        // 🔹 もし coefficient の最初の桁が 0 なら指数を1つ下げて補正
        if (coefficient < 1) {
            coefficient *= 10;
            newExponent -= 1;
        }

        // 🔹 **指数が負 (`exponent < 0`) のとき、指数を +1 補正**
        if (exponent < 0) {
            newExponent += 1;
        }

        let sign = floatResult < 0 ? "-" : "";
        let exponentForm = `${sign}${coefficient} × 10^${newExponent}`;
        exponentResultElement.innerHTML = `計算結果: ${exponentForm}`;

        if (Number.isInteger(base) && Number.isInteger(exponent) && exponent >= 0) {
            let bigIntResult = BigInt(Math.round(base)) ** BigInt(exponent);
            resultElement.innerHTML = `詳細:\n${bigIntResult.toString()}`;
        } else {
            resultElement.innerHTML = `詳細:\n${floatResult.toExponential(20)}`;
        }

    } catch (error) {
        resultElement.innerHTML = "⚠ 計算エラー: 結果が大きすぎます";
        exponentResultElement.innerHTML = "";
    }
}

// エンターキーで計算を実行
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // エンターでのリロードを防ぐ
        calculatePower(); // 計算実行
    }
});

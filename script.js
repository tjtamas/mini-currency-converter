document.addEventListener("DOMContentLoaded", () => {
    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");
    const convertBtn = document.getElementById("convertBtn");
    const result = document.getElementById("result");
  
    // Deviza opciók betöltése
    const currencies = ["USD", "EUR", "HUF", "GBP"];
    currencies.forEach(curr => {
      fromCurrency.innerHTML += `<option value="${curr}">${curr}</option>`;
      toCurrency.innerHTML += `<option value="${curr}">${curr}</option>`;
    });
  
    convertBtn.addEventListener("click", () => {
      const amount = document.getElementById("amount").value;
      const from = fromCurrency.value;
      const to = toCurrency.value;
  
      fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`)
        .then(res => res.json())
        .then(data => {
          result.textContent = `${amount} ${from} = ${data.result.toFixed(2)} ${to}`;
        })
        .catch(err => {
          result.textContent = "Hiba történt.";
          console.error(err);
        });
    });
  });
  
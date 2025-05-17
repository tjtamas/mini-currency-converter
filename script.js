document.addEventListener("DOMContentLoaded", () => {
  const fromCurrency = document.getElementById("fromCurrency");
  const toCurrency = document.getElementById("toCurrency");
  const convertBtn = document.getElementById("convertBtn");
  const result = document.getElementById("result");
  const amountInput = document.getElementById("amount");

  const currencies = ["USD", "EUR", "HUF", "GBP"];
  let chartInstance = null;

  currencies.forEach(curr => {
    fromCurrency.innerHTML += `<option value="${curr}">${curr}</option>`;
    toCurrency.innerHTML += `<option value="${curr}">${curr}</option>`;
  });

  convertBtn.addEventListener("click", async () => {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (!amount || amount <= 0) {
      result.textContent = "❗ Please enter a valid positive amount.";
      return;
    }

    result.textContent = "⏳ Converting...";

    try {
      // 1. Get today's exchange rate manually
      const today = new Date();
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const start = formatDate(startDate);
      const end = formatDate(endDate);

      // 2. Fetch latest (today's) rate for conversion
      const latestRateRes = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
      const latestRateData = await latestRateRes.json();

      const rate = latestRateData.rates[to];
      const converted = (amount * rate).toFixed(2);
      result.textContent = `${amount} ${from} = ${converted} ${to}`;

      // 3. Fetch timeseries data
      const timeseriesUrl = `https://api.frankfurter.app/${start}..${end}?from=${from}&to=${to}`;
      const timeRes = await fetch(timeseriesUrl);
      const timeData = await timeRes.json();

      if (!timeData.rates || typeof timeData.rates !== 'object') {
        result.textContent = "⚠️ Error loading historical rates.";
        return;
      }

      const labels = Object.keys(timeData.rates);
      const values = labels.map(date => timeData.rates[date][to]);

      if (chartInstance) {
        chartInstance.destroy();
      }

      const ctx = document.getElementById("chart").getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: `Exchange rate: ${from} to ${to}`,
            data: values,
            borderColor: "blue",
            backgroundColor: "lightblue",
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            title: {
              display: true,
              text: `7-day rate trend: ${from} → ${to}`
            }
          }
        }
      });

    } catch (err) {
      result.textContent = "⚠️ Something went wrong.";
      console.error(err);
    }
  });
});

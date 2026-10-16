
const form = document.getElementById("converter-form");
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from-currency");
const toSelect = document.getElementById("to-currency");
const swapButton = document.getElementById("swap-btn");
const convertButton = document.getElementById("convert-btn");

const output = document.getElementById("converted-amount");
const rateText = document.getElementById("rate-text");
const dateText = document.getElementById("date-text");
const status = document.getElementById("status");

document.getElementById("year").textContent = new Date().getFullYear();

function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 4
  }).format(amount);
}

function showStatus(message, error = false) {
  status.textContent = message;
  status.classList.toggle("error", error);
}

async function convertCurrency() {
  const amount = Number(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (
    amountInput.value.trim() === "" ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    showStatus("Enter a valid amount of zero or more.", true);
    return;
  }

  convertButton.disabled = true;
  convertButton.textContent = "Converting...";
  output.textContent = "—";
  rateText.textContent = "";
  dateText.textContent = "";
  showStatus("Fetching reference exchange rates...");

  try {
    let rate = 1;
    let date = "Same currency";

    if (from !== to) {
      const params = new URLSearchParams({ from, to });
      const response = await fetch(
        `https://api.frankfurter.dev/v1/latest?${params}`
      );

      if (!response.ok) {
        throw new Error("The exchange-rate service is unavailable.");
      }

      const data = await response.json();
      rate = data.rates?.[to];

      if (typeof rate !== "number" || !Number.isFinite(rate)) {
        throw new Error("No exchange rate was returned for this pair.");
      }

      date = data.date || "Unavailable";
    }

    output.textContent = formatMoney(amount * rate, to);
    rateText.textContent =
      `1 ${from} = ${new Intl.NumberFormat("en-US", {
        maximumSignificantDigits: 7
      }).format(rate)} ${to}`;

    dateText.textContent =
      from === to ? "Same currency." : `Rate date: ${date}`;

    showStatus("Conversion completed.");
  } catch (error) {
    output.textContent = "Unavailable";
    showStatus(
      `${error.message} Check your internet connection and try again.`,
      true
    );
  } finally {
    convertButton.disabled = false;
    convertButton.textContent = "Convert currency →";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  convertCurrency();
});

swapButton.addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  convertCurrency();
});

fromSelect.addEventListener("change", convertCurrency);
toSelect.addEventListener("change", convertCurrency);
amountInput.addEventListener("change", convertCurrency);

convertCurrency();

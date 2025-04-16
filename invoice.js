const typeDefaults = {
  "Big Bit": { unit: 1, price: 5000 },
  "Small Bit": { unit: 1, price: 3000 },
  "Casing": { unit: 1, price: 4500 },
  "Cleaning": { unit: 1, price: 2000 },
  "Meals": { unit: 1, price: 1000 },
  "Extra Charges": { unit: 1, price: 500 },
  "Others": { unit: 1, price: 0 }
};

let currentId = localStorage.getItem("invoice-counter") || 1;

function setDefaults() {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("service-date").value = today;
  document.getElementById("invoice-date").value = today;
  document.getElementById("invoice-id").textContent = `INV-${String(currentId).padStart(4, '0')}`;
}

function addItem(type = "Big Bit", unit = 1, price = 0) {
  const container = document.createElement("div");
  container.className = "item-row";

  const typeSelect = document.createElement("select");
  Object.keys(typeDefaults).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    if (key === type) opt.selected = true;
    typeSelect.appendChild(opt);
  });

  const unitInput = document.createElement("input");
  const priceInput = document.createElement("input");
  const amountInput = document.createElement("input");
  amountInput.disabled = true;

  unitInput.type = priceInput.type = "number";
  unitInput.value = unit;
  priceInput.value = price;

  container.append(typeSelect, unitInput, priceInput, amountInput);
  document.getElementById("items").appendChild(container);

  const update = () => {
    const amt = parseFloat(unitInput.value || 0) * parseFloat(priceInput.value || 0);
    amountInput.value = amt.toFixed(2);
    calculateTotal();
  };

  typeSelect.onchange = () => {
    const val = typeSelect.value;
    if (typeDefaults[val]) {
      unitInput.value = typeDefaults[val].unit;
      priceInput.value = typeDefaults[val].price;
    }
    update();
  };

  [unitInput, priceInput].forEach(el => el.oninput = update);
  update();
}

function calculateTotal() {
  let total = 0;
  document.querySelectorAll(".item-row").forEach(row => {
    total += parseFloat(row.children[3].value || 0);
  });
  document.getElementById("total").textContent = total.toFixed(2);
  calculateBalance();
}

function calculateBalance() {
  const total = parseFloat(document.getElementById("total").textContent) || 0;
  const adv = parseFloat(document.getElementById("advance").value) || 0;
  const balance = total - adv;
  document.getElementById("balance").textContent = balance.toFixed(2);
}

function exportPDF() {
  langUpdate();
  html2pdf().from(document.getElementById("invoice")).save();
}

function exportImage() {
  langUpdate();
  html2canvas(document.getElementById("invoice")).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = "invoice.png";
    link.click();
  });
}

function saveInvoice() {
  const id = `INV-${String(currentId).padStart(4, '0')}`;
  const data = {
    id,
    name: document.getElementById("client-name").value,
    village: document.getElementById("client-village").value,
    phone: document.getElementById("client-phone").value,
    invoiceDate: document.getElementById("invoice-date").value,
    advance: document.getElementById("advance").value,
    items: Array.from(document.querySelectorAll(".item-row")).map(row => ({
      type: row.children[0].value,
      unit: row.children[1].value,
      price: row.children[2].value
    }))
  };
  localStorage.setItem(id, JSON.stringify(data));
  localStorage.setItem("invoice-counter", ++currentId);
  alert("Invoice saved!");
}

function loadInvoices() {
  const saved = document.getElementById("saved-invoices");
  saved.innerHTML = "<h3>Saved Invoices:</h3>";
  for (let key in localStorage) {
    if (key.startsWith("INV-")) {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = key;
      btn.onclick = () => loadInvoice(key);
      saved.appendChild(btn);
    }
  }
}

function loadInvoice(id) {
  const data = JSON.parse(localStorage.getItem(id));
  if (!data) return alert("Invoice not found");

  document.getElementById("client-name").value = data.name;
  document.getElementById("client-village").value = data.village;
  document.getElementById("client-phone").value = data.phone;
  document.getElementById("invoice-date").value = data.invoiceDate;
  document.getElementById("advance").value = data.advance;
  document.getElementById("invoice-id").textContent = data.id;
  document.getElementById("items").innerHTML = "";
  data.items.forEach(i => addItem(i.type, i.unit, i.price));
  calculateTotal();
}

const langMap = {
  te: {
    "Name:": "పేరు:",
    "Village:": "గ్రామం:",
    "Phone:": "ఫోన్:",
    "Service Date:": "సేవ తేదీ:",
    "Invoice Date:": "బిల్లు తేదీ:",
    "Type": "రకం",
    "Unit": "యూనిట్",
    "Price": "ధర",
    "Amount": "మొత్తం",
    "Total:": "మొత్తం:",
    "Advance Paid:": "అడ్వాన్స్ చెల్లింపు:",
    "Balance:": "బాకీ:",
    "Service Provider Sign:": "సేవ అందించిన సంతకం:",
    "Customer Sign:": "గ్రాహకుని సంతకం:",
    "Invoice #:": "ఇన్వాయిస్ నంబర్:"
  }
};

function langUpdate() {
  const lang = document.querySelector('input[name="lang"]:checked').value;
  if (lang !== "te") return; // default English

  const map = langMap[lang];
  for (let id in map) {
    const el = Array.from(document.querySelectorAll("strong, div, p")).find(e => e.textContent.trim() === id);
    if (el) el.textContent = map[id];
  }
}

window.onload = () => {
  setDefaults();
  addItem();
};

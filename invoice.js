function addRow() {
  const row = document.createElement('div');
  row.className = 'table-row';
  row.innerHTML = `
    <input type="text" placeholder="Type" />
    <input type="number" placeholder="Unit" oninput="updateAmount(this)" />
    <input type="number" placeholder="Price" oninput="updateAmount(this)" />
    <input type="text" class="amount" value="0.00" disabled />
    <button onclick="this.parentNode.remove(); calculateTotal()">🗑️</button>
  `;
  document.getElementById('item-rows').appendChild(row);
  calculateTotal();
}

function updateAmount(input) {
  const row = input.parentNode;
  const unit = parseFloat(row.children[1].value) || 0;
  const price = parseFloat(row.children[2].value) || 0;
  const amount = (unit * price).toFixed(2);
  row.children[3].value = amount;
  calculateTotal();
}

function calculateTotal() {
  let total = 0;
  document.querySelectorAll('.amount').forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  document.getElementById('total').textContent = total.toFixed(2);
  calculateBalance();
}

function calculateBalance() {
  const total = parseFloat(document.getElementById('total').textContent) || 0;
  const advance = parseFloat(document.getElementById('advance').value) || 0;
  const balance = (total - advance).toFixed(2);
  document.getElementById('balance').textContent = balance;
}

function exportPDF() {
  const clone = getStaticInvoiceClone();
  const opt = {
    margin: 0.5,
    filename: 'service-invoice.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(clone).save();
}

function exportImage() {
  const original = document.getElementById('invoice');
  const clone = getStaticInvoiceClone();

  // Create off-screen container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  container.style.background = '#fff';
  container.style.padding = '20px';
  container.appendChild(clone);
  document.body.appendChild(container);

  // Wait for DOM to render before capturing
  setTimeout(() => {
    html2canvas(clone, { scale: 2 }).then(canvas => {
      const imageData = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imageData;
      downloadLink.download = 'service-invoice.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      document.body.removeChild(container); // clean up temp container
    });
  }, 100); // slight delay to ensure render
}




// Initialize with one row
window.onload = () => addRow();

function getStaticInvoiceClone() {
  const original = document.getElementById('invoice');
  const clone = original.cloneNode(true);

  // Remove buttons
  clone.querySelectorAll('button, .add-btn, .export-buttons').forEach(btn => btn.remove());

  // Convert inputs to static text
  clone.querySelectorAll('input').forEach(input => {
    const text = document.createElement('span');
    text.textContent = input.type === 'date' ? input.value : input.value || input.placeholder || '';
    text.style.borderBottom = '1px solid #ccc';
    text.style.padding = '4px';
    text.style.display = 'inline-block';
    input.replaceWith(text);
  });

  return clone;
}

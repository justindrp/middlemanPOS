let products = JSON.parse(localStorage.getItem('products')) || [];
let currentTransaction = [];
let currency = 'USD'; // Default currency
const conversionRate = 15000; // 1 USD = 15000 IDR
let editIndex = null; // To track which product is being edited

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    openTab('inputTab');
    renderExistingProducts();
});

// Function to open a tab
function openTab(tabName) {
    const inputTab = document.getElementById('inputTab');
    const salesTab = document.getElementById('salesTab');

    inputTab.style.display = 'none';
    salesTab.style.display = 'none';

    if (tabName === 'inputTab') {
        inputTab.style.display = 'block';
    } else if (tabName === 'salesTab') {
        salesTab.style.display = 'block';
        renderProductList();
    }
}

// Function to change currency
function changeCurrency() {
    currency = document.getElementById('currency').value;
    document.getElementById('currencySymbol').innerText = (currency === 'USD') ? '$' : 'Rp';
    renderExistingProducts();
    renderProductList();
    calculateTotal();
}

// Function to add or update a product
function addOrUpdateProduct() {
    const name = document.getElementById('productName').value.trim();
    let price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);

    if (name === '' || isNaN(price) || isNaN(stock)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    // Convert price to USD for internal storage if in IDR
    if (currency === 'IDR') {
        price = price / conversionRate;
    }

    if (editIndex !== null) {
        // Update existing product
        products[editIndex] = { name, price, stock };
        editIndex = null;
        document.getElementById('cancelEditBtn').style.display = 'none';
        alert('Product updated successfully!');
    } else {
        // Add new product
        products.push({ name, price, stock });
        alert('Product added successfully!');
    }

    localStorage.setItem('products', JSON.stringify(products));
    clearForm();
    renderExistingProducts();
    renderProductList();
}

// Function to render existing products in Input Tab
function renderExistingProducts() {
    const existingProductsDiv = document.getElementById('existingProducts');
    existingProductsDiv.innerHTML = '';

    if (products.length === 0) {
        existingProductsDiv.innerHTML = '<p>No products available.</p>';
        return;
    }

    products.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'product-details';
        const displayPrice = (currency === 'USD') ? product.price : product.price * conversionRate;
        const currencySymbol = (currency === 'USD') ? '$' : 'Rp';
        detailsDiv.innerHTML = `<strong>${product.name}</strong> - ${currencySymbol}${displayPrice.toFixed(2)} - Stock: ${product.stock}`;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'product-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerText = 'Edit';
        editBtn.onclick = () => editProduct(index);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerText = 'Delete';
        deleteBtn.onclick = () => deleteProduct(index);

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        productDiv.appendChild(detailsDiv);
        productDiv.appendChild(actionsDiv);

        existingProductsDiv.appendChild(productDiv);
    });
}

// Function to edit a product
function editProduct(index) {
    const product = products[index];
    editIndex = index;

    document.getElementById('productName').value = product.name;
    const displayPrice = (currency === 'USD') ? product.price : product.price * conversionRate;
    document.getElementById('productPrice').value = (currency === 'USD') ? product.price : product.price * conversionRate;
    document.getElementById('productStock').value = product.stock;

    document.getElementById('cancelEditBtn').style.display = 'inline-block';
}

// Function to cancel edit
function cancelEdit() {
    editIndex = null;
    clearForm();
    document.getElementById('cancelEditBtn').style.display = 'none';
}

// Function to delete a product
function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        renderExistingProducts();
        renderProductList();
        alert('Product deleted successfully!');
    }
}

// Function to clear the form
function clearForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
}

// Function to render product list in Sales Tab
function renderProductList() {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<p>No products available for sale.</p>';
        return;
    }

    products.forEach((product, index) => {
        const displayPrice = (currency === 'USD') ? product.price : product.price * conversionRate;
        const currencySymbol = (currency === 'USD') ? '$' : 'Rp';
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'product-details';
        detailsDiv.innerHTML = `<strong>${product.name}</strong> - ${currencySymbol}${displayPrice.toFixed(2)} - Stock: ${product.stock}`;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'product-actions';

        const selectBtn = document.createElement('button');
        selectBtn.className = 'edit-btn';
        selectBtn.innerText = 'Select';
        selectBtn.onclick = () => addToTransaction(index);

        actionsDiv.appendChild(selectBtn);

        productDiv.appendChild(detailsDiv);
        productDiv.appendChild(actionsDiv);

        productList.appendChild(productDiv);
    });
}

// Function to add a product to the current transaction
function addToTransaction(productIndex) {
    const quantityInput = document.getElementById('purchaseQuantity');
    let quantity = parseInt(quantityInput.value);

    if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity.');
        return;
    }

    const product = products[productIndex];

    if (quantity > product.stock) {
        alert('Not enough stock!');
        return;
    }

    // Check if product is already in the transaction
    const existingItemIndex = currentTransaction.findIndex(item => item.index === productIndex);
    if (existingItemIndex !== -1) {
        // Update quantity
        currentTransaction[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        currentTransaction.push({ index: productIndex, quantity });
    }

    calculateTotal();
    quantityInput.value = '';
}

// Function to calculate total amount
function calculateTotal() {
    let total = 0;

    currentTransaction.forEach(item => {
        const product = products[item.index];
        total += product.price * item.quantity;
    });

    const displayTotal = (currency === 'USD') ? total : total * conversionRate;
    const currencySymbol = (currency === 'USD') ? '$' : 'Rp';
    document.getElementById('totalAmount').innerText = `${currencySymbol}${displayTotal.toFixed(2)}`;
}

// Function to complete the transaction
function completeTransaction() {
    if (currentTransaction.length === 0) {
        alert('No items in the transaction.');
        return;
    }

    // Verify payment (for simplicity, we'll assume payment is done)
    if (!confirm('Has the customer paid?')) {
        return;
    }

    // Update stock
    currentTransaction.forEach(item => {
        products[item.index].stock -= item.quantity;
    });

    // Log the transaction
    logTransaction();

    // Save updated products
    localStorage.setItem('products', JSON.stringify(products));

    // Reset transaction
    currentTransaction = [];
    calculateTotal();
    alert('Transaction complete!');
    renderExistingProducts();
    renderProductList();
}

// Function to log the transaction
function logTransaction() {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transactionDetails = currentTransaction.map(item => {
        const product = products[item.index];
        return {
            name: product.name,
            quantity: item.quantity,
            price: product.price,
            total: product.price * item.quantity
        };
    });

    const totalAmount = transactionDetails.reduce((sum, item) => sum + item.total, 0);

    const transactionRecord = {
        date: new Date().toLocaleString(),
        items: transactionDetails,
        total: totalAmount
    };

    transactions.push(transactionRecord);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

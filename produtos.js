
 // produtos.js - Consolidated and improved version

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    if (document.getElementById('productTable')) {
        loadProducts();
    }
    carregarClientes();
    setupEventListeners();
}

function carregarClientes() {
    const selectCliente = document.getElementById('cliente');
    if (selectCliente) {
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nome;
            selectCliente.appendChild(option);
        });
    } else {
        console.error('Elemento de seleção de cliente não encontrado');
    }
}

function setupEventListeners() {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleFormSubmit);
    } else {
        console.error('Formulário de produto não encontrado');
    }

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    const formEditTemplate = document.getElementById('formEditTemplate');
    if (formEditTemplate) {
        window.onclick = function(event) {
            if (event.target == formEditTemplate) {
                closeModal();
            }
        };
    }

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-btn')) {
            const index = event.target.getAttribute('data-index');
            editProduct(index);
        } else if (event.target.classList.contains('remove-btn')) {
            const index = event.target.getAttribute('data-index');
            removeProduct(index);
        }
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = {};
    
    formData.forEach((value, key) => {
        if (key !== 'imagem') {
            product[key] = value;
        }
    });
    
    product.estoque = parseInt(product.estoque) || 0;
    product.estoqueMinimo = parseInt(product.estoqueMinimo) || 0;
    product.status = product.estoque <= product.estoqueMinimo ? 'Baixo' : 'Normal';
    
    const imageFile = formData.get('imagem');
    if (imageFile && imageFile.size > 0) {
        const reader = new FileReader();
        reader.onload = function(event) {
            product.imagem = event.target.result;
            saveProduct(product);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveProduct(product);
    }
}

function saveProduct(product) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    const index = products.findIndex(p => p.id === product.id);
    
    const clienteSelect = document.getElementById('cliente');
    if (clienteSelect) {
        const selectedOption = clienteSelect.options[clienteSelect.selectedIndex];
        product.clienteNome = selectedOption ? selectedOption.text : 'Cliente não especificado';
    }
    
    if (index !== -1) {
        products[index] = { ...products[index], ...product };
    } else {
        products.push(product);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    adicionarAoHistorico(product);
    
    alert('Produto salvo com sucesso!');
    
    if (window.location.pathname.includes('CadastroDeProdutos.html')) {
        window.location.href = 'paginaDadosDeProdutos.html';
    } else {
        loadProducts();
        closeModal();
    }
}

function adicionarAoHistorico(produto) {
    let historico = JSON.parse(localStorage.getItem('historicoMovimentacoes')) || [];
    const novoItem = {
        ...produto,
        data: new Date().toLocaleString()
    };
    historico.push(novoItem);
    localStorage.setItem('historicoMovimentacoes', JSON.stringify(historico));
}

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tableBody = document.querySelector('#productTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        products.forEach((product, index) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td><img src="${product.imagem || '/api/placeholder/50/50'}" alt="${product.produto}" width="50" height="50"></td>
                <td>${product.id}</td>
                <td>${product.clienteNome}</td>
                <td>${product.produto}</td>
                <td>${product.descricao}</td>
                <td>${product.estoque}</td>
                <td>${product.estoqueMinimo}</td>
                <td>${product.status}</td>
                <td>
                    <button class="btn btn-blue edit-btn" data-index="${index}"><i class="fas fa-pencil-alt"></i> Editar</button>
                    <button class="btn btn-red remove-btn" data-index="${index}"><i class="fas fa-trash"></i> Remover</button>
                </td>
            `;
        });
    } else {
        console.error('Tabela de produtos não encontrada');
    }
}

function editProduct(index) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products[index];
    
    const form = document.getElementById('productForm');
    if (form) {
        form.querySelector('#cliente').value = product.cliente;
        form.querySelector('#id').value = product.id;
        form.querySelector('#produto').value = product.produto;
        form.querySelector('#descricao').value = product.descricao;
        form.querySelector('#quantEstoque').value = product.estoque;
        form.querySelector('#estMinimo').value = product.estoqueMinimo;
        
        const modal = document.getElementById('formEditTemplate');
        if (modal) {
            modal.style.display = 'block';
        }
    } else {
        console.error('Formulário de edição não encontrado');
    }
}

function removeProduct(index) {
    if (confirm('Tem certeza que deseja remover este produto?')) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
    }
}

function closeModal() {
    const modal = document.getElementById('formEditTemplate');
    if (modal) {
        modal.style.display = 'none';
    }
}
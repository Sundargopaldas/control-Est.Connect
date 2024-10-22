console.log("Script iniciado");

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded evento disparado");

    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('clienteId');
    console.log("clienteId obtido da URL:", clienteId);

    if (!clienteId) {
        console.log("clienteId não fornecido, chamando handleNoClientId()");
        handleNoClientId();
        return;
    }

    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    console.log("Clientes obtidos do localStorage:", clientes);

    const cliente = clientes.find(c => c.id === clienteId);
    console.log("Cliente encontrado:", cliente);

    if (cliente) {
        console.log("Cliente válido, configurando a página");
        document.getElementById("clienteInfo").textContent = `Cliente: ${cliente.nome}`;
        setupPageForClient(clienteId);
    } else {
        console.log("Cliente não encontrado, chamando handleClientNotFound()");
        handleClientNotFound(clienteId);
    }
});

function handleNoClientId() {
    console.log("Executando handleNoClientId()");
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <h1>Erro: ID do Cliente não fornecido</h1>
            <p>Por favor, selecione um cliente na página inicial.</p>
            <button onclick="window.location.href='index.html'">Voltar para a Página Inicial</button>
        `;
    } else {
        console.error("Elemento .container não encontrado");
    }
}

function handleClientNotFound(clienteId) {
    console.log("Executando handleClientNotFound()", clienteId);
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <h1>Erro: Cliente não encontrado</h1>
            <p>Não foi possível encontrar um cliente com o ID: ${clienteId}</p>
            <button onclick="window.location.href='index.html'">Voltar para a Página Inicial</button>
        `;
    } else {
        console.error("Elemento .container não encontrado");
    }
}

function setupPageForClient(clienteId) {
    console.log("Configurando página para o cliente", clienteId);

    const elements = {
        modal: document.getElementById("modal"),
        btnAbrirModal: document.getElementById("btnAbrirModal"),
        spanFechar: document.querySelector(".close"),
        btnCadastrarProduto: document.getElementById("btnCadastrarProduto"),
        btnVoltar: document.getElementById("btnVoltar")
    };

    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Elemento '${key}' não encontrado`);
        }
    }

    if (elements.btnAbrirModal) {
        elements.btnAbrirModal.onclick = function() {
            console.log("Botão Abrir Modal clicado");
            elements.modal.style.display = "block";
        }
    }

    if (elements.spanFechar) {
        elements.spanFechar.onclick = function() {
            console.log("Botão Fechar Modal clicado");
            elements.modal.style.display = "none";
        }
    }

    window.onclick = function(event) {
        if (event.target == elements.modal) {
            console.log("Clique fora do modal detectado");
            elements.modal.style.display = "none";
        }
    }

    if (elements.btnCadastrarProduto) {
        elements.btnCadastrarProduto.onclick = function() {
            console.log("Botão Cadastrar Produto clicado");
            const nomeProduto = document.getElementById("nomeProduto").value.trim();
            const idProduto = document.getElementById("idProduto").value.trim();
            console.log("Dados do produto:", { nome: nomeProduto, id: idProduto });

            if (nomeProduto && idProduto) {
                if (adicionarProduto(clienteId, nomeProduto, idProduto)) {
                    elements.modal.style.display = "none";
                    document.getElementById("nomeProduto").value = "";
                    document.getElementById("idProduto").value = "";
                    alert("Produto adicionado com sucesso!");
                    carregarProdutos(clienteId);
                } else {
                    alert("Erro ao adicionar o produto. Por favor, tente novamente.");
                }
            } else {
                alert("Por favor, preencha todos os campos.");
            }
        }
    }

    if (elements.btnVoltar) {
        elements.btnVoltar.onclick = function() {
            console.log("Botão Voltar clicado");
            window.location.href = "index.html";
        }
    }

    carregarProdutos(clienteId);
}

function adicionarProduto(clienteId, nomeProduto, idProduto) {
    console.log("Adicionando produto:", { clienteId, nomeProduto, idProduto });
    try {
        let produtos = JSON.parse(localStorage.getItem(`produtos_${clienteId}`)) || [];
        produtos.push({ nome: nomeProduto, id: idProduto });
        localStorage.setItem(`produtos_${clienteId}`, JSON.stringify(produtos));
        console.log("Produtos salvos:", produtos);
        return true;
    } catch (error) {
        console.error("Erro ao adicionar produto:", error);
        return false;
    }
}

function deletarProduto(clienteId, idProduto) {
    console.log("Deletando produto:", { clienteId, idProduto });
    try {
        let produtos = JSON.parse(localStorage.getItem(`produtos_${clienteId}`)) || [];
        produtos = produtos.filter(p => p.id !== idProduto);
        localStorage.setItem(`produtos_${clienteId}`, JSON.stringify(produtos));
        console.log("Produto deletado. Produtos restantes:", produtos);
        return true;
    } catch (error) {
        console.error("Erro ao deletar produto:", error);
        return false;
    }
}

function carregarProdutos(clienteId) {
    console.log("Carregando produtos para o cliente:", clienteId);
    const listaProdutos = document.getElementById("listaProdutos");
    if (!listaProdutos) {
        console.error("Elemento 'listaProdutos' não encontrado");
        return;
    }

    const produtos = JSON.parse(localStorage.getItem(`produtos_${clienteId}`)) || [];
    console.log("Produtos carregados:", produtos);

    listaProdutos.innerHTML = "";

    if (produtos.length === 0) {
        listaProdutos.textContent = "Nenhum produto cadastrado.";
    } else {
        const ul = document.createElement("ul");
        produtos.forEach(produto => {
            const li = document.createElement("li");
            li.textContent = `${produto.nome} (ID: ${produto.id})`;
            
            const btnDeletar = document.createElement("button");
            btnDeletar.textContent = "Deletar";
            btnDeletar.className = "btn-deletar";
            btnDeletar.onclick = function() {
                if (confirm(`Tem certeza que deseja deletar o produto "${produto.nome}"?`)) {
                    if (deletarProduto(clienteId, produto.id)) {
                        carregarProdutos(clienteId);
                    } else {
                        alert("Erro ao deletar o produto. Por favor, tente novamente.");
                    }
                }
            };
            
            li.appendChild(btnDeletar);
            ul.appendChild(li);
        });
        listaProdutos.appendChild(ul);
    }
}

console.log("Script concluído");
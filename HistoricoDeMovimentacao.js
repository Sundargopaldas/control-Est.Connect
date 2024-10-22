// HistoricoMovimentacoes.js

// Função para carregar o histórico de movimentações
function carregarHistoricoMovimentacoes() {
    const tableBody = document.getElementById('historicoTableBody');
    if (!tableBody) {
        console.error('Elemento da tabela de histórico não encontrado');
        return;
    }

    tableBody.innerHTML = ''; // Limpa a tabela

    const historico = JSON.parse(localStorage.getItem('historicoMovimentacoes')) || [];
    
    historico.forEach((item, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${item.data}</td>
            <td>${item.cliente || ''}</td>
            <td>${item.produto || ''}</td>
            <td>${item.id || ''}</td>
            <td>${item.descricao || ''}</td>
            <td>${item.imagem ? `<img src="${item.imagem}" alt="Imagem do produto">` : 'Sem imagem'}</td>
            <td>${item.entrada || ''}</td>
            <td>${item.saida || ''}</td>
            <td>${item.estoque || ''}</td>
            <td>${item.status || ''}</td>
            <td class="actions-column"><button class="remove-btn" onclick="removerItemHistorico(${index})">Remover</button></td>
        `;
    });

    console.log(`Carregados ${historico.length} itens no histórico.`);
}

// Função para remover um item do histórico
function removerItemHistorico(index) {
    let historico = JSON.parse(localStorage.getItem('historicoMovimentacoes')) || [];
    historico.splice(index, 1);
    localStorage.setItem('historicoMovimentacoes', JSON.stringify(historico));
    carregarHistoricoMovimentacoes(); // Recarrega a tabela
}

// Função para adicionar um novo item ao histórico
function adicionarAoHistorico(produto) {
    let historico = JSON.parse(localStorage.getItem('historicoMovimentacoes')) || [];
    
    const novoItem = {
        ...produto,
        data: new Date().toLocaleString()
    };
    
    historico.push(novoItem);
    localStorage.setItem('historicoMovimentacoes', JSON.stringify(historico));
}

// Função para sincronizar o histórico com a tabela de produtos
function sincronizarHistorico() {
    const produtos = JSON.parse(localStorage.getItem('products')) || [];
    const historicoAtual = JSON.parse(localStorage.getItem('historicoMovimentacoes')) || [];
    
    produtos.forEach(produto => {
        // Verifica se o produto já existe no histórico
        const produtoExistente = historicoAtual.find(item => 
            item.id === produto.id && 
            item.entrada === produto.entrada && 
            item.saida === produto.saida
        );
        
        if (!produtoExistente) {
            adicionarAoHistorico(produto);
        }
    });
    
    carregarHistoricoMovimentacoes();
}

// Função para atualizar o histórico quando um produto é modificado
function atualizarHistorico(produtoAtualizado) {
    let historico = JSON.parse(localStorage.getItem('historicoMovimentacoes')) || [];
    
    const index = historico.findIndex(item => item.id === produtoAtualizado.id);
    
    if (index !== -1) {
        historico[index] = {
            ...produtoAtualizado,
            data: new Date().toLocaleString()
        };
        localStorage.setItem('historicoMovimentacoes', JSON.stringify(historico));
    } else {
        adicionarAoHistorico(produtoAtualizado);
    }
    
    carregarHistoricoMovimentacoes();
}

// Carregar o histórico quando a página for carregada
window.addEventListener('load', () => {
    carregarHistoricoMovimentacoes();
    sincronizarHistorico();
});

// Adicionar um event listener para mudanças no localStorage
window.addEventListener('storage', (event) => {
    if (event.key === 'products') {
        sincronizarHistorico();
    }
});
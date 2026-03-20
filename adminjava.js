// Simulador de Banco de Dados de Clientes para a Tabela
let clientesFalsos = [
    { id: 1, nome: "Clínica Saúde Total", seg: "Clínica", plano: "Supreme Super", status: "ativo" },
    { id: 2, nome: "Burger Prime", seg: "Restaurante", plano: "Supreme Basic", status: "ativo" },
    { id: 3, nome: "Pet Gold", seg: "Pet Shop", plano: "Supreme Basic", status: "suspenso" },
    { id: 4, nome: "Tech Store", seg: "Loja", plano: "Supreme Elite", status: "ativo" }
];

// 1. LOGIN MASTER
function entrarAdmin(e) {
    e.preventDefault();
    const senha = document.getElementById('admin-senha').value;
    
    // A senha de segurança do dono da Supreme-Tech
    if(senha === 'master123') { 
        document.getElementById('login-admin').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        carregarTabela();
    } else {
        document.getElementById('erro-login').style.display = 'block';
    }
}

function sairAdmin() {
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('login-admin').style.display = 'flex';
    document.getElementById('form-login').reset();
    document.getElementById('erro-login').style.display = 'none';
}

// 2. NAVEGAÇÃO
function navegarAdmin(idSecao, elementoMenu) {
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    elementoMenu.classList.add('active');
    
    document.querySelectorAll('.section-panel').forEach(s => s.classList.remove('active'));
    document.getElementById(idSecao).classList.add('active');
}

// 3. CARREGAR TABELA DE CLIENTES
function carregarTabela() {
    const tbody = document.getElementById('tabela-clientes');
    tbody.innerHTML = ''; // Limpa antes de preencher

    clientesFalsos.forEach(c => {
        let badge = c.status === 'ativo' 
            ? '<span class="badge badge-active">🟢 ATIVO</span>' 
            : '<span class="badge badge-suspended">🔴 SUSPENSO</span>';
        
        let botaoAcao = c.status === 'ativo'
            ? `<button class="btn-action suspend" onclick="mudarStatus(${c.id}, 'suspenso')">Cortar Acesso</button>`
            : `<button class="btn-action reactivate" onclick="mudarStatus(${c.id}, 'ativo')">Reativar Conta</button>`;

        tbody.innerHTML += `
            <tr>
                <td style="color: var(--primary);">#${c.id}</td>
                <td style="color: #fff; font-weight: bold;">${c.nome}</td>
                <td style="text-transform: capitalize;">${c.seg}</td>
                <td>${c.plano}</td>
                <td>${badge}</td>
                <td>
                    ${botaoAcao}
                    <button class="btn-action" style="margin-left: 5px;" onclick="alert('Uma nova senha foi gerada e enviada para o cliente #${c.id}')">🔑 Resetar Senha</button>
                </td>
            </tr>
        `;
    });
}

// 4. MUDAR STATUS DO CLIENTE (O KILL SWITCH DE INADIMPLÊNCIA)
function mudarStatus(id, novoStatus) {
    const confirmacao = confirm(`Tem certeza que deseja mudar o status do cliente #${id} para ${novoStatus.toUpperCase()}?`);
    if(confirmacao) {
        // Futuro: Enviar Webhook para o n8n atualizar o MySQL
        console.log(`Enviado para n8n: { acao: "mudar_status_cliente", id_cliente: ${id}, status: "${novoStatus}" }`);
        
        // Simulação visual para o painel
        clientesFalsos.find(c => c.id === id).status = novoStatus;
        carregarTabela();
    }
}

// 5. GERADOR DE SENHA SEGURA PARA NOVOS CLIENTES
function gerarSenha() {
    const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";
    let senha = "";
    for (let i = 0; i < 8; i++) {
        senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    document.getElementById('senha-gerada').value = senha;
}

// 6. CADASTRAR NOVO CLIENTE (ENVIA PARA O N8N -> MYSQL)
function cadastrarCliente(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData.entries());

    // Este pacote vai para o n8n criar o cadastro real no SQL
    const payload = {
        acao: "criar_novo_cliente_master",
        segredo_admin: "CHAVE_SECRETA_SUPREME",
        dados_cliente: dados
    };

    console.log("🚀 Comando de criação para o n8n:", JSON.stringify(payload, null, 2));

    alert(`✅ Sucesso! O painel da empresa "${dados.nome_empresa}" foi criado no sistema.`);
    form.reset();
    
    // Volta para a aba de gerenciar clientes
    navegarAdmin('sec-clientes', document.querySelectorAll('.menu-item')[1]);
}
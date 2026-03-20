// === CONEXÃO COM O BANCO DE DADOS (SUPABASE) ===
const SUPABASE_URL = 'https://hhyvtehbsfoeuagwhklm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S9oWEYBafLstrVI2SJQ9uA_ijH5Ph9e';

// Mudamos o nome para 'supabaseClient' para evitar o conflito do erro!
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const NUMERO_WHATSAPP_SUPORTE = "5521999999999"; 
let clienteLogado = null;
window.onload = () => {
    const sessaoSalva = localStorage.getItem('sessao_supreme');
    if (sessaoSalva) {
        // Se tem memória, pula a tela de login e vai direto pro painel!
        iniciarSessao(JSON.parse(sessaoSalva));
    }
};
// === EVENTO DE LOGIN REAL NO BANCO DE DADOS ===
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const erroDiv = document.getElementById('login-error');
    
    const btn = this.querySelector('button');
    const textoOriginal = btn.innerText;
    btn.innerText = "Autenticando...";

    const { data: cliente, error } = await supabaseClient
        .from('clientes')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .single(); 

    btn.innerText = textoOriginal;

    if (cliente) {
        // === A TRAVA DE SEGURANÇA (KILL SWITCH FINANCEIRO) ===
        if (cliente.status === 'suspenso') {
            erroDiv.style.display = 'block';
            erroDiv.innerText = "⛔ Acesso Suspenso. Por favor, entre em contato com o suporte financeiro da Supreme-Tech.";
            return; // O 'return' impede que o código continue e abra o painel!
        }
  // === ALTERAR SENHA PELO PAINEL DO CLIENTE ===
async function alterarMinhaSenha(event) {
    event.preventDefault(); // Impede a página de recarregar
    
    if(!clienteLogado) return;

    const novaSenha = document.getElementById('nova-senha-cliente').value;
    const btn = event.target.querySelector('button');
    const txtOrig = btn.innerText;
    
    btn.innerText = "Salvando...";

    // Vai no Supabase e atualiza apenas a coluna 'senha' do cliente atual
    const { error } = await supabaseClient
        .from('clientes')
        .update({ senha: novaSenha })
        .eq('id', clienteLogado.id);

    btn.innerText = txtOrig;

    if (error) {
        alert("Ocorreu um erro ao tentar alterar sua senha. Tente novamente.");
        console.error(error);
    } else {
        // Atualiza a memória local
        clienteLogado.senha = novaSenha; 
        alert("✅ Sua senha foi alterada com sucesso! Use a nova senha no próximo login.");
        document.getElementById('nova-senha-cliente').value = ''; // Limpa o campo
    }
}      
        // Se chegou aqui, o cliente está ATIVO e pode entrar.
        erroDiv.style.display = 'none';
        iniciarSessao(cliente);
        
    } else {
        erroDiv.style.display = 'block';
        erroDiv.innerText = "Acesso Negado. Credenciais inválidas.";
    }
});

// === MONTA O PAINEL DE ACORDO COM O CLIENTE ===
function iniciarSessao(dadosCliente) {
    clienteLogado = dadosCliente;
    localStorage.setItem('sessao_supreme', JSON.stringify(dadosCliente));
    
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.getElementById('nome-empresa').innerText = clienteLogado.nome_empresa;
    document.getElementById('badge-plano').innerText = "Plano " + clienteLogado.plano.toUpperCase();

    const menus = document.querySelectorAll('.menu-item');
    menus.forEach(menu => {
        const permitidos = menu.getAttribute('data-menu').split(',');
        if (permitidos.includes('todos') || permitidos.includes(clienteLogado.segmento)) {
            menu.classList.add('visible');
        } else {
            menu.classList.remove('visible');
        }
    });

    if (clienteLogado.plano.includes('elite')) {
        document.getElementById('dash-bloqueado').style.display = 'none';
        document.getElementById('dash-liberado').style.display = 'block';
    } else {
        document.getElementById('dash-bloqueado').style.display = 'block';
        document.getElementById('dash-liberado').style.display = 'none';
    }

    navegar('sec-dashboard', document.querySelector('.menu-item.visible'));
}

function navegar(idSecao, elementoMenu) {
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    if(elementoMenu) elementoMenu.classList.add('active');

    document.querySelectorAll('.section-panel').forEach(s => s.classList.remove('active'));
    document.getElementById(idSecao).classList.add('active');
}

function fazerLogout() {
    clienteLogado = null;
    localStorage.removeItem('sessao_supreme');
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-form').reset();
}

function abrirWhatsAppSuporte() {
    const texto = encodeURIComponent(`Olá, equipe Supreme-Tech! Sou da empresa *${clienteLogado.nome_empresa}* e preciso de ajuda no meu painel.`);
    window.open(`https://wa.me/${NUMERO_WHATSAPP_SUPORTE}?text=${texto}`, '_blank');
}

// === MOTOR DO CATÁLOGO ===
function adicionarCategoria(botao) {
    const wrapper = botao.closest('.section-panel').querySelector('.categorias-wrapper');
    const div = document.createElement('div');
    div.className = 'categoria-block';
    
    div.innerHTML = `
        <div class="categoria-topo">
            <input type="text" placeholder="Nome da Categoria (Ex: Consultas, Lanches...)" class="cat-nome" required>
            <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove()" title="Excluir Categoria">🗑️</button>
        </div>
        <div class="itens-wrapper"></div>
        <button type="button" class="btn-add-item" onclick="adicionarItem(this)">+ Adicionar Nome e Valor</button>
    `;
    wrapper.appendChild(div);
    adicionarItem(div.querySelector('.btn-add-item'));
}

function adicionarItem(botao) {
    const wrapper = botao.previousElementSibling; 
    const div = document.createElement('div');
    div.className = 'item-row';
    
    div.innerHTML = `
        <input type="text" placeholder="Nome do Item/Serviço" class="item-nome" required>
        <input type="text" placeholder="R$ 0,00" class="item-preco" required>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()" title="Excluir Item">✖</button>
    `;
    wrapper.appendChild(div);
}

// === ENVIO DE DADOS REAIS PARA O SUPABASE ===
async function salvarConfiguracoes(event) {
    event.preventDefault();
    const form = event.target;
    
    // 1. Processa o Catálogo
    const wrapperCategorias = form.querySelector('.categorias-wrapper');
    let catalogoCompleto = [];
    if (wrapperCategorias) {
        wrapperCategorias.querySelectorAll('.categoria-block').forEach(catBlock => {
            let nomeCategoria = catBlock.querySelector('.cat-nome').value;
            let itensDaCategoria = [];
            
            catBlock.querySelectorAll('.item-row').forEach(itemRow => {
                itensDaCategoria.push({
                    nome: itemRow.querySelector('.item-nome').value,
                    preco: itemRow.querySelector('.item-preco').value
                });
            });
            catalogoCompleto.push({ categoria: nomeCategoria, itens: itensDaCategoria });
        });
    }

    // 2. Coleta o resto dos dados (Horários, Textos, Taxas)
    const formData = new FormData(form);
    let dadosFormulario = Object.fromEntries(formData.entries());
    
    // Junta o catálogo formatado aos dados gerais
    dadosFormulario['catalogo'] = catalogoCompleto;

    // 3. Verifica o botão de emergência
    const toggleBot = form.querySelector('#toggle-bot');
    const statusBot = toggleBot ? (toggleBot.checked ? "SIM" : "NAO") : "NAO";

    // Mostra que está salvando
    const btnSalvar = form.querySelector('button[type="submit"]');
    const textoBotaoOrig = btnSalvar.innerText;
    btnSalvar.innerText = "Salvando na Nuvem...";

    // 4. ATUALIZA O BANCO DE DADOS OFICIAL (SUPABASE)
    const { data, error } = await supabaseClient
        .from('configuracoes_robo')
        .upsert({ 
            cliente_id: clienteLogado.id, 
            bot_desativado: statusBot,
            dados_painel: dadosFormulario 
        });

    btnSalvar.innerText = textoBotaoOrig;

    if (error) {
        console.error("Erro no Supabase:", error);
        alert("Ocorreu um erro ao salvar. Tente novamente.");
    } else {
        const aviso = form.querySelector('.aviso-sucesso');
        aviso.style.display = 'block';
        setTimeout(() => { aviso.style.display = 'none'; }, 4000);
    }
}

// === ENVIO DE SUPORTE (Webhook do n8n) ===
function enviarContato(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const payload = {
        cliente_id: clienteLogado.id,
        acao: "abrir_ticket",
        assunto: formData.get('assunto'),
        mensagem: formData.get('mensagem_suporte')
    };

    // Aqui usamos o n8n para enviar o alerta para você via WhatsApp/Email!
    fetch("https://seu-n8n.com/webhook/ticket-suporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const aviso = form.querySelector('.aviso-sucesso');
    aviso.style.display = 'block';
    form.reset(); 
    setTimeout(() => { aviso.style.display = 'none'; }, 4000);
}
// ==========================================
// SISTEMA DE TROCA DE SENHA DO CLIENTE
// ==========================================
function abrirModalSenhaCliente() {
    document.getElementById('modal-senha-cliente').style.display = 'flex';
}

function fecharModalSenhaCliente() {
    document.getElementById('modal-senha-cliente').style.display = 'none';
    document.getElementById('nova-senha-input').value = ''; // Limpa o campo ao fechar
}

async function alterarMinhaSenha(event) {
    event.preventDefault(); 
    
    if(!clienteLogado) return;

    const novaSenha = document.getElementById('nova-senha-input').value;
    const btn = event.target.querySelector('button');
    const txtOrig = btn.innerText;
    
    btn.innerText = "Atualizando Cofre...";

    // Vai no Supabase e atualiza a senha
    const { error } = await supabaseClient
        .from('clientes')
        .update({ senha: novaSenha })
        .eq('id', clienteLogado.id);

    btn.innerText = txtOrig;

    if (error) {
        alert("Ocorreu um erro ao tentar alterar sua senha. Tente novamente.");
        console.error(error);
    } else {
        clienteLogado.senha = novaSenha; 
        alert("✅ Sua senha foi alterada com sucesso!");
        fecharModalSenhaCliente(); // Fecha a janela sozinho após o sucesso
    }
}

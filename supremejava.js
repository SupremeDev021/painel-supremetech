// URL do Webhook do n8n que vai receber as atualizações (colocaremos isso depois)
const URL_WEBHOOK_N8N = "https://seu-n8n.com/webhook/atualizar-configs";

let clienteLogado = null;

// EVENTO DE LOGIN (Aqui simulamos o back-end por enquanto)
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    let simulaRespostaBanco = null;

    if(email === "clinica@teste.com") {
        simulaRespostaBanco = { id: 1, nome: "Clínica Vida", segmento: "clinica", token: "abc123token" };
    } else if (email === "lanche@teste.com") {
        simulaRespostaBanco = { id: 2, nome: "Burger Zé", segmento: "restaurante", token: "xyz890token" };
    } else if (email === "pet@teste.com") {
        simulaRespostaBanco = { id: 3, nome: "Pet Feliz", segmento: "petshop", token: "pet456token" };
    } else if (email === "loja@teste.com") {
        simulaRespostaBanco = { id: 4, nome: "Loja Virtual", segmento: "loja", token: "loja789token" };
    }

    if (simulaRespostaBanco) {
        document.getElementById('login-error').style.display = 'none';
        iniciarSessao(simulaRespostaBanco);
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
});

// MONTA O PAINEL E ESCONDE O QUE NÃO É DAQUELE CLIENTE
function iniciarSessao(dadosCliente) {
    clienteLogado = dadosCliente;
    
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.getElementById('nome-empresa').innerText = 'Painel | ' + clienteLogado.nome;

    const menus = document.querySelectorAll('.menu-item');
    menus.forEach(menu => {
        const permitidos = menu.getAttribute('data-menu').split(',');
        if (permitidos.includes('todos') || permitidos.includes(clienteLogado.segmento)) {
            menu.classList.add('visible');
        } else {
            menu.classList.remove('visible');
        }
    });

    if (clienteLogado.segmento === 'petshop') {
        document.getElementById('bloco-banho').style.display = 'block';
    } else {
        document.getElementById('bloco-banho').style.display = 'none';
    }
}

// NAVEGAÇÃO ENTRE AS ABAS
function navegar(idSecao, elementoMenu) {
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    elementoMenu.classList.add('active');

    document.querySelectorAll('.section-panel').forEach(s => s.classList.remove('active'));
    document.getElementById(idSecao).classList.add('active');
}

// LOGOUT
function fazerLogout() {
    clienteLogado = null;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-form').reset();
}

// ENVIA AS CONFIGURAÇÕES PARA O N8N
function salvarConfiguracoes(event, formId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Constrói a estrutura JSON que o n8n espera receber
    const payload = {
        cliente_id: clienteLogado.id,
        segmento: clienteLogado.segmento,
        acao: "atualizar_configuracoes",
        configuracoes: {}
    };

    formData.forEach((value, key) => {
        payload.configuracoes[key] = value;
    });

    console.log("Enviando para o n8n:", JSON.stringify(payload));

    // Feedback visual para o cliente
    const aviso = form.querySelector('.aviso-sucesso');
    aviso.style.display = 'block';
    setTimeout(() => { aviso.style.display = 'none'; }, 4000);

    /* O CÓDIGO FINAL DE CONEXÃO FICARÁ ASSIM:
    fetch(URL_WEBHOOK_N8N, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(res => console.log('Salvo com sucesso no n8n!'))
      .catch(err => console.error('Erro de conexão:', err));
    */
}
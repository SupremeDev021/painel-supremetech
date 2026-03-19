const URL_WEBHOOK_N8N = "https://seu-n8n.com/webhook/atualizar-configs";
const NUMERO_WHATSAPP_SUPORTE = "5521999999999"; 

let clienteLogado = null;

// EVENTO DE LOGIN 
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    let simulaRespostaBanco = null;

    if(email === "clinica@teste.com") {
        simulaRespostaBanco = { id: 1, nome: "Clínica Saúde Total", segmento: "clinica", plano: "supreme super" };
    } else if (email === "restaurante@teste.com") {
        simulaRespostaBanco = { id: 2, nome: "Burger Prime", segmento: "restaurante", plano: "supreme basic" };
    } else if (email === "loja@teste.com") {
        simulaRespostaBanco = { id: 4, nome: "Tech Store", segmento: "loja", plano: "supreme elite" };
    } else {
        simulaRespostaBanco = { id: 3, nome: "Pet Gold", segmento: "petshop", plano: "supreme basic" };
    }

    if (simulaRespostaBanco) {
        document.getElementById('login-error').style.display = 'none';
        iniciarSessao(simulaRespostaBanco);
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
});

function iniciarSessao(dadosCliente) {
    clienteLogado = dadosCliente;
    
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.getElementById('nome-empresa').innerText = clienteLogado.nome;
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

    if (clienteLogado.plano === 'supreme elite') {
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
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-form').reset();
}

function abrirWhatsAppSuporte() {
    const texto = encodeURIComponent(`Olá, equipe Supreme-Tech! Sou da empresa *${clienteLogado.nome}* e preciso de ajuda no meu painel.`);
    window.open(`https://wa.me/${NUMERO_WHATSAPP_SUPORTE}?text=${texto}`, '_blank');
}

// ENVIO DE DADOS - INCLUINDO O TOGGLE "DESATIVAR BOT"
function salvarConfiguracoes(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    let dadosFormulario = Object.fromEntries(formData.entries());
    
    // Verifica se o formulário atual possui o botão de desativar (checkbox)
    const toggleBot = form.querySelector('#toggle-bot');
    if (toggleBot) {
        dadosFormulario['bot_desativado'] = toggleBot.checked ? "SIM" : "NAO";
    }

    const payload = {
        cliente_id: clienteLogado.id,
        acao: "salvar_configuracoes",
        dados: dadosFormulario
    };

    console.log("Enviando Configuração para o n8n:", JSON.stringify(payload));

    const aviso = form.querySelector('.aviso-sucesso');
    aviso.style.display = 'block';
    setTimeout(() => { aviso.style.display = 'none'; }, 4000);
}

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

    console.log("Ticket enviado:", JSON.stringify(payload));

    const aviso = form.querySelector('.aviso-sucesso');
    aviso.style.display = 'block';
    form.reset(); 
    setTimeout(() => { aviso.style.display = 'none'; }, 4000);
}

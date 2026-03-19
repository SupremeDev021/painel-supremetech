let clienteLogado = null;

// EVENTO DE LOGIN (Simulando o Banco de Dados)
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    let simulaRespostaBanco = null;

    // Repare no "plano" que adicionamos no banco de dados
    if(email === "clinica@teste.com") {
        simulaRespostaBanco = { id: 1, nome: "Clínica Vida", segmento: "clinica", plano: "supreme", token: "abc123token" };
    } else if (email === "lanche@teste.com") {
        simulaRespostaBanco = { id: 2, nome: "Burger Zé", segmento: "restaurante", plano: "start", token: "xyz890token" };
    } else if (email === "loja@teste.com") {
        simulaRespostaBanco = { id: 4, nome: "Loja Tech", segmento: "loja", plano: "elite", token: "loja789token" };
    }

    if (simulaRespostaBanco) {
        document.getElementById('login-error').style.display = 'none';
        iniciarSessao(simulaRespostaBanco);
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
});

// MONTA O PAINEL DE ACORDO COM O SEGMENTO E PLANO
function iniciarSessao(dadosCliente) {
    clienteLogado = dadosCliente;
    
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.getElementById('nome-empresa').innerText = clienteLogado.nome;
    document.getElementById('badge-plano').innerText = "Plano " + clienteLogado.plano.toUpperCase();

    // 1. Filtra as abas laterais por Segmento
    const menus = document.querySelectorAll('.menu-item');
    menus.forEach(menu => {
        const permitidos = menu.getAttribute('data-menu').split(',');
        if (permitidos.includes('todos') || permitidos.includes(clienteLogado.segmento)) {
            menu.classList.add('visible');
        } else {
            menu.classList.remove('visible');
        }
    });

    // Ajuste fino para Pet Shop
    if (clienteLogado.segmento === 'petshop') {
        document.getElementById('bloco-banho').style.display = 'block';
    } else {
        document.getElementById('bloco-banho').style.display = 'none';
    }

    // 2. Trava ou Libera o Dashboard com base no Plano
    if (clienteLogado.plano === 'elite') {
        document.getElementById('dash-bloqueado').style.display = 'none';
        document.getElementById('dash-liberado').style.display = 'block';
    } else {
        document.getElementById('dash-bloqueado').style.display = 'block';
        document.getElementById('dash-liberado').style.display = 'none';
    }

    // Volta sempre para a primeira aba (Dashboard)
    navegar('sec-dashboard', document.querySelector('.menu-item.visible'));
}

// NAVEGAÇÃO ENTRE AS ABAS
function navegar(idSecao, elementoMenu) {
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    if(elementoMenu) elementoMenu.classList.add('active');

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

// ENVIO DE DADOS (CONFIGURAÇÕES) PARA O N8N
function salvarConfiguracoes(event, formId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const payload = {
        cliente_id: clienteLogado.id,
        acao: "salvar_configuracoes",
        dados: Object.fromEntries(formData.entries())
    };

    console.log("Enviando Configuração para o n8n:", JSON.stringify(payload));

    const aviso = form.querySelector('.aviso-sucesso');
    aviso.style.display = 'block';
    setTimeout(() => { aviso.style.display = 'none'; }, 4000);
}

// ENVIO DE DADOS (SUPORTE) PARA O N8N
function enviarContato(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const payload = {
        cliente_id: clienteLogado.id,
        acao: "abrir_ticket_suporte",
        assunto: formData.get('assunto'),
        mensagem: formData.get('mensagem_suporte')
    };

    console.log("Enviando Pedido de Suporte para o n8n:", JSON.stringify(payload));

    const aviso = form.querySelector('.aviso-sucesso');
    aviso.style.display = 'block';
    form.reset(); // Limpa o formulário após enviar
    setTimeout(() => { aviso.style.display = 'none'; }, 4000);
}

// BOTÃO DE UPSELL
function solicitarUpgrade() {
    alert("Iniciando contato com a Supreme-Tech para upgrade do Plano " + clienteLogado.plano.toUpperCase() + " para o ELITE 360. Entraremos em contato via WhatsApp!");
    // Aqui você também pode fazer um fetch para o n8n avisando você, dono da Supreme-Tech, que o cliente quer comprar o plano mais caro!
}

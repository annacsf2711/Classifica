// ===================== CONFIGURAÇÃO =====================
const API_URL = 'http://localhost:3000';

// pega o banco salvo no localStorage (definido em abrirBanco() na tela anterior)
const bancoId = localStorage.getItem('bancoId');


// professor logado (salvo no localStorage no momento do login, veja observação abaixo)
const idProfessor = localStorage.getItem('idProfessor');
fetch(`http://localhost:3000/professor/${idProfessor}`) // requisição para o servidor passando o id do professor na URL
.then(async resposta => {
   
  if (!resposta.ok) {
    const mensagem = await resposta.text();
    throw new Error(mensagem);
  }
  return resposta.json();
})

.then(professor => {   // recebe os dados do professor retornados pelo servidor

    
  console.log("Professor:", professor);


  document.getElementById("nomeUsuario").textContent = professor.nome;
  document.getElementById('avatarInicial').textContent = professor.nome.charAt(0).toUpperCase(); // Exibe a primeira letra do nome como avatar

  
})
.catch(erro => {
  console.error("Erro ao buscar professor:", erro);
});

// elementos da tela
const listaQuestoes = document.getElementById('listaQuestoes');
const tituloBanco = document.getElementById('tituloBanco');
const subtituloBanco = document.getElementById('subtituloBanco');
const modalAdicionar = document.getElementById('modalAdicionar');
const listaDisponiveis = document.getElementById('listaDisponiveis');
const addBtn = document.querySelector('.add-btn');
const fecharModal = document.getElementById('fecharModal');

// elementos das abas
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const formNovaQuestao = document.getElementById('formNovaQuestao');

// ===================== CARREGAR DADOS DO BANCO (nome, disciplina, id) =====================
async function carregarInfoBanco() {
  try {
    const resposta = await fetch(`${API_URL}/buscarBanco/${bancoId}`);

    if (!resposta.ok) {
      throw new Error(`Servidor retornou status ${resposta.status}`);
    }

    const banco = await resposta.json();

    tituloBanco.textContent = banco.nome;
    subtituloBanco.textContent = `Disciplina: ${banco.disciplina || '-'} · ID do banco: ${banco.id}`;
    document.title = `Classifica - ${banco.nome}`;

  } catch (erro) {
    console.error("Erro ao carregar informações do banco:", erro);
    tituloBanco.textContent = `Banco #${bancoId}`;
    subtituloBanco.textContent = 'Não foi possível carregar os detalhes deste banco.';
  }
}

// ===================== CARREGAR QUESTÕES DO BANCO =====================
async function carregarQuestoes() {
  try {
    const resposta = await fetch(`${API_URL}/listarQuestoesBanco/${bancoId}`);

    if (!resposta.ok) {
      throw new Error(`Servidor retornou status ${resposta.status}`);
    }

    const questoes = await resposta.json();

    listaQuestoes.innerHTML = '';

    if (questoes.length === 0) {
      listaQuestoes.innerHTML = '<p>Nenhuma questão neste banco ainda.</p>';
      return;
    }

    questoes.forEach((questao, index) => {
      const div = document.createElement('div');
      div.classList.add('question');
      div.innerHTML = `
        <div class="left">
          <h3>Questão ${index + 1}</h3>
          <span class="type"><span class="dot"></span> ${questao.tipo || 'Tipo de questão'}</span>
        </div>
        <button class="btn" onclick="abrirQuestao(${questao.id})">Abrir</button>
      `;
      listaQuestoes.appendChild(div);
    });

  } catch (erro) {
    console.error("Erro ao carregar questões:", erro);
    listaQuestoes.innerHTML = `<p>Erro ao carregar questões. Verifique se o servidor (${API_URL}) está rodando.</p>`;
  }
}

// ===================== ABRIR MODAL E CARREGAR DISPONÍVEIS =====================
async function abrirModalAdicionar() {
  listaDisponiveis.innerHTML = '<p>Carregando...</p>';
  modalAdicionar.style.display = 'flex';

  // sempre volta pra primeira aba ao abrir o modal
  ativarAba('existentes');

  try {
    const resposta = await fetch(`${API_URL}/listarExerciciosDisponiveis/${bancoId}`);

    if (!resposta.ok) {
      throw new Error(`Servidor retornou status ${resposta.status}`);
    }

    const disponiveis = await resposta.json();

    listaDisponiveis.innerHTML = '';

    if (disponiveis.length === 0) {
      listaDisponiveis.innerHTML = '<p>Nenhuma questão disponível para adicionar.</p>';
    } else {
      disponiveis.forEach(ex => {
        const item = document.createElement('div');
        item.classList.add('item-disponivel');
        item.innerHTML = `
          <span>${ex.enunciado ? ex.enunciado.substring(0, 50) + '...' : 'Questão #' + ex.id}</span>
          <button onclick="adicionarQuestao(${ex.id})">Adicionar</button>
        `;
        listaDisponiveis.appendChild(item);
      });
    }

  } catch (erro) {
    console.error("Erro ao carregar exercícios disponíveis:", erro);
    listaDisponiveis.innerHTML = `<p>Erro ao carregar questões disponíveis. Verifique se o servidor (${API_URL}) está rodando.</p>`;
  }
}

// ===================== ALTERNAR ABAS DO MODAL =====================
function ativarAba(nomeAba) {
  tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === nomeAba);
  });
  tabContents.forEach(content => {
    const ehAlvo = content.id === `tab${nomeAba.charAt(0).toUpperCase()}${nomeAba.slice(1)}`;
    content.classList.toggle('active', ehAlvo);
  });
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => ativarAba(btn.dataset.tab));
});

// ===================== ADICIONAR QUESTÃO EXISTENTE AO BANCO =====================
async function adicionarQuestao(exercicioId) {
  try {
    const resposta = await fetch(`${API_URL}/adicionarQuestaoBanco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bancoId, exercicioId })
    });

    if (!resposta.ok) {
      throw new Error(`Servidor retornou status ${resposta.status}`);
    }

    modalAdicionar.style.display = 'none';
    carregarQuestoes();

  } catch (erro) {
    console.error("Erro ao adicionar questão:", erro);
    alert("Não foi possível adicionar a questão. Verifique se o servidor está rodando.");
  }
}

// ===================== CRIAR NOVA QUESTÃO E JÁ ADICIONAR AO BANCO =====================
formNovaQuestao.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dadosQuestao = {
    enunciado: document.getElementById('novoEnunciado').value,
    alternativaA: document.getElementById('novaAlternativaA').value,
    alternativaB: document.getElementById('novaAlternativaB').value,
    alternativaC: document.getElementById('novaAlternativaC').value,
    alternativaD: document.getElementById('novaAlternativaD').value,
    alternativaCorreta: document.getElementById('novaCorreta').value,
    nivelDificuldade: document.getElementById('novoNivel').value,
    criadoPor: idProfessor,
    bancoId: bancoId // usado no backend pra descobrir a disciplina/área do banco
  };

  try {
    // 1. cria o exercício
    const respostaCriar = await fetch(`${API_URL}/criarExercicio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosQuestao)
    });

    if (!respostaCriar.ok) {
      // tenta extrair mensagem do corpo (JSON ou texto)
      let detalhe = '';
      try {
        const ct = respostaCriar.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const body = await respostaCriar.json();
          detalhe = (body && (body.error || body.message || JSON.stringify(body))) || '';
        } else {
          detalhe = await respostaCriar.text();
        }
      } catch (e) {
        detalhe = 'Falha ao ler resposta de erro do servidor';
      }
      throw new Error(`Servidor retornou status ${respostaCriar.status}${detalhe ? ': ' + detalhe : ''}`);
    }

    const resultado = await respostaCriar.json();
    const novoExercicioId = resultado.id;

    // 2. já vincula esse exercício recém-criado ao banco atual
    const respostaVinc = await fetch(`${API_URL}/adicionarQuestaoBanco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bancoId, exercicioId: novoExercicioId })
    });

    if (!respostaVinc.ok) {
      let detalheV = '';
      try {
        const ct = respostaVinc.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const body = await respostaVinc.json();
          detalheV = (body && (body.error || body.message || JSON.stringify(body))) || '';
        } else {
          detalheV = await respostaVinc.text();
        }
      } catch (e) {
        detalheV = 'Falha ao ler resposta de erro do servidor';
      }
      throw new Error(`Erro ao vincular exercício ao banco. Status ${respostaVinc.status}${detalheV ? ': ' + detalheV : ''}`);
    }

    formNovaQuestao.reset();
    modalAdicionar.style.display = 'none';
    carregarQuestoes();

  } catch (erro) {
    console.error("Erro ao criar questão:", erro);
    alert("Não foi possível criar a questão. Erro: " + (erro.message || erro));
  }
});

// ===================== ABRIR UMA QUESTÃO =====================
function abrirQuestao(id) {
  window.location.href = `Tela_Editar_Questao.html?id=${id}`;
}

// ===================== EVENTOS =====================
addBtn.addEventListener('click', abrirModalAdicionar);
fecharModal.addEventListener('click', () => modalAdicionar.style.display = 'none');

// ===================== INICIAR =====================
if (bancoId) {
  carregarInfoBanco();
  carregarQuestoes();
} else {
  tituloBanco.textContent = 'Banco não identificado';
  listaQuestoes.innerHTML = '<p>Banco não identificado. Volte à tela anterior.</p>';
}
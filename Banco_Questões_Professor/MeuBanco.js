// ===================== CONFIGURAÇÃO =====================
const API_URL = 'http://localhost:3000';

// pega o banco pela URL, ex: Tela_Meu_Banco.html?bancoId=2
const params = new URLSearchParams(window.location.search);
const bancoId = params.get('bancoId');

// elementos da tela
const listaQuestoes = document.getElementById('listaQuestoes');
const modalAdicionar = document.getElementById('modalAdicionar');
const listaDisponiveis = document.getElementById('listaDisponiveis');
const addBtn = document.querySelector('.add-btn');
const fecharModal = document.getElementById('fecharModal');

// ===================== CARREGAR QUESTÕES DO BANCO =====================
async function carregarQuestoes() {
  try {
    const resposta = await fetch(`${API_URL}/listarQuestoesBanco/${bancoId}`);
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
  }
}

// ===================== ABRIR MODAL E CARREGAR DISPONÍVEIS =====================
async function abrirModalAdicionar() {
  try {
    const resposta = await fetch(`${API_URL}/listarExerciciosDisponiveis/${bancoId}`);
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

    modalAdicionar.style.display = 'flex';

  } catch (erro) {
    console.error("Erro ao carregar exercícios disponíveis:", erro);
  }
}

// ===================== ADICIONAR QUESTÃO AO BANCO =====================
async function adicionarQuestao(exercicioId) {
  try {
    await fetch(`${API_URL}/adicionarQuestaoBanco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bancoId, exercicioId })
    });

    modalAdicionar.style.display = 'none';
    carregarQuestoes(); // atualiza a lista principal

  } catch (erro) {
    console.error("Erro ao adicionar questão:", erro);
  }
}

// ===================== ABRIR UMA QUESTÃO =====================
function abrirQuestao(id) {
  window.location.href = `Tela_Editar_Questao.html?id=${id}`;
}

// ===================== EVENTOS =====================
addBtn.addEventListener('click', abrirModalAdicionar);
fecharModal.addEventListener('click', () => modalAdicionar.style.display = 'none');

// ===================== INICIAR =====================
if (bancoId) {
  carregarQuestoes();
} else {
  listaQuestoes.innerHTML = '<p>Banco não identificado. Volte à tela anterior.</p>';
}
// ===================== CONFIGURAÇÃO =====================
const API_URL = 'http://localhost:3000';

// ID do professor logado.
// Por enquanto fixo pra teste — depois troque pelo valor real
// (ex: salvo no localStorage no momento do login).
const professorId = localStorage.getItem('professorId') || 1;

// elementos da tela
const listaBancos = document.getElementById('listaBancos');
const btnNovoBanco = document.getElementById('btnNovoBanco');
const modalNovoBanco = document.getElementById('modalNovoBanco');
const inputNomeBanco = document.getElementById('inputNomeBanco');
const inputDisciplinaBanco = document.getElementById('inputDisciplinaBanco');
const btnSalvarBanco = document.getElementById('btnSalvarBanco');
const btnCancelarBanco = document.getElementById('btnCancelarBanco');

// ===================== CARREGAR BANCOS DO PROFESSOR =====================
async function carregarBancos() {
  try {
    const resposta = await fetch(`${API_URL}/listarBancos/${professorId}`);
    const bancos = await resposta.json();

    listaBancos.innerHTML = '';

    if (bancos.length === 0) {
      listaBancos.innerHTML = '<p>Nenhum banco criado ainda.</p>';
      return;
    }

    bancos.forEach(banco => {
      const card = document.createElement('div');
      card.classList.add('card-banco');

      // se for banco do sistema, mostra o nome com destaque de cor (ex: "Questões Classifica")
      const nomeFormatado = banco.tipo === 'sistema'
        ? banco.nome.replace(/(\S+)$/, '<span class="destaque">$1</span>')
        : banco.nome;

      card.innerHTML = `
        <div>
          <h3>${nomeFormatado}</h3>
          <div class="info">
            ${banco.total_questoes ? `<span><span class="dot"></span> ${banco.total_questoes} questões</span>` : ''}
            <span><span class="dot"></span> Disciplina: ${banco.disciplina || '-'}</span>
          </div>
        </div>
        <a href="Tela_Meu_Banco.html?bancoId=${banco.id}" class="btn">Abrir</a>
      `;
      listaBancos.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro ao carregar bancos:", erro);
  }
}

// ===================== CRIAR NOVO BANCO =====================
async function criarBanco() {
  const nome = inputNomeBanco.value.trim();
  const disciplina = inputDisciplinaBanco.value.trim();

  if (!nome) {
    alert('Digite um nome para o banco.');
    return;
  }

  try {
    await fetch(`${API_URL}/criarBanco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, disciplina, professorId })
    });

    // limpa os campos e fecha o modal
    inputNomeBanco.value = '';
    inputDisciplinaBanco.value = '';
    modalNovoBanco.style.display = 'none';

    carregarBancos(); // atualiza a lista com o novo banco

  } catch (erro) {
    console.error("Erro ao criar banco:", erro);
  }
}

// ===================== EVENTOS =====================
btnNovoBanco.addEventListener('click', () => {
  modalNovoBanco.style.display = 'flex';
});

btnCancelarBanco.addEventListener('click', () => {
  modalNovoBanco.style.display = 'none';
});

btnSalvarBanco.addEventListener('click', criarBanco);

// ===================== INICIAR =====================
carregarBancos();
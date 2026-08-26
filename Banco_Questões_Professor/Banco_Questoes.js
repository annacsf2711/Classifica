// ===================== CONFIGURAÇÃO =====================
const API_URL = 'http://localhost:3000';

// ID do professor logado.
// Por enquanto fixo pra teste — depois troque pelo valor real
// (ex: salvo no localStorage no momento do login).
const idProfessor = localStorage.getItem('idProfessor') ;

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
  
})
.catch(erro => {
  console.error("Erro ao buscar professor:", erro);
});

// elementos da tela
const listaBancos = document.getElementById('listaBancos');
const addCard = document.getElementById('addCard');
const formCard = document.getElementById('formCard');
const inputNomeBanco = document.getElementById('nomeBanco');
const inputDisciplinaBanco = document.getElementById('disciplinaBanco');
const btnSalvarBanco = document.getElementById('salvarBanco');

// ===================== MOSTRAR/ESCONDER FORMULÁRIO =====================
function toggleForm() {
  formCard.classList.toggle('open');
  if (formCard.classList.contains('open')) {
    inputNomeBanco.focus();
  }
}

// ===================== CARREGAR BANCOS DO PROFESSOR =====================
async function carregarBancos() {
  listaBancos.innerHTML = '<p class="estado-vazio">Carregando bancos...</p>';

  try {
    const resposta = await fetch(`${API_URL}/listarBancos/${idProfessor}`);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const bancos = await resposta.json();

    listaBancos.innerHTML = '';

    if (!bancos || bancos.length === 0) {
      listaBancos.innerHTML = '<p class="estado-vazio">Nenhum banco criado ainda.</p>';
      return;
    }

    bancos.forEach(banco => {
      const card = document.createElement('div');
      card.classList.add('card-banco');

      // se for banco do sistema, mostra a última palavra do nome com destaque
      // (ex: "Questões Classifica" -> "Classifica" fica colorido)
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
        <button class="btn" onclick="abrirBanco(${banco.id})">Abrir</button>
      `;
      listaBancos.appendChild(card);
    });

  } catch (erro) {
    console.error('Erro ao carregar bancos:', erro);
    listaBancos.innerHTML = '<p class="estado-erro">Não foi possível carregar os bancos. Verifique se a API está rodando.</p>';
  }
}

// ===================== ABRIR UM BANCO (salva o id e navega) =====================
function abrirBanco(id) {
  localStorage.setItem('bancoId', id);
  window.location.href = 'Tela_MeuBanco.html';
}

// ===================== CRIAR NOVO BANCO =====================
async function criarBanco() {
  const nome = inputNomeBanco.value.trim();
  const disciplina = inputDisciplinaBanco.value.trim();

  if (!nome) {
    alert('Digite um nome para o banco.');
    return;
  }

  btnSalvarBanco.disabled = true;
  btnSalvarBanco.textContent = 'Salvando...';

  try {
    const resposta = await fetch(`${API_URL}/criarBanco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, disciplina, idProfessor })
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    // limpa os campos e fecha o formulário depois de salvar
    inputNomeBanco.value = '';
    inputDisciplinaBanco.value = '';
    formCard.classList.remove('open');

    carregarBancos(); // atualiza a lista com o novo banco

  } catch (erro) {
    console.error('Erro ao criar banco:', erro);
    alert('Não foi possível criar o banco. Verifique se a API está rodando.');
  } finally {
    btnSalvarBanco.disabled = false;
    btnSalvarBanco.textContent = 'Salvar';
  }
}

// ===================== INICIAR =====================
carregarBancos();
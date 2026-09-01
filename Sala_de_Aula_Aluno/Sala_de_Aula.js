const API_URL = 'http://localhost:3000';

 
const idEstudante = localStorage.getItem("idEstudante"); // busca o id do professor que foi salvo no navegador após o login

console.log("ID:", idEstudante);

fetch(`http://localhost:3000/estudante/${idEstudante}`) // requisição para o servidor passando o id do professor na URL
.then(async resposta => {
   
  if (!resposta.ok) {
    const mensagem = await resposta.text();
    throw new Error(mensagem);
  }
  return resposta.json();
})

.then(estudante => {   // recebe os dados do estudandte retornados pelo servidor

    
  console.log("Estudante:", estudante);


  document.getElementById("nomeUsuario").textContent = estudante.nome;
  
})
.catch(erro => {
  console.error("Erro ao buscar aluno:", erro);
});

async function carregarColegas() {

  try {

    const resposta = await fetch(
      `${API_URL}/colegasTurma/${idEstudante}`
    );

    const colegas = await resposta.json();

    const grid =
      document.getElementById('colegasGrid');

    grid.innerHTML = '';

    colegas.forEach(colega => {

      const div =
        document.createElement('div');

      div.classList.add('colega-card');

      div.innerHTML = `
        <div class="colega-avatar">
          ${colega.nome.charAt(0)}
        </div>

        <div class="colega-name">
          ${colega.nome}
        </div>

        <button class="colega-btn">
          Colega
        </button>
      `;

      grid.appendChild(div);
    });

  } catch (erro) {
    console.error(
      'Erro ao carregar colegas',
      erro
    );
  }
}

carregarColegas();

const CORES_DISCIPLINA = {
  "Matemática": ["#3aa4e8", "#0a5681"],
  "Português": ["#3ec98a", "#04884a"],
  "Ciências da Natureza": ["#8b5cf6", "#c084fc"],
  "Ciências Humanas": ["#f27128", "#fbbf24"]
};

function carregarDisciplinas() {
  document.querySelectorAll('.disciplina-card').forEach(card => {
    card.addEventListener('click', () => abrirSimulados(card.dataset.disciplina));
  });
}

async function abrirSimulados(disciplina) {
  const modal = document.getElementById('modalSimulados');
  const header = document.getElementById('modalHeader');
  const titulo = document.getElementById('modalDisciplinaTitulo');
  const subtitulo = document.getElementById('modalSubtitulo');
  const lista = document.getElementById('listaSimulados');

  const [cor1, cor2] = CORES_DISCIPLINA[disciplina] || ["#3aa4e8", "#3ec98a"];
  header.style.setProperty('--modal-accent', cor1);
  header.style.setProperty('--modal-accent-2', cor2);
  document.documentElement.style.setProperty('--modal-accent', cor1);

  titulo.textContent = disciplina;
  subtitulo.textContent = "Escolha um simulado para responder";
  lista.innerHTML = '<p style="text-align:center; color:#9aa3b2; padding:20px;">Carregando...</p>';
  modal.classList.add('ativo');

  try {
    const resposta = await fetch(
      `${API_URL}/simuladosParaAluno/${idEstudante}/${encodeURIComponent(disciplina)}`
    );
    const simulados = await resposta.json();

    if (simulados.length === 0) {
      lista.innerHTML = `
        <div class="modal-vazio">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/>
          </svg>
          <p>Nenhum simulado disponível ainda para esta disciplina.</p>
        </div>`;
      return;
    }

    lista.innerHTML = '';
    simulados.forEach(sim => {
      const data = new Date(sim.data_criacao).toLocaleDateString('pt-BR');
      const item = document.createElement('div');
      item.classList.add('simulado-item');
      item.innerHTML = `
        <div style="display:flex; align-items:center; flex:1;">
          <div class="simulado-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${cor1}" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h3"/>
            </svg>
          </div>
          <div class="simulado-info">
            <b>${sim.nome}</b>
            <span>${sim.total_questoes} questão(ões) · ${data}</span>
          </div>
        </div>
        <button class="simulado-btn" data-id="${sim.id}" style="background:${cor1}">Responder</button>
      `;
      lista.appendChild(item);
    });

    lista.querySelectorAll('.simulado-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = `../Simulado/Simulado.html?idSimulado=${btn.dataset.id}`;
      });
    });

  } catch (erro) {
    console.error('Erro ao carregar simulados:', erro);
    lista.innerHTML = '<p style="text-align:center; color:#e74c3c; padding:20px;">Erro ao carregar simulados. Tente novamente.</p>';
  }
}

document.getElementById('fecharModal').addEventListener('click', () => {
  document.getElementById('modalSimulados').classList.remove('ativo');
});

document.getElementById('modalSimulados').addEventListener('click', (e) => {
  if (e.target.id === 'modalSimulados') {
    document.getElementById('modalSimulados').classList.remove('ativo');
  }
});

carregarDisciplinas();
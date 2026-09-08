const API_URL = 'http://localhost:3000';

// pega o id da turma que veio na URL (?idTurma=123)
const params = new URLSearchParams(window.location.search);
const idTurma = params.get('idTurma');

// pega o id do professor logado, salvo no navegador após o login
const idProfessor = localStorage.getItem("idProfessor");

console.log("ID Turma:", idTurma);

// ---- Nome do professor (mesmo padrão da tela de turmas) ----
if (idProfessor) {
  fetch(`${API_URL}/professor/${idProfessor}`)
    .then(async resposta => {
      if (!resposta.ok) {
        const mensagem = await resposta.text();
        throw new Error(mensagem);
      }
      return resposta.json();
    })
    .then(professor => {
      document.getElementById("nomeProfessor").textContent = professor.nome;
      document.getElementById("avatarInicial").textContent = professor.nome.charAt(0).toUpperCase();
    })
    .catch(erro => console.error("Erro ao buscar professor:", erro));
}

// ---- Dados da turma (nome, disciplina, código) ----
async function carregarTurma() {
  try {
    const resposta = await fetch(`${API_URL}/turma/${idTurma}`);

    if (!resposta.ok) {
      const mensagem = await resposta.text();
      throw new Error(mensagem);
    }

    const turma = await resposta.json();

    document.getElementById("nomeTurmaTitulo").textContent = turma.nome;
    document.getElementById("disciplinaTurma").textContent = `Disciplina: ${turma.disciplina}`;
    document.getElementById("codigoTurma").textContent = `Código: ${turma.codigo}`;

  } catch (erro) {
    console.error("Erro ao buscar turma:", erro);
    document.getElementById("nomeTurmaTitulo").textContent = "Turma";
  }
}

// ---- Lista de alunos da turma, no mesmo estilo do "Seus Colegas" do aluno ----
async function carregarAlunosDaTurma() {
  const grid = document.getElementById('alunosGrid');

  try {
    // ajuste esta rota para o endpoint real do seu backend, se o nome for diferente
    const resposta = await fetch(`${API_URL}/alunosTurma/${idTurma}`);

    if (!resposta.ok) {
      const mensagem = await resposta.text();
      throw new Error(mensagem);
    }

    const alunos = await resposta.json();

    document.getElementById("quantidadeAlunos").textContent =
      `${alunos.length} aluno${alunos.length === 1 ? '' : 's'}`;

    if (alunos.length === 0) {
      grid.innerHTML = `
        <div class="estado-vazio-alunos" style="grid-column: 1 / -1;">
          Nenhum aluno entrou nessa turma ainda. Compartilhe o código com eles!
        </div>`;
      return;
    }

    grid.innerHTML = '';

    alunos.forEach(aluno => {
      const div = document.createElement('div');
      div.classList.add('colega-card');

      div.innerHTML = `
        <div class="colega-avatar">
          ${aluno.nome.charAt(0).toUpperCase()}
        </div>
        <div class="colega-name">
          ${aluno.nome}
        </div>
      `;

      grid.appendChild(div);
    });

  } catch (erro) {
    console.error('Erro ao carregar alunos da turma:', erro);
    grid.innerHTML = `
      <div class="estado-vazio-alunos" style="grid-column: 1 / -1;">
        Erro ao carregar os alunos. Tente novamente.
      </div>`;
  }
}

carregarTurma();
carregarAlunosDaTurma();
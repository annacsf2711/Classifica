const idTurma = localStorage.getItem('idTurma');
const idProfessor = localStorage.getItem('idProfessor');

async function buscarJSON(url) { // Função genérica para fazer requisições GET e retornar JSON
  const resposta = await fetch(url); // Faz a requisição para a URL informada

  if (!resposta.ok) {
    throw new Error(await resposta.text());
  }
  return resposta.json();
}

// ==================== CARREGAR DADOS DO PROFESSOR ====================
async function carregarProfessor() {
  // Se não houver professor logado, encerra a função
  if (!idProfessor) return;

  try {
    const professor = await buscarJSON('/api/professor/${idProfessor}');

    document.getElementById('nomeProfessor').textContent = professor.nome; // Exibe o nome do professor na tela
    document.getElementById('avatarInicial').textContent = professor.nome.charAt(0).toUpperCase(); // Exibe a primeira letra do nome como avatar

  } catch (erro) {
    console.error('Erro ao buscar professor:', erro);
  }
}

// ==================== CARREGAR DADOS DA TURMA ====================
async function carregarTurma() {

  try {
    // Busca as informações da turma
    const turma = await buscarJSON('/api/turma/${idTurma}?idProfessor=${encodeURIComponent(idProfessor)}');

    document.getElementById('nomeTurmaTitulo').textContent = turma.nome; // Exibe o título com o nome da turma
    document.getElementById('codigoTurma').textContent = `Código: ${turma.codigo}`;// Exibe o código da turma
    document.getElementById('disciplinaTurma').textContent =`Disciplina: ${turma.especialidade}`;
    
  } catch (erro) {
    console.error('Erro ao buscar turma:', erro);
    document.getElementById('nomeTurmaTitulo').textContent = 'Turma não encontrada';
    document.getElementById('metaDisciplina').style.display = 'none'; // ocultar disciplina
  }
}

// ==================== EXIBIR MENSAGEM NA GRADE ====================
function mostrarMensagemGrade(grade, texto) {

  grade.innerHTML = ''; // Limpa o conteúdo atual do grid

  const div = document.createElement('div'); // Cria um elemento para mostrar a mensagem
  div.className = 'estado-vazio-alunos'; // Define a classe CSS
  div.style.gridColumn = '1 / -1'; // Faz a mensagem ocupar todas as colunas
  div.textContent = texto; // Define o texto da mensagem
  grade.appendChild(div); // Adiciona a mensagem na grade
}

// ==================== CARREGAR ALUNOS DA TURMA ====================
async function carregarAlunosDaTurma() {

  const grade = document.getElementById('alunosGrade'); // Obtém o container dos alunos

  try {
    const alunos = await buscarJSON('/api/alunosTurma/${idTurma}'); // Busca os alunos vinculados à turma

    // Atualiza a quantidade de alunos
    document.getElementById('quantidadeAlunos').textContent = `${alunos.length} aluno${alunos.length === 1 ? '' : 's'}`;

    if (alunos.length === 0) {
      // Exibe mensagem de turma vazia
      mostrarMensagemGrade(grade, 'Nenhum aluno entrou nessa turma ainda. Compartilhe o código com eles!');
      return;
    }

    grade.innerHTML = ''; // Limpa o grid antes de preencher

    alunos.forEach(aluno => {// Percorre todos os alunos encontrados
      const card = document.createElement('div'); // Cria o card do aluno
      card.className = 'colega-card'; // Define a classe CSS do card

      const avatar = document.createElement('div');// Cria o avatar
      avatar.className = 'colega-avatar'; // Define a classe CSS do avatar

      avatar.textContent = aluno.nome.charAt(0).toUpperCase(); // Mostra a primeira letra do nome
      const nome = document.createElement('div'); // Cria o elemento do nome
      nome.className = 'colega-name'; // Define a classe CSS do nome
      nome.textContent = aluno.nome;  // Exibe o nome do aluno
      card.append(avatar, nome); // Adiciona avatar e nome ao card

      grade.appendChild(card);// Adiciona o card ao grade
    });

  } catch (erro) {
    console.error('Erro ao carregar alunos da turma:', erro);
    mostrarMensagemGrade(grade, 'Erro ao carregar os alunos. Tente novamente.');
  }
}

// ==================== INICIALIZAÇÃO DA PÁGINA ====================

carregarProfessor();

if (!idTurma || !idProfessor) {// Verifica se existe professor logado e turma selecionada
  document.getElementById('nomeTurmaTitulo').textContent ='Turma não encontrada';
  document.getElementById('metaDisciplina').style.display ='none'; // Oculta a disciplina
  mostrarMensagemGrade(
    document.getElementById('alunosGrade'),
    'Abra esta tela a partir de "Minhas Turmas" e faça login como professor.'
  );

} else {
  carregarTurma();
  carregarAlunosDaTurma();
}

// ===================================== Voltar Tela de início ===================================================
window.voltarLogin = function () {
    window.location.href = "../4LoginProfessor/LoginProfessor.html";
};
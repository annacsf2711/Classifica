const API_URL = '/api';

const idEstudante = localStorage.getItem("idEstudante");

// ===================================== Buscar dados do estudante ===================================================
fetch(`${API_URL}/estudante/${idEstudante}`)
  .then(async resposta => {
    if (!resposta.ok) {
      const mensagem = await resposta.text();
      throw new Error(mensagem);
    }
    return resposta.json();
  })
  .then(estudante => {
    console.log("Estudante:", estudante);

    document.getElementById("nomeUsuario").textContent = estudante.nome;
    document.getElementById("tituloSaudacao").textContent = `Olá, ${estudante.nome.split(" ")[0]}!`;
    document.getElementById("avatarInicial").textContent = estudante.nome.charAt(0).toUpperCase();
  })
  .catch(erro => {
    console.error("Erro ao buscar aluno:", erro);
  });

// ===================================== Abrir Sala De Aula ===================================================
window.abrirSalaDeAula = async function (event) {
  event.preventDefault();

  try {
    const resposta = await fetch(`${API_URL}/estudante/${idEstudante}`);
    const dados = await resposta.json();

    if (dados.id_turma !== null) {
      localStorage.setItem("idTurma", dados.id_turma);
      window.location.href = "../Sala_de_Aula_Aluno/Sala_de_Aula.html";
    } else {
      window.location.href = "../7CodigoSala/CodigoSalaAluno.html";
    }
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao verificar turma.");
  }
};

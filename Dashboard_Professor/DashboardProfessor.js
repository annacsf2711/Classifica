const API_URL = '/api';

const idProfessor = localStorage.getItem("idProfessor");

// ===================================== Buscar dados do professor ===================================================
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
      console.log("Professor:", professor);

      document.getElementById("nomeProfessor").textContent = professor.nome;
      document.getElementById("tituloSaudacao").textContent = `Olá, ${professor.nome.split(" ")[0]}!`;
      document.getElementById("avatarInicial").textContent = professor.nome.charAt(0).toUpperCase();
    })
    .catch(erro => console.error("Erro ao buscar professor:", erro));
}

// ===================================== Abrir Sala De Aula ===================================================
window.abrirSalaDeAula = async function (event) {
  event.preventDefault();

  try {
    const resposta = await fetch(`${API_URL}/professor/${idProfessor}/turma`);
    const dados = await resposta.json();

    if (dados.possuiTurma) {
      localStorage.setItem("idTurma", dados.id_turma);
      window.location.href = "../8SalaDeAulaProfessor/SalaAulaProfessor.html";
    } else {
      window.location.href = "../7CodigoSala/CodigoSalaProf.html";
    }
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao verificar turma.");
  }
};
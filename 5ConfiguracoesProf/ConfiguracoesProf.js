import { ColocarBarra,TransformarDataBr, conferirDataBR } from "../DataCepCpf.js";
// ================================ Preencher o campo da Configuração =========================================
const idProfessor = localStorage.getItem("idProfessor"); // busca o id do professor que foi salvo no navegador após o login

console.log("ID:", idProfessor);

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

  document.getElementById("nome").value = professor.nome;
  document.getElementById("cpf").value = professor.cpf;
  document.getElementById("nascimento").value = new Date(professor.data_nasc).toLocaleDateString("pt-BR"); 
  // converte a data para o formato brasileiro (dd/mm/aaaa)
  document.getElementById("cep").value = professor.cep;
  document.getElementById("email").value = professor.email;
  document.getElementById("disciplina").value = professor.especialidade;
  document.getElementById("senha").value = professor.senha;
  
  document.getElementById("nomeUsuario").textContent = professor.nome;
  document.getElementById('avatarInicial').textContent = professor.nome.charAt(0).toUpperCase(); // Exibe a primeira letra do nome como avatar
  
})
.catch(erro => {
  console.error("Erro ao buscar professor:", erro);
});


// ativa a máscara de data
document.getElementById("nascimento")
    .addEventListener("input", ColocarBarra);


// ===================================== Modificar ==================================================
document.getElementById("modificar").addEventListener("click", async () => {

  const idProfessor = localStorage.getItem("idProfessor");     
  const data = document.getElementById("nascimento").value;

  const correto = conferirDataBR(data);
  if (!correto) {
    alert("Data inválida");
    return;
  }    
  const dataNova = TransformarDataBr(data);


  const dadosAtualizados = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      cep: document.getElementById("cep").value,
      cpf: document.getElementById("cpf").value,
      senha: document.getElementById("senha").value,
      especialidade: document.getElementById("disciplina").value,
      data_nasc: dataNova
  };

  try {
      const resposta = await fetch(`http://localhost:3000/professor/${idProfessor}`,{
          method: "PUT", // ou PATCH
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(dadosAtualizados)
      });

      if (!resposta.ok) {
        const mensagem = await resposta.text();
        throw new Error(mensagem);
      }
      alert("Dados atualizados com sucesso!");
  }
  catch (erro) {
      console.error("Erro ao atualizar:", erro);
      alert("Erro ao atualizar os dados.");
  }
});

// ===================================== Senha ===================================================
const campoSenha = document.getElementById("senha");
const btnCadeado = document.getElementById("editarSenha");

// Procura o ícone dentro do botão (o span com a classe material-symbols-outlined)
const icone = btnCadeado.querySelector(".material-symbols-outlined");

btnCadeado.addEventListener("click", () => {
    campoSenha.readOnly = !campoSenha.readOnly; // Inverte o valor de readOnly:
    if (campoSenha.readOnly) {
        campoSenha.type = "password";
        icone.textContent = "lock";
    } else {
        campoSenha.type = "text";
        icone.textContent = "lock_open";
        campoSenha.focus(); // Coloca o cursor dentro do campo de senha
    }
});

// ===================================== Desativar ===================================================
document.getElementById("desativar").addEventListener("click", async () => {
    const confirmar = confirm("Deseja realmente desativar sua conta?");
    
    if (!confirmar) return;
    const idProfessor = localStorage.getItem("idProfessor");
    
    try {
      const resposta = await fetch(`http://localhost:3000/desativarProfessor/${idProfessor}`, {
        method: "PUT"
      });

      if (!resposta.ok) {
        throw new Error();
      }
      localStorage.removeItem("idProfessor");
      alert("Conta desativada com sucesso!");
      window.location.href = "../4LoginProfessor/LoginProfessor.html";
    } catch (erro) {
      console.error(erro);
      alert("Erro ao desativar a conta.");
    }
});

// ===================================== Deletar ===================================================
document.getElementById("deletar").addEventListener("click", async () => {
    const confirmar = confirm("Deseja realmente deletar sua conta?");
    
    if (!confirmar) return;
    const idProfessor = localStorage.getItem("idProfessor");
    
    try {
      const resposta = await fetch(`http://localhost:3000/deletarProfessor/${idProfessor}`, {
        method: "DELETE"
      });

      if (!resposta.ok) {
        throw new Error();
      }
      localStorage.removeItem("idProfessor");
      alert("Conta deletada com sucesso!");
      window.location.href = "../4LoginProfessor/LoginProfessor.html";
    } catch (erro) {
      console.error(erro);
      alert("Erro ao desativar a conta.");
    }
});

// ===================================== Abrir Sala De Aula ===================================================
window.abrirSalaDeAula = async function(event) {
    event.preventDefault();
    const idProfessor = localStorage.getItem("idProfessor");

    try {
      const resposta = await fetch(`http://localhost:3000/professor/${idProfessor}/turma`);
      const dados = await resposta.json();
      console.log("Dados recebidos:", dados);

      if (dados.possuiTurma) {
        localStorage.setItem(
          "idTurma",
          dados.id_turma
        );
        window.location.href = "../8SalaDeAulaProfessor/SalaAulaProfessor.html";
      }else {
          window.location.href = "../7CodigoSala/CodigoSalaProf.html";
        }

    }catch (erro) {
      console.error(erro);
      alert("Erro ao verificar turma.");
    }
};

// ===================================== Voltar Tela de início ===================================================
window.voltarLogin = function () {
    window.location.href = "../4LoginProfessor/LoginProfessor.html";
};
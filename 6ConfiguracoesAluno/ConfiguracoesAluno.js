import { ColocarBarra,TransformarDataBr, conferirDataBR } from "../DataCepCpf.js";
// ================================ Preencher o campo da Configuração =========================================
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

  document.getElementById("nome").value = estudante.nome;
  document.getElementById("cpf").value = estudante.cpf;
  document.getElementById("nascimento").value = new Date(estudante.data_nasc).toLocaleDateString("pt-BR"); 
  // converte a data para o formato brasileiro (dd/mm/aaaa)
  document.getElementById("cep").value = estudante.cep;
  document.getElementById("email").value = estudante.email;
  document.getElementById("senha").value = estudante.senha;
  document.getElementById("nomeUsuario").textContent = estudante.nome;
  
})
.catch(erro => {
  console.error("Erro ao buscar aluno:", erro);
});


// ativa a máscara de data
document.getElementById("nascimento")
    .addEventListener("input", ColocarBarra);


// ===================================== Modificar ===================================================
document.getElementById("modificar").addEventListener("click", async () => {

  const idEstudante = localStorage.getItem("idEstudante");     
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
      data_nasc: dataNova
  };

  try {
      const resposta = await fetch(`http://localhost:3000/estudante/${idEstudante}`,{
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

// ===================================== Deletar ===================================================
document.getElementById("deletar").addEventListener("click", async () => {
    const confirmar = confirm("Deseja realmente desativar sua conta?");
    
    if (!confirmar) return;
    const idEstudante = localStorage.getItem("idEstudante");
    
    try {
      const resposta = await fetch(`http://localhost:3000/desativarAluno/${idEstudante}`, {
        method: "PUT"
      });

      if (!resposta.ok) {
        throw new Error();
      }
      localStorage.removeItem("idEstudante");
      alert("Conta desativada com sucesso!");
      window.location.href = "../2LoginAluno/LoginAluno.html";
    } catch (erro) {
      console.error(erro);
      alert("Erro ao desativar a conta.");
    }
});


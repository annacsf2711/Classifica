import { ColocarBarra,TransformarDataBr, conferirDataBR } from "../ConferirData.js";
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
  document.getElementById("nomeUsuario").textContent = professor.nome;
  
})
.catch(erro => {
  console.error("Erro ao buscar professor:", erro);
});


// ativa a máscara de data
document.getElementById("nascimento")
    .addEventListener("input", ColocarBarra);


// ===================================== Modificar ===================================================
 

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



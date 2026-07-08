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

  const data = new Date(professor.data_nasc); // cira um objeto date a partir da data recebida do banco

  document.getElementById("nome").value = professor.nome;
  document.getElementById("cpf").value = professor.cpf;
  document.getElementById("nascimento").value = data.toLocaleDateString("pt-BR"); // converte a data para o formato brasileiro (dd/mm/aaaa)
  document.getElementById("cep").value = professor.cep;
  document.getElementById("email").value = professor.email;
  document.getElementById("disciplina").value = professor.especialidade;

  document.getElementById("nomeUsuario").textContent = professor.nome;
})
.catch(erro => {
  console.error("Erro ao buscar professor:", erro);
});


// ===================================== Modificar ===================================================
  
document.getElementById("btnSalvar").addEventListener("click", async () => {
  
    const idProfessor = localStorage.getItem("idProfessor"); // pegar o id do professor que está conectado
    
    const dadosAtualizados = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        cep: document.getElementById("cep").value,
        cpf: document.getElementById("cpf").value,
        especialidade: document.getElementById("disciplina").value
    };


});




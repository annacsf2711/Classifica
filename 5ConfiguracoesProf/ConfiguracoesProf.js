const idProfessor = localStorage.getItem("idProfessor"); // busca o id do professor que foi salvo no navegador após o login

console.log("ID:", idProfessor);

fetch(`http://localhost:3000/professor/${idProfessor}`) // requisição para o servidor passando o id do professor na URL


  .then(resposta => {
    console.log("Resposta:", resposta);
    return resposta.json();
  })
  .then(professor => {   // recebe os dados do professor retornados pelo servidor

    document.getElementById("nome").value = professor.nome;
    document.getElementById("cpf").value = professor.cpf;
    document.getElementById("nascimento").value = professor.data_nasc;
    document.getElementById("cep").value = professor.cep;
    document.getElementById("email").value = professor.email;
    document.getElementById("endereco").value = professor.cep;
    document.getElementById("disciplina").value = professor.especialidade;

    document.getElementById("nomeUsuario").textContent = professor.nome;
  })
  .catch(erro => {
    console.error("Erro ao buscar professor:", erro);
  });



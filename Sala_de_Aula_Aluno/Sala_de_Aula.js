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

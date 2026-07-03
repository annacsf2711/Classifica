// ===================== CPF: 000.000.000-00 =====================

// getElementById('cpf') = procura o elemento cujo id="cpf".
// .addEventListener('input', ...) = "fique escutando: toda vez que o usuário digitar algo nesse campo, execute a função abaixo".
// (e) => { ... } = função de callback.  É o "evento" (contém informações sobre o que aconteceu, incluindo o próprio input).
document.getElementById('cpf').addEventListener('input', (evento) => {

  // e.target = o elemento que disparou o evento (o input do CPF).
  // .value = o texto que está escrito dentro dele agora.
  // .replace(/\D/g, '') = expressão regular:
  //     \D  → "qualquer coisa que NÃO seja dígito" (letra, ponto, traço...)
  //     g   → "global": troca TODAS as ocorrências, não só a primeira.
  //     ''  → substitui por vazio (ou seja, apaga).
  // Resultado: sobra só números puros. Ex.: "123.abc4" vira "1234".
  // .slice(0, 11) = pega no máximo 11 caracteres (CPF tem 11 dígitos).
  let v = evento.target.value.replace(/\D/g, '').slice(0, 11); //apaga tudo que n for número e garante ter apenas 11 caracteres 

  // Agora inserimos os separadores.
  // (\d{3})(\d)  → captura 3 dígitos (grupo 1) seguidos de 1 dígito (grupo 2).
  // '$1.$2'      → substitui por: grupo1 + ponto + grupo2.
  v = v.replace(/(\d{3})(\d)/, '$1.$2')

       .replace(/(\d{3})(\d)/, '$1.$2')

       .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  // Devolve o texto formatado para o campo.
  evento.target.value = v;
});


// ===================== Data: dd/mm/aaaa =====================
document.getElementById('dataNascimento').addEventListener('input', (evento) => {
    let v = evento.target.value.replace(/\D/g, '').slice(0, 8);
    v = v.replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
    evento.target.value = v;
});



// ===================== CEP: 00000-000 =====================

document.getElementById('cep').addEventListener('input', (evento) => {
  let v = evento.target.value.replace(/\D/g, '').slice(0, 8);
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  evento.target.value = v;
});

// ===================== Cadastrar =====================
document.getElementById("formCadastro").addEventListener("submit", async (evento) => { //selecionar o formulário e escutar o evento
    evento.preventDefault(); //impede que a pag recarregue ao enviar o formulário
    
     const dataBr = document.getElementById("dataNascimento").value;

    // converte de DD/MM/AAAA → AAAA-MM-DD
    const partes = dataBr.split("/"); // divide o texto usando /, criando um array list com as parte 
    const dataNova = `${partes[2]}-${partes[1]}-${partes[0]}`;


    const dadosCadastros = { //criar um obj com os dados digitados nos inputs
        nome: document.getElementById("nome").value,
        cep: document.getElementById("cep").value,
        cpf: document.getElementById("cpf").value,
        dataNascimento: dataNova,
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
    };
    try{
        const resposta = await fetch("http://localhost:3000/cadastrar", { // envie os dados para o servidor backend
            method: "POST", // tipo de requisiçã HTTP usada para enviar dados
            headers: { // informações extras da requisição, como os dados estão sendo enviados
                "Content-Type": "application/json", // estou enviando os dados em formato JSON
            },
            body: JSON.stringify(dadosCadastros), // enviando os dados
        });
        const texto = await resposta.text(); // pega a respost que veio do servidor e tranforma em texto
        alert(texto); // mostra uma mensagem na tela
    } 
    catch(erro){ // caso dê erro
        console.error(erro); // mostra o erro no console do navegador 
        alert("Erro ao conectar com o servidor"); // mostra a mensagem ao usuário
    }
});


function conferirNome() { // Cria a função que será executada ao clicar no botão
    let nome = document.getElementById("nome").value; // Pega o valor digitado no campo com id="nome"  (let = guarda qualquer coisa)
    if (nome == null || nome.trim() == "") {   // Verifica se o valor é nulo ou se está vazio
        alert("Campo nome incompleto!");  // Exibe uma mensagem informando que o campo está incompleto (alert = pequenas janelas de diálogo)
    } 
}



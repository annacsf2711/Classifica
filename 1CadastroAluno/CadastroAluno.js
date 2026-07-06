// ===================== CPF: 000.000.000-00 ====================================================

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
  // Resultado: sobra só números puros. Ex.: "123.4" vira "1234".
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


// ===================== Data: dd/mm/aaaa ======================================================
document.getElementById('dataNascimento').addEventListener('input', (evento) => {
    let v = evento.target.value.replace(/\D/g, '').slice(0, 8);
    v = v.replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
    evento.target.value = v;
});

// ===================== Conferir Data ======================================================
function conferirData (){
    const dataBr = document.getElementById("dataNascimento").value;
    const partes = dataBr.split("/"); // cria um array list com as três partes
    const dia = Number (partes[0]);
    const mes = Number (partes[1]);
    const ano = Number (partes[2]);

    if(mes > 0 && mes < 13){ // o mês ser entre 1 e 12
        if(mes  == 2){ // se for fevereiro
            return mes2(dia, ano); //descobre se é bissexto ou não
        }else{  // não for fevereiro
            if(mes == 1 || mes == 3 || mes == 5 || mes == 7 || mes == 8 || mes == 10 || mes == 12){ // conferir se tem 31 dias
                if(dia < 32 && dia > 0){
                    return true;
                }else{
                    return false;
                }
            }else{ // caso n seja um mês que tenha 31 dias
                if(dia < 31 && dia > 0){
                    return true;
                }else{
                    return false;
                        
                }
            }
        }
    } 
    return false;//caso seja menor que 1 ou maior que 12
}

function mes2(dia, ano) {
    if ((ano % 400 == 0) || (ano % 4 == 0 && ano % 100 != 0)){ // ano bissexto
        if (dia > 0 && dia <= 29) {
            return true;
        } else {
            return false;
        }
    } else { // ano não bissexto
        if (dia > 0 && dia <= 28) {
            return true;
        } else {
            return false;  
        }
    }
}


// ===================== CEP: 00000-000 =========================================================

document.getElementById('cep').addEventListener('input', (evento) => {
    let v = evento.target.value.replace(/\D/g, '').slice(0, 8);
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    evento.target.value = v;
});


// ===================== Cadastrar ===============================================================
document.getElementById("formCadastroAluno").addEventListener("submit", async (evento) => { //selecionar o formulário e escutar o evento
    evento.preventDefault(); //impede que a pag recarregue ao enviar o formulário
    
    if(!conferirData()){ //if (conferirData() == false)
        alert("Data inválida"); 
        return; // a função para
    } else {
        alert("Data válida");
    }

    const dataBr = document.getElementById("dataNascimento").value;

    // converte de DD/MM/AAAA → AAAA-MM-DD
    const partes = dataBr.split("/"); // divide o texto usando /, criando um array list com as parte 
    const dataNova = `${partes[2]}-${partes[1]}-${partes[0]}`;


    const dadosCadastrosAluno = { //criar um obj com os dados digitados nos inputs
        nome: document.getElementById("nome").value,
        cep: document.getElementById("cep").value,
        cpf: document.getElementById("cpf").value,
        dataNascimento: dataNova,
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
    };
    try{
        const resposta = await fetch("http://localhost:3000/cadastrarAluno", { // envie os dados para o servidor backend
            method: "POST", // tipo de requisiçã HTTP usada para enviar dados
            headers: { // informações extras da requisição, como os dados estão sendo enviados
                "Content-Type": "application/json", // estou enviando os dados em formato JSON
            },
            body: JSON.stringify(dadosCadastrosAluno), // enviando os dados
        });
        const texto = await resposta.text(); // pega a respost que veio do servidor e tranforma em texto
        alert(texto); // mostra uma mensagem na tela
    } 
    catch(erro){ // caso dê erro
        console.error(erro); // mostra o erro no console do navegador 
        alert("Erro ao conectar com o servidor"); // mostra a mensagem ao usuário
    }
});


// ===================== Conferir se tudo está preenchido ====================================================

function conferir() { // Cria a função que será executada ao clicar no botão   
    let nome = document.getElementById("nome").value;
    let cep = document.getElementById("cep").value;
    let cpf = document.getElementById("cpf").value;
    let data = document.getElementById("dataNascimento").value;
    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;

    if (nome == null|| cep == null|| cpf == null || email == null|| senha == null || data == null || 
        nome.trim() == "" || cep.trim() == "" || cpf.trim() == "" || email.trim() == "" || senha.trim() == "" || 
        data.trim() == "") {   // Verifica se o valor é nulo ou se está vazio

        alert("Complete todos os campos!");  // Exibe uma mensagem informando que o campo está incompleto (alert = pequenas janelas de diálogo)
    } 
}

// ===================== Calcelar ================================================================================
function cancelar() {
    window.location.href = "../2LoginAluno/LoginAluno.html"; //window.location.href é uma forma de dizer ao navegador para abrir outra página
}




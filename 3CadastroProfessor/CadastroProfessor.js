import { ColocarBarra, PontosCPF, PontosCEP, TransformarDataBr, conferirDataBR, validarCPF, conferirCpfEmailProf} from "../DataCepCpf.js";

// ===================== CPF: 000.000.000-00 ====================================================
document.getElementById("cpf")
    .addEventListener("input", PontosCPF);


// ===================== Data: dd/mm/aaaa ======================================================
document.getElementById("dataNascimento")
    .addEventListener("input", ColocarBarra);


// ===================== CEP: 00000-000 =========================================================
document.getElementById('cep')
    .addEventListener('input', PontosCEP );
 

// ===================== Conferir se tudo está preenchido ====================================================
function conferir() { // Cria a função que será executada ao clicar no botão   
    let nome = document.getElementById("nome").value;
    let cep = document.getElementById("cep").value;
    let cpf = document.getElementById("cpf").value;
    let disciplina = document.getElementById("disciplina").value;
    let data = document.getElementById("dataNascimento").value;
    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;

    if (nome == null|| cep == null|| cpf == null || email == null|| senha == null || data == null || 
        nome.trim() == "" || cep.trim() == "" || cpf.trim() == "" || email.trim() == "" || senha.trim() == "" || 
        data.trim() == "" || disciplina == null || disciplina.trim() == "") {   // Verifica se o valor é nulo ou se está vazio

        alert("Complete todos os campos!");  // Exibe uma mensagem informando que o campo está incompleto (alert = pequenas janelas de diálogo)
        return false;
    } 
    return true;
}

// ===================== Cadastrar ===============================================================
document.getElementById("formCadastroProf").addEventListener("submit", async (evento) => { //selecionar o formulário e escutar o event
    evento.preventDefault();

    if (!conferir()) { // conferir se tudo está preenchido
        return;
    }
    
    const cpf = document.getElementById("cpf").value;
    const email = document.getElementById("email").value;
     
    if (!validarCPF(cpf)) {
        alert("CPF inválido!");
        return;
    }
     
    const podeCadastrar = await conferirCpfEmailProf(cpf, email);
     
    if (!podeCadastrar) {
        return;
    }

    const data = document.getElementById("dataNascimento").value;

    const correto = conferirDataBR(data);
    if (!correto) {
        alert("Data inválida");
        return;
    } 

    const dataNova = TransformarDataBr(data);

    const dadosCadastrosProf = { //criar um obj com os dados digitados nos inputs
        nome: document.getElementById("nome").value,
        cep: document.getElementById("cep").value,
        cpf: document.getElementById("cpf").value,
        disciplina: document.getElementById("disciplina").value,
        dataNascimento: dataNova,
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
    };
    try{
        const resposta = await fetch("http://localhost:3000/cadastrarProf", { // envie os dados para o servidor backend
            method: "POST", // tipo de requisiçã HTTP usada para enviar dados
            headers: { // informações extras da requisição, como os dados estão sendo enviados
                "Content-Type": "application/json", // estou enviando os dados em formato JSON
            },
            body: JSON.stringify(dadosCadastrosProf), // enviando os dados
        });
        const texto = await resposta.text(); // pega a respost que veio do servidor e tranforma em texto
        alert(texto); // mostra uma mensagem na tela
        window.location.href = "../4LoginProfessor/LoginProfessor.html";        
    } 
    catch(erro){ // caso dê erro
        console.error(erro); // mostra o erro no console do navegador 
        alert("Erro ao conectar com o servidor"); // mostra a mensagem ao usuário
    }
});


// ===================== Calcelar ================================================================================
function cancelar() {
    window.location.href = "../4LoginProfessor/LoginProfessor.html"; //window.location.href é uma forma de dizer ao navegador para abrir outra página
}
document.getElementById("btnCancelarProf")
    .addEventListener("click", cancelar);



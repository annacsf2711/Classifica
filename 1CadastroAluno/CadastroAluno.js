import { ColocarBarra, PontosCPF, PontosCEP, TransformarDataBr, conferirDataBR, validarCPF, conferirCpfEmail, SenhaVisivel} from "../DataCepCpf.js";

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
function conferir() { 
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
        return false;
    } 
    return true;
}

// ===================== Cadastrar ===============================================================
document.getElementById("formCadastroAluno").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!conferir()) {
        return;
    }
    
    const cpf = document.getElementById("cpf").value;
    const email = document.getElementById("email").value;

    if (!validarCPF(cpf)) {
        alert("CPF inválido!");
        return;
    }

    const podeCadastrar = await conferirCpfEmail(cpf, email);

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
        window.location.href = "../2LoginAluno/LoginAluno.html";        

    } 
    catch(erro){ // caso dê erro
        console.error(erro); // mostra o erro no console do navegador 
        alert("Erro ao conectar com o servidor"); // mostra a mensagem ao usuário
    }
});


// ===================== Calcelar ================================================================================
function cancelar() {
    window.location.href = "../2LoginAluno/LoginAluno.html"; //window.location.href é uma forma de dizer ao navegador para abrir outra página
}

document.getElementById("btnCancelarAlu")
    .addEventListener("click", cancelar);

// ===================== Senha =====================
document.addEventListener('DOMContentLoaded', () => {
    //DOMContentLoaded: Espera apenas o HTML/DOM ficar pronto (é mais rápido e o mais recomendado para a maioria dos scripts).
    const campoSenha = document.getElementById("senha");
    const botaoCadeado = document.getElementById("btn-cadeado");

    // Ativa a funcionalidade
    SenhaVisivel(campoSenha, botaoCadeado);
});
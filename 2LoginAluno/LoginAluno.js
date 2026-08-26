import {SenhaVisivel} from "../DataCepCpf.js";
// ===================== Login =====================
document.getElementById("formLoginAluno").addEventListener("submit", async (evento) => { //selecionar o formulário e escutar o evento
    evento.preventDefault(); //impede que a pag recarregue ao enviar o formulário
    
    const dadosLoginAluno = { //criar um obj com os dados digitados nos inputs
        senha: document.getElementById("senha").value,
        email: document.getElementById("email").value,
    };
    console.log("dados", dadosLoginAluno);

    try{
        const resposta = await fetch("http://localhost:3000/loginAluno", { // envie os dados para o servidor backend
            method: "POST", // tipo de requisiçã HTTP usada para enviar dados
            headers: { // informações extras da requisição, como os dados estão sendo enviados
                "Content-Type": "application/json", // estou enviando os dados em formato JSON
            },
            body: JSON.stringify(dadosLoginAluno), // enviando os dados
        });

        const dados = await resposta.json(); // converte a resposta do servidor para objeto js

        console.log("Resposta do servidor:", dados);

        if (dados.contaDesativada) {
            const reativar = confirm("Sua conta está desativada. Deseja reativá-la?");

            if (reativar) {
                await fetch(`http://localhost:3000/reativarAluno/${dados.idEstudante}`, {
                    method: "PUT"
                });
                alert("Conta reativada com sucesso! Faça o login novamente.");
            }

        } else if (dados.usuarioExiste) { // verifica se o login foi realizado com sucesso
            localStorage.setItem("idEstudante", dados.idEstudante); // salva o id do aluno no navegador
            console.log("Id aluno:", dados.idEstudante);
            console.log("Vou redirecionar");
            window.location.href = "http://127.0.0.1:5500/TCC---Classifica/Diagnostico/telainicialdiag.html";        
        } else {
            alert(dados.mensagem); 
        }

    } catch (erro) { // executa caso ocorra algum erro na requisição
        console.error(erro); 
        alert("Erro ao conectar com o servidor"); 
    }
});
// ===================== Senha Cadeado =====================
document.addEventListener('DOMContentLoaded', () => {
    //DOMContentLoaded: Espera apenas o HTML/DOM ficar pronto (é mais rápido e o mais recomendado para a maioria dos scripts).
    const campoSenha = document.getElementById("senha");
    const botaoCadeado = document.getElementById("btn-cadeado");

    // Ativa a funcionalidade
    SenhaVisivel(campoSenha, botaoCadeado);
});
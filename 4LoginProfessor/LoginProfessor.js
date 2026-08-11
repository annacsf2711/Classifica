import {SenhaVisivel} from "../DataCepCpf.js";
// ===================== Login =====================
document.getElementById("formLoginProf").addEventListener("submit", async (evento) => { //selecionar o formulário e escutar o evento
    evento.preventDefault(); //impede que a pag recarregue ao enviar o formulário
    const dadosLoginProf = { //criar um obj com os dados digitados nos inputs
        senha: document.getElementById("senha").value,
        email: document.getElementById("email").value,
    };
    console.log("dados", dadosLoginProf);

    try{
        const resposta = await fetch("http://localhost:3000/loginProf", { // envie os dados para o servidor backend
            method: "POST", // tipo de requisiçã HTTP usada para enviar dados
            headers: { // informações extras da requisição, como os dados estão sendo enviados
                "Content-Type": "application/json", // estou enviando os dados em formato JSON
            },
            body: JSON.stringify(dadosLoginProf), // enviando os dados
        });
        const dados = await resposta.json(); // converte a resposta do servidor para objeto js

        if (dados.usuarioExiste) { // verifica se o login foi realizado com sucesso
            localStorage.setItem("idProfessor", dados.idProfessor); // salva o id do professor no navegador
            console.log("Id professor:", dados.idProfessor);
            window.location.href = "../5ConfiguracoesProf/ConfiguracoesProf.html";        
        } else { // 
            alert(dados.mensagem); 
        }
    } catch (erro) { // executa caso ocorra algum erro na requisição
        console.error(erro); 
        alert("Erro ao conectar com o servidor"); 
    }
});

// ===================== Senha =====================
document.addEventListener('DOMContentLoaded', () => {
    //DOMContentLoaded: Espera apenas o HTML/DOM ficar pronto (é mais rápido e o mais recomendado para a maioria dos scripts).
    const campoSenha = document.getElementById("senha");
    const botaoCadeado = document.getElementById("btn-cadeado");

    // Ativa a funcionalidade
    SenhaVisivel(campoSenha, botaoCadeado);
});

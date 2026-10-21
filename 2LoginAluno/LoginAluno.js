import { SenhaVisivel } from "../DataCepCpf.js";
// ===================== Login =====================
document.getElementById("formLoginAluno").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const dadosLoginAluno = {
        senha: document.getElementById("senha").value,
        email: document.getElementById("email").value,
    };

    try {
        const resposta = await fetch('/api/loginAluno', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosLoginAluno),
        });

        const dados = await resposta.json();

        console.log("Resposta do servidor:", dados);

        if (dados.contaDesativada) {
            const reativar = confirm("Sua conta está desativada. Deseja reativá-la?");

            if (reativar) {
                await fetch('/api/reativarAluno/${dados.idEstudante}', {
                    method: "PUT"
                });
                alert("Conta reativada com sucesso! Faça o login novamente.");
                window.location.href = "LoginAluno.html";        
            }
        
        }else if (dados.usuarioExiste) { // verifica se o login foi realizado com sucesso
            localStorage.setItem("idEstudante", dados.id_estudante); // salva o id do aluno no navegador
            console.log("Id aluno:", dados.id_estudante);
            console.log("Vou redirecionar");
            window.location.href = "http://127.0.0.1:5500/TCC---Classifica/Diagnostico/telainicialdiag.html";        
        } else {
            alert(dados?.mensagem || "Email ou senha incorretos.");
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
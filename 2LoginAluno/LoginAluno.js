import { SenhaVisivel } from "../DataCepCpf.js";

// ===================== Login =====================
document.getElementById("formLoginAluno").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const dadosLoginAluno = {
        senha: document.getElementById("senha").value,
        email: document.getElementById("email").value,
    };

    try {
        const resposta = await fetch("http://localhost:3000/loginAluno", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosLoginAluno),
        });

        const dados = await resposta.json();

        if (dados && dados.usuarioExiste) {
            localStorage.setItem("idEstudante", dados.id_estudante); // usa o nome retornado pelo servidor
            console.log("Id aluno:", dados.id_estudante);
            window.location.href = "../Diagnostico/telainicialdiag.html";

        } else {
            alert(dados?.mensagem || "Email ou senha incorretos.");
        }
    } catch (erro) {
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



// ===================== teste google =====================
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "360940613559-u8aev3vdje02f7ag7p81ekgqgdd0u8tr.apps.googleusercontent.com",
        callback: receberUsuario
    });
}

function loginGoogle() {
    google.accounts.id.prompt();
}
function receberUsuario(response) {
    const dados = parseJwt(response.credential);
    document.getElementById("email").value = dados.email;
    // Se existir campo nome
    const campoNome = document.getElementById("nome");
    if (campoNome) {
        campoNome.value = dados.name;
    }
}
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            )
            .join('')
    );
    return JSON.parse(jsonPayload);
}
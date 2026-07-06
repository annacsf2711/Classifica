// ===================== Login =====================

document.getElementById("formLoginAluno").addEventListener("submit", async (evento) => { //selecionar o formulário e escutar o evento
    evento.preventDefault(); //impede que a pag recarregue ao enviar o formulário
    
    const dadosLoginAluno = { //criar um obj com os dados digitados nos inputs
        senha: document.getElementById("senha").value,
        email: document.getElementById("email").value,
    };
    try{
        const resposta = await fetch("http://localhost:3000/loginAluno", { // envie os dados para o servidor backend
            method: "POST", // tipo de requisiçã HTTP usada para enviar dados
            headers: { // informações extras da requisição, como os dados estão sendo enviados
                "Content-Type": "application/json", // estou enviando os dados em formato JSON
            },
            body: JSON.stringify(dadosLoginAluno), // enviando os dados
        });
        const texto = await resposta.text(); // pega a respost que veio do servidor e tranforma em texto
        alert(texto); // mostra uma mensagem na tela
    } 
    catch(erro){ // caso dê erro
        console.error(erro); // mostra o erro no console do navegador 
        alert("Erro ao conectar com o servidor"); // mostra a mensagem ao usuário
    }
});




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
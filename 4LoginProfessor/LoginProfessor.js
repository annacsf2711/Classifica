// ===================== Login =====================

document.getElementById("formLoginProf").addEventListener("submit", async (evento) => { //selecionar o formulário e escutar o evento
    evento.preventDefault(); //impede que a pag recarregue ao enviar o formulário
    
    const dadosLoginProf = { //criar um obj com os dados digitados nos inputs
        senha: document.getElementById("senha").value,
        email: document.getElementById("email").value,
    };
    try{
        const resposta = await fetch("http://localhost:3000/loginProf", { // envie os dados para o servidor backend
            method: "POST", // tipo de requisiçã HTTP usada para enviar dados
            headers: { // informações extras da requisição, como os dados estão sendo enviados
                "Content-Type": "application/json", // estou enviando os dados em formato JSON
            },
            body: JSON.stringify(dadosLoginProf), // enviando os dados
        });
        const texto = await resposta.text(); // pega a respost que veio do servidor e tranforma em texto
        alert(texto); // mostra uma mensagem na tela
    } 
    catch(erro){ // caso dê erro
        console.error(erro); // mostra o erro no console do navegador 
        alert("Erro ao conectar com o servidor"); // mostra a mensagem ao usuário
    }
});

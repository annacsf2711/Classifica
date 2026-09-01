// ===================================== Passar ID ===================================================
const idEstudante = localStorage.getItem("idEstudante");

fetch(`http://localhost:3000/estudante/${idEstudante}`)
.then(async resposta => {
    if (!resposta.ok) {
        const mensagem = await resposta.text();
        throw new Error(mensagem);
    }
    return resposta.json();
    })

.then(estudante => {
    console.log("Estudante:", estudante);
    document.getElementById("nomeUsuario").textContent = estudante.nome || estudante.nome_estudante;
    })
    .catch(error => {
        console.error("Erro:", error);
    });



// ===========================================================================================

let questoes = [];
let questaoAtual = 0;
let respostas = [];
let alternativaSelecionada = null;

// Executa assim que a página é carregada no navegador
document.addEventListener('DOMContentLoaded', () => {
    carregarQuestoes();
});

// ===================================== Buscar Questões ===================================================
// Busca as questões da API com base na matéria informada na URL (?materia=xxx)
async function carregarQuestoes() {

    const paramentro = new URLSearchParams(window.location.search); // Obtém os parâmetros da URL
    const materia = paramentro.get('materia'); // Pega o valor do parâmetro "materia"

    document.getElementById('loading').style.display = 'block'; // Mostra o indicador de carregamento

    document.getElementById('questionCard').style.display = 'none'; // Esconde o cartão das questões enquanto carrega

    try {
        // Faz a requisição ao servidor buscando as questões da matéria
        const response = await fetch(`http://localhost:3000/api/questoes/${materia}`);
        questoes = await response.json();

        document.getElementById('loading').style.display = 'none';// Esconde o indicador de carregamento

        if (questoes.length === 0) { // Verifica se não foi encontrada nenhuma questão
            document.getElementById('enunciadoBox').innerHTML = '<p>Nenhuma questão encontrada para esta matéria.</p>';
            document.getElementById('questionCard').style.display = 'block'; // exibe o cartão
            return;
        }

        document.getElementById('questionCard').style.display = 'block'; // Exibe o cartão com as questões
        renderizarQuestao();

    } catch (error) {
        console.error('Erro ao carregar questões:', error);
        document.getElementById('loading').innerHTML ='<p>Erro ao carregar as questões do servidor.</p>';
    }
}


// ===================================== Renderizar ===================================================
function renderizarQuestao() {

    if (questaoAtual >= questoes.length) {// Verifica se já chegou ao final das questões
        mostrarResultadoFinal();
        return;
    }

    // Obtém a questão atual do vetor
    const questao = questoes[questaoAtual];

    // Atualiza o número da questão
    document.getElementById('questaoNumero').textContent = `Questão ${questaoAtual + 1} de ${questoes.length}`;

    // Calcula a porcentagem da barra de progresso
    const progresso = ((questaoAtual + 1) / questoes.length) * 100;

    // Atualiza a largura da barra de progresso
    document.getElementById('barraProgresso').style.width = `${progresso}%`;

    // Exibe o enunciado da questão
    document.getElementById('enunciadoBox').innerHTML =`<p>${questao.enunciado}</p>`;

    // Obtém o container onde serão colocadas as alternativas
    const alternativesContainer = document.getElementById('alternativesContainer');

    // Letras utilizadas para acessar as alternativas no banco
    const alternativas = ['a', 'b', 'c', 'd'];

    // Letras exibidas visualmente ao usuário
    const letras = ['A', 'B', 'C', 'D'];

    // Recupera resposta já marcada anteriormente
    alternativaSelecionada = respostas[questaoAtual] || null;

    // Cria as alternativas 
    alternativesContainer.innerHTML = alternativas.map((alt, index) => {
        const isSelected = (alternativaSelecionada === alt); // Verifica se essa alternativa está selecionada
        // Retorna o HTML da alternativa
        return ` 
            <div class="alternative-row ${isSelected ? 'selected' : ''}"
                 onclick="selecionarAlternativa('${alt}')">
                <div class="alternative-badge">
                    ${letras[index]}
                </div>
                ${questao[`alternativa_${alt}`]}
            </div>
        `;
    }).join('');

    // Altera o texto do botão
    document.getElementById('btn-enviar').textContent =
        questaoAtual === questoes.length - 1
            ? 'Finalizar avaliação'
            : 'Próxima questão';
}

// ===================================== Marcar Alternativa Escolhida ===================================================
function selecionarAlternativa(letra) {
    alternativaSelecionada = letra; // Guarda a alternativa selecionada
    respostas[questaoAtual] = letra; // Salva a resposta do aluno
    renderizarQuestao(); // Atualiza a tela destacando a alternativa
}


// ===================================== Proxima Questão ===================================================
function proximaQuestao() {
    if (!alternativaSelecionada) {
        alert('Por favor, selecione uma alternativa antes de continuar.');
        return;
    }
    const questao = questoes[questaoAtual];
    const acertou =
        alternativaSelecionada.toLowerCase() ===
        questao.alternativa_correta.toLowerCase();

    mostrarFeedback({
        acertou,
        alternativaCorreta: questao.alternativa_correta.toUpperCase()
    });
    setTimeout(() => {
        questaoAtual++;
        alternativaSelecionada = null;

        document.getElementById('feedbackContainer')?.remove();

        if (questaoAtual < questoes.length) {
            renderizarQuestao();
        } else {
            mostrarResultadoFinal();
        }
    }, 1500);
}
// ===================================== mostrarFeedback ===================================================
function mostrarFeedback(resultado) {
    
    document.getElementById('feedbackContainer')?.remove();

    const feedbackDiv = document.createElement('div');
    
    feedbackDiv.id = 'feedbackContainer';
    feedbackDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
    `;

    if (resultado.acertou) {

        feedbackDiv.style.backgroundColor = '#4CAF50';
        feedbackDiv.textContent = '✓ Resposta Correta!';

    } else {

        feedbackDiv.style.backgroundColor = '#f44336';
        feedbackDiv.textContent =
            `✗ Resposta Incorreta! A correta era: ${resultado.alternativaCorreta}`;
    }

    document.body.appendChild(feedbackDiv);
}

// ===================== Enviar respostas para o banco =====================
async function enviarRespostas() {
    if (!idEstudante ) {
        console.error('ID do estudante não encontrado.');
        return;
    }

    // Monta o array com id_exercicio e a resposta marcada
    const dadosParaEnvio = questoes.map((q, index) => ({
        id_exercicio: q.id_exercicio,
        resposta: respostas[index] || null // pode ser null se não respondeu
    }));

    try { // Tenta fazer a requisição
        const response = await fetch('http://localhost:3000/api/respostasQuestoes', {
            method: 'POST', // define o método como POST
            headers: {
                'Content-Type': 'application/json', // define o tipo de conteúdo
            },
            body: JSON.stringify({
                id_estudante: idEstudante,
                respostas: dadosParaEnvio
            })
        });

        if (!response.ok) { // Se a resposta não for ok
            const erro = await response.text();
            throw new Error(erro); // lança erro
        }

        const mensagem = await response.text(); // pega a resposta
        console.log('Respostas enviadas com sucesso:', mensagem); // mostra no console
    } catch (error) { // Se der erro
        console.error('Erro ao enviar respostas:', error); // mostra o erro
        alert('Erro ao salvar suas respostas. Tente novamente mais tarde.'); // mostra alerta
    }
}
// ===================================== FIM DA PROVA ===================================================
async function mostrarResultadoFinal() {
    await enviarRespostas();
    let acertos = 0; // Contador de acertos
    questoes.forEach((questao, posicao) => { // forEach: Percorre todas as questões
        if (respostas[posicao] === questao.alternativa_correta) {
            acertos++;
        }
    });

    // Substitui o conteúdo da página pelo resultado final
    document.getElementById('questionCard').innerHTML = `
        <h2>Avaliação Concluída!</h2>

        <p style="font-size: 1.2rem; margin: 20px 0;">
            Você acertou
            <strong>${acertos}</strong>
            de
            <strong>${questoes.length}</strong>
            questões.
        </p>

        <button
            id="btn-enviar"
            onclick="window.location.href='QuestoesAlunos.html'">
            Voltar para Matérias
        </button>
    `;
}
// ===================================== Poder Clicar ===================================================
window.selecionarAlternativa = selecionarAlternativa;
window.proximaQuestao = proximaQuestao;
window.abrirSalaDeAula = abrirSalaDeAula;

// ===================================== Abrir Sala De Aula ===================================================
async function abrirSalaDeAula(event) {
    event.preventDefault();
    const idEstudante = localStorage.getItem("idEstudante");
    try {
        const idTurma = localStorage.getItem("idTurma");
        const resposta = await fetch(`http://localhost:3000/estudante/${idEstudante}`);
        const dados = await resposta.json();

        if (idTurma && idTurma !== "null") {
            localStorage.setItem("idTurma", dados.id_turma);
            window.location.href = "../Sala_de_Aula_Aluno/Sala_De_Aula.html";
        } else {
            window.location.href = "../7CodigoSala/CodigoSalaAluno.html";
        }

    } catch (erro) {
        console.error(erro);
        alert("Erro ao verificar turma.");
    }
}

let questoes = [];
let questaoAtual = 0;
let respostas = [];
let alternativaSelecionada = null;

// Executa assim que a página é carregada no navegador
document.addEventListener('DOMContentLoaded', () => {
    carregarQuestoes();
});

// 1. Busca as questões da API com base na matéria informada na URL (?materia=xxx)
async function carregarQuestoes() {
    const urlParams = new URLSearchParams(window.location.search);
    const materia = urlParams.get('materia') || 'matematica';

    document.getElementById('loading').style.display = 'block';
    document.getElementById('questionCard').style.display = 'none';

    try {
        const response = await fetch(`http://localhost:3000/api/questoes/${materia}`);
        questoes = await response.json();

        document.getElementById('loading').style.display = 'none';

        if (questoes.length === 0) {
            document.getElementById('enunciadoBox').innerHTML = '<p>Nenhuma questão encontrada para esta matéria.</p>';
            document.getElementById('questionCard').style.display = 'block';
            return;
        }

        document.getElementById('questionCard').style.display = 'block';
        renderizarQuestao();
    } catch (error) {
        console.error('Erro ao carregar questões:', error);
        document.getElementById('loading').innerHTML = '<p>Erro ao carregar as questões do servidor.</p>';
    }
}

// 2. Renderiza a questão atual na tela
function renderizarQuestao() {
    if (questaoAtual >= questoes.length) { 
        mostrarResultadoFinal(); 
        return;
    }

    const questao = questoes[questaoAtual]; 
    
    document.getElementById('questaoNumero').textContent = `Questão ${questaoAtual + 1} de ${questoes.length}`;
    
    const progresso = ((questaoAtual + 1) / questoes.length) * 100; 
    document.getElementById('barraProgresso').style.width = `${progresso}%`; 

    document.getElementById('enunciadoBox').innerHTML = `<p>${questao.enunciado}</p>`; 

    const alternativesContainer = document.getElementById('alternativesContainer'); 
    const alternativas = ['a', 'b', 'c', 'd']; 
    const letras = ['A', 'B', 'C', 'D']; 
    
    alternativaSelecionada = respostas[questaoAtual] || null;

    alternativesContainer.innerHTML = alternativas.map((alt, index) => {
        const isSelected = (alternativaSelecionada === alt); 
        return `
            <div class="alternative-row ${isSelected ? 'selected' : ''}" 
                 onclick="selecionarAlternativa('${alt}')"> 
                <div class="alternative-badge">${letras[index]}</div> 
                ${questao[`alternativa_${alt}`]} 
            </div>
        `;
    }).join('');

    document.getElementById('btn-enviar').textContent = 
        questaoAtual === questoes.length - 1 ? 'Finalizar avaliação' : 'Próxima questão'; 
}

// 3. Marca a alternativa escolhida
function selecionarAlternativa(letra) {
    alternativaSelecionada = letra;
    respostas[questaoAtual] = letra;
    renderizarQuestao();
}

// 4. Botão para avançar
function proximaQuestao() {
    if (!respostas[questaoAtual]) {
        alert('Por favor, selecione uma alternativa antes de continuar.');
        return;
    }

    questaoAtual++;
    renderizarQuestao();
}

// 5. Tela de resultado final
function mostrarResultadoFinal() {
    let acertos = 0;
    questoes.forEach((q, index) => {
        if (respostas[index] === q.alternativa_correta) {
            acertos++;
        }
    });

    document.getElementById('questionCard').innerHTML = `
        <h2>Avaliação Concluída!</h2>
        <p style="font-size: 1.2rem; margin: 20px 0;">Você acertou <strong>${acertos}</strong> de <strong>${questoes.length}</strong> questões.</p>
        <button id="btn-enviar" onclick="window.location.href='QuestoesAlunos.html'">Voltar para Matérias</button>
    `;
}
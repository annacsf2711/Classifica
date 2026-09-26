// ===== CONFIGURAÇÃO DA URL DO BACKEND =====
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de desempenho carregada');
    
    const idEstudante = localStorage.getItem('id_estudante');
    console.log('ID do Estudante:', idEstudante);

    if (!idEstudante || idEstudante === 'undefined' || idEstudante === 'null') {
        console.error('ID do estudante não encontrado');
        mostrarErro('Faça login para ver seu desempenho.');
        return;
    }

    const url = API_URL + '/api/desempenho/' + idEstudante;
    console.log('URL da requisição:', url);

    fetch(url)
        .then(function(res) {
            console.log('Status da resposta:', res.status);
            if (!res.ok) {
                throw new Error('Erro HTTP: ' + res.status);
            }
            return res.json();
        })
        .then(function(data) {
            console.log('Dados recebidos:', data);
            preencherDados(data);
        })
        .catch(function(err) {
            console.error('Erro detalhado:', err);
            mostrarErro('Erro ao carregar os dados. Verifique se o servidor está rodando em ' + API_URL);
        });
});

function preencherDados(data) {
    var geral = data.geral;
    var areas = data.areas;
    
    document.getElementById('taxaGeral').innerHTML = geral.taxa + '<span>%</span>';
    document.getElementById('classificacaoGeral').textContent = geral.classificacao;
    
    var mensagem = 'Que tal revisar os conteúdos? Você pode melhorar!';
    if (geral.taxa >= 80) {
        mensagem = 'Parabéns! Você está acima da média e mantendo seu desempenho.';
    } else if (geral.taxa >= 60) {
        mensagem = 'Bom desempenho! Continue praticando para melhorar.';
    }
    document.getElementById('mensagemParabens').textContent = mensagem;
    
    var grid = document.getElementById('gridAreas');
    grid.innerHTML = '';
    
    if (!areas || areas.length === 0) {
        grid.innerHTML = 
            '<p style="grid-column: 1/-1; color: #6b7d90; text-align: center; padding: 40px;">' +
            'Nenhuma questão respondida no diagnóstico. Faça o diagnóstico para ver seu desempenho.</p>';
        return;
    }
    
    areas.forEach(function(area) {
        var card = document.createElement('div');
        card.className = 'card-area';
        card.innerHTML = `
            <h3>${area.nome}</h3>
            <div class="taxa-destaque">${area.taxa}%</div>
            <div class="item">
                <span class="label">TAXA DE ACERTO</span>
                <span class="valor">${area.taxa}%</span>
            </div>
            <div class="item">
                <span class="label">QUESTÕES RESPONDIDAS</span>
                <span class="valor">${area.respondidas}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function mostrarErro(mensagem) {
    document.getElementById('taxaGeral').innerHTML = '--<span>%</span>';
    document.getElementById('mensagemParabens').textContent = mensagem;
    document.getElementById('classificacaoGeral').textContent = 'Erro';
    document.getElementById('gridAreas').innerHTML = 
        '<p style="grid-column: 1/-1; color: #d32f2f; text-align: center; padding: 40px;">' +
        mensagem + '</p>';
}

// ===================================== Abrir Sala De Aula ===================================================
window.abrirSalaDeAula = async function(event) {
    console.log("está entrando nessa função");
    event.preventDefault();

    const idEstudante = localStorage.getItem("idEstudante");
    try {
      const resposta = await fetch(`http://localhost:3000/estudante/${idEstudante}`);
      const dados = await resposta.json();

      console.log("Dados Recebidos", dados);
      console.log("id_turma: ", dados.id_turma);

      if (dados.id_turma !== null) {
          localStorage.setItem("idTurma", dados.id_turma);
          window.location.href = "../Sala_de_Aula_Aluno/Sala_De_Aula.html";
      } else {
          window.location.href = "../7CodigoSala/CodigoSalaAluno.html";
      }

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao verificar turma.");
    }
}
// ===================================== Voltar Tela de início ===================================================
window.voltarLogin = function () {
    window.location.href = "../2LoginAluno/LoginAluno.html";
};
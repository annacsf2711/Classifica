// ATENÇÃO: ajuste a porta/host se o seu backend rodar em outro endereço
    const API_URL = '/api';

    // Enquanto não há login integrado, o professor pode ser passado direto na URL:
    // Tela_Meus_Simulados.html?id_professor=1&nome=Leticia%20Pinho
    // Quando o login estiver pronto, basta gravar 'professorId' e 'nomeProfessor'
    // no localStorage no momento do loginProf, e isso continua funcionando sozinho
    // (a URL tem prioridade sobre o localStorage, pra facilitar testes).
    const parametrosUrl = new URLSearchParams(window.location.search);
        
    const professorId = parametrosUrl.get('id_professor') || localStorage.getItem('idProfessor');
    const nomeProfessorSalvo = parametrosUrl.get('nome') || localStorage.getItem('nomeProfessor');
    
    console.log("Professor id: ", professorId, nomeProfessorSalvo)
    let turmaSelecionada = null;
    let exerciciosDisponiveis = [];
    let selecionadas = new Set();

    document.addEventListener('DOMContentLoaded', () => {
      if (nomeProfessorSalvo) {
        document.getElementById('nomeProfessor').textContent = nomeProfessorSalvo;
        document.getElementById('avatarInicial').textContent = nomeProfessorSalvo.charAt(0).toUpperCase();
      }

      if (!professorId) {
        document.getElementById('listaSimulados').innerHTML =
          '<div class="estado-erro">Nenhum professor identificado. Acesse a página com ?id_professor=SEU_ID na URL (ex: Tela_Meus_Simulados.html?id_professor=1).</div>';
        return;
      }

      carregarSimulados();
    });

    // ===================== CARREGAR SIMULADOS =====================
    async function carregarSimulados() {
      const container = document.getElementById('listaSimulados');
      container.innerHTML = '<div class="estado-carregando">Carregando seus simulados...</div>';

      try {
        const response = await fetch(`${API_URL}/listarSimulados/${professorId}`);
        if (!response.ok) throw new Error('Erro ao buscar simulados');

        const simulados = await response.json();

        if (simulados.length === 0) {
          container.innerHTML = '<div class="estado-vazio">Você ainda não criou nenhum simulado. Clique no + abaixo para começar.</div>';
          return;
        }

        container.innerHTML = simulados.map(s => `
          <div class="card">
            <div class="card-info">
              <h3><span class="accent">${s.nome}</span>${s.turma ? ' - ' + s.turma : ''}</h3>
              <div class="meta">
                <span><span class="dot"></span>${s.total_questoes} questõe${s.total_questoes == 1 ? '' : 's'}</span>
              </div>
            </div>
            <a href="Tela_Avaliacao.html?simuladoId=${s.id}" class="btn">Entrar</a>
          </div>
        `).join('');

      } catch (erro) {
        console.error('Erro:', erro);
        container.innerHTML = '<div class="estado-erro">Erro ao carregar seus simulados. Verifique se o servidor está rodando.</div>';
      }
    }

    // ===================== MODAL =====================
    function abrirModal() {
      document.getElementById('modalOverlay').classList.add('open');
      document.getElementById('nomeSimulado').focus();
      carregarExerciciosDisponiveis();
      carregarTurmasProfessor();
    }

    function fecharModal() {
      document.getElementById('modalOverlay').classList.remove('open');
      document.getElementById('nomeSimulado').value = '';
      turmaSelecionada = null;
      selecionadas.clear();
      atualizarContador();
    }

    function fecharModalFora(event) {
      if (event.target.id === 'modalOverlay') fecharModal();
    }

    // ===================== CARREGAR QUESTÕES DO BANCO DO PROFESSOR =====================
    async function carregarExerciciosDisponiveis() {
      const picker = document.getElementById('questoesPicker');
      console.log("Professor ID:", professorId);
      console.log("URL:", `${API_URL}/listarExerciciosProfessor/${professorId}`);
      picker.innerHTML = '<div style="padding:14px; font-size:14px; color:#4a5568;">Carregando questões...</div>';

      try {
        const response = await fetch(`${API_URL}/listarExerciciosProfessor/${professorId}`);
        if (!response.ok) {
          const texto = await response.text();
          throw new Error(texto);
        }

        exerciciosDisponiveis = await response.json();

        if (exerciciosDisponiveis.length === 0) {
          picker.innerHTML = '<div style="padding:14px; font-size:14px; color:#4a5568;">Nenhuma questão no seu banco ainda. Cadastre questões primeiro.</div>';
          return;
        }

        picker.innerHTML = exerciciosDisponiveis.map(ex => `
          <label class="questao-item">
            <input type="checkbox" value="${ex.id}" onchange="alternarSelecao(${ex.id}, this.checked)" />
            <span>
              <span class="tag">${ex.disciplina || 'Sem disciplina'}</span><br>
              ${ex.enunciado.length > 100 ? ex.enunciado.slice(0, 100) + '...' : ex.enunciado}
            </span>
          </label>
        `).join('');

      } catch (erro) {
          console.error('Erro completo:', erro);
          alert(erro.message);
        }  
    }

    function alternarSelecao(exercicioId, marcado) {
      if (marcado) {
        selecionadas.add(exercicioId);
      } else {
        selecionadas.delete(exercicioId);
      }
      atualizarContador();
    }

    function atualizarContador() {
      document.getElementById('contadorSelecionadas').textContent = selecionadas.size;
    }

    // ===================== CRIAR SIMULADO + VINCULAR QUESTÕES =====================
    async function criarSimulado() {
      const nome = document.getElementById('nomeSimulado').value.trim();

      if (!nome) {
        alert('Digite um nome para o simulado.');
        return;
      }
      if (!turmaSelecionada) {
        alert('Selecione uma turma.');
        return;
      }
      if (selecionadas.size === 0) {
        alert('Selecione ao menos uma questão para o simulado.');
        return;
      }

      const btn = document.getElementById('btnCriarSimulado');
      btn.disabled = true;
      btn.textContent = 'Criando...';

      try {
        const criarResponse = await fetch(`${API_URL}/criarSimulado`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, turmaId: turmaSelecionada, professorId })
        });

        if (!criarResponse.ok) throw new Error('Erro ao criar simulado');
        const { id: simuladoId } = await criarResponse.json();

        for (const exercicioId of selecionadas) {
          await fetch(`${API_URL}/adicionarQuestaoSimulado`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ simuladoId, exercicioId })
          });
        }

        fecharModal();
        carregarSimulados();

      } catch (erro) {
        console.error('Erro:', erro);
        alert('Erro ao criar o simulado. Tente novamente.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Criar Simulado';
      }
    }
        // ===================== CARREGAR TURMAS DO PROFESSOR =====================
    async function carregarTurmasProfessor() {
      const picker = document.getElementById('turmasPicker');
      picker.innerHTML = '<div style="padding:14px; font-size:14px; color:#4a5568;">Carregando turmas...</div>';

      try {
        const response = await fetch(`${API_URL}/listarTurmasProfessor/${professorId}`);
        if (!response.ok) throw new Error('Erro ao buscar turmas');

        const turmas = await response.json();

        if (turmas.length === 0) {
          picker.innerHTML = '<div style="padding:14px; font-size:14px; color:#4a5568;">Você ainda não leciona nenhuma turma.</div>';
          return;
        }

        picker.innerHTML = turmas.map(t => `
          <label class="turma-item">
            <input type="radio" name="turmaRadio" value="${t.id}" onchange="selecionarTurma(${t.id})" />
            <span>${t.nome}</span>
          </label>
        `).join('');

      } catch (erro) {
        console.error('Erro:', erro);
        picker.innerHTML = '<div style="padding:14px; font-size:14px; color:#c0392b;">Erro ao carregar turmas.</div>';
      }
    }

    function selecionarTurma(idTurma) {
      turmaSelecionada = idTurma;
    }

// ===================================== Voltar Tela de início ===================================================
window.voltarLogin = function () {
    window.location.href = "../4LoginProfessor/LoginProfessor.html";
};
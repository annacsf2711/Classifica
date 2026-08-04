// ATENÇÃO: ajuste a porta/host se o seu backend rodar em outro endereço
    const API_URL = 'http://localhost:3000';

    // Enquanto não há login integrado, o professor pode ser passado direto na URL:
    // Tela_Meus_Simulados.html?id_professor=1&nome=Leticia%20Pinho
    // Quando o login estiver pronto, basta gravar 'professorId' e 'nomeProfessor'
    // no localStorage no momento do loginProf, e isso continua funcionando sozinho
    // (a URL tem prioridade sobre o localStorage, pra facilitar testes).
    const parametrosUrl = new URLSearchParams(window.location.search);

    const professorId = parametrosUrl.get('id_professor') || localStorage.getItem('professorId');
    const nomeProfessorSalvo = parametrosUrl.get('nome') || localStorage.getItem('nomeProfessor');

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
    }

    function fecharModal() {
      document.getElementById('modalOverlay').classList.remove('open');
      document.getElementById('nomeSimulado').value = '';
      document.getElementById('turmaSimulado').value = '';
      selecionadas.clear();
      atualizarContador();
    }

    function fecharModalFora(event) {
      if (event.target.id === 'modalOverlay') fecharModal();
    }

    // ===================== CARREGAR QUESTÕES DO BANCO DO PROFESSOR =====================
    async function carregarExerciciosDisponiveis() {
      const picker = document.getElementById('questoesPicker');
      picker.innerHTML = '<div style="padding:14px; font-size:14px; color:#4a5568;">Carregando questões...</div>';

      try {
        const response = await fetch(`${API_URL}/listarExerciciosProfessor/${professorId}`);
        if (!response.ok) throw new Error('Erro ao buscar exercícios');

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
        console.error('Erro:', erro);
        picker.innerHTML = '<div style="padding:14px; font-size:14px; color:#c0392b;">Erro ao carregar suas questões.</div>';
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
      const turma = document.getElementById('turmaSimulado').value.trim();

      if (!nome) {
        alert('Digite um nome para o simulado.');
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
          body: JSON.stringify({ nome, turma, professorId })
        });

        if (!criarResponse.ok) throw new Error('Erro ao criar simulado');
        const { id: simuladoId } = await criarResponse.json();

        // adiciona cada questão selecionada, uma de cada vez
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
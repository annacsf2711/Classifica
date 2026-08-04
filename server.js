const express = require('express'); // usada para cirar o servidor
const { Pool } = require('pg'); // para conectar no PosrtgreSQL
const cors = require('cors'); // permite que o front-end se conecte ao back-end

const app = express(); // cria o servidor 

// permitir comunicação com o navegador
app.use(cors());
app.use(express.json());

// conexão com PostgreSQL
const pool = new Pool({
  user: 'ra0081817',              // seu usuário
  host: '10.90.24.54',             // ou IP do servidor casa: 200.18.128.54    escola: 10.90.24.54
  database: 'ra0081817',
  password: 'Filhos03*',         // sua senha do pgAdmin
  port: 5432
});


// iniciar servidor
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});

// ===================== CADASTRAR ALUNO =====================
app.post('/cadastrarAluno', async (req, res) => {
  console.log("Dados recebidos no servidor:", req.body);
  const { nome, cpf, dataNascimento, email, senha, cep } = req.body; // pega os dados

  try { // tentando executar o código
    await pool.query( // executa o comando sql no banco
      `INSERT INTO classifica.estudante (nome, cpf, email, senha, cep, data_nasc, data_cadastro, nivel_proficiencia_geral, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), 0, true)`,
      [nome, cpf, email, senha, cep, dataNascimento]
    );

    res.send("Cadastro realizado com sucesso!");

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao salvar no banco");
  }
});


// ===================== LOGIN ALUNO =====================
app.post('/loginAluno', async (req, res) => {
  console.log("Dados recebidos no login", req.body);
  const {email, senha} = req.body;
  try {
    // Executa a busca no banco de dados para ver se o usuário existe
    const resultado = await pool.query(  
      `SELECT EXISTS( 
          SELECT 1 FROM classifica.estudante WHERE email = $1 AND senha = $2
      )`,
      [email, senha]
    ); 

    const usuarioExiste = resultado.rows[0].exists; // true ou false

    if (usuarioExiste) {
      res.send("Login realizado com sucesso!");
    } else {
      res.status(401).send("Email ou senha incorretos.");
    }
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao processar o login no banco");
  }
});

// ===================== CADASTRAR PROF =====================
app.post('/cadastrarProf', async (req, res) => {
  console.log("Dados recebidos no servidor:", req.body);
  const { nome, cep, cpf, disciplina, dataNascimento, email, senha } = req.body;
  try { // tentando executar o código
    await pool.query( // executa o comando sql no banco
      `INSERT INTO classifica.professor (nome, cpf, cep, data_nasc, email, senha, especialidade, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
      [nome, cpf, cep, dataNascimento, email, senha, disciplina]
    );

    res.send("Cadastro realizado com sucesso!");

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao salvar no banco");
  }
});

// ===================== LOGIN PROF =====================
app.post('/loginProf', async (req, res) => {
  console.log("Dados recebidos no login", req.body);
  const {email, senha} = req.body;
  try {
    // Executa a busca no banco de dados para ver se o usuário existe
    const resultado = await pool.query(  
      `SELECT id FROM classifica.professor WHERE email = $1 AND senha = $2`,
      [email, senha]
    ); 

    if (resultado.rows.length > 0) {
      res.json({ mensagem: "Login realizado com sucesso!", professorId: resultado.rows[0].id });
    } else {
      res.status(401).send("Email ou senha incorretos.");
    }
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao processar o login no banco");
  }
});

// ===================== LISTAR QUESTÕES DE UM BANCO =====================
app.get('/listarQuestoesBanco/:bancoId', async (req, res) => {
  const { bancoId } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT e.id_exercicio AS id, e.enunciado, e.nivel_dificuldade AS tipo
       FROM classifica.banco_questoes_exercicios bqe
       JOIN classifica.exercicio e ON e.id_exercicio = bqe.exercicio_id
       WHERE bqe.banco_id = $1
       ORDER BY bqe.ordem`,
      [bancoId]
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao listar questões do banco");
  }
});

// ===================== LISTAR EXERCÍCIOS DISPONÍVEIS PARA ADICIONAR =====================
app.get('/listarExerciciosDisponiveis/:bancoId', async (req, res) => {
  const { bancoId } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT e.id_exercicio AS id, e.enunciado, e.nivel_dificuldade AS tipo
       FROM classifica.exercicio e
       WHERE e.id_exercicio NOT IN (
         SELECT exercicio_id FROM classifica.banco_questoes_exercicios WHERE banco_id = $1
       )
       ORDER BY e.id_exercicio`,
      [bancoId]
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao listar exercícios disponíveis");
  }
});

// ===================== ADICIONAR QUESTÃO AO BANCO =====================
app.post('/adicionarQuestaoBanco', async (req, res) => {
  const { bancoId, exercicioId } = req.body;
  try {
    // calcula a próxima posição (ordem) dentro do banco
    const ordemResultado = await pool.query(
      `SELECT COALESCE(MAX(ordem), 0) + 1 AS proxima_ordem
       FROM classifica.banco_questoes_exercicios WHERE banco_id = $1`,
      [bancoId]
    );
    const proximaOrdem = ordemResultado.rows[0].proxima_ordem;

    await pool.query(
      `INSERT INTO classifica.banco_questoes_exercicios (banco_id, exercicio_id, ordem)
       VALUES ($1, $2, $3)`,
      [bancoId, exercicioId, proximaOrdem]
    );

    res.send("Questão adicionada ao banco com sucesso!");
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao adicionar questão ao banco");
  }
});
// ===================== CRIAR NOVO EXERCÍCIO =====================
app.post('/criarExercicio', async (req, res) => {
  const {
    enunciado, alternativaA, alternativaB, alternativaC, alternativaD,
    alternativaCorreta, nivelDificuldade, criadoPor, bancoId
  } = req.body;

  try {
    // 1. descobre a disciplina configurada no banco de questões
    const bancoResultado = await pool.query(
      `SELECT disciplina FROM classifica.banco_questoes WHERE id = $1`,
      [bancoId]
    );

    if (bancoResultado.rows.length === 0) {
      return res.status(404).send("Banco de questões não encontrado");
    }

    const disciplina = bancoResultado.rows[0].disciplina;

    // 2. busca o id da área correspondente a essa disciplina (colunas reais: id_area, nome_area)
    // Consulta todas as áreas e faz comparação normalizada em JS para lidar com acentos e caixa
    const areaResultado = await pool.query(
      `SELECT id_area, nome_area FROM classifica.area_conhecimento`
    );

    if (areaResultado.rows.length === 0) {
      return res.status(400).send(`Nenhuma área cadastrada no sistema`);
    }

    // normaliza texto removendo acentos, espaços e convertendo para minúsculas
    const normalizeName = (s) => {
      if (s == null) return '';
      // decomposição unicode + remoção de marcas de combinação para tirar acentos
      return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
    };

    const disciplinaNorm = normalizeName(disciplina);
    let idArea = null;
    for (const row of areaResultado.rows) {
      if (normalizeName(row.nome_area) === disciplinaNorm) {
        idArea = row.id_area;
        break;
      }
    }

    // fallback: tentar correspondência case-insensitive direta no banco (se algo falhar)
    if (idArea === null) {
      const tentativa = await pool.query(
        `SELECT id_area FROM classifica.area_conhecimento WHERE TRIM(nome_area) ILIKE TRIM($1) LIMIT 1`,
        [disciplina]
      );
      if (tentativa.rows.length > 0) idArea = tentativa.rows[0].id_area;
    }

    if (idArea === null) {
      return res.status(400).send(`Nenhuma área encontrada para a disciplina "${disciplina}"`);
    }

    // 3. cria o exercício já com o id_area correto
    const resultado = await pool.query(
      `INSERT INTO classifica.exercicio
         (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d,
          alternativa_correta, nivel_dificuldade, id_area, data_criada, criado_por, dono,
          total_tentativas, total_acertos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, 0, 0)
       RETURNING id_exercicio AS id`,
      [enunciado, alternativaA, alternativaB, alternativaC, alternativaD,
       alternativaCorreta, nivelDificuldade, idArea, criadoPor, criadoPor]
    );

    res.json({ id: resultado.rows[0].id });

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao criar exercício");
  }
});


// ===================================================================
// Cole estas rotas no seu server.js, antes de app.listen(...)
// Seguem o mesmo padrão das rotas de banco_questoes que você já tem
// ===================================================================

// ===================== LISTAR SIMULADOS DE UM PROFESSOR =====================
app.get('/listarSimulados/:professorId', async (req, res) => {
  const { professorId } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT s.id, s.nome, s.turma, s.data_criacao,
              COUNT(se.exercicio_id) AS total_questoes
       FROM classifica.simulado s
       LEFT JOIN classifica.simulado_exercicios se ON se.simulado_id = s.id
       WHERE s.professor_id = $1 AND s.ativo = true
       GROUP BY s.id
       ORDER BY s.data_criacao DESC`,
      [professorId]
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao listar simulados");
  }
});

// ===================== CRIAR SIMULADO =====================
app.post('/criarSimulado', async (req, res) => {
  const { nome, turma, professorId } = req.body;
  try {
    const resultado = await pool.query(
      `INSERT INTO classifica.simulado (nome, turma, professor_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [nome, turma, professorId]
    );
    res.json({ id: resultado.rows[0].id });
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao criar simulado");
  }
});

// ===================== ADICIONAR QUESTÃO AO SIMULADO =====================
app.post('/adicionarQuestaoSimulado', async (req, res) => {
  const { simuladoId, exercicioId } = req.body;
  try {
    const ordemResultado = await pool.query(
      `SELECT COALESCE(MAX(ordem), 0) + 1 AS proxima_ordem
       FROM classifica.simulado_exercicios WHERE simulado_id = $1`,
      [simuladoId]
    );
    const proximaOrdem = ordemResultado.rows[0].proxima_ordem;

    await pool.query(
      `INSERT INTO classifica.simulado_exercicios (simulado_id, exercicio_id, ordem)
       VALUES ($1, $2, $3)
       ON CONFLICT (simulado_id, exercicio_id) DO NOTHING`,
      [simuladoId, exercicioId, proximaOrdem]
    );

    res.send("Questão adicionada ao simulado com sucesso!");
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao adicionar questão ao simulado");
  }
});

// ===================== REMOVER QUESTÃO DO SIMULADO =====================
app.delete('/removerQuestaoSimulado/:simuladoId/:exercicioId', async (req, res) => {
  const { simuladoId, exercicioId } = req.params;
  try {
    await pool.query(
      `DELETE FROM classifica.simulado_exercicios WHERE simulado_id = $1 AND exercicio_id = $2`,
      [simuladoId, exercicioId]
    );
    res.send("Questão removida do simulado");
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao remover questão do simulado");
  }
});

// ===================== LISTAR QUESTÕES DE UM SIMULADO (para o aluno abrir/responder) =====================
app.get('/listarQuestoesSimulado/:simuladoId', async (req, res) => {
  const { simuladoId } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT e.id_exercicio AS id, e.enunciado,
              e.alternativa_a, e.alternativa_b, e.alternativa_c, e.alternativa_d,
              e.alternativa_correta, se.ordem
       FROM classifica.simulado_exercicios se
       JOIN classifica.exercicio e ON e.id_exercicio = se.exercicio_id
       WHERE se.simulado_id = $1
       ORDER BY se.ordem`,
      [simuladoId]
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao listar questões do simulado");
  }
});

// ===================== LISTAR QUESTÕES DA MATÉRIA DO PROFESSOR (para escolher no modal "Adicionar Simulado") =====================
app.get('/listarExerciciosProfessor/:professorId', async (req, res) => {
  const { professorId } = req.params;
  try {
    // 1. descobre a especialidade (disciplina) do professor
    const profResultado = await pool.query(
      `SELECT especialidade FROM classifica.professor WHERE id_professor = $1`,
      [professorId]
    );

    if (profResultado.rows.length === 0) {
      return res.status(404).send("Professor não encontrado");
    }

    const especialidade = profResultado.rows[0].especialidade;

    // 2. lista TODAS as questões da mesma área de conhecimento, independente de quem criou
    const resultado = await pool.query(
      `SELECT e.id_exercicio AS id, e.enunciado, e.nivel_dificuldade,
              a.nome_area AS disciplina
       FROM classifica.exercicio e
       JOIN classifica.area_conhecimento a ON a.id_area = e.id_area
       WHERE TRIM(a.nome_area) ILIKE TRIM($1)
       ORDER BY e.data_criada DESC`,
      [especialidade]
    );

    res.json(resultado.rows);
  } catch (erro) {
      console.error("ERRO COMPLETO:", erro);
      res.status(500).send(erro.message);
    }
});
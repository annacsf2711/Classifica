const express = require('express'); // usada para cirar o servidor
const { Pool } = require('pg'); // para conectar no PosrtgreSQL
const cors = require('cors'); // permite que o front-end se conecte ao back-end
// const path = require('path'); // 
const app = express(); // cria o servidor 

// permitir comunicação com o navegador
app.use(cors());
app.use(express.json());

// conexão com PostgreSQL
const pool = new Pool({
  user: 'ra0081817',              // seu usuário
  host: '200.18.128.54',             // ou IP do servidor casa: 200.18.128.54    escola: 10.90.24.54
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
// ===================== LOGIN ALUNO =========================
app.post('/loginAluno', async (req, res) => {

  console.log("Dados recebidos no login", req.body);
  const {email, senha} = req.body;
  try {
    // Executa a busca no banco de dados para ver se o usuário existe
    const resultado = await pool.query(  
      `SELECT id_estudante, ativo, id_turma FROM classifica.estudante WHERE email = $1 AND senha = $2`,
      [email, senha]
    ); 
    console.log("Resultado do banco:", resultado)
    
    const usuarioExiste = resultado.rows.length > 0; // Verifica se retornou algo

    if (usuarioExiste) {   

      console.log("ativo:", resultado.rows[0].ativo);

      if (resultado.rows[0].ativo == false) {
        console.log("Conta Desativada");

        return res.status(403).json({
          usuarioExiste: true,
          contaDesativada: true,
          idEstudante: resultado.rows[0].id_estudante,
          id_turma: resultado.rows[0].id_turma,
          mensagem: "Conta desativada"
        });
      }

      return res.json({  // envia um objeto com + informações
        usuarioExiste: true,
        mensagem: "Login realizado com sucesso!",
        id_estudante: resultado.rows[0].id_estudante,   // envia o id do aluno para o LoginAluno
        id_turma: resultado.rows[0].id_turma
      });
    }
    else { 
        res.status(401).json({
        usuarioExiste: false,
        mensagem: "Email ou senha incorretos."
      });
    }
  }
  catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao processar o login no banco");
  }
});
// ===================== CONFIG ALUNO ========================
app.get('/estudante/:id_estudante', async (req, res) => { // rota para buscar os dados de um professor pelo id
  const {id_estudante} = req.params;   // pega o id 

  try {
    const resultado = await pool.query(     // consulta os dados do professor no banco

      `SELECT id_estudante,id_turma, nome, cpf, cep, data_nasc, email, senha
      FROM classifica.estudante WHERE id_estudante = $1`,
      [id_estudante]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).send("Aluno não encontrado");
    }
    
    res.json(resultado.rows[0]); // pegar o primeira elemento

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao buscar aluno");
  }
});
app.put("/estudante/:id_estudante", async (req, res) => {
  
    console.log(req.params);
    console.log(req.body);

    const {id_estudante} = req.params;   // pega o id 
    const { nome, email, cep, cpf, senha, data_nasc } = req.body;
    try {
      await pool.query(
        `UPDATE classifica.estudante
        SET nome = $1, email = $2, cep = $3, cpf = $4, senha = $5, data_nasc = $6
        WHERE id_estudante = $7`,
        [nome, email, cep, cpf, senha, data_nasc, id_estudante]
      );
      res.status(200).send("Aluno atualizado com sucesso");
    } catch (erro) {
        console.error(erro);
        res.status(500).send("Erro ao atualizar aluno");
    }
});
// ===================== Desativar Aluno =====================
app.put("/desativarAluno/:id_estudante", async (req, res) => {
  
  console.log("Rota desativar aluno chamada");

  const { id_estudante } = req.params;
  try {
    await pool.query(
    `UPDATE classifica.estudante SET ativo = false WHERE id_estudante = $1`,
    [id_estudante]
  );
  res.send("Aluno desativado");
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao desativar");
  }
});
// ===================== Reativar Aluno =====================
app.put('/reativarAluno/:id_estudante', async (req, res) => {
    const { id_estudante } = req.params;
    try {
        const resultado = await pool.query(
          `UPDATE classifica.estudante SET ativo = true WHERE id_estudante = $1`,
          [id_estudante]
        );

        console.log("Linhas alteradas:", resultado.rowCount);
        res.json({
            sucesso: true,
            mensagem: "Conta reativada com sucesso!"
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao reativar a conta."
        });
    }
});
// ===================== Deletar Aluno =====================
app.delete("/deletarAluno/:id_estudante", async (req, res) => {
  const { id_estudante } = req.params;

  try {
    // Tabelas que possuem FK para aluno
    await pool.query(
      `DELETE FROM classifica.estudante
       WHERE id_estudante = $1`,
      [id_estudante]
    );

    // Exclui o aluno
    await pool.query(
      `DELETE FROM classifica.estudante
       WHERE id_estudante = $1`,
      [id_estudante]
    );

    res.send("Aluno excluído permanentemente");

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao excluir Aluno");
  }
});
// ===================== Código Turma Aluno =====================
app.post('/turmaEstudante', async (req, res) => {
  const { codigo, idEstudante } = req.body;

  try {
    const turma = await pool.query(
      `SELECT idturma, nome FROM classifica.turma
       WHERE codigo = $1`,
      [codigo]
    );

    if (turma.rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Turma não encontrada"
      });
    }

    const idTurma = turma.rows[0].idturma;

    await pool.query(
      `UPDATE classifica.estudante SET id_turma = $1
       WHERE id_estudante = $2`,
      [idTurma, idEstudante]
    );

    res.json({
      salaExistente: true,
      mensagem: "Aluno entrou na turma",
      idTurma: idTurma,
      nomeTurma: turma.rows[0].nome
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao entrar na turma");
  }
});
// ===================== QUESTÕES POR MATÉRIA ALUNO ===============
app.get('/api/questoes/:materia', async (req, res) => {
    const { materia } = req.params;

    try {
        const mapaAreas = {
            'matematica': 'Matemática',
            'portugues': 'Português',
            'natureza': 'Ciências da Natureza',
            'humanas': 'Ciências Humanas'
        };

        const nomeArea = mapaAreas[materia] || materia;

        // Query corrigida usando o schema 'classifica' e as colunas reais do seu banco
        const query = `
            SELECT e.* 
            FROM classifica.exercicio e
            INNER JOIN classifica.area_conhecimento a ON e.id_area = a.id_area
            WHERE LOWER(a.nome_area) LIKE LOWER($1)
            ORDER BY e.id_exercicio
        `;

        const { rows } = await pool.query(query, [`%${nomeArea}%`]);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar questões por área:', error);
        res.status(500).send('Erro interno do servidor');
    }
});
app.use(express.static('9QuestoesAlunos'));
// ===================== SALVAR RESPOSTAS DAS QUESTÕES ALUNO ======
app.post('/api/respostasQuestoes', async (req, res) => {
    try { const { id_estudante, respostas } = req.body;
      if (!id_estudante || !respostas || !Array.isArray(respostas)) {
          return res.status(400).send("Dados inválidos");
      }

      for (const item of respostas) {
        const questao = await pool.query(
          `SELECT alternativa_correta FROM classifica.exercicio
            WHERE id_exercicio = $1`,
            [item.id_exercicio]
        );
        if (questao.rows.length === 0) continue;
          const correta = questao.rows[0].alternativa_correta;
          const correto =
                item.resposta &&
                item.resposta.toLowerCase() === correta.toLowerCase();
          await pool.query(
                `INSERT INTO classifica.tentativa
                (id_estudante, id_exercicio, resposta_marcada, correto, data_tentativa)
                VALUES ($1,$2,$3, $4,NOW()) `,
                [id_estudante, item.id_exercicio,item.resposta,correto]
            );
        }
        res.status(200).send("Respostas salvas com sucesso!");
    } catch (erro) {
      console.error("Erro ao salvar respostas:", erro);
      res.status(500).send("Erro ao salvar respostas no banco");
    }
});

// ===================== CPF e E-mail conferir se existem =========
app.post("/verificarCadastroAluno", async (req, res) => {
    // Recebe CPF e e-mail enviados pelo frontend
    const { cpf, email } = req.body;
    try {
      // Consulta no PostgreSQL
      const resultado = await pool.query(
        `SELECT id_estudante, cpf, email FROM classifica.estudante
          WHERE cpf = $1 OR email = $2`,
          [cpf, email]
        );
        // Verifica se o CPF existe
        const cpfExiste = resultado.rows.some(function(estudante) {
            return estudante.cpf === cpf;
        });
        // Verifica se o e-mail existe
        const emailExiste = resultado.rows.some(function(estudante) {
            return estudante.email === email;
        });
        // Retorna para o frontend
        res.json({
            cpfExiste,
            emailExiste
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: true,
            mensagem: "Erro ao consultar CPF e e-mail"
        });
    }
});
app.post("/verificarCadastroProf", async (req, res) => {
    // Recebe CPF e e-mail enviados pelo frontend
    const { cpf, email } = req.body;
    try {
      // Consulta no PostgreSQL
      const resultado = await pool.query(
        `SELECT id_professor, cpf, email FROM classifica.professor
          WHERE cpf = $1 OR email = $2`,
          [cpf, email]
        );
        // Verifica se o CPF existe
        const cpfExiste = resultado.rows.some(function(professor) {
            return professor.cpf === cpf;
        });
        // Verifica se o e-mail existe
        const emailExiste = resultado.rows.some(function(professor) {
            return professor.email === email;
        });
        // Retorna para o frontend
        res.json({
            cpfExiste,
            emailExiste
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: true,
            mensagem: "Erro ao consultar CPF e e-mail"
        });
    }
});

// ===================== CADASTRAR PROF ===========================
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
// ===================== LOGIN PROF ==============================
app.post('/loginProf', async (req, res) => {
  console.log("Dados recebidos no login", req.body);
  const {email, senha} = req.body;
  try {
    // Executa a busca no banco de dados para ver se o usuário existe
    const resultado = await pool.query(
      `SELECT id_professor, ativo FROM classifica.professor WHERE email = $1 AND senha = $2`,
      [email, senha]
    );
    console.log(resultado.rows[0]);
    console.log("Valor de ativo:", resultado.rows[0].ativo);

    const usuarioExiste = resultado.rows.length > 0; // Verifica se retornou algo
    if (usuarioExiste) {

      console.log("ativo:", resultado.rows[0].ativo);

      if (resultado.rows[0].ativo == false) {
        console.log("Conta Desativada");

        return res.status(403).json({
          usuarioExiste: true,
          contaDesativada: true,
          idProfessor: resultado.rows[0].id_professor,
          mensagem: "Conta desativada"
        });
      }

      console.log("Login normal");

      return res.json({  // envia um objeto com + informações
        usuarioExiste: true,
        mensagem: "Login realizado com sucesso!",
        idProfessor: resultado.rows[0].id_professor   // envia o id do professor para o LoginProfessor 
      });
    }

    else { 
        res.status(401).json({
        usuarioExiste: false,
        mensagem: "Email ou senha incorretos."
      });
    }
  }
  catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao processar o login no banco");
  }
});
// ===================== CONFIG PROF ==============================
app.get('/professor/:id_professor', async (req, res) => { // rota para buscar os dados de um professor pelo id
  const {id_professor} = req.params;   // pega o id 

  try {
    const resultado = await pool.query(     // consulta os dados do professor no banco

      `SELECT id_professor, nome, cpf, cep, data_nasc, email, especialidade, senha
      FROM classifica.professor WHERE id_professor = $1`,
      [id_professor]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).send("Professor não encontrado");
    }
    res.json(resultado.rows[0]); // pegar o primeira elemento

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao buscar professor");
  }
});
// ======='============== Desativar PROF ===========================
app.put("/desativarProfessor/:id_professor", async (req, res) => {
  
  const {id_professor} = req.params;
  try {
    await pool.query(
    `UPDATE classifica.professor SET ativo = false WHERE id_professor = $1`,
    [id_professor]
  );
  res.send("Professor desativado");
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao desativar");
  }
});
// ===================== Deletar PROF ==============================
app.delete("/deletarProfessor/:id_professor", async (req, res) => {
  const { id_professor } = req.params;

  try {
    // Tabelas que possuem FK para professor
    await pool.query(
      `DELETE FROM classifica.professor_turma
       WHERE id_professor = $1`,
      [id_professor]
    );

    // Exclui o professor
    await pool.query(
      `DELETE FROM classifica.professor
       WHERE id_professor = $1`,
      [id_professor]
    );

    res.send("Professor excluído permanentemente");
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao excluir professor");
  }
});
// ===================== Reativar Professor ========================
app.put('/reativarProfessor/:id_professor', async (req, res) => {
    const { id_professor } = req.params;
    try {
        await pool.query(
            `UPDATE classifica.professor SET ativo = true WHERE id_professor = $1`,
            [id_professor]
        );

        res.json({
            sucesso: true,
            mensagem: "Conta reativada com sucesso!"
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao reativar a conta."
        });
    }
});
// ===================== Código Turma Professor =====================
app.post('/turmaProf', async (req, res) => {
  const { codigo, idProfessor } = req.body;

  try {
    const turma = await pool.query(
      `SELECT idturma, nome
       FROM classifica.turma
       WHERE codigo = $1`,
      [codigo]
    );

    if (turma.rows.length === 0) {
      return res.status(404).json({
        salaExistente: false,
        mensagem: "Sala inexistente"
      });
    }

    const idTurma = turma.rows[0].idturma;

    await pool.query(
      `INSERT INTO classifica.professor_turma
       (id_professor, idturma)
       VALUES ($1, $2)`,
      [idProfessor, idTurma]
    );

    res.json({
      salaExistente: true,
      mensagem: "Professor vinculado à turma",
      idProfessor,
      idTurma,
      nomeTurma: turma.rows[0].nome
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao entrar na turma");
  }
});
// ===================== ENTRAR TURMA PROFESSOR =====================
app.get('/professor/:id/turma', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      `SELECT idturma
       FROM classifica.professor_turma
       WHERE id_professor = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.json({
        possuiTurma: false
      });
    }

    res.json({
      possuiTurma: true,
      id_turma: resultado.rows[0].idturma
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Erro ao buscar turma"
    });
  }
});
// ============ TURMA PROFESSORES ===================================
app.get('/turmasProfessor/:idProfessor', async (req, res) => {
  const idProfessor = Number(req.params.idProfessor);
  if (!idProfessor) return res.status(400).send('ID inválido');

  try {
    const { rows } = await pool.query(
      `SELECT t.idturma, t.codigo, t.nome
         FROM classifica.turma t
         JOIN classifica.professor_turma pt ON pt.idturma = t.idturma
        WHERE pt.id_professor = $1
        ORDER BY t.nome`,
      [idProfessor]
    );
    res.json(rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).send('Erro ao buscar turmas');
  }
});
// ================= BUSCANDO TURMAS ================================
app.get('/turma/:idTurma', async (req, res) => {
  const idTurma = Number(req.params.idTurma);
  const idProfessor = Number(req.query.idProfessor);
  if (!idTurma || !idProfessor) return res.status(400).send('ID inválido');

  try {
    const { rows } = await pool.query(
      `SELECT t.idturma,t.codigo, t.nome, p.especialidade
      FROM classifica.turma t
      JOIN classifica.professor_turma pt ON pt.idturma = t.idturma
      JOIN classifica.professor p ON p.id_professor = pt.id_professor
      WHERE t.idturma = $1 AND pt.id_professor = $2`,
      [idTurma, idProfessor]
    );
    if (rows.length === 0) return res.status(404).send('Turma não encontrada');
    res.json(rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).send('Erro ao buscar turma');
  }
});
// ============== PEGANDO ALUNOS DA TURMA ===========================
app.get('/alunosTurma/:idTurma', async (req, res) => {
  const idTurma = Number(req.params.idTurma);
  if (!idTurma) return res.status(400).send('ID inválido');

  try {
    const { rows } = await pool.query(
      'SELECT nome FROM classifica.estudante WHERE id_turma = $1 ORDER BY nome',
      [idTurma]
    );
    res.json(rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).send('Erro ao buscar alunos');
  }
});




// ===================== QUESTÕES DO DIAGNOSTICO ====================
app.get('/api/questoes', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 15;
    
    const resultado = await pool.query(
      `SELECT 
        id_enunciadodiag as id,
        enunciado,
        alternativa_a,
        alternativa_b,
        alternativa_c,
        alternativa_d,
        alternativa_correta
       FROM classifica.avaliacao_diagnostica 
       LIMIT $1`,
      [limite]
    );
    
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao buscar questões");
  }
});
// ===================== VERIFICAR SE ALUNO JÁ FEZ DIAGNÓSTICO ====================
app.get('/api/diagnostico/status/:id_estudante', async (req, res) => {
  const { id_estudante } = req.params;
  
  if (!id_estudante || id_estudante === 'undefined') {
    return res.status(400).json({ erro: 'ID do estudante não informado' });
  }

  try {
    const resultado = await pool.query(
      `SELECT COUNT(*) AS total
       FROM classifica.tentativa_diagnostico
       WHERE id_estudante = $1`,
      [id_estudante]
    );

    const jaFez = Number(resultado.rows[0].total) > 0;
    return res.json({ jaFez });
  } catch (erro) {
    console.error('Erro ao verificar diagnóstico:', erro);
    return res.status(500).send("Erro ao verificar diagnóstico");
  }
});
// ===================== SALVAR RESPOSTAS DO DIAGNÓSTICO ====================
app.post('/api/respostas', async (req, res) => {
    try {
        const { id_estudante, respostas } = req.body;
        // respostas é um array de objetos: [{ id_exercicio, resposta }]

        if (!id_estudante || !respostas || !Array.isArray(respostas)) {
            return res.status(400).send("Dados inválidos");
        }

        for (const item of respostas) {
            // Buscar a alternativa correta da questão diagnóstica
            const questao = await pool.query(
                `SELECT alternativa_correta FROM classifica.avaliacao_diagnostica WHERE id_enunciadodiag = $1`,
                [item.id_exercicio]   // usa o id da questão recebido do frontend
            );
            if (questao.rows.length === 0) continue;

            const correta = questao.rows[0].alternativa_correta;
            const correto = item.resposta.toLowerCase() === correta.toLowerCase();

           await pool.query(
    `INSERT INTO classifica.tentativa_diagnostico 
        (id_exercicio, resposta_marcada, correto, id_estudante, data_tentativa)
     VALUES ($1, $2, $3, $4, NOW())`,
    [item.id_exercicio, item.resposta, correto, id_estudante]
);
        }

        res.status(200).send("Respostas salvas com sucesso!");
    } catch (erro) {
        console.error("Erro ao salvar respostas:", erro);
        res.status(500).send("Erro ao salvar respostas no banco");
    }
});
app.put("/professor/:id_professor", async (req, res) => { // mudando dados
  
    console.log(req.params);
    console.log(req.body);

    const {id_professor} = req.params;   // pega o id 
    const { nome, email, cep, cpf, especialidade, data_nasc, senha} = req.body;
    try {
      await pool.query(
        `UPDATE classifica.professor
        SET nome = $1, email = $2, cep = $3, cpf = $4, especialidade = $5, data_nasc = $6, senha = $7
        WHERE id_professor = $8`,
        [nome, email, cep, cpf, especialidade, data_nasc, senha, id_professor]
      );
      res.status(200).send("Professor atualizado com sucesso");
    } catch (erro) {
        console.error(erro);
        res.status(500).send("Erro ao atualizar professor");
    }
});
// ===================== LISTAR BANCOS DE QUESTÕES DE UM PROFESSOR =====================
app.get('/listarBancos/:idProfessor', async (req, res) => {
  const { idProfessor } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT b.id, b.nome, b.disciplina,
              COUNT(bqe.exercicio_id)::int AS total_questoes
       FROM classifica.banco_questoes b
       LEFT JOIN classifica.banco_questoes_exercicios bqe ON bqe.banco_id = b.id
       WHERE b.professor_id = $1
       GROUP BY b.id, b.nome, b.disciplina
       ORDER BY b.id DESC`,
      [idProfessor]
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao listar bancos de questões");
  }
});
// ===================== CRIAR NOVO BANCO DE QUESTÕES =====================
app.post('/criarBanco', async (req, res) => {
  const { nome, disciplina, idProfessor } = req.body;
  try {
    const resultado = await pool.query(
      `INSERT INTO classifica.banco_questoes (nome, disciplina, professor_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [nome, disciplina, idProfessor]
    );
    res.json({ id: resultado.rows[0].id });
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao criar banco de questões");
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
// ===================== BUSCAR DADOS DE UM BANCO =====================
app.get('/buscarBanco/:bancoId', async (req, res) => {

  const { bancoId } = req.params;

  try {

    const resultado = await pool.query(
      `
      SELECT
        id,
        nome,
        disciplina
      FROM classifica.banco_questoes
      WHERE id = $1
      `,
      [bancoId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).send("Banco não encontrado");
    }

    res.json(resultado.rows[0]);

  } catch (erro) {

    console.error(erro);

    res.status(500).send(
      "Erro ao buscar banco"
    );
  }
});
// ===================== LISTAR EXERCÍCIOS DISPONÍVEIS PARA ADICIONAR =====================
app.get('/listarExerciciosDisponiveis/:bancoId', async (req, res) => {
  const { bancoId } = req.params;
  try {
    // 1. descobre a disciplina do banco
    const bancoResultado = await pool.query(
      `SELECT disciplina FROM classifica.banco_questoes WHERE id = $1`,
      [bancoId]
    );

    if (bancoResultado.rows.length === 0) {
      return res.status(404).send("Banco de questões não encontrado");
    }

    const disciplina = bancoResultado.rows[0].disciplina;

    // 2. lista só as questões da mesma área de conhecimento,
    //    que ainda não estão nesse banco
    const resultado = await pool.query(
      `SELECT e.id_exercicio AS id, e.enunciado, e.nivel_dificuldade AS tipo
       FROM classifica.exercicio e
       JOIN classifica.area_conhecimento a ON a.id_area = e.id_area
       WHERE TRIM(a.nome_area) ILIKE TRIM($1)
         AND e.id_exercicio NOT IN (
           SELECT exercicio_id FROM classifica.banco_questoes_exercicios WHERE banco_id = $2
         )
       ORDER BY e.id_exercicio`,
      [disciplina, bancoId]
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
      alternativa_correta, nivel_dificuldade, id_area, data_criada, criado_por,
      total_tentativas, total_acertos)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, 0, 0)
   RETURNING id_exercicio AS id`,
  [
    enunciado,
    alternativaA,
    alternativaB,
    alternativaC,
    alternativaD,
    alternativaCorreta,
    nivelDificuldade,
    idArea,
    criadoPor
  ]
);

    res.json({ id: resultado.rows[0].id });

  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao criar exercício");
  }
});
// ===================== LISTAR SIMULADOS DE UM PROFESSOR =====================
app.get('/listarSimulados/:professorId', async (req, res) => {
  const { professorId } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT s.id, s.nome, t.nome AS turma, s.data_criacao,
              COUNT(se.exercicio_id) AS total_questoes
       FROM classifica.simulado s
       LEFT JOIN classifica.simulado_exercicios se ON se.simulado_id = s.id
       LEFT JOIN classifica.turma t ON t.idturma = s.turma_id
       WHERE s.professor_id = $1 AND s.ativo = true
       GROUP BY s.id, t.nome
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
  const { nome, turmaId, professorId } = req.body;
  try {
    const resultado = await pool.query(
      `INSERT INTO classifica.simulado (nome, turma_id, professor_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [nome, turmaId, professorId]
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
// ===================== LISTAR ALUNOS DA TURMA =====================
app.get('/colegasTurma/:idEstudante', async (req, res) => {
  const { idEstudante } = req.params;

  try {

    const turmaResultado = await pool.query(
      `
      SELECT id_turma
      FROM classifica.estudante
      WHERE id_estudante = $1
      `,
      [idEstudante]
    );

    if (turmaResultado.rows.length === 0) {
      return res.json([]);
    }

    const idTurma =
      turmaResultado.rows[0].id_turma;

    const colegasResultado = await pool.query(
      `
      SELECT
        id_estudante,
        nome
      FROM classifica.estudante
      WHERE id_turma = $1
      AND id_estudante <> $2
      ORDER BY nome
      `,
      [idTurma, idEstudante]
    );

    res.json(colegasResultado.rows);

  } catch (erro) {
    console.error(erro);
    res.status(500).send(
      "Erro ao listar colegas"
    );
  }
});
// ===================== LISTAR TURMAS DE UM PROFESSOR =====================
app.get('/listarTurmasProfessor/:professorId', async (req, res) => {
  const { professorId } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT t.idturma AS id, t.nome AS nome, t.codigo
       FROM classifica.turma t
       JOIN classifica.professor_turma pt ON pt.idturma = t.idturma
       WHERE pt.id_professor = $1
       ORDER BY t.nome`,
      [professorId]
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao listar turmas do professor");
  }
});
// ===================== SIMULADOS DE UMA DISCIPLINA PARA O ALUNO =====================
app.get('/simuladosParaAluno/:idEstudante/:disciplina', async (req, res) => {
  const { idEstudante, disciplina } = req.params;

  try {
    // 1. descobre a turma do aluno
    const turmaResultado = await pool.query(
      `SELECT id_turma FROM classifica.estudante WHERE id_estudante = $1`,
      [idEstudante]
    );

    if (turmaResultado.rows.length === 0 || !turmaResultado.rows[0].id_turma) {
      return res.json([]);
    }

    const idTurma = turmaResultado.rows[0].id_turma;

    // 2. busca os simulados dessa turma, cujo professor leciona essa disciplina
    const resultado = await pool.query(
      `SELECT s.id, s.nome, s.data_criacao,
              COUNT(se.exercicio_id)::int AS total_questoes
       FROM classifica.simulado s
       JOIN classifica.professor p ON p.id_professor = s.professor_id
       LEFT JOIN classifica.simulado_exercicios se ON se.simulado_id = s.id
       WHERE s.turma_id = $1
         AND s.ativo = true
         AND TRIM(p.especialidade) ILIKE TRIM($2)
       GROUP BY s.id
       ORDER BY s.data_criacao DESC`,
      [idTurma, disciplina]
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao buscar simulados do aluno");
  }
});
// ===================== SALVAR RESPOSTAS DO SIMULADO ====================
app.post('/api/simulado/respostas', async (req, res) => {
    try {
        const { id_estudante, id_simulado, respostas } = req.body;
        // respostas é um array de objetos: [{ id_exercicio, resposta }]

        if (!id_estudante || !id_simulado || !respostas || !Array.isArray(respostas)) {
            return res.status(400).send("Dados inválidos");
        }

        for (const item of respostas) {
            // Busca a alternativa correta do exercício
            const questao = await pool.query(
                `SELECT alternativa_correta FROM classifica.exercicio WHERE id_exercicio = $1`,
                [item.id_exercicio]
            );
            if (questao.rows.length === 0) continue;

            const correta = questao.rows[0].alternativa_correta;
            const correto = item.resposta
                ? item.resposta.toLowerCase() === correta.toLowerCase()
                : false;

            await pool.query(
                `INSERT INTO classifica.tentativa
                    (id_estudante, id_exercicio, resposta_marcada, correto, data_tentativa, id_simulado)
                 VALUES ($1, $2, $3, $4, NOW(), $5)`,
                [id_estudante, item.id_exercicio, item.resposta, correto, id_simulado]
            );
        }

        res.status(200).send("Respostas do simulado salvas com sucesso!");
    } catch (erro) {
        console.error("Erro ao salvar respostas do simulado:", erro);
        res.status(500).send("Erro ao salvar respostas do simulado no banco");
    }
});
// ===================== VERIFICAR SE O ALUNO JÁ FEZ ESSE SIMULADO ====================
app.get('/api/simulado/status/:idEstudante/:idSimulado', async (req, res) => {
    const { idEstudante, idSimulado } = req.params;
    try {
        const resultado = await pool.query(
            `SELECT COUNT(*) AS total
             FROM classifica.tentativa
             WHERE id_estudante = $1 AND id_simulado = $2`,
            [idEstudante, idSimulado]
        );

        const jaFez = Number(resultado.rows[0].total) > 0;
        res.json({ jaFez });
    } catch (erro) {
        console.error('Erro ao verificar status do simulado:', erro);
        res.status(500).send("Erro ao verificar status do simulado");
    }
});
// ===================== BUSCAR RESPOSTAS QUE O ALUNO JÁ DEU NESSE SIMULADO ====================
app.get('/api/simulado/minhasRespostas/:idEstudante/:idSimulado', async (req, res) => {
    const { idEstudante, idSimulado } = req.params;
    try {
        const resultado = await pool.query(
            `SELECT
                e.id_exercicio AS id,
                e.enunciado,
                e.alternativa_a,
                e.alternativa_b,
                e.alternativa_c,
                e.alternativa_d,
                e.alternativa_correta,
                t.resposta_marcada,
                t.correto
             FROM classifica.tentativa t
             JOIN classifica.exercicio e ON e.id_exercicio = t.id_exercicio
             LEFT JOIN classifica.simulado_exercicios se
                ON se.exercicio_id = e.id_exercicio AND se.simulado_id = t.id_simulado
             WHERE t.id_estudante = $1 AND t.id_simulado = $2
             ORDER BY se.ordem NULLS LAST, t.id_tentativa`,
            [idEstudante, idSimulado]
        );

        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar respostas do aluno no simulado:', erro);
        res.status(500).send("Erro ao buscar respostas do aluno no simulado");
    }
});
// ===================== DESEMPENHO =====================
app.get('/api/desempenho/:id_estudante', async (req, res) => {
  const { id_estudante } = req.params;

  try {
    // Busca todas as tentativas do diagnóstico do aluno (usa o id do estudante logado)
    const resultado = await pool.query(
      `SELECT correto, id_exercicio
       FROM classifica.tentativa_diagnostico
       WHERE id_estudante = $1`,
      [id_estudante]
    );

    // ===== Calcula o índice da avaliação diagnóstica =====
    let diagnostico = { taxa: 0, respondidas: 0, classificacao: "Sem dados" };

    if (resultado.rows.length > 0) {
      const tentativas = resultado.rows;
      const totalGeral = tentativas.length;
      const acertosGeral = tentativas.filter(t => t.correto === true).length;
      const taxaGeral = Math.round((acertosGeral / totalGeral) * 100);

      let classificacao = 'Ruim';
      if (taxaGeral >= 80) classificacao = 'Excelente';
      else if (taxaGeral >= 60) classificacao = 'Bom';
      else if (taxaGeral >= 40) classificacao = 'Regular';

      diagnostico = { taxa: taxaGeral, respondidas: totalGeral, classificacao };
    }

    // ===== Calcula o índice do simulado =====
    // A funcionalidade de simulado (com correção de respostas) ainda não foi implementada,
    // ou seja, ainda não existe uma tabela de tentativas de simulado no banco.
    // Por enquanto retornamos "sem dados" para não travar a tela de desempenho.
    // Quando a tabela existir (ex: classifica.tentativa_simulado), basta repetir aqui
    // a mesma lógica usada acima para o diagnóstico, filtrando por id_estudante.
    let simulado = { taxa: 0, respondidas: 0, classificacao: "Sem dados" };

    // Mantém a estrutura "geral" (compatível com o que a tela já usava) e adiciona
    // os dois índices pedidos: diagnostico e simulado.
    const geral = diagnostico; // índice geral = índice do diagnóstico (única avaliação implementada até então)

    res.json({
      geral,
      diagnostico,
      simulado
    });

  } catch (erro) {
    console.error('Erro ao calcular desempenho:', erro);
    res.status(500).json({ erro: 'Erro ao buscar desempenho' });
  }
});
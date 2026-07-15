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


// ===================== LOGIN ALUNO =====================
app.post('/loginAluno', async (req, res) => {
  console.log("Dados recebidos no login", req.body);
  const {email, senha} = req.body;
  try {
    // Executa a busca no banco de dados para ver se o usuário existe
    const resultado = await pool.query(  
      `SELECT id_estudante FROM classifica.estudante WHERE email = $1 AND senha = $2`,
      [email, senha]
    ); 
    console.log("Resultado do banco:", resultado)
    const usuarioExiste = resultado.rows.length > 0; // Verifica se retornou algo

    if (usuarioExiste) {   
      res.json({  // envia um objeto com + informações
        usuarioExiste: true,
        mensagem: "Login realizado com sucesso!",
        idEstudante: resultado.rows[0].id_estudante   // envia o id do aluno para o LoginAluno
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

// ===================== CONFIG ALUNO =====================
app.get('/estudante/:id_estudante', async (req, res) => { // rota para buscar os dados de um professor pelo id
  const {id_estudante} = req.params;   // pega o id 

  try {
    const resultado = await pool.query(     // consulta os dados do professor no banco

      `SELECT id_estudante, nome, cpf, cep, data_nasc, email, senha
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

console.log("Rota PUT carregada");
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
// ===================== Delete Aluno =====================
app.put("/desativarAluno/:id_estudante", async (req, res) => {
  
  console.log("Rota desativar aluno chamada");

  const {id_estudante} = req.params;
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
      `SELECT id_professor FROM classifica.professor WHERE email = $1 AND senha = $2 AND ativo = true`,
      [email, senha]
    );

    const usuarioExiste = resultado.rows.length > 0; // Verifica se retornou algo
    if (usuarioExiste) { 
      res.json({  // envia um objeto com + informações
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

// ===================== CONFIG PROF =====================
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

console.log("Rota PUT carregada");
app.put("/professor/:id_professor", async (req, res) => {
  
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

// ===================== Delete PROF =====================
app.put("/desativarProfessor/:id_professor", async (req, res) => {
  
  console.log("Rota desativar professor chamada");

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
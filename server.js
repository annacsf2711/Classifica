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
      `SELECT EXISTS( 
          SELECT id FROM classifica.professor WHERE email = $1 AND senha = $2
      )`,
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



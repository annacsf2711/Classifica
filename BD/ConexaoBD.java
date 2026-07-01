package BD;

import Diagnostico.Questao;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ConexaoBD {
    // Configurações do banco 
    private static final String URL = "jdbc:postgresql://10.90.24.54:5432/classifica";
    private static final String USUARIO = "0081817";
    private static final String SENHA = "aula";
    
    private Connection connection;
    
   public ConexaoBD() {
        try {
            // Carrega o driver JDBC do PostgreSQL
            Class.forName("postgresql-42.7.11.jar");
            System.out.println("Driver PostgreSQL carregado com sucesso!");
        } catch (ClassNotFoundException e) {
            System.err.println("Erro ao carregar driver PostgreSQL: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Método para conectar ao banco
    private Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(URL, USUARIO, SENHA);
            System.out.println("Conexão com PostgreSQL estabelecida!");
        }
        return connection;
    }
    
    // Método principal - busca todas as questões com suas opções
    public List<Questao> getAll() {
        List<Questao> questoes = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmtQuestoes = null;
        PreparedStatement stmtOpcoes = null;
        ResultSet rsQuestoes = null;
        ResultSet rsOpcoes = null;
        
        try {
            conn = getConnection();
            
            // Busca todas as questões (adapte os nomes das colunas conforme sua tabela)
            String sqlQuestoes = "SELECT id, titulo, gabarito FROM questoes ORDER BY id";
            stmtQuestoes = conn.prepareStatement(sqlQuestoes);
            rsQuestoes = stmtQuestoes.executeQuery();
            
            // Para cada questão, busca suas opções
            while (rsQuestoes.next()) {
                int id = rsQuestoes.getInt("id");
                String titulo = rsQuestoes.getString("titulo");
                int gabarito = rsQuestoes.getInt("gabarito");
                
                // Busca as opções desta questão
                String sqlOpcoes = "SELECT texto FROM opcoes WHERE questao_id = ? ORDER BY ordem";
                stmtOpcoes = conn.prepareStatement(sqlOpcoes);
                stmtOpcoes.setInt(1, id);
                rsOpcoes = stmtOpcoes.executeQuery();
                
                List<String> opcoes = new ArrayList<>();
                while (rsOpcoes.next()) {
                    opcoes.add(rsOpcoes.getString("texto"));
                }
                
                // Cria o objeto Questao
                Questao questao = new Questao(id, titulo, opcoes, gabarito);
                questoes.add(questao);
            }
            
            System.out.println("Total de questões carregadas: " + questoes.size());
            
        } catch (SQLException e) {
            System.err.println("Erro ao buscar questões: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Fecha todos os recursos
            fecharRecursos(rsOpcoes, stmtOpcoes, null);
            fecharRecursos(rsQuestoes, stmtQuestoes, conn);
        }
        
        return questoes;
    }
    
    // Método auxiliar para fechar recursos
    private void fecharRecursos(ResultSet rs, Statement stmt, Connection conn) {
        try {
            if (rs != null) rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        try {
            if (stmt != null) stmt.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        try {
            if (conn != null) conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    
    // Método para testar a conexão
    public boolean testarConexao() {
        try {
            Connection conn = getConnection();
            if (conn != null && !conn.isClosed()) {
                System.out.println("Conexão testada com sucesso!");
                
                // Testa se as tabelas existem
                DatabaseMetaData meta = conn.getMetaData();
                ResultSet tabelas = meta.getTables(null, null, "questoes", null);
                if (tabelas.next()) {
                    System.out.println("Tabela 'questoes' encontrada!");
                } else {
                    System.err.println("Tabela 'questoes' NÃO encontrada!");
                }
                
                ResultSet tabelasOpcoes = meta.getTables(null, null, "opcoes", null);
                if (tabelasOpcoes.next()) {
                    System.out.println("Tabela 'opcoes' encontrada!");
                } else {
                    System.err.println("Tabela 'opcoes' NÃO encontrada!");
                }
                
                conn.close();
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Erro ao testar conexão: " + e.getMessage());
        }
        return false;
    }
    
    // Método main para teste
    public static void main(String[] args) {
        ConexaoBD bd = new ConexaoBD();
        
        // Testa conexão
        if (bd.testarConexao()) {
            System.out.println("\n=== Testando carregamento de questões ===");
            List<Questao> questoes = bd.getAll();
            
            for (Questao q : questoes) {
                System.out.println("\nQuestão " + q.getId() + ": " + q.getTexto());
                System.out.println("Opções:");
                for (int i = 0; i < q.getOpcoes().size(); i++) {
                    System.out.println("  " + i + ": " + q.getOpcoes().get(i));
                }
                System.out.println("Gabarito: " + q.getGabarito());
            }
        }
    }
}
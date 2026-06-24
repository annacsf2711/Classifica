import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class ConexaoBD {
    public static void main(String[] args) {
        String url = "jdbc:mysql://10.90.24.54:5432/classifica"; // nome do banco
        String usuario = "0081817"; // usuário 
        String senha = "aula";   // senha 
        try {
            // Criar conexão
            Connection conexao = DriverManager.getConnection(url, usuario, senha);
            System.out.println("Conexão realizada com sucesso!");

            // Exemplo de consulta
            String sql = "SELECT * FROM questoes";
            PreparedStatement consulta = conexao.prepareStatement(sql);
            ResultSet resultado = consulta.executeQuery();

            while (resultado.next()) {
                System.out.println("Questão: " + resultado.getString("titulo"));
            }

            // Fechar conexão
            resultado.close();
            consulta.close();
            conexao.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

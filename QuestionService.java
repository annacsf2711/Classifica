import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Serviço simples que fornece perguntas em memória.
 * Em produção esse serviço poderá buscar de um banco de dados.
 */
public class QuestionService {
    private final List<Question> questions = new ArrayList<>();

    public QuestionService() {
        loadSampleQuestions();
    }

    // Carrega algumas perguntas de exemplo (simula um banco de dados)
    private void loadSampleQuestions() {
        questions.add(new Question(1,
                "Qual é a capital do Brasil?",
                Arrays.asList("São Paulo", "Brasília.", "Rio de Janeiro", "Salvador. "),
                1)); // Brasília

        questions.add(new Question(2,
                "Quanto é 2 + 2?",
                Arrays.asList("3", "4", "5", "22"),
                1)); // 4
    }

    // Retorna lista imutável para evitar modificações externas diretas
    public List<Question> getAll() {
        return Collections.unmodifiableList(questions);
    }

    // Método de conveniência para adicionar pergunta (útil para evolução)
    public void addQuestion(Question q) {
        questions.add(q);
    }
}

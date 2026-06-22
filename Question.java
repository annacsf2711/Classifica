import java.util.List;

/**
 * Modelo simples de uma pergunta de múltipla escolha.
 * Mantemos campos mínimos para facilitar serialização/futuras persistências.
 */
public class Question {
    private final int id;
    private final String text;
    private final List<String> options;
    private final int correctIndex;

    // Construtor
    public Question(int id, String text, List<String> options, int correctIndex) {
        this.id = id;
        this.text = text;
        this.options = options;
        this.correctIndex = correctIndex;
    }

    // Getters
    public int getId() { return id; }
    public String getText() { return text; }
    public List<String> getOptions() { return options; }
    public int getCorrectIndex() { return correctIndex; }
}

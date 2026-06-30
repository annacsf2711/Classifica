package Diagnostico;
import java.util.List;

public class Questao {
    private final int id;
    private final String texto;
    private final List<String> opcoes;
    private final int gabarito;

    // Construtor
    public Questao(int id, String text, List<String> options, int correctIndex) {
        this.id = id;
        this.texto = text;
        this.opcoes = options;
        this.gabarito = correctIndex;
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getTexto() {
        return texto;
    }

    public List<String> getOpcoes() {
        return opcoes;
    }

    public int getGabarito() {
        return gabarito;
    }
}

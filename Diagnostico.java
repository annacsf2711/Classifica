import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Entry point: servidor HTTP simples que serve a interface HTML
 * e processa submissões de respostas. Mantido propositalmente
 * simples para facilitar evolução futura (banco de dados, templates).
 */
public class Diagnostico {

	public static void main(String[] args) throws Exception {
		QuestionService service = new QuestionService();

		// Cria servidor embutido na porta 8000
		HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);

		// Contexto raiz: serve o arquivo estático web/index.html se existir
		server.createContext("/", exchange -> {
			if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
				Path index = Paths.get("web", "index.html");
				if (Files.exists(index)) {
					byte[] bytes = Files.readAllBytes(index);
					exchange.getResponseHeaders().set("Content-Type", "text/html; charset=utf-8");
					exchange.sendResponseHeaders(200, bytes.length);
					try (OutputStream os = exchange.getResponseBody()) {
						os.write(bytes);
					}
				} else {
					// fallback: gera formulário dinamicamente
					String html = renderForm(service.getAll());
					sendResponse(exchange, 200, html);
				}
			} else {
				exchange.sendResponseHeaders(405, -1);
			}
		});

		// Endpoint de submissão tradicional (retorna HTML)
		server.createContext("/submit", exchange -> {
			if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
				String body = readStream(exchange.getRequestBody());
				Map<String, String> params = parseForm(body);
				String resultHtml = renderResult(service.getAll(), params);
				sendResponse(exchange, 200, resultHtml);
			} else {
				exchange.sendResponseHeaders(405, -1);
			}
		});

		// API: retorna perguntas em JSON (sem revelar resposta correta)
		server.createContext("/api/questions", exchange -> {
			if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
				String json = questionsToJson(service.getAll());
				exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
				sendResponse(exchange, 200, json);
			} else {
				exchange.sendResponseHeaders(405, -1);
			}
		});

		// API: recebe respostas via form-urlencoded e retorna JSON com pontuação
		server.createContext("/api/submit", exchange -> {
			if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
				String body = readStream(exchange.getRequestBody());
				Map<String, String> params = parseForm(body);
				String json = computeResultJson(service.getAll(), params);
				exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
				sendResponse(exchange, 200, json);
			} else {
				exchange.sendResponseHeaders(405, -1);
			}
		});

		server.setExecutor(null);
		server.start();
		System.out.println("Servidor iniciado: http://localhost:8000/");
	}

	// Gera HTML do formulário a partir das perguntas
	private static String renderForm(List<Question> questions) {
		StringBuilder sb = new StringBuilder();
		sb.append("<!doctype html><html><head><meta charset=\"utf-8\"><title>Avaliação Diagnóstica</title>")
				.append("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body>")
				.append("<h1>Avaliação Diagnóstica - Exemplo</h1>")
				.append("<form method=\"post\" action=\"/submit\">");

		for (Question q : questions) {
			sb.append("<fieldset>");
			sb.append("<legend>").append(escape(q.getText())).append("</legend>");
			List<String> opts = q.getOptions();
			for (int i = 0; i < opts.size(); i++) {
				String name = "q" + q.getId();
				String value = String.valueOf(i);
				sb.append("<label>");
				sb.append("<input type=\"radio\" name=\"" + name + "\" value=\"" + value + "\" required>");
				sb.append(escape(opts.get(i)));
				sb.append("</label><br>");
			}
			sb.append("</fieldset><br>");
		}

		sb.append("<button type=\"submit\">Enviar</button>");
		sb.append("</form>");
		sb.append("</body></html>");
		return sb.toString();
	}

	// Gera HTML com resultados básicos (pontuação)
	private static String renderResult(List<Question> questions, Map<String, String> params) {
		int correct = 0;
		StringBuilder sb = new StringBuilder();
		sb.append("<!doctype html><html><head><meta charset=\"utf-8\"><title>Resultado</title></head><body>")
				.append("<h1>Resultado</h1>")
				.append("<ul>");

		for (Question q : questions) {
			String key = "q" + q.getId();
			String answer = params.getOrDefault(key, "");
			int ansIndex = -1;
			try { ansIndex = Integer.parseInt(answer); } catch (Exception ignored) {}
			boolean isCorrect = ansIndex == q.getCorrectIndex();
			if (isCorrect) correct++;
			sb.append("<li>");
			sb.append(escape(q.getText()));
			sb.append(" - Sua resposta: ");
			if (ansIndex >= 0 && ansIndex < q.getOptions().size()) {
				sb.append(escape(q.getOptions().get(ansIndex)));
			} else {
				sb.append("(não respondida)");
			}
			sb.append(isCorrect ? " <strong>(correta)</strong>" : " <em>(incorreta)</em>");
			sb.append("</li>");
		}

		sb.append("</ul>");
		sb.append("<p>Pontuação: " + correct + " / " + questions.size() + "</p>");
		sb.append("<p><a href=\"/\">Fazer novamente</a></p>");
		sb.append("</body></html>");
		return sb.toString();
	}

	// Converte lista de perguntas para JSON (não inclui índice correto)
	private static String questionsToJson(List<Question> questions) {
		StringBuilder sb = new StringBuilder();
		sb.append("[");
		boolean firstQ = true;
		for (Question q : questions) {
			if (!firstQ) sb.append(",");
			firstQ = false;
			sb.append("{");
			sb.append("\"id\":").append(q.getId()).append(",");
			sb.append("\"text\":\"").append(jsonEscape(q.getText())).append("\",");
			sb.append("\"options\":[");
			boolean first = true;
			for (String o : q.getOptions()) {
				if (!first) sb.append(",");
				first = false;
				sb.append("\"").append(jsonEscape(o)).append("\"");
			}
			sb.append("]");
			sb.append("}");
		}
		sb.append("]");
		return sb.toString();
	}

	// Calcula resultado com base em parâmetros (form-urlencoded) e retorna JSON
	private static String computeResultJson(List<Question> questions, Map<String, String> params) {
		int correct = 0;
		StringBuilder details = new StringBuilder();
		details.append("[");
		boolean first = true;
		for (Question q : questions) {
			String key = "q" + q.getId();
			String answer = params.getOrDefault(key, "");
			int ansIndex = -1;
			try { ansIndex = Integer.parseInt(answer); } catch (Exception ignored) {}
			boolean isCorrect = ansIndex == q.getCorrectIndex();
			if (isCorrect) correct++;
			if (!first) details.append(",");
			first = false;
			details.append("{");
			details.append("\"id\":").append(q.getId()).append(",");
			details.append("\"question\":\"").append(jsonEscape(q.getText())).append("\",");
			details.append("\"selected\":").append(ansIndex).append(",");
			details.append("\"selectedText\":\"");
			if (ansIndex >= 0 && ansIndex < q.getOptions().size()) details.append(jsonEscape(q.getOptions().get(ansIndex)));
			details.append("\",");
			details.append("\"correctIndex\":").append(q.getCorrectIndex()).append(",");
			details.append("\"correctText\":\"").append(jsonEscape(q.getOptions().get(q.getCorrectIndex()))).append("\",");
			details.append("\"correct\":").append(isCorrect);
			details.append("}");
		}
		details.append("]");

		StringBuilder out = new StringBuilder();
		out.append("{");
		out.append("\"score\":").append(correct).append(",");
		out.append("\"total\":").append(questions.size()).append(",");
		out.append("\"details\":").append(details.toString());
		out.append("}");
		return out.toString();
	}

	// Escape para JSON simples
	private static String jsonEscape(String s) {
		if (s == null) return "";
		return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
	}

	// Envia resposta HTTP simples
	private static void sendResponse(HttpExchange exchange, int statusCode, String body) throws IOException {
		byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
		exchange.getResponseHeaders().set("Content-Type", "text/html; charset=utf-8");
		exchange.sendResponseHeaders(statusCode, bytes.length);
		try (OutputStream os = exchange.getResponseBody()) {
			os.write(bytes);
		}
	}

	// Lê InputStream para string
	private static String readStream(InputStream is) throws IOException {
		byte[] bytes = is.readAllBytes();
		return new String(bytes, StandardCharsets.UTF_8);
	}

	// Parse simples de form-urlencoded (body)
	private static Map<String, String> parseForm(String body) throws IOException {
		Map<String, String> map = new HashMap<>();
		if (body == null || body.isEmpty()) return map;
		String[] pairs = body.split("&");
		for (String p : pairs) {
			int idx = p.indexOf('=');
			if (idx >= 0) {
				String k = URLDecoder.decode(p.substring(0, idx), StandardCharsets.UTF_8);
				String v = URLDecoder.decode(p.substring(idx + 1), StandardCharsets.UTF_8);
				map.put(k, v);
			}
		}
		return map;
	}

	// Escapa HTML básico
	private static String escape(String s) {
		if (s == null) return "";
		return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
				.replace("\"", "&quot;").replace("'", "&#x27;");
	}
}

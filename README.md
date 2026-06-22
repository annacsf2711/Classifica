# Avaliação Diagnóstica - Exemplo Java (simples)

Projeto mínimo em Java que expõe uma interface básica para uma avaliação diagnóstica.

Como executar (Java 11+):

1. Abra terminal na pasta do projeto (onde estão os arquivos .java).
2. Compile:

```bash
javac *.java
```

3. Execute:

```bash
java Diagnostico
```

4. Abra no navegador: http://localhost:8000/

Notas de arquitetura e evolução:

- O projeto usa um `QuestionService` em memória. Para evoluir, substitua ou complemente esse serviço
  para buscar perguntas de um banco de dados (JDBC, JPA, etc.).
- O servidor é `com.sun.net.httpserver.HttpServer` (sem frameworks) para manter a simplicidade. Pode-se
  migrar para um micro-framework como Spark, Javalin ou Spring Boot quando for necessário maior
  escalabilidade e funcionalidade.
- Para separar camadas e permitir testes, converta a geração de HTML em templates (ex.: Thymeleaf,
  FreeMarker) ou use um frontend separado que consuma APIs REST.

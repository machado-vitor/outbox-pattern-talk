# Apresentação: outbox com relay, JDBC Source e Debezium

`outbox-pattern.html` é a apresentação: 10 minutos, em inglês, para devs. É um único arquivo que abre
offline em qualquer navegador (duplo clique), sem servidor.

- 9 slides de fala (cerca de 8:45 a 140 palavras por minuto), com o roteiro e o tempo de cada slide nas notas.
- 8 slides de backup depois do "Thank you" para perguntas: DDL da outbox, loop do relay, configurações do
  producer, como escalar o relay, dedupe no consumidor, config do Debezium, monitoramento do slot e do
  binlog, expurgo. Os que não vêm das POCs dizem "illustrative, not from the POCs".
- Código com cores do VS Code (tema Light+); amarelo marca o que comentar, vermelho marca a armadilha.

Teclas: → ou espaço avança, ← volta, F tela cheia, N mostra as notas, P abre o modo apresentador numa
segunda janela sincronizada, com cronômetro e o roteiro.

## Editar

A fonte é `html/outbox-pattern.src.html`. Num bloco `<pre data-lang="java|sql|json">`, envolva o trecho a
comentar em `⟦…⟧` (amarelo) ou `⟦!…⟧` (vermelho). Depois:

```sh
npm install      # na 1ª vez: npx playwright install chromium
npm run build    # colore o código com Shiki, renderiza os diagramas mermaid e regrava outbox-pattern.html
```

Todo trecho citado com `arquivo:linhas` foi copiado das POCs sem alteração. A análise por trás de cada slide
está em `../reports/Comparativo outbox relay JDBC Debezium.md`, e as notas com fontes em `../research_notes/`.

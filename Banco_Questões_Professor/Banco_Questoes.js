async function carregarBancos() {
  const resposta = await fetch(`${API_URL}/listarBancos/${professorId}`);
  const bancos = await resposta.json();

  const container = document.querySelector('.lista-bancos'); // ajustar seletor real
  container.innerHTML = '';

  bancos.forEach(banco => {
    const card = document.createElement('div');
    card.classList.add('card-banco');
    card.innerHTML = `
      <h3>${banco.nome}</h3>
      <span>${banco.total_questoes} questões · Disciplina: ${banco.disciplina}</span>
      <a href="Tela_Meu_Banco.html?bancoId=${banco.id}" class="btn">Abrir</a>
    `;
    container.appendChild(card);
  });
}
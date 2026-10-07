/**
 * Interface de Demonstração - Fortnite AP1 (Vanilla JS)
 * Contexto: Apenas dados fictícios locais em memória.
 * NENHUMA CONEXÃO COM O BACKEND / API É REALIZADA.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Dados fictícios locais simulados (Mock)
  let itensMock = [
    { id: 1, nome: "Picareta de Batalha", tipo: "Ferramenta", disponivel: true },
    { id: 2, nome: "Escudo Potente", tipo: "Consumível", disponivel: true },
    { id: 3, nome: "Rifle de Assalto Lendário (SCAR)", tipo: "Arma", disponivel: true },
    { id: 4, nome: "Espingarda Pump Épica", tipo: "Arma", disponivel: false },
    { id: 5, nome: "Asa-Delta Tubarão Laser", tipo: "Cosmético", disponivel: true }
  ];

  // Elementos do DOM
  const form = document.getElementById("item-form");
  const inputId = document.getElementById("item-id");
  const inputNome = document.getElementById("item-nome");
  const selectTipo = document.getElementById("item-tipo");
  const checkboxDisponivel = document.getElementById("item-disponivel");
  const btnSalvar = document.getElementById("btn-salvar");
  const btnSalvarTexto = document.getElementById("btn-salvar-texto");
  const btnCancelar = document.getElementById("btn-cancelar");
  const modoBadge = document.getElementById("modo-operacao");
  const filtroBusca = document.getElementById("filtro-busca");
  const tbody = document.getElementById("itens-tbody");
  const emptyState = document.getElementById("empty-state");
  const totalItensEl = document.getElementById("total-itens");
  const totalDisponiveisEl = document.getElementById("total-disponiveis");
  const statusMsgEl = document.getElementById("mensagem-status");

  // Modal de Detalhes
  const modalDetalhes = document.getElementById("modal-detalhes");
  const modalCorpo = document.getElementById("modal-corpo");
  const btnFecharModal = document.getElementById("btn-fechar-modal");
  const btnModalOk = document.getElementById("btn-modal-ok");

  let timeoutMensagem = null;

  /**
   * Exibe mensagens de feedback para o usuário
   */
  function exibirMensagem(texto, tipo = "success") {
    clearTimeout(timeoutMensagem);
    statusMsgEl.textContent = texto;
    statusMsgEl.className = `status-message ${tipo}`;

    timeoutMensagem = setTimeout(() => {
      statusMsgEl.className = "status-message hidden";
      statusMsgEl.textContent = "";
    }, 4000);
  }

  /**
   * Atualiza contadores de itens
   */
  function atualizarEstatisticas() {
    const total = itensMock.length;
    const disponiveis = itensMock.filter(i => i.disponivel).length;

    totalItensEl.textContent = total;
    totalDisponiveisEl.textContent = disponiveis;
  }

  /**
   * Renderiza a tabela de itens filtrada ou completa
   */
  function renderizarTabela() {
    const termo = (filtroBusca.value || "").toLowerCase().trim();

    const itensFiltrados = itensMock.filter(item => 
      item.nome.toLowerCase().includes(termo) ||
      item.tipo.toLowerCase().includes(termo)
    );

    tbody.innerHTML = "";

    if (itensFiltrados.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");

      itensFiltrados.forEach(item => {
        const tr = document.createElement("tr");

        // Coluna ID
        const tdId = document.createElement("td");
        tdId.textContent = `#${item.id}`;
        tr.appendChild(tdId);

        // Coluna Nome
        const tdNome = document.createElement("td");
        tdNome.textContent = item.nome;
        tdNome.style.fontWeight = "600";
        tr.appendChild(tdNome);

        // Coluna Tipo
        const tdTipo = document.createElement("td");
        const badgeTipo = document.createElement("span");
        badgeTipo.className = "item-badge-tipo";
        badgeTipo.textContent = item.tipo;
        tdTipo.appendChild(badgeTipo);
        tr.appendChild(tdTipo);

        // Coluna Disponibilidade
        const tdDisp = document.createElement("td");
        const statusSpan = document.createElement("span");
        statusSpan.className = `item-status ${item.disponivel ? "badge-disponivel" : "badge-indisponivel"}`;
        statusSpan.textContent = item.disponivel ? "✔ Disponível" : "✖ Indisponível";
        tdDisp.appendChild(statusSpan);
        tr.appendChild(tdDisp);

        // Coluna Ações
        const tdAcoes = document.createElement("td");
        tdAcoes.className = "acoes-cell";

        // Botão Visualizar
        const btnView = document.createElement("button");
        btnView.type = "button";
        btnView.className = "btn btn-table btn-view";
        btnView.textContent = "Ver";
        btnView.setAttribute("aria-label", `Visualizar detalhes de ${item.nome}`);
        btnView.addEventListener("click", () => abrirModalDetalhes(item.id));
        tdAcoes.appendChild(btnView);

        // Botão Editar
        const btnEdit = document.createElement("button");
        btnEdit.type = "button";
        btnEdit.className = "btn btn-table btn-edit";
        btnEdit.textContent = "Editar";
        btnEdit.setAttribute("aria-label", `Editar item ${item.nome}`);
        btnEdit.addEventListener("click", () => carregarParaEdicao(item.id));
        tdAcoes.appendChild(btnEdit);

        // Botão Excluir
        const btnDel = document.createElement("button");
        btnDel.type = "button";
        btnDel.className = "btn btn-table btn-delete";
        btnDel.textContent = "Excluir";
        btnDel.setAttribute("aria-label", `Excluir item ${item.nome}`);
        btnDel.addEventListener("click", () => deletarItem(item.id, item.nome));
        tdAcoes.appendChild(btnDel);

        tr.appendChild(tdAcoes);
        tbody.appendChild(tr);
      });
    }

    atualizarEstatisticas();
  }

  /**
   * Carrega um item no formulário para edição
   */
  function carregarParaEdicao(id) {
    const item = itensMock.find(i => i.id === id);
    if (!item) {
      exibirMensagem("Item não encontrado nos dados locais.", "danger");
      return;
    }

    inputId.value = item.id;
    inputNome.value = item.nome;
    selectTipo.value = item.tipo;
    checkboxDisponivel.checked = Boolean(item.disponivel);

    modoBadge.textContent = `Editando #${item.id}`;
    modoBadge.classList.add("edicao");
    btnSalvarTexto.textContent = "Salvar Alterações";
    btnCancelar.textContent = "Cancelar Edição";

    inputNome.focus();
    exibirMensagem(`Item "${item.nome}" carregado no formulário para edição.`, "info");
  }

  /**
   * Reseta o formulário para inclusão de novo item
   */
  function resetarFormulario() {
    form.reset();
    inputId.value = "";
    checkboxDisponivel.checked = true;

    modoBadge.textContent = "Novo Item";
    modoBadge.classList.remove("edicao");
    btnSalvarTexto.textContent = "Adicionar Item";
    btnCancelar.textContent = "Limpar Campos";
  }

  /**
   * Salva o item (criação ou edição simulada)
   */
  function salvarItem(e) {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const tipo = selectTipo.value.trim();
    const disponivel = checkboxDisponivel.checked;
    const idAtual = inputId.value ? parseInt(inputId.value, 10) : null;

    // Validação básica
    if (!nome) {
      exibirMensagem("Por favor, preencha o nome do item.", "danger");
      inputNome.focus();
      return;
    }

    if (!tipo) {
      exibirMensagem("Por favor, selecione um tipo válido.", "danger");
      selectTipo.focus();
      return;
    }

    if (idAtual) {
      // Atualização
      const index = itensMock.findIndex(i => i.id === idAtual);
      if (index !== -1) {
        itensMock[index] = { id: idAtual, nome, tipo, disponivel };
        exibirMensagem(`Item "${nome}" atualizado com sucesso no inventário de demonstração!`, "success");
      } else {
        exibirMensagem("Não foi possível localizar o item para atualização.", "danger");
      }
    } else {
      // Inclusão com ID sequencial simulado
      const proximoId = itensMock.length > 0 ? Math.max(...itensMock.map(i => i.id)) + 1 : 1;
      const novoItem = { id: proximoId, nome, tipo, disponivel };
      itensMock.push(novoItem);
      exibirMensagem(`Item "${nome}" adicionado com sucesso ao inventário de demonstração!`, "success");
    }

    resetarFormulario();
    renderizarTabela();
  }

  /**
   * Remove um item da lista simulada
   */
  function deletarItem(id, nome) {
    const confirmacao = window.confirm(`Deseja realmente remover o item "${nome}" (ID: ${id}) da demonstração?`);
    if (!confirmacao) return;

    const tamanhoInicial = itensMock.length;
    itensMock = itensMock.filter(i => i.id !== id);

    if (itensMock.length < tamanhoInicial) {
      // Se estava editando o item excluído, reseta o formulário
      if (inputId.value === String(id)) {
        resetarFormulario();
      }
      exibirMensagem(`Item "${nome}" removido do inventário de teste.`, "danger");
      renderizarTabela();
    }
  }

  /**
   * Abre a janela modal com detalhes do item
   */
  function abrirModalDetalhes(id) {
    const item = itensMock.find(i => i.id === id);
    if (!item) return;

    modalCorpo.innerHTML = `
      <div class="modal-detail-row">
        <span class="modal-label">ID do Item:</span>
        <span class="modal-value">#${item.id}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-label">Nome:</span>
        <span class="modal-value">${item.nome}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-label">Tipo:</span>
        <span class="modal-value">${item.tipo}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-label">Disponibilidade:</span>
        <span class="modal-value" style="color: ${item.disponivel ? 'var(--status-success)' : 'var(--text-muted)'}; font-weight: bold;">
          ${item.disponivel ? "Disponível para uso" : "Indisponível / No Cofre"}
        </span>
      </div>
      <div class="modal-detail-row" style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-dim);">
        <small>Registro puramente demonstrativo em memória local.</small>
      </div>
    `;

    modalDetalhes.classList.remove("hidden");
    btnModalOk.focus();
  }

  /**
   * Fecha a janela modal
   */
  function fecharModalDetalhes() {
    modalDetalhes.classList.add("hidden");
  }

  // Event Listeners
  form.addEventListener("submit", salvarItem);
  btnCancelar.addEventListener("click", resetarFormulario);
  filtroBusca.addEventListener("input", renderizarTabela);

  btnFecharModal.addEventListener("click", fecharModalDetalhes);
  btnModalOk.addEventListener("click", fecharModalDetalhes);

  // Fechar modal ao clicar fora ou pressionar ESC
  modalDetalhes.addEventListener("click", (e) => {
    if (e.target === modalDetalhes) fecharModalDetalhes();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalDetalhes.classList.contains("hidden")) {
      fecharModalDetalhes();
    }
  });

  // Inicialização
  renderizarTabela();
});

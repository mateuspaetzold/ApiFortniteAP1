/**
 * Interface do Inventário - Fortnite AP1 (Vanilla JS)
 * Integração completa com a API backend (/api/itens).
 */

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "/api/itens";
  let itens = [];

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
   * Extrai a mensagem de erro retornada pela API ou usa uma mensagem padrão
   */
  async function extrairMensagemErro(response, mensagemPadrao) {
    try {
      const erroJson = await response.json();
      if (erroJson && erroJson.mensagem) {
        return erroJson.mensagem;
      }
    } catch (_) {
      // Caso a resposta não seja JSON válido
    }
    return mensagemPadrao || `Erro na requisição (Status: ${response.status})`;
  }

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
   * Atualiza contadores de itens na interface
   */
  function atualizarEstatisticas() {
    const total = itens.length;
    const disponiveis = itens.filter(i => i.disponivel).length;

    totalItensEl.textContent = String(total);
    totalDisponiveisEl.textContent = String(disponiveis);
  }

  /**
   * Renderiza a tabela de itens filtrada ou completa usando textContent
   */
  function renderizarTabela() {
    const termo = (filtroBusca.value || "").toLowerCase().trim();

    const itensFiltrados = itens.filter(item => 
      (item.nome && item.nome.toLowerCase().includes(termo)) ||
      (item.tipo && item.tipo.toLowerCase().includes(termo))
    );

    // Limpeza segura sem innerHTML
    tbody.textContent = "";

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
   * 1. GET - Busca todos os itens na API
   */
  async function listarItens() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const msg = await extrairMensagemErro(response, "Erro ao carregar itens da API.");
        throw new Error(msg);
      }
      itens = await response.json();
      renderizarTabela();
    } catch (error) {
      exibirMensagem(error.message || "Falha na conexão com a API.", "danger");
    }
  }

  /**
   * 2. GET - Busca item por ID e preenche o formulário para edição
   */
  async function carregarParaEdicao(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        const msg = await extrairMensagemErro(response, "Item não encontrado na API.");
        throw new Error(msg);
      }

      const item = await response.json();

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
    } catch (error) {
      exibirMensagem(error.message || "Erro ao carregar item para edição.", "danger");
    }
  }

  /**
   * Reseta o formulário para criação de novo item
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
   * 3. POST / 4. PUT - Salva o item (criação ou edição) na API
   */
  async function salvarItem(e) {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const tipo = selectTipo.value.trim();
    const disponivel = checkboxDisponivel.checked;
    const idAtual = inputId.value ? parseInt(inputId.value, 10) : null;

    // Validação local no frontend
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

    const payload = { nome, tipo, disponivel };

    try {
      if (idAtual) {
        // PUT /api/itens/{id}
        const response = await fetch(`${API_URL}/${idAtual}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const msg = await extrairMensagemErro(response, "Erro ao atualizar item.");
          throw new Error(msg);
        }

        const itemAtualizado = await response.json();
        exibirMensagem(`Item "${itemAtualizado.nome}" atualizado com sucesso!`, "success");
      } else {
        // POST /api/itens
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const msg = await extrairMensagemErro(response, "Erro ao criar item.");
          throw new Error(msg);
        }

        const itemCriado = await response.json();
        exibirMensagem(`Item "${itemCriado.nome}" criado com sucesso!`, "success");
      }

      resetarFormulario();
      await listarItens();
    } catch (error) {
      exibirMensagem(error.message || "Falha ao salvar o item.", "danger");
    }
  }

  /**
   * 5. DELETE - Remove um item da API
   */
  async function deletarItem(id, nome) {
    const confirmacao = window.confirm(`Deseja realmente excluir o item "${nome}" (ID: ${id})?`);
    if (!confirmacao) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const msg = await extrairMensagemErro(response, "Erro ao excluir o item.");
        throw new Error(msg);
      }

      // Se estava editando o item excluído, reseta o formulário
      if (inputId.value === String(id)) {
        resetarFormulario();
      }

      exibirMensagem(`Item "${nome}" excluído com sucesso!`, "success");
      await listarItens();
    } catch (error) {
      exibirMensagem(error.message || "Falha ao excluir o item.", "danger");
    }
  }

  /**
   * Abre a janela modal com detalhes do item obtidos da API (sem innerHTML)
   */
  async function abrirModalDetalhes(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        const msg = await extrairMensagemErro(response, "Item não encontrado.");
        throw new Error(msg);
      }

      const item = await response.json();

      // Limpeza segura sem innerHTML
      modalCorpo.textContent = "";

      function criarLinhaDetalhe(rotulo, valor, corDestaque = null) {
        const row = document.createElement("div");
        row.className = "modal-detail-row";

        const label = document.createElement("span");
        label.className = "modal-label";
        label.textContent = rotulo;

        const value = document.createElement("span");
        value.className = "modal-value";
        value.textContent = valor;
        if (corDestaque) {
          value.style.color = corDestaque;
          value.style.fontWeight = "bold";
        }

        row.appendChild(label);
        row.appendChild(value);
        return row;
      }

      modalCorpo.appendChild(criarLinhaDetalhe("ID do Item:", `#${item.id}`));
      modalCorpo.appendChild(criarLinhaDetalhe("Nome:", item.nome));
      modalCorpo.appendChild(criarLinhaDetalhe("Tipo:", item.tipo));
      modalCorpo.appendChild(
        criarLinhaDetalhe(
          "Disponibilidade:",
          item.disponivel ? "Disponível para uso" : "Indisponível / No Cofre",
          item.disponivel ? "var(--status-success)" : "var(--text-muted)"
        )
      );

      const infoRow = document.createElement("div");
      infoRow.className = "modal-detail-row";
      infoRow.style.marginTop = "0.5rem";
      infoRow.style.fontSize = "0.8rem";
      infoRow.style.color = "var(--text-dim)";
      const infoSmall = document.createElement("small");
      infoSmall.textContent = "Registro sincronizado em tempo real com a API.";
      infoRow.appendChild(infoSmall);
      modalCorpo.appendChild(infoRow);

      modalDetalhes.classList.remove("hidden");
      btnModalOk.focus();
    } catch (error) {
      exibirMensagem(error.message || "Erro ao carregar detalhes do item.", "danger");
    }
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

  // Inicialização: carrega os dados reais da API
  listarItens();
});

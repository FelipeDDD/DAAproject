# Quiz Review Viewer

Abra a ferramenta executando **open-viewer.cmd** ou abrindo **index.html** diretamente no navegador.

Na tela, selecione o arquivo **review-state.json** e, opcionalmente, o arquivo correspondente **review-validation.json**. A ordem de seleção não importa.

Os relatórios são processados apenas localmente pelo navegador. Nenhum relatório é enviado pela rede ou armazenado neste repositório.

O visualizador aceita os vereditos `APPROVE`, `REVISE`, `REJECT`, `PASS`, `KEEP_AND_ADD`, `REVISE_AND_ADD` e `REVISE_ORIGINAL`. As candidatas de `addition_candidate` aparecem como itens de revisão separados da questão existente. Também aceita `new_question` ou `candidate` sem `original`, identificadas por `candidate_key` ou `id`. Uma questão nova pode aparecer diretamente com `item_type: "new_question"`.

As decisões de questões existentes são `ACCEPT_RECOMMENDATION`, `KEEP_CURRENT`, `NEEDS_ADJUSTMENT` e `UNSURE`. Para questões novas são `APPROVE_NEW`, `REJECT_NEW`, `NEEDS_ADJUSTMENT` e `UNSURE`. Escolha pelo botão dentro do cartão da versão desejada. Para conservar a original **e** acrescentar a outra versão, clique em **Manter a original e adicionar esta** no cartão da proposta/revisão. Se houver também uma candidata adicional, ela aparece logo depois para uma terceira decisão independente; assim é possível escolher as três. **Pedir ajuste** exige uma observação. **Decidir depois** marca `UNSURE` e mantém o item entre as pendências. As decisões são salvas imediatamente na chave anterior do `localStorage`, associadas ao relatório carregado. O filtro inicial é **Não revisadas**; uma decisão concluída sai da fila e abre o próximo item quando o avanço automático está ligado. **Anterior** permite voltar e alterar a escolha; **Desfazer última decisão** restaura o valor anterior. Os atalhos 1–4 e as setas permanecem em **Atalhos de teclado**, exceto durante a edição de texto. Filtros, avanço automático e último item visitado também são salvos localmente e restaurados ao reabrir os mesmos relatórios.

O JSON exportado (`schema_version: 2`) contém uma entrada em `decisions` por item decidido ou anotado: `item_type`, `id` ou `candidate_key`, `source_id` quando houver, `decision`, `addition_decision` para candidatas novas, `notes`, `reviewed_at`, `dataset_sha256` e `source_sha256` quando disponíveis. Na combinação original + proposta/revisão, `decision` continua sendo `KEEP_CURRENT` e a entrada recebe `also_add_version: "proposal"`, `"revised"` ou `"final"`. Leitores antigos continuam recebendo o campo `decision`; para aplicar a adição simultânea, precisam considerar o novo campo opcional. **Importar decisões JSON** aceita esse formato após abrir os relatórios; decisões locais existentes prevalecem em caso de conflito. O exportador não altera CSVs nem gera questões. Decisões antigas salvas neste navegador continuam legíveis.

Não é necessário instalar ou executar Node.js, npm ou qualquer servidor.

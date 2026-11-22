# Swamp V3 · Oclusão experimental

Em **Dev Tools → Teleport to swamp V3 (1920 px)**, o seletor **Swamp occlusion** começa em **Off**. **On** mostra os recortes. **Debug** pinta os pixels da máscara de rosa e desenha as bases em ciano. Caminhe acima e abaixo da base para comparar o personagem com o cenário.

| Recorte | Local | Centro da base (px) | Profundidade (px) |
| --- | --- | --- | --- |
| brush | Moita à beira da água, ao sul da arena central | 930, 1550 | 1559 |
| pillar | Coluna quebrada à esquerda do círculo da arena central | 829,5, 898 | 906 |
| stump | Toco entre a estrada sudeste e o cais | 1362, 1598 | 1606 |

O mapa usa o fundo bicúbico já ampliado para 1920 px. A extração usa esse próprio PNG e grava um recorte RGBA por objeto. Cada recorte tem posição inteira no mundo e escala 1. A profundidade é o Y inferior da base. O personagem usa o Y dos pés.

As coordenadas da tabela são as bases do protótipo. A versão atual do mapa tem `OcclusionReferences` vazia, então os recortes só aparecem depois de adicionar uma referência com o nome correspondente nessa camada. Para usar uma colisão como referência, atribua a propriedade string `occlusionMask` com o nome do recorte a um retângulo sem rotação em `Collision`. Use uma referência por recorte.

Para regenerar após ajustar a base, execute `python tools/swamp-occlusion/extract.py` com Pillow e NumPy. O script lê as bases, calcula a janela de cada objeto e separa primeiro plano e fundo por crescimento de regiões guiado pelas diferenças locais de RGB. As sementes foram ajustadas à mão para estes três objetos. Se mover a janela, revise as sementes contra a arte. As texturas e suas origens ficam em `public/assets/maps/swamp-occlusion/`.

O script gera localmente `comparison.png` com o original, o alpha e o recorte sobre fundo neutro, e `edges-2x.png` com as bordas ampliadas.

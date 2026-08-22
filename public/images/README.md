# Convenção de imagens

`/images/{collections|products|looks}/<slug>/<arquivo>`

- `collections/<slug>/` — mídia de campanha da coleção (hero, imagens editoriais).
- `products/<slug>/` — fotos de produto por cor (`<cor>-01.jpg`, `<cor>-02.jpg`, ...).
- `looks/<slug-da-colecao>/` — foto/vídeo do look completo.

Os arquivos `.svg` atuais são placeholders neutros. Para substituir por fotos reais,
troque o arquivo mantendo o mesmo caminho (ou atualize o `src` correspondente em
`src/data/`) — nenhuma página precisa mudar.

# Verificação da transferência local

> Atualização de 06/10/2026: o usuário autorizou publicar na master também as fontes, os documentos e os artefatos locais do projeto. As menções anteriores a materiais fora do Git e a mudanças ainda não publicadas descrevem a preparação anterior. O .gitignore atual exclui ambientes instalados, caches e cópias temporárias de teste.

Conferência realizada em 06/10/2026, após reunir os materiais e preparar o pacote para outro computador. Esta verificação cobre a portabilidade local; os testes industriais, o acesso real ao Firebase e a publicação não foram executados nesta preparação.

## Preservação

- 64 arquivos originais copiados e conferidos por SHA-256, sem divergências. O mapa e o manifesto identificam as fontes.
- 110 arquivos de `app/`, `firebase/` e `tests/` comparados com o estado anterior à preparação, sem alterações.
- Bundle Git verificado, com histórico completo das duas branches locais.
- Documentação antiga preservada como histórico, com entrada atual na raiz da pasta.
- Exclusões de fontes privadas confirmadas em `.gitignore`; funcionam também na cópia transferida.

## Instalação em uma extração nova

A cópia extraída foi instalada com Node.js 24.19.0, `npm ci --ignore-scripts` e `npm run prepare:vendor`, sem usar `node_modules` ou runtimes da pasta original.

| Verificação | Resultado |
| --- | --- |
| Instalação a partir do lockfile | Concluída, 734 pacotes instalados |
| Preparação das bibliotecas locais | Concluída |
| `npm test` | 100 testes aprovados, nenhuma falha |
| `npm run verify:static -- --deploy` | 53 arquivos, nenhum erro; não realiza publicação |
| Servidor local | Página inicial, módulo principal, CSS, Chart.js e logo responderam HTTP 200 |
| Fontes privadas no servidor | Caminho de `referencias-locais/` respondeu HTTP 404 |
| Links nos quatro documentos novos de entrada/mapa/transferência | Nenhum destino local ausente |

O instalador reportou 16 alertas de auditoria de dependências: 4 moderados e 12 altos. O lockfile foi preservado. Esse resultado não identifica sozinho quais alertas afetam o cliente servido; a avaliação e eventual atualização de dependências ficam para trabalho específico, sem aplicar `npm audit fix --force` durante a transferência.

## Restauração do Git

O script corrigido foi executado em outra extração nova. Restaurou `master` no commit `a268ddcd841ed7cb71f9110752498f0902e16222`, com 58 entradas pendentes no status daquela cópia. Os 110 arquivos protegidos permaneceram idênticos. Nenhum remoto foi configurado e nenhum commit ou publicação foi feito. Uma segunda execução reconheceu o Git existente e não alterou nada.

## Integridade do ZIP

Todos os arquivos incluídos são relacionados no `MANIFESTO_PACOTE.json`, com tamanho e SHA-256. A conferência comparou os conteúdos descompactados de cada entrada ao manifesto, verificou os arquivos essenciais e confirmou a ausência das dependências instaláveis, metadados `.git`, ambientes locais e snapshots brutos de banco excluídos.

O número exato de arquivos e o tamanho da versão final podem ser lidos no manifesto e na saída do verificador:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verificar-pacote-local.ps1 -PackagePath 'caminho-do-pacote.zip'
```

O verificador apenas lê o ZIP. Não instala, restaura Git ou executa o sistema.

## Limites desta conferência

Uma pasta extraída e uma instalação limpa reproduzem a transferência local, mas não substituem teste físico no computador da equipe. Recursos externos e o Firebase real dependem de rede e permissões. As verificações completas de navegador e emulador da entrega CEP estão no relatório daquela entrega; não foram repetidas aqui porque o aplicativo, seus testes e regras não foram modificados.

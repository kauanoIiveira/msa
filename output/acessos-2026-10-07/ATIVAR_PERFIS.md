> Status atualizado: os três vínculos foram ativados pelo Console Firebase em 2026-10-07T17:11:01.959Z. Os quatro REs passaram pela verificação de autenticação, perfil e leitura dos dados. As instruções abaixo permanecem como referência.

# Ativação dos três perfis no workspace msa

As contas abaixo já existem no Firebase Authentication, e suas senhas seguem o padrão escolhido pelo usuário: RE seguido de um zero. Não há senhas nem tokens nos arquivos de apoio. A conta administrativa já está ativa.

Na tentativa anterior, o servidor negou a escrita em members com a conta do aplicativo. A ativação foi concluída com a conta Google administradora do projeto msayellowteam no Console Firebase.

| RE | E-mail interno de autenticação | UID | Valor de role |
|---|---|---|---|
| 00001 | 00001@msa.test | 0eVbM9fpCWVmRhxR67baaxsrZYt2 | engineer |
| 00002 | 00002@msa.test | kyXe3uPg3deh3Kiqc11IcXJebCA2 | operator |
| 00003 | 00003@msa.test | MesrbrOmAkMcM3JCsF9tPcJ65r22 | viewer |

1. Abra https://console.firebase.google.com/project/msayellowteam/database/msayellowteam-default-rtdb/data e autentique-se com a conta Google administradora do projeto.
2. Navegue até workspaces/msa/members. Preserve os membros existentes e acrescente os três novos UIDs da tabela.
3. Em cada UID, crie role com o valor exato informado: engineer, operator ou viewer. Os JSONs individuais em vinculos/ contêm o valor de cada novo nó.
4. Entre novamente no aplicativo com cada RE e sua senha para conferir a ativação.

Os caminhos e valores exatos também estão em contas-firebase.json. A configuração pública do login contém somente REs e e-mails; a autorização continua sendo validada pelo membership e pelas regras do banco.

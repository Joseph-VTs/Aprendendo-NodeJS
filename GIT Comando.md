- Aparece no git log? Está salvo na história.
- Aparece no git status? Está sendo trabalhado "antes" de virar história.
- Não aparece em nenhum dos dois? Ou o arquivo não existe na pasta, ou ele está exatamente igual à última versão que já está no log (está "limpo").

### Hipoteses
Ver o que temos (git status)
Colocar na area de Preparação (staging area), (git add "nome do arquivo")
Revisar mudanças (git diff --staged)
Enviar mudança (git commit -m "nome do git")
Caso eu digite o nome errado, e agora?(git commit --amend -m "novo texto corrigido")
Não lembro se já subi o arquivo ou não e agora? Usamos o comando (git show --name-only) que mostra a mensagem do último commit e a lista de arquivos que foram salvos nele
Enviar para a branch (git push)
add
Após ter usado o (git add), resolvi que quero voltar os arquivos da staging area (git restore --staged "nome-do-arquivo")
(git restore --staged .). Volta todos os arquivos do staging area
(git restore). Descarta as mudanças do arquivo

Se você quer uma lista limpa de arquivos que não estão no log (não rastreados), (git ls-files --others --exclude-standard)
Para ver arquivos que você deu add, mas não deu commit, e se você quer ver o que está "quase" entrando no log (na área de Stage/Index), (git diff --cached --name-only)


- Reverter após um push
Encontar o hash do commit (git log --oneline)
Comando para reverter (git revert "hash-do-commit-errado")
Refazer a push (git push origin "nome-da-branch")

### Sobre o git log
- [Fonte da Pesquisa](https://www.atlassian.com/br/git/tutorials/git-log)

- (git log). Detalha os envio e as alterações
- (--oneline). Mostra o id + observação, de maneira resumida
- (--oneline --reverse). Porém em ordem reversa
- (--reverse). Muda a ordem que aparece
- (--date-order). Organiza os commits pela data do commit em vez da ordem padrão
- (--topo-order). Mostra os commits em ordem topológica (não exibe commits de uma ramificação antes dos commits anteriores a ela), o que é mais linear
- (--author-date-order). Ordenar com base na data em que o autor escreveu o commit
- (git shortlog). Quem fez o que, o (-n) mostra quantidade de commit por autor
- (--after="yesterday").Você também pode passar referências relativas como "1 semana atrás" e "ontem"
- (--author="John\|Mary"). Pesquisa por autor
- (-i). Ignora as diferenças de maiúsculas e minúsculas
- (-n). Conta a quantidade
- (--oneline --graph --all). Mostra o histórico local. Se a sua última alteração não aparecer no topo, ela não foi commitada.

### Sobre o git add
Arquivos específicos (git add arquivo1.txt pasta/arquivo2.png arquivo3.py)
Todos os arquivos da pasta atual (git add . ), (Recomendado para adicionar tudo recursivamente)
Todos os arquivos alterados (git add -u), (Adiciona apenas arquivos modificados/deletados, sem novos arquivos)
Usando padrões (Wildcards) (git add *.html), (Adiciona todos os arquivos HTML)
Adição interativa (git add -i), (Permite selecionar quais arquivos adicionar)
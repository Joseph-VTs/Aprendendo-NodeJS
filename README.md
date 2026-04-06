# Aprendendo-NodeJS
Crescendo e Evoluindo utilizando NodeJS para construir aplicações backend escaláveis e de alta performance



### Sobre 
Node.js é usado principalmente para construir aplicações backend escaláveis e de alta performance, destacando-se em APIs RESTful/GraphQL, microserviços e aplicações em tempo real (chats, dashboards). Sua arquitetura assíncrona o torna ideal para operações I/O intensivas e sistemas de tempo real, sendo muito utilizado com frameworks como Express.js.



### Instalações de Pacotes
npm init -y
npm install express
npm install sqlite3 sqlite
npm intall cors (Por segurança, o Node.js bloqueia pedidos que venham de outros lugares (como um arquivo HTML abrindo no seu navegador))


### Segurança - Login
- Bcrypt: Para nunca salvar a senha real no banco (apenas um código secreto).
- JWT (JSON Web Token): Para dar um "crachá de acesso" ao usuário após o login.
npm install bcrypt jsonwebtoken


### Vamos limpar a casa para o Tunnel funcionar:
- No terminal do projeto mobile, pare o Expo (Ctrl + C).
- Digite estes comandos um por um:
    - npm install -g eas-cli
    - npx expo login
    - npx expo start --tunnel
- Se o erro persistir, tente usar o comando instalando o Ngrok manualmente:
    - npm install -g @expo/ngrok
    - npx expo start --tunnel
# Cine Clube - Backend

> Descrição do projeto

# Deploy
Você pode ver a documentação da API nesse <a href="https://cineclube-backend.herokuapp.com/doc/"> link </a>

## **Links**

- Documentação do TypeORM: [Link](https://github.com/typeorm/typeorm/tree/master/docs)
- Tutorial de TypeORM: [Link](https://www.youtube.com/playlist?list=PLDqnSpzNKDvn-3cpMf3yPn7gTnb3ooy4b)

## Pré-requesitos

- Node.js
- npm

## Iniciando

- Clonar este repositório  
  `git clone http://tools.ages.pucrs.br/cine-clube/backend.git`

- Entrar no diretório do projeto  
  `cd backend`

- Instalar as dependências  
  `npm install`

Execute o seguinte comando:
`cp .env.example .env`

A seguir, altere os valores de **DB_USERNAME** e **DB_USERNAME** do arquivo .env, substituindo-os pelo usuário e senha do banco de dados.

_OBS: Se ainda não instalou o banco de dados, veja como na [página de configuração](https://tools.ages.pucrs.br/cine-clube/cineclube-wiki/wikis/configuracao)._

Também deve se inserir o endereço do arquivo de configuração do Firebase em **GOOGLE_APPLICATION_CREDENTIALS**  
O arquivo deve ser obtido no [console do Firebase](https://console.firebase.google.com). Acesse as configurações > Usuários e permissões > Contas de serviço > Gerar nova chave privada.

Renomeie o arquivo para `firebase-config.json`
Onde o valor final deve ser como o abaixo:

```
GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\username\Documents\AGES\backend\firebase-config.json"
```

- Rodar as migrações do banco  
  `npm run typeorm -- migration:run`

- Popular o banco de dados  
  `npm run db:seed`

- Fazer a geração das rotas  
  `npm run tsoa:gen`

- Iniciar a aplicação  
  `npm run dev`

- Acesse pelo navegador  
  `http://localhost:5000`

## Comandos do TypeORM

- Rodar as migrações do banco  
  `npm run typeorm -- migration:run`

- Criar as novas migrações  
  `npm run typeorm -- migration:generate -n <nome da migração>`

- Reverter a última migração do banco  
  `npm run typeorm -- migration:revert`

## Como executar localmente o projeto (Em um ambiente linux)

Após clonar o repositório, dentro do repositório frontend
* Baixar as dependências do front com o comando `npm install`
* Buildar o projeto frontend com o comando `ng build`

Dentro do repositório backend
* Baixar as dependências do back com o comando `composer install`
* Renomear o arquivo `.env.example` para `.env`
* Executar as migrations do banco `php artisan migrate`
* Caso dentro do arquivo `.env` a variável `APP_KEY` esteja vazia, executar o comando `php artisan key:generate`
* Subir o projeto `php artisan serve`

# Conectar o Expo Go do iPhone na API local

Este passo a passo serve para rodar a API Laravel na sua máquina Windows e acessar essa API pelo app mobile aberto no Expo Go do iPhone.

O ponto mais importante: no iPhone, `localhost` é o próprio iPhone, não o seu computador. Por isso o mobile precisa usar o IP local da sua máquina, algo como `192.168.0.25`.

## 1. Confirme que o iPhone e o computador estão na mesma rede

Conecte o iPhone e o computador no mesmo Wi-Fi.

Evite redes com isolamento de dispositivos, como algumas redes de faculdade, empresa, hotel ou Wi-Fi de convidados. Se estiver usando uma dessas redes, prefira rotear internet pelo celular ou usar uma rede doméstica.

## 2. Descubra o IP local do seu computador

No PowerShell, rode:

```powershell
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.IPAddress -notlike "127.*" -and
    $_.PrefixOrigin -ne "WellKnown" -and
    $_.IPAddress -notlike "169.254.*"
  } |
  Select-Object InterfaceAlias, IPAddress
```

Procure o IP da interface de Wi-Fi ou Ethernet. Exemplo:

```text
InterfaceAlias IPAddress
-------------- ---------
Wi-Fi          192.168.0.25
```

Nos próximos comandos, troque `192.168.0.25` pelo IP que apareceu na sua máquina.

## 3. Configure o backend Laravel

Entre na pasta do backend:

```powershell
cd C:\xampp\htdocs\woman-health\backend
```

Se ainda não existir `.env`, crie a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Gere a chave da aplicação, caso ainda não tenha feito:

```powershell
php artisan key:generate
```

Rode as migrations, caso o banco ainda não esteja atualizado:

```powershell
php artisan migrate
```

Limpe caches do Laravel:

```powershell
php artisan optimize:clear
```

Inicie a API aceitando conexões da rede local:

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

Deixe esse terminal aberto.

Importante: não use `--host=127.0.0.1` para testar no iPhone, porque isso prende a API apenas na própria máquina.

## 4. Libere a porta 8000 no Firewall do Windows

Abra outro PowerShell como Administrador e rode:

```powershell
New-NetFirewallRule `
  -DisplayName "Minha Saude Feminina API Laravel 8000" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8000 `
  -Action Allow
```

Se aparecer que a regra já existe ou se você preferir remover e criar de novo:

```powershell
Remove-NetFirewallRule -DisplayName "Minha Saude Feminina API Laravel 8000"
```

Depois rode novamente o comando `New-NetFirewallRule`.

## 5. Teste a API pelo navegador do iPhone

No Safari do iPhone, acesse:

```text
http://192.168.0.25:8000/api/v1/mobile/contents
```

Troque `192.168.0.25` pelo IP da sua máquina.

Se aparecer JSON, uma lista vazia, ou uma mensagem JSON do Laravel, a conexão funcionou.

Se o Safari não abrir nada, confira:

- O iPhone e o computador estão no mesmo Wi-Fi.
- O Laravel está rodando com `--host=0.0.0.0`.
- O IP usado é o IP atual da sua máquina.
- A porta `8000` foi liberada no Firewall.

## 6. Configure a URL da API no app mobile

Entre na pasta mobile:

```powershell
cd C:\xampp\htdocs\woman-health\mobile
```

Crie o `.env` do mobile, caso ainda não exista:

```powershell
Copy-Item .env.example .env
```

Atualize a URL da API no `.env`:

```powershell
Set-Content .env "EXPO_PUBLIC_API_BASE_URL=http://192.168.0.25:8000/api/v1/mobile"
```

Troque `192.168.0.25` pelo IP local da sua máquina.

Para conferir:

```powershell
Get-Content .env
```

O resultado deve ficar parecido com:

```text
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.25:8000/api/v1/mobile
```

## 7. Instale as dependências do mobile

Ainda na pasta `mobile`, rode:

```powershell
npm install
```

## 8. Inicie o Expo limpando o cache

Ainda na pasta `mobile`, rode:

```powershell
npx expo start -c
```

O `-c` é importante porque variáveis `EXPO_PUBLIC_*` são lidas na inicialização do Expo. Se mudar o `.env`, pare o Expo e rode de novo com `-c`.

## 9. Abra no Expo Go

No iPhone:

1. Abra o app Expo Go.
2. Escaneie o QR Code exibido no terminal ou no navegador do Expo.
3. Aguarde o app carregar.
4. Teste login, conteúdos ou qualquer tela que consuma a API.

## 10. Comandos rápidos para copiar e colar

Use este bloco trocando apenas o IP:

```powershell
# Backend
cd C:\xampp\htdocs\woman-health\backend
php artisan optimize:clear
php artisan serve --host=0.0.0.0 --port=8000
```

Em outro PowerShell:

```powershell
# Mobile
cd C:\xampp\htdocs\woman-health\mobile
Set-Content .env "EXPO_PUBLIC_API_BASE_URL=http://192.168.0.25:8000/api/v1/mobile"
npm install
npx expo start -c
```

Se precisar liberar o firewall, rode em PowerShell como Administrador:

```powershell
New-NetFirewallRule `
  -DisplayName "Minha Saude Feminina API Laravel 8000" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8000 `
  -Action Allow
```

## Problemas comuns

### O app mostra erro de rede

Confira se o `.env` do mobile não está usando `localhost`.

Errado para iPhone:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1/mobile
```

Certo:

```text
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.25:8000/api/v1/mobile
```

Depois reinicie o Expo:

```powershell
cd C:\xampp\htdocs\woman-health\mobile
npx expo start -c
```

### O Safari do iPhone não abre a API

Reinicie o Laravel assim:

```powershell
cd C:\xampp\htdocs\woman-health\backend
php artisan serve --host=0.0.0.0 --port=8000
```

Confira o IP novamente:

```powershell
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.IPAddress -notlike "127.*" -and
    $_.PrefixOrigin -ne "WellKnown" -and
    $_.IPAddress -notlike "169.254.*"
  } |
  Select-Object InterfaceAlias, IPAddress
```

### O IP mudou

Isso pode acontecer ao trocar de Wi-Fi ou reiniciar o roteador. Atualize o `.env` do mobile:

```powershell
cd C:\xampp\htdocs\woman-health\mobile
Set-Content .env "EXPO_PUBLIC_API_BASE_URL=http://NOVO_IP_AQUI:8000/api/v1/mobile"
npx expo start -c
```

### A API abre no computador, mas não no iPhone

Provavelmente é firewall ou o Laravel está preso em `127.0.0.1`.

Use:

```powershell
cd C:\xampp\htdocs\woman-health\backend
php artisan serve --host=0.0.0.0 --port=8000
```

E libere a porta:

```powershell
New-NetFirewallRule `
  -DisplayName "Minha Saude Feminina API Laravel 8000" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8000 `
  -Action Allow
```
